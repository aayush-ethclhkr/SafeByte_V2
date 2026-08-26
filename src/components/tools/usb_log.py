"""
SafeByte USB Monitor v2.0
- Real-time detection of ANY USB / external device connect or disconnect
- Runs entirely in background (system tray icon)
- Beep + native macOS alert on every event
- Event log table with timestamp, device name, vendor ID, product ID, action
- Export log to CSV
- Works on macOS (IOKit via system_profiler) and Windows (WMI)
- No root / admin required on macOS

macOS detection method: polls `system_profiler SPUSBDataType` every 2 seconds
and diffs the device set — instant detection without root.

Dependencies:
    pip install pystray pillow
"""

import tkinter as tk
from tkinter import ttk, messagebox
import threading
import subprocess
import platform
import time
import csv
import os
import json
import sys
from datetime import datetime
from PIL import Image, ImageDraw
import pystray

# ── Config ─────────────────────────────────────────────────────────────────────
POLL_INTERVAL = 2          # seconds between USB scans
LOG_FILE      = os.path.join(os.path.expanduser("~"), "SafeByte", "usb_events.csv")
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

# ── Platform detection ─────────────────────────────────────────────────────────
IS_MAC     = platform.system() == "Darwin"
IS_WINDOWS = platform.system() == "Windows"

