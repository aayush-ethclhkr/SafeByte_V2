"""
SafeByte Password Manager — v2.0
Two-factor protection:
  1. Master password  → PBKDF2-HMAC-SHA256 (100k iterations) derives a key that
                        encrypts/decrypts the Fernet key stored in secret.key.enc
                        The raw Fernet key is NEVER written to disk in plaintext.
  2. TOTP (RFC 6238)  → Google Authenticator / Authy compatible.
                        On first run a QR code is shown for enrollment.
                        Every login requires the current 6-digit code.

Dependencies:
    pip install cryptography pyotp qrcode[pil] pillow
"""

import tkinter as tk
from tkinter import messagebox, simpledialog
import sqlite3
import secrets
import string
import hashlib
import base64
import os
import json
import time

from cryptography.fernet import Fernet, InvalidToken
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from typing import Optional, Tuple
import pyotp

# ── File paths ─────────────────────────────────────────────────────────────────
# Store all data in ~/SafeByte/ so it persists across app updates and works
# correctly when running as a frozen .app bundle (bundle dir is read-only).
_DATA_DIR = os.path.join(os.path.expanduser("~"), "SafeByte")
os.makedirs(_DATA_DIR, exist_ok=True)

ENCRYPTED_KEY_FILE = os.path.join(_DATA_DIR, "secret.key.enc")
AUTH_CONFIG_FILE   = os.path.join(_DATA_DIR, "auth.cfg")
DB_FILE            = os.path.join(_DATA_DIR, "password_manager.db")

# ── PBKDF2 helpers ─────────────────────────────────────────────────────────────
PBKDF2_ITERATIONS = 100_000

def _derive_key_from_password(master_password: str, salt: bytes) -> bytes:
    """Derive a 32-byte key from the master password using PBKDF2-HMAC-SHA256."""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=PBKDF2_ITERATIONS,
    )
    return base64.urlsafe_b64encode(kdf.derive(master_password.encode()))

def _encrypt_fernet_key(fernet_key: bytes, master_password: str, salt: bytes) -> bytes:
    """Encrypt the raw Fernet key with the derived master-password key."""
    derived = _derive_key_from_password(master_password, salt)
    wrapper = Fernet(derived)
    return wrapper.encrypt(fernet_key)

def _decrypt_fernet_key(encrypted_fernet_key: bytes, master_password: str, salt: bytes) -> bytes:
    """Decrypt the stored Fernet key. Raises InvalidToken on wrong password."""
    derived = _derive_key_from_password(master_password, salt)
    wrapper = Fernet(derived)
    return wrapper.decrypt(encrypted_fernet_key)  # raises InvalidToken if wrong

# ── Auth config (salt + TOTP secret) ──────────────────────────────────────────
def _load_auth_config() -> Optional[dict]:
    if not os.path.exists(AUTH_CONFIG_FILE):
        return None
    with open(AUTH_CONFIG_FILE, "r") as f:
        cfg = json.load(f)
    cfg["salt"] = base64.b64decode(cfg["salt"])
    return cfg

def _save_auth_config(salt: bytes, totp_secret: str) -> None:
    cfg = {
        "salt": base64.b64encode(salt).decode(),
        "totp_secret": totp_secret,
    }
    with open(AUTH_CONFIG_FILE, "w") as f:
        json.dump(cfg, f)

# ── First-run setup ────────────────────────────────────────────────────────────
def first_run_setup(root: tk.Tk) -> Tuple[Fernet, str]:
    """
    Called when no auth config exists.
    1. Ask user to set a master password.
    2. Generate a TOTP secret and show QR code for enrollment.
    3. Verify the OTP to confirm enrollment.
    4. Encrypt and save the Fernet key.
    Returns (cipher, totp_secret).
    """
    messagebox.showinfo(
        "First Run — Setup",
        "Welcome to SafeByte Password Manager!\n\n"
        "You'll now:\n"
        "  1. Set a Master Password\n"
        "  2. Enroll an Authenticator app (Google Authenticator / Authy)\n\n"
        "These two factors will protect your vault."
    )

    # ── Step 1: master password ───────────────────────────────────────────────
    while True:
        mp = simpledialog.askstring("Master Password", "Set a strong master password:", show="*", parent=root)
        if mp is None:
            root.destroy()
            raise SystemExit("Setup cancelled.")
        if len(mp) < 8:
            messagebox.showwarning("Too Short", "Master password must be at least 8 characters.")
            continue
        mp2 = simpledialog.askstring("Confirm Password", "Confirm master password:", show="*", parent=root)
        if mp != mp2:
            messagebox.showwarning("Mismatch", "Passwords do not match. Try again.")
            continue
        break

    # ── Step 2: TOTP enrollment ───────────────────────────────────────────────
    totp_secret = pyotp.random_base32()
    totp = pyotp.TOTP(totp_secret)
    uri = totp.provisioning_uri(name="SafeByte Vault", issuer_name="SafeByte")

    # Show QR code in a popup window
    _show_qr_enrollment(root, uri, totp_secret)

    # ── Step 3: verify OTP to confirm enrollment ──────────────────────────────
    while True:
        code = simpledialog.askstring("Verify OTP", "Enter the 6-digit code from your authenticator app:", parent=root)
        if code is None:
            root.destroy()
            raise SystemExit("Setup cancelled.")
        if totp.verify(code.strip(), valid_window=1):
            break
        messagebox.showerror("Invalid Code", "OTP code is incorrect or expired. Try again.")

    # ── Step 4: generate Fernet key, encrypt with master password ─────────────
    salt = secrets.token_bytes(32)
    raw_fernet_key = Fernet.generate_key()
    encrypted_fernet_key = _encrypt_fernet_key(raw_fernet_key, mp, salt)

    with open(ENCRYPTED_KEY_FILE, "wb") as f:
        f.write(encrypted_fernet_key)

    _save_auth_config(salt, totp_secret)

    messagebox.showinfo("Setup Complete", "✅ Vault protected! Master password + OTP authentication enabled.")
    return Fernet(raw_fernet_key), totp_secret


