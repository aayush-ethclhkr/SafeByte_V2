"""
SafeByte File System Crawler v2.0
- Directory chooser + threaded scan (never freezes UI)
- MD5 + SHA256 hash every file
- VirusTotal hash reputation lookup (batch, rate-limited)
- Local heuristics: suspicious extensions, dangerous filenames, bad path patterns
- Results table: SAFE / SUSPICIOUS / MALICIOUS with colour coding
- Export full report to CSV and TXT
"""

import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import threading
import os
import hashlib
import platform
import csv
import json
import time
import urllib.request
import urllib.error
from datetime import datetime
from typing import Optional

# Load .env if present (for local development)
try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env"))
except ImportError:
    pass  # dotenv not installed — use system env vars

# ── Config ─────────────────────────────────────────────────────────────────────
VT_API_KEY  = os.environ.get("VT_API_KEY", "")
VT_ENDPOINT = "https://www.virustotal.com/api/v3/files/{}"
VT_RATE_LIMIT_DELAY = 15   # seconds between VT requests (free tier: 4/min)
MAX_FILE_SIZE_MB    = 50   # skip hashing files larger than this

# ── Suspicious heuristics ──────────────────────────────────────────────────────
SUSPICIOUS_EXTENSIONS = {
    ".exe", ".dll", ".bat", ".cmd", ".vbs", ".js", ".jse", ".wsf", ".wsh",
    ".ps1", ".psm1", ".psd1", ".scr", ".pif", ".com", ".lnk", ".hta",
    ".jar", ".msi", ".msp", ".reg", ".inf", ".sys", ".drv", ".ocx",
    ".elf", ".so", ".dylib", ".sh", ".bash", ".zsh", ".fish",
    ".docm", ".xlsm", ".pptm", ".dotm", ".xltm",        # macro-enabled Office
    ".iso", ".img", ".vhd", ".vhdx",                    # disk images
}

DANGEROUS_FILENAMES = {
    "autorun.inf", "desktop.ini", "thumbs.db",
    "nc.exe", "ncat.exe", "netcat.exe", "nmap.exe",
    "mimikatz.exe", "mimikatz.dll", "meterpreter",
    "payload.exe", "backdoor.exe", "trojan.exe", "rat.exe",
    "keylogger.exe", "spy.exe", "stealer.exe",
    "cryptolocker", "wannacry", "petya", "ryuk",
    "inject.exe", "loader.exe", "dropper.exe",
}

SUSPICIOUS_PATH_PATTERNS = [
    "/tmp/",  "\\temp\\", "\\tmp\\",
    "/var/tmp/", "appdata\\roaming\\microsoft\\windows\\start menu\\programs\\startup",
    "appdata\\local\\temp", "/library/launchagents/",
    "/library/launchdaemons/", "/etc/cron", "/etc/init.d/",
    "programdata\\microsoft\\windows\\start menu\\programs\\startup",
]

# ── MD5 / SHA256 ───────────────────────────────────────────────────────────────
def hash_file(path: str) -> tuple[Optional[str], Optional[str]]:
    try:
        size_mb = os.path.getsize(path) / (1024 * 1024)
        if size_mb > MAX_FILE_SIZE_MB:
            return None, None
        md5  = hashlib.md5()
        sha2 = hashlib.sha256()
        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                md5.update(chunk)
                sha2.update(chunk)
        return md5.hexdigest(), sha2.hexdigest()
    except (OSError, PermissionError):
        return None, None

# ── VirusTotal lookup ──────────────────────────────────────────────────────────
def vt_lookup(sha256: str) -> dict:
    url = VT_ENDPOINT.format(sha256)
    req = urllib.request.Request(url, headers={"x-apikey": VT_API_KEY})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            stats = data["data"]["attributes"]["last_analysis_stats"]
            return {
                "malicious":  stats.get("malicious", 0),
                "suspicious": stats.get("suspicious", 0),
                "harmless":   stats.get("harmless", 0),
                "undetected": stats.get("undetected", 0),
            }
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return {"malicious": 0, "suspicious": 0, "harmless": 0, "undetected": 0, "not_found": True}
        return {}
    except Exception:
        return {}

# ── Local heuristic verdict ────────────────────────────────────────────────────
def local_verdict(path: str) -> tuple[str, list[str]]:
    """Returns (verdict, [reasons]) using local rules only."""
    reasons = []
    name = os.path.basename(path).lower()
    ext  = os.path.splitext(name)[1].lower()
    path_lower = path.lower()

    if name in DANGEROUS_FILENAMES:
        reasons.append(f"Known dangerous filename: {name}")

    if ext in SUSPICIOUS_EXTENSIONS:
        reasons.append(f"Suspicious extension: {ext}")

    for pat in SUSPICIOUS_PATH_PATTERNS:
        if pat in path_lower:
            reasons.append(f"Suspicious location: {pat.strip('/')}")
            break

    if not reasons:
        return "SAFE", []
    if any("dangerous" in r or "location" in r for r in reasons):
        return "SUSPICIOUS", reasons
    return "SUSPICIOUS", reasons