# ── Beep ───────────────────────────────────────────────────────────────────────
def beep():
    """Cross-platform alert sound."""
    try:
        if IS_MAC:
            subprocess.Popen(["afplay", "/System/Library/Sounds/Funk.aiff"],
                             stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        elif IS_WINDOWS:
            import winsound
            winsound.Beep(1000, 400)
        else:
            subprocess.Popen(["paplay", "/usr/share/sounds/freedesktop/stereo/device-added.oga"],
                             stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        print("\a", end="", flush=True)   # terminal bell fallback

# ── Native macOS notification ──────────────────────────────────────────────────
def mac_notify(title: str, message: str):
    if IS_MAC:
        script = f'display notification "{message}" with title "{title}" sound name "Funk"'
        subprocess.Popen(["osascript", "-e", script],
                         stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

# ── USB snapshot — macOS ───────────────────────────────────────────────────────
def _get_usb_devices_mac() -> dict[str, dict]:
    """
    Returns dict keyed by a stable device ID string.
    Uses system_profiler JSON output — no root needed.
    """
    try:
        result = subprocess.run(
            ["system_profiler", "SPUSBDataType", "-json"],
            capture_output=True, text=True, timeout=5
        )
        data = json.loads(result.stdout)
        devices = {}

        def _walk(items, depth=0):
            for item in items:
                name    = item.get("_name", "Unknown Device")
                vendor  = item.get("vendor_id", "")
                product = item.get("product_id", "")
                serial  = item.get("serial_num", "")
                bcd     = item.get("bcd_device", "")
                # stable key: vendor+product+serial (serial may be blank)
                key = f"{vendor}:{product}:{serial}:{bcd}"
                devices[key] = {
                    "name":    name,
                    "vendor":  vendor,
                    "product": product,
                    "serial":  serial,
                }
                # recurse into hubs
                if "_items" in item:
                    _walk(item["_items"], depth + 1)

        usb_root = data.get("SPUSBDataType", [])
        _walk(usb_root)
        return devices
    except Exception:
        return {}

# ── USB snapshot — Windows ─────────────────────────────────────────────────────
def _get_usb_devices_windows() -> dict[str, dict]:
    try:
        import wmi
        c = wmi.WMI()
        devices = {}
        for d in c.Win32_USBControllerDevice():
            dep = d.Dependent
            name    = getattr(dep, "Name", "Unknown")
            vid     = getattr(dep, "HardwareID", [""])[0] if getattr(dep, "HardwareID", None) else ""
            key     = getattr(dep, "DeviceID", name)
            devices[key] = {"name": name, "vendor": vid, "product": "", "serial": ""}
        return devices
    except Exception:
        return {}

def get_usb_devices() -> dict[str, dict]:
    if IS_MAC:
        return _get_usb_devices_mac()
    elif IS_WINDOWS:
        return _get_usb_devices_windows()
    return {}

# ── Tray icon ──────────────────────────────────────────────────────────────────
def _make_tray_icon_image(alert: bool = False) -> Image.Image:
    img  = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    color = "#ff4444" if alert else "#00cc66"
    # USB symbol — simplified circle + plug
    draw.ellipse([4, 4, 60, 60], fill=color)
    draw.rectangle([26, 14, 38, 50], fill="white")
    draw.rectangle([20, 36, 44, 44], fill="white")
    draw.ellipse([20, 12, 30, 22], fill="white")
    draw.ellipse([34, 12, 44, 22], fill="white")
    return img

# ── Main Application ───────────────────────────────────────────────────────────
class USBMonitor:
    def __init__(self):
        self._known_devices: dict[str, dict] = {}
        self._events: list[dict] = []
        self._monitoring = False
        self._stop_flag  = False
        self._alert_flash = False

        self._build_window()
        self._build_tray()

        # Start monitor thread
        self._monitoring = True
        self._known_devices = get_usb_devices()   # baseline snapshot
        threading.Thread(target=self._monitor_loop, daemon=True).start()

    # ── Main window ───────────────────────────────────────────────────────────
    def _build_window(self):
        self.root = tk.Tk()
        self.root.title("🔌 SafeByte USB Monitor")
        self.root.geometry("900x560")
        self.root.resizable(True, True)
        self.root.protocol("WM_DELETE_WINDOW", self._hide_window)

        # Header
        hdr = tk.Frame(self.root, bg="#1a1a2e", pady=10)
        hdr.pack(fill="x")
        tk.Label(hdr, text="🔌 SafeByte USB Monitor",
                 bg="#1a1a2e", fg="#00ff88",
                 font=("Arial", 17, "bold")).pack()
        tk.Label(hdr, text="Real-time USB & external device detection — running in background",
                 bg="#1a1a2e", fg="#888888", font=("Arial", 9)).pack()

        # Status bar
        status_bar = tk.Frame(self.root, padx=12, pady=6)
        status_bar.pack(fill="x")

        self.status_dot = tk.Label(status_bar, text="●", fg="#00cc66",
                                   font=("Arial", 14))
        self.status_dot.pack(side="left")
        self.status_lbl = tk.Label(status_bar, text="  Monitoring active",
                                   font=("Arial", 10, "bold"))
        self.status_lbl.pack(side="left")

        self.known_count_lbl = tk.Label(status_bar, text="",
                                        font=("Arial", 9), fg="#888888")
        self.known_count_lbl.pack(side="left", padx=16)

        # Controls
        ctrl = tk.Frame(self.root, padx=12, pady=4)
        ctrl.pack(fill="x")
        tk.Button(ctrl, text="💾 Export CSV", command=self._export_csv).pack(side="left", padx=4)
        tk.Button(ctrl, text="🗑 Clear Log",  command=self._clear_log).pack(side="left", padx=4)
        tk.Button(ctrl, text="🔍 Current Devices", command=self._show_current).pack(side="left", padx=4)
        tk.Button(ctrl, text="Hide to Tray", command=self._hide_window).pack(side="right", padx=4)

        # Event log table
        tbl_frame = tk.Frame(self.root, padx=12, pady=6)
        tbl_frame.pack(fill="both", expand=True)

        cols = ("time", "action", "name", "vendor", "product", "serial")
        self.tree = ttk.Treeview(tbl_frame, columns=cols,
                                 show="headings", selectmode="browse")
        headings = {
            "time":    ("Timestamp",   160),
            "action":  ("Action",       90),
            "name":    ("Device Name", 260),
            "vendor":  ("Vendor ID",    90),
            "product": ("Product ID",   90),
            "serial":  ("Serial",      150),
        }
        for col, (heading, width) in headings.items():
            self.tree.heading(col, text=heading)
            self.tree.column(col, width=width, minwidth=40)

        vsb = ttk.Scrollbar(tbl_frame, orient="vertical",   command=self.tree.yview)
        hsb = ttk.Scrollbar(tbl_frame, orient="horizontal", command=self.tree.xview)
        self.tree.configure(yscrollcommand=vsb.set, xscrollcommand=hsb.set)
        self.tree.grid(row=0, column=0, sticky="nsew")
        vsb.grid(row=0, column=1, sticky="ns")
        hsb.grid(row=1, column=0, sticky="ew")
        tbl_frame.rowconfigure(0, weight=1)
        tbl_frame.columnconfigure(0, weight=1)

        # Row colours
        self.tree.tag_configure("CONNECTED",    background="#002200", foreground="#66ff88")
        self.tree.tag_configure("DISCONNECTED", background="#220000", foreground="#ff8888")

        # Bottom note
        tk.Label(self.root,
                 text="Closing this window hides to tray — monitoring continues in background.",
                 font=("Arial", 8), fg="#666666").pack(pady=4)

    # ── Tray icon ─────────────────────────────────────────────────────────────
    def _build_tray(self):
        menu = pystray.Menu(
            pystray.MenuItem("Open Monitor", self._show_window, default=True),
            pystray.MenuItem("Exit",         self._quit_app),
        )
        self._tray_icon = pystray.Icon(
            "SafeByte USB Monitor",
            _make_tray_icon_image(False),
            "SafeByte USB Monitor",
            menu,
        )
        threading.Thread(target=self._tray_icon.run, daemon=True).start()

    def _hide_window(self):
        self.root.withdraw()

    def _show_window(self, *_):
        self.root.deiconify()
        self.root.lift()

    def _quit_app(self, *_):
        self._stop_flag = True
        self._tray_icon.stop()
        self.root.quit()

    # ── Monitor loop (background thread) ─────────────────────────────────────
    def _monitor_loop(self):
        while not self._stop_flag:
            time.sleep(POLL_INTERVAL)
            try:
                current = get_usb_devices()
                known   = self._known_devices

                # Connected devices (in current but not in known)
                for key, info in current.items():
                    if key not in known:
                        self._on_event("CONNECTED", info)

                # Disconnected devices (in known but not in current)
                for key, info in known.items():
                    if key not in current:
                        self._on_event("DISCONNECTED", info)

                self._known_devices = current
                self.root.after(0, self._update_known_count, len(current))

            except Exception:
                pass

    def _on_event(self, action: str, info: dict):
        """Called in monitor thread — schedules UI update on main thread."""
        ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        event = {
            "time":    ts,
            "action":  action,
            "name":    info.get("name",    "Unknown"),
            "vendor":  info.get("vendor",  "—"),
            "product": info.get("product", "—"),
            "serial":  info.get("serial",  "—"),
        }
        self._events.append(event)
        self._append_csv(event)
        beep()
        self.root.after(0, self._insert_event_row, event)
        self.root.after(0, self._flash_tray, action)

        # macOS native notification
        emoji = "🔌" if action == "CONNECTED" else "⏏️"
        mac_notify(
            f"{emoji} USB Device {action.title()}",
            f"{info.get('name', 'Unknown Device')} — {ts}"
        )

    def _insert_event_row(self, event: dict):
        self.tree.insert("", 0, values=(   # insert at top
            event["time"], event["action"], event["name"],
            event["vendor"], event["product"], event["serial"],
        ), tags=(event["action"],))

    def _flash_tray(self, action: str):
        """Flash tray icon red on connect, then back to green."""
        self._tray_icon.icon = _make_tray_icon_image(alert=True)
        def _reset():
            time.sleep(3)
            self._tray_icon.icon = _make_tray_icon_image(alert=False)
        threading.Thread(target=_reset, daemon=True).start()

    def _update_known_count(self, count: int):
        self.known_count_lbl.config(
            text=f"Currently connected: {count} USB device(s)")

    # ── Current devices popup ─────────────────────────────────────────────────
    def _show_current(self):
        devices = get_usb_devices()
        win = tk.Toplevel(self.root)
        win.title("Currently Connected USB Devices")
        win.geometry("640x360")
        cols = ("name", "vendor", "product", "serial")
        tree = ttk.Treeview(win, columns=cols, show="headings")
        for col, heading, width in [
            ("name", "Device Name", 300), ("vendor", "Vendor ID", 90),
            ("product", "Product ID", 90), ("serial", "Serial", 150)
        ]:
            tree.heading(col, text=heading)
            tree.column(col, width=width)
        for info in devices.values():
            tree.insert("", "end", values=(
                info["name"], info["vendor"], info["product"], info["serial"]
            ))
        tree.pack(fill="both", expand=True, padx=8, pady=8)
        tk.Label(win, text=f"Total: {len(devices)} device(s)",
                 font=("Arial", 9), fg="#888888").pack(pady=4)

    # ── CSV log ───────────────────────────────────────────────────────────────
    def _append_csv(self, event: dict):
        try:
            write_header = not os.path.exists(LOG_FILE)
            with open(LOG_FILE, "a", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=[
                    "time", "action", "name", "vendor", "product", "serial"])
                if write_header:
                    writer.writeheader()
                writer.writerow(event)
        except Exception:
            pass

    def _export_csv(self):
        if not self._events:
            messagebox.showwarning("No Events", "No USB events recorded yet.")
            return
        from tkinter import filedialog
        path = filedialog.asksaveasfilename(
            defaultextension=".csv",
            filetypes=[("CSV", "*.csv")],
            initialfile=f"usb_events_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        )
        if not path:
            return
        with open(path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=[
                "time", "action", "name", "vendor", "product", "serial"])
            writer.writeheader()
            writer.writerows(self._events)
        messagebox.showinfo("Exported", f"Log saved to:\n{path}")

    def _clear_log(self):
        self._events.clear()
        for item in self.tree.get_children():
            self.tree.delete(item)

    # ── Run ───────────────────────────────────────────────────────────────────
    def run(self):
        self.root.mainloop()


# ── Entry point ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app = USBMonitor()
    app.run()
