from rich.console import Console
from rich.panel import Panel
from rich.columns import Columns
from rich.table import Table

from modules.balance_checker import (
    get_eth_balance,
    get_btc_balance,
    get_trx_balance,
    get_ltc_balance,
    get_doge_balance,
    get_xrp_balance,
    get_ada_balance,
)
from modules.transaction_intelligence import (
    get_transaction_intelligence,
    get_btc_transaction_intelligence,
    get_trx_transaction_intelligence,
    get_ltc_transaction_intelligence,
    get_doge_transaction_intelligence,
    get_xrp_transaction_intelligence,
    get_ada_transaction_intelligence,
)
from modules.registry_checker import check_registry
from modules.case_lookup import get_linked_cases
from modules.risk_engine import calculate_risk

console = Console()

# ─── Network config map ───────────────────────────────────────────────────────
# Maps wallet_type → (balance_fn, intelligence_fn, currency_symbol)

NETWORK_CONFIG = {
    "Ethereum": (get_eth_balance,  get_transaction_intelligence,     "ETH"),
    "Bitcoin":  (get_btc_balance,  get_btc_transaction_intelligence, "BTC"),
    "Tron":     (get_trx_balance,  get_trx_transaction_intelligence, "TRX"),
    "Litecoin": (get_ltc_balance,  get_ltc_transaction_intelligence, "LTC"),
    "Dogecoin": (get_doge_balance, get_doge_transaction_intelligence,"DOGE"),
    "XRP":      (get_xrp_balance,  get_xrp_transaction_intelligence, "XRP"),
    "Cardano":  (get_ada_balance,  get_ada_transaction_intelligence, "ADA"),
}


def detect_wallet(address):
    """Heuristic network detection from address format."""
    address = address.strip()

    if address.startswith("0x") and len(address) == 42:
        return "Ethereum"

    if address.startswith("T") and len(address) == 34:
        return "Tron"

    if (
        address.startswith("1")
        or address.startswith("3")
        or address.startswith("bc1")
    ):
        return "Bitcoin"

    if address.startswith("ltc1") or address.startswith("L") or address.startswith("M"):
        return "Litecoin"

    if address.startswith("D") and len(address) == 34:
        return "Dogecoin"

    if address.startswith("r") and 25 <= len(address) <= 34:
        return "XRP"

    if address.startswith("addr1"):
        return "Cardano"

    return "Unknown"


def wallet_analysis():
    address = input("\nEnter Wallet Address : ").strip()

    wallet_type = detect_wallet(address)

    if wallet_type == "Unknown":
        console.print(
            "[bold red]Invalid or Unsupported Wallet Address[/bold red]"
        )
        input("\nPress Enter...")
        return

    console.print(
        f"\n[bold cyan]Detected Network : {wallet_type}[/bold cyan]"
    )

    # ── Fetch balance ──────────────────────────────────────────────────────────
    balance_fn, intelligence_fn, symbol = NETWORK_CONFIG[wallet_type]

    balance_text = "N/A"
    status       = "Offline"
    balance_raw  = 0.0

    with console.status(f"[yellow]Fetching {wallet_type} balance...[/yellow]"):
        balance_raw = balance_fn(address)

    if balance_raw is not None:
        balance_text = f"{balance_raw:.6f} {symbol}"
        status       = "ACTIVE"
    else:
        balance_raw = 0.0

    # ── Fetch transaction intelligence ────────────────────────────────────────
    total_tx = incoming = outgoing = 0
    total_received = total_sent = 0.0
    first_activity = last_activity = "Unknown"
    wallet_age = 0
    recent_transactions = []

    with console.status(f"[yellow]Fetching {wallet_type} transaction history...[/yellow]"):
        tx_info = intelligence_fn(address)

    if tx_info:
        total_tx        = tx_info["total_tx"]
        incoming        = tx_info["incoming"]
        outgoing        = tx_info["outgoing"]
        total_received  = tx_info["received"]
        total_sent      = tx_info["sent"]
        first_activity  = tx_info["first_activity"]
        last_activity   = tx_info["last_activity"]
        wallet_age      = tx_info["wallet_age"]
        recent_transactions = tx_info["recent_transactions"]

    # ── Registry & case lookup ────────────────────────────────────────────────
    registry_status   = "CLEAR"
    linked_case_count = 0
    risk_score        = 0
    threat_level      = "LOW"

    registry_hit = check_registry(address)

    if registry_hit:
        registry_status = "HIGH RISK"

    linked_cases      = get_linked_cases(address)
    linked_case_count = len(linked_cases)

    risk_score, threat_level = calculate_risk(
        balance_raw,
        total_tx,
        bool(registry_hit),
        linked_cases,
        wallet_type,
    )

    # ── Render panels ─────────────────────────────────────────────────────────
    wallet_panel = Panel(
        f"""
    Network : {wallet_type}

    Balance : {balance_text}

    Status  : {status}
    """,
        title="WALLET INFO",
        border_style="cyan",
    )

    tx_panel = Panel(
        f"""
    Total TX : {total_tx}

    Incoming : {incoming}

    Outgoing : {outgoing}
    """,
        title="TRANSACTION STATS",
        border_style="green",
    )

    risk_panel = Panel(
        f"""
    Score  : {risk_score}/100

    Threat : {threat_level}
    """,
        title="RISK ENGINE",
        border_style="red",
    )

    investigation_panel = Panel(
        f"""
    Registry : {registry_status}

    Cases    : {linked_case_count}
    """,
        title="INVESTIGATION",
        border_style="yellow",
    )

    console.print(Columns([wallet_panel, tx_panel]))
    console.print(Columns([risk_panel, investigation_panel]))

    console.print(
        Panel(
            f"""
    First Activity : {first_activity}

    Last Activity  : {last_activity}

    Wallet Age     : {wallet_age} Days

    Total Received : {total_received} {symbol}

    Total Sent     : {total_sent} {symbol}
    """,
            title="BLOCKCHAIN INTELLIGENCE",
            border_style="magenta",
        )
    )

    # ── Recent transactions table ─────────────────────────────────────────────
    if recent_transactions:
        table = Table(title="RECENT TRANSACTIONS")
        table.add_column("HASH")
        table.add_column("VALUE")
        table.add_column("DATE")

        for tx in recent_transactions:
            table.add_row(
                tx.get("hash",  "N/A"),
                f"{tx.get('value', 0)} {symbol}",
                tx.get("date",  "N/A"),
            )

        console.print(table)
    else:
        console.print("[dim]No recent transactions found.[/dim]")

    input("\nPress Enter...")