# ── Main Application ───────────────────────────────────────────────────────────
class FileCrawlerApp:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("🔍 SafeByte File System Crawler")
        self.root.geometry("1100x700")
        self.root.resizable(True, True)

        self._scanning     = False
        self._stop_flag    = False
        self._results: list[dict] = []
        self._vt_queue: list[dict] = []

        self._build_ui()

    # ── UI construction ────────────────────────────────────────────────────────
    def _build_ui(self):
        # Header
        hdr = tk.Frame(self.root, bg="#1a1a2e", pady=10)
        hdr.pack(fill="x")
        tk.Label(hdr, text="🔍 SafeByte File System Crawler",
                 bg="#1a1a2e", fg="#00ff88", font=("Arial", 17, "bold")).pack()
        tk.Label(hdr, text="Scan any directory for malware and suspicious files",
                 bg="#1a1a2e", fg="#888888", font=("Arial", 9)).pack()

        # Controls
        ctrl = tk.Frame(self.root, pady=8, padx=12)
        ctrl.pack(fill="x")

        tk.Label(ctrl, text="Directory:", font=("Arial", 10, "bold")).grid(
            row=0, column=0, sticky="w", padx=(0, 6))
        self.dir_var = tk.StringVar(value=os.path.expanduser("~"))
        tk.Entry(ctrl, textvariable=self.dir_var, width=60,
                 font=("Courier", 10)).grid(row=0, column=1, sticky="ew", padx=4)
        tk.Button(ctrl, text="Browse…", command=self._browse).grid(
            row=0, column=2, padx=4)

        self.vt_var = tk.BooleanVar(value=True)
        tk.Checkbutton(ctrl, text="VirusTotal hash lookup (slower — needs internet)",
                       variable=self.vt_var).grid(row=1, column=0, columnspan=3,
                                                  sticky="w", pady=4)

        btn_row = tk.Frame(ctrl)
        btn_row.grid(row=2, column=0, columnspan=3, sticky="w", pady=4)
        self.start_btn = tk.Button(btn_row, text="▶  Start Scan", width=14,
                                   bg="#00cc66", fg="white", font=("Arial", 10, "bold"),
                                   command=self._start_scan)
        self.start_btn.pack(side="left", padx=(0, 6))
        self.stop_btn = tk.Button(btn_row, text="⏹  Stop", width=10,
                                  state="disabled", command=self._stop_scan)
        self.stop_btn.pack(side="left", padx=(0, 6))
        tk.Button(btn_row, text="💾 Export CSV", width=14,
                  command=self._export_csv).pack(side="left", padx=(0, 6))
        tk.Button(btn_row, text="📄 Export TXT", width=14,
                  command=self._export_txt).pack(side="left")

        ctrl.columnconfigure(1, weight=1)

        # Stats bar
        stats_frame = tk.Frame(self.root, pady=4, padx=12)
        stats_frame.pack(fill="x")
        self.stat_total    = self._stat_label(stats_frame, "Total Files", "0", 0)
        self.stat_safe     = self._stat_label(stats_frame, "Safe",        "0", 1, "#00cc66")
        self.stat_susp     = self._stat_label(stats_frame, "Suspicious",  "0", 2, "#ffaa00")
        self.stat_mal      = self._stat_label(stats_frame, "Malicious",   "0", 3, "#ff4444")
        self.stat_skipped  = self._stat_label(stats_frame, "Skipped",     "0", 4, "#888888")

        # Progress
        prog_frame = tk.Frame(self.root, padx=12)
        prog_frame.pack(fill="x")
        self.progress_var = tk.DoubleVar()
        self.progress_bar = ttk.Progressbar(prog_frame, variable=self.progress_var,
                                            maximum=100, mode="indeterminate")
        self.progress_bar.pack(fill="x", pady=2)
        self.status_var = tk.StringVar(value="Ready — choose a directory and click Start Scan")
        tk.Label(prog_frame, textvariable=self.status_var, anchor="w",
                 font=("Arial", 9), fg="#555555").pack(fill="x")

        # Results table
        tbl_frame = tk.Frame(self.root, padx=12, pady=6)
        tbl_frame.pack(fill="both", expand=True)

        cols = ("verdict", "filename", "path", "ext", "size_kb",
                "md5", "vt_malicious", "vt_total", "reasons")
        self.tree = ttk.Treeview(tbl_frame, columns=cols,
                                 show="headings", selectmode="browse")

        headings = {
            "verdict":      ("Verdict",       80),
            "filename":     ("Filename",      180),
            "path":         ("Full Path",     300),
            "ext":          ("Ext",            50),
            "size_kb":      ("Size (KB)",      80),
            "md5":          ("MD5",           200),
            "vt_malicious": ("VT Malicious",   90),
            "vt_total":     ("VT Total",       70),
            "reasons":      ("Reasons",        260),
        }
        for col, (heading, width) in headings.items():
            self.tree.heading(col, text=heading,
                              command=lambda c=col: self._sort_column(c))
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
        self.tree.tag_configure("MALICIOUS",  background="#3a0000", foreground="#ff6666")
        self.tree.tag_configure("SUSPICIOUS", background="#2a2000", foreground="#ffcc44")
        self.tree.tag_configure("SAFE",       background="#001a00", foreground="#66ff99")
        self.tree.tag_configure("SKIPPED",    background="#1a1a1a", foreground="#888888")

    def _stat_label(self, parent, label, value, col, color="#ffffff"):
        f = tk.Frame(parent, padx=10)
        f.grid(row=0, column=col, padx=6)
        lbl = tk.Label(f, text=value, font=("Arial", 16, "bold"), fg=color)
        lbl.pack()
        tk.Label(f, text=label, font=("Arial", 8), fg="#888888").pack()
        return lbl

    # ── Browse ─────────────────────────────────────────────────────────────────
    def _browse(self):
        d = filedialog.askdirectory(initialdir=self.dir_var.get())
        if d:
            self.dir_var.set(d)

    # ── Scan control ───────────────────────────────────────────────────────────
    def _start_scan(self):
        directory = self.dir_var.get()
        if not os.path.isdir(directory):
            messagebox.showerror("Error", "Please select a valid directory.")
            return

        self._stop_flag = False
        self._scanning  = True
        self._results.clear()
        self._vt_queue.clear()

        # Clear table
        for item in self.tree.get_children():
            self.tree.delete(item)

        self._reset_stats()
        self.start_btn.config(state="disabled")
        self.stop_btn.config(state="normal")
        self.progress_bar.start(10)

        threading.Thread(target=self._scan_worker,
                         args=(directory,), daemon=True).start()

    def _stop_scan(self):
        self._stop_flag = True
        self.status_var.set("Stopping…")

    def _scan_done(self):
        self._scanning = False
        self.progress_bar.stop()
        self.start_btn.config(state="normal")
        self.stop_btn.config(state="disabled")
        total = len(self._results)
        mal   = sum(1 for r in self._results if r["verdict"] == "MALICIOUS")
        susp  = sum(1 for r in self._results if r["verdict"] == "SUSPICIOUS")
        self.status_var.set(
            f"Scan complete — {total} files | {mal} malicious | {susp} suspicious"
        )

    # ── Scan worker (runs in thread) ───────────────────────────────────────────
    def _scan_worker(self, directory: str):
        vt_enabled = self.vt_var.get()
        counts = {"total": 0, "safe": 0, "suspicious": 0,
                  "malicious": 0, "skipped": 0}
        vt_last_call = 0.0

        for dirpath, dirnames, filenames in os.walk(directory):
            if self._stop_flag:
                break

            # Skip hidden dirs on macOS/Linux
            if platform.system() in ("Darwin", "Linux"):
                dirnames[:] = [d for d in dirnames if not d.startswith(".")]

            for filename in filenames:
                if self._stop_flag:
                    break

                filepath = os.path.join(dirpath, filename)
                counts["total"] += 1
                self.root.after(0, lambda p=filepath: self.status_var.set(
                    f"Scanning: {p[:90]}…"))

                # Hash
                try:
                    size_bytes = os.path.getsize(filepath)
                except OSError:
                    size_bytes = 0

                size_kb = round(size_bytes / 1024, 1)
                md5, sha256 = hash_file(filepath)

                if md5 is None:
                    counts["skipped"] += 1
                    row = {
                        "verdict": "SKIPPED", "filename": filename,
                        "path": filepath,
                        "ext": os.path.splitext(filename)[1].lower(),
                        "size_kb": size_kb, "md5": "—", "sha256": "—",
                        "vt_malicious": "—", "vt_total": "—",
                        "reasons": "Too large or permission denied",
                    }
                    self._results.append(row)
                    self.root.after(0, self._insert_row, row)
                    self.root.after(0, self._update_stats, counts)
                    continue

                # Local heuristics
                verdict, reasons = local_verdict(filepath)

                # VirusTotal
                vt_mal = "—"
                vt_tot = "—"
                if vt_enabled and sha256:
                    elapsed = time.time() - vt_last_call
                    if elapsed < VT_RATE_LIMIT_DELAY:
                        time.sleep(VT_RATE_LIMIT_DELAY - elapsed)
                    vt_result = vt_lookup(sha256)
                    vt_last_call = time.time()

                    if vt_result and "not_found" not in vt_result:
                        vt_mal = vt_result.get("malicious", 0)
                        vt_tot = (vt_result.get("malicious", 0) +
                                  vt_result.get("suspicious", 0) +
                                  vt_result.get("harmless", 0) +
                                  vt_result.get("undetected", 0))
                        if vt_result.get("malicious", 0) > 0:
                            verdict = "MALICIOUS"
                            reasons.append(
                                f"VirusTotal: {vt_result['malicious']} engines flagged")
                        elif vt_result.get("suspicious", 0) > 0 and verdict == "SAFE":
                            verdict = "SUSPICIOUS"
                            reasons.append(
                                f"VirusTotal: {vt_result['suspicious']} engines suspicious")

                counts[verdict.lower()] = counts.get(verdict.lower(), 0) + 1

                row = {
                    "verdict": verdict,
                    "filename": filename,
                    "path": filepath,
                    "ext": os.path.splitext(filename)[1].lower(),
                    "size_kb": size_kb,
                    "md5": md5,
                    "sha256": sha256 or "—",
                    "vt_malicious": vt_mal,
                    "vt_total": vt_tot,
                    "reasons": "; ".join(reasons) if reasons else "None",
                }
                self._results.append(row)
                self.root.after(0, self._insert_row, row)
                self.root.after(0, self._update_stats, counts)

        self.root.after(0, self._scan_done)

    # ── Table helpers ──────────────────────────────────────────────────────────
    def _insert_row(self, row: dict):
        self.tree.insert("", "end", values=(
            row["verdict"], row["filename"], row["path"],
            row["ext"], row["size_kb"], row["md5"],
            row["vt_malicious"], row["vt_total"], row["reasons"],
        ), tags=(row["verdict"],))

    def _reset_stats(self):
        for lbl in (self.stat_total, self.stat_safe,
                    self.stat_susp, self.stat_mal, self.stat_skipped):
            lbl.config(text="0")

    def _update_stats(self, counts: dict):
        self.stat_total.config(text=str(counts["total"]))
        self.stat_safe.config(text=str(counts.get("safe", 0)))
        self.stat_susp.config(text=str(counts.get("suspicious", 0)))
        self.stat_mal.config(text=str(counts.get("malicious", 0)))
        self.stat_skipped.config(text=str(counts.get("skipped", 0)))

    def _sort_column(self, col: str):
        data = [(self.tree.set(k, col), k) for k in self.tree.get_children("")]
        data.sort()
        for idx, (_, k) in enumerate(data):
            self.tree.move(k, "", idx)

    # ── Export ─────────────────────────────────────────────────────────────────
    def _export_csv(self):
        if not self._results:
            messagebox.showwarning("No Data", "Run a scan first.")
            return
        path = filedialog.asksaveasfilename(
            defaultextension=".csv",
            filetypes=[("CSV files", "*.csv")],
            initialfile=f"safebyte_scan_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
        )
        if not path:
            return
        with open(path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=[
                "verdict", "filename", "path", "ext", "size_kb",
                "md5", "sha256", "vt_malicious", "vt_total", "reasons"
            ])
            writer.writeheader()
            writer.writerows(self._results)
        messagebox.showinfo("Exported", f"CSV saved to:\n{path}")

    def _export_txt(self):
        if not self._results:
            messagebox.showwarning("No Data", "Run a scan first.")
            return
        path = filedialog.asksaveasfilename(
            defaultextension=".txt",
            filetypes=[("Text files", "*.txt")],
            initialfile=f"safebyte_scan_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt",
        )
        if not path:
            return
        with open(path, "w", encoding="utf-8") as f:
            f.write(f"SafeByte File System Crawler — Scan Report\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("=" * 80 + "\n\n")
            for r in self._results:
                if r["verdict"] in ("MALICIOUS", "SUSPICIOUS"):
                    f.write(f"[{r['verdict']}] {r['path']}\n")
                    f.write(f"  MD5:     {r['md5']}\n")
                    f.write(f"  VT:      {r['vt_malicious']}/{r['vt_total']}\n")
                    f.write(f"  Reasons: {r['reasons']}\n\n")
        messagebox.showinfo("Exported", f"Report saved to:\n{path}")


# ── Entry point ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    root = tk.Tk()
    app = FileCrawlerApp(root)
    root.mainloop()