def _show_qr_enrollment(root: tk.Tk, uri: str, totp_secret: str) -> None:
    """Show TOTP QR code in a Tk window for authenticator enrollment."""
    win = tk.Toplevel(root)
    win.title("Enroll Authenticator App")
    win.resizable(False, False)

    tk.Label(win, text="Scan this QR code with Google Authenticator or Authy:",
             font=("Arial", 11, "bold"), pady=10).pack()

    # Try to render a QR code image; fall back to text if qrcode/pillow unavailable
    try:
        import qrcode
        from PIL import ImageTk
        qr_img = qrcode.make(uri)
        qr_img = qr_img.resize((220, 220))
        tk_img = ImageTk.PhotoImage(qr_img)
        lbl = tk.Label(win, image=tk_img)
        lbl.image = tk_img  # keep reference
        lbl.pack(pady=8)
    except ImportError:
        tk.Label(win, text="(Install qrcode + pillow for QR image)", fg="gray").pack()

    tk.Label(win, text="Or enter this key manually:", font=("Arial", 10)).pack()
    key_var = tk.StringVar(value=totp_secret)
    entry = tk.Entry(win, textvariable=key_var, state="readonly", width=36, font=("Courier", 12))
    entry.pack(pady=4)
    tk.Label(win, text='Account name: "SafeByte Vault"', fg="gray").pack()

    tk.Button(win, text="Done — I've enrolled", command=win.destroy, width=24).pack(pady=12)
    root.wait_window(win)


# ── Login screen ───────────────────────────────────────────────────────────────
def login(root: tk.Tk, cfg: dict) -> Fernet:
    """
    Show master-password + OTP login gate.
    Returns a Fernet cipher on success; destroys root on too many failures.
    """
    max_attempts = 5
    attempt = 0

    while attempt < max_attempts:
        mp = simpledialog.askstring(
            "SafeByte Vault — Login",
            f"Enter master password (attempt {attempt + 1}/{max_attempts}):",
            show="*",
            parent=root,
        )
        if mp is None:
            root.destroy()
            raise SystemExit("Login cancelled.")

        code = simpledialog.askstring(
            "SafeByte Vault — OTP",
            "Enter 6-digit code from your authenticator app:",
            parent=root,
        )
        if code is None:
            root.destroy()
            raise SystemExit("Login cancelled.")

        # Verify OTP first (fast check)
        totp = pyotp.TOTP(cfg["totp_secret"])
        if not totp.verify(code.strip(), valid_window=1):
            attempt += 1
            messagebox.showerror("Invalid OTP", f"Incorrect OTP code. {max_attempts - attempt} attempts left.")
            continue

        # Verify master password by trying to decrypt the Fernet key
        try:
            raw_fernet_key = _decrypt_fernet_key(
                open(ENCRYPTED_KEY_FILE, "rb").read(),
                mp,
                cfg["salt"],
            )
            return Fernet(raw_fernet_key)
        except (InvalidToken, Exception):
            attempt += 1
            messagebox.showerror(
                "Wrong Password",
                f"Master password is incorrect. {max_attempts - attempt} attempts left."
            )

    messagebox.showerror("Locked", "Too many failed attempts. Application will close.")
    root.destroy()
    raise SystemExit("Vault locked after too many failed attempts.")


# ── DB setup ───────────────────────────────────────────────────────────────────
def setup_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS passwords (
        id       INTEGER PRIMARY KEY AUTOINCREMENT,
        service  TEXT NOT NULL,
        email    TEXT NOT NULL,
        username TEXT NOT NULL,
        password TEXT NOT NULL
    )''')
    conn.commit()
    conn.close()


# ── Crypto helpers ─────────────────────────────────────────────────────────────
def encrypt_password(cipher: Fernet, password: str) -> str:
    return cipher.encrypt(password.encode()).decode()

def decrypt_password(cipher: Fernet, encrypted_password: str) -> str:
    return cipher.decrypt(encrypted_password.encode()).decode()


# ── Password actions ───────────────────────────────────────────────────────────
def store_password(cipher: Fernet, entries: dict):
    service  = entries["service"].get()
    email    = entries["email"].get()
    username = entries["username"].get()
    password = entries["password"].get()

    if not all([service, email, username, password]):
        messagebox.showwarning("Error", "All fields are required!")
        return

    encrypted_pw = encrypt_password(cipher, password)
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO passwords (service, email, username, password) VALUES (?, ?, ?, ?)",
        (service, email, username, encrypted_pw),
    )
    conn.commit()
    conn.close()

    for e in entries.values():
        e.delete(0, tk.END)
    messagebox.showinfo("Saved", "✅ Password stored securely!")


def get_password(cipher: Fernet, entries: dict):
    email = entries["email"].get()
    if not email:
        messagebox.showwarning("Error", "Email field is required to retrieve a password.")
        return

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT service, username, password FROM passwords WHERE email=?", (email,)
    )
    result = cursor.fetchone()
    conn.close()

    if result:
        service, username, encrypted_pw = result
        decrypted_pw = decrypt_password(cipher, encrypted_pw)
        messagebox.showinfo(
            "Retrieved",
            f"Service:  {service}\nUsername: {username}\nPassword: {decrypted_pw}"
        )
    else:
        messagebox.showwarning("Not Found", "No password found for this email.")


def generate_password(entries: dict):
    chars = string.ascii_letters + string.digits + string.punctuation
    pwd = "".join(secrets.choice(chars) for _ in range(16))
    entries["password"].delete(0, tk.END)
    entries["password"].insert(0, pwd)


# ── Main GUI ───────────────────────────────────────────────────────────────────
def build_main_window(root: tk.Tk, cipher: Fernet):
    root.title("🔐 SafeByte Password Manager")
    root.geometry("700x480")
    root.resizable(False, False)

    # Header
    header = tk.Frame(root, bg="#1a1a2e", pady=12)
    header.pack(fill="x")
    tk.Label(header, text="🔐 SafeByte Password Manager",
             bg="#1a1a2e", fg="#00ff88", font=("Arial", 16, "bold")).pack()
    tk.Label(header, text="Protected by Master Password + OTP",
             bg="#1a1a2e", fg="#888888", font=("Arial", 9)).pack()

    # Form
    form = tk.Frame(root, pady=20)
    form.pack()

    labels = ["Service:", "Email:", "Username:", "Password:"]
    keys   = ["service", "email", "username", "password"]
    entries: dict[str, tk.Entry] = {}

    for i, (lbl, key) in enumerate(zip(labels, keys)):
        tk.Label(form, text=lbl, anchor="e", width=12).grid(row=i, column=0, padx=10, pady=6, sticky="e")
        entry = tk.Entry(form, width=36,
                         show="*" if key == "password" else "")
        entry.grid(row=i, column=1, padx=10, pady=6)
        entries[key] = entry

    # Buttons
    btn_frame = tk.Frame(root)
    btn_frame.pack(pady=8)

    tk.Button(btn_frame, text="💾 Store Password",    width=20,
              command=lambda: store_password(cipher, entries)).grid(row=0, column=0, padx=8, pady=5)
    tk.Button(btn_frame, text="🔍 Retrieve Password", width=20,
              command=lambda: get_password(cipher, entries)).grid(row=0, column=1, padx=8, pady=5)
    tk.Button(btn_frame, text="⚡ Generate Password",  width=20,
              command=lambda: generate_password(entries)).grid(row=1, column=0, padx=8, pady=5)

    # Status bar
    tk.Label(root, text="🔒 Vault unlocked — session active",
             fg="#00aa55", font=("Arial", 9)).pack(side="bottom", pady=6)


# ── Entry point ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    root = tk.Tk()
    root.withdraw()  # hide root until auth passes

    setup_db()

    cfg = _load_auth_config()

    if cfg is None or not os.path.exists(ENCRYPTED_KEY_FILE):
        # First run — set up master password + TOTP
        cipher, _ = first_run_setup(root)
    else:
        # Returning user — login gate
        cipher = login(root, cfg)

    # Auth passed — show main window
    root.deiconify()
    build_main_window(root, cipher)
    root.mainloop()

    # Wipe cipher from memory on close
    del cipher
