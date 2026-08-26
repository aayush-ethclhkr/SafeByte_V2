import os
import sys
from rich.console import Console
from rich.panel import Panel

console = Console()


def main_menu():

    while True:

        os.system("cls" if os.name == "nt" else "clear")

        console.print(
            Panel(
                """
[bold cyan]
  ██████╗██████╗ ██╗   ██╗██████╗ ████████╗ ██████╗
 ██╔════╝██╔══██╗╚██╗ ██╔╝██╔══██╗╚══██╔══╝██╔═══██╗
 ██║     ██████╔╝ ╚████╔╝ ██████╔╝   ██║   ██║   ██║
 ██║     ██╔══██╗  ╚██╔╝  ██╔═══╝    ██║   ██║   ██║
 ╚██████╗██║  ██║   ██║   ██║        ██║   ╚██████╔╝
  ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═╝        ╚═╝    ╚═════╝
[/bold cyan]
[bold yellow]      ████████╗██████╗  █████╗  ██████╗███████╗[/bold yellow]
[bold yellow]         ██╔══╝██╔══██╗██╔══██╗██╔════╝██╔════╝[/bold yellow]
[bold yellow]         ██║   ██████╔╝███████║██║     █████╗  [/bold yellow]
[bold yellow]         ██║   ██╔══██╗██╔══██║██║     ██╔══╝  [/bold yellow]
[bold yellow]         ██║   ██║  ██║██║  ██║╚██████╗███████╗[/bold yellow]
[bold yellow]         ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚══════╝[/bold yellow]

[bold red]          ██████╗ ██╗                    [/bold red]
[bold red]          ██╔══██╗██║                    [/bold red]
[bold red]          ███████║██║                    [/bold red]
[bold red]          ██╔══██║██║                    [/bold red]
[bold red]          ██║  ██║██║                    [/bold red]
[bold red]          ╚═╝  ╚═╝╚═╝                    [/bold red]

[dim]       SafeByte Platform — CryptoTrace AI Tool[/dim]
[dim]       Powered by SafeByte[/dim]
                """,
                title="[bold green]CRYPTOTRACE AI[/bold green]",
                border_style="green",
            )
        )

        console.print("""
[bold cyan][1][/bold cyan]  🔍  Wallet Analysis
[bold cyan][2][/bold cyan]  📋  Case Management
[bold cyan][3][/bold cyan]  👁   Wallet Tracker / Watchlist
[bold cyan][4][/bold cyan]  🗂   Wallet Registry
[bold cyan][5][/bold cyan]  📄  Report Generator
[bold cyan][6][/bold cyan]  📊  System Dashboard
[bold cyan][0][/bold cyan]  ❌  Exit
""")

        choice = input("Select Option > ").strip()

        if choice == "1":
            from modules.wallet_detector import wallet_analysis
            wallet_analysis()

        elif choice == "2":
            case_menu()

        elif choice == "3":
            tracker_menu()

        elif choice == "4":
            from modules.wallet_registry import wallet_registry_menu
            wallet_registry_menu()

        elif choice == "5":
            report_menu()

        elif choice == "6":
            dashboard_menu()

        elif choice == "0":
            console.print(
                "\n[bold red]CRYPTOTRACE AI SESSION TERMINATED[/bold red]\n"
            )
            sys.exit(0)


def case_menu():

    from modules.case_manager import (
        create_case,
        view_cases,
        search_case,
        close_case,
        delete_case,
    )

    while True:

        os.system("cls" if os.name == "nt" else "clear")

        console.print(
            Panel(
                """
[bold cyan][1][/bold cyan]  Create Case
[bold cyan][2][/bold cyan]  View All Cases
[bold cyan][3][/bold cyan]  Search Case
[bold cyan][4][/bold cyan]  Close Case
[bold cyan][5][/bold cyan]  Delete Case
[bold cyan][0][/bold cyan]  Back
                """,
                title="CASE MANAGEMENT",
                border_style="cyan",
            )
        )

        choice = input("Select Option > ").strip()

        if choice == "1":
            create_case()
        elif choice == "2":
            view_cases()
            input("\nPress Enter...")
        elif choice == "3":
            search_case()
        elif choice == "4":
            close_case()
        elif choice == "5":
            delete_case()
        elif choice == "0":
            break


def tracker_menu():

    from modules.wallet_tracker import (
        track_wallet,
        view_watchlist,
        remove_wallet,
    )

    while True:

        os.system("cls" if os.name == "nt" else "clear")

        console.print(
            Panel(
                """
[bold cyan][1][/bold cyan]  Track Wallet
[bold cyan][2][/bold cyan]  View Watchlist
[bold cyan][3][/bold cyan]  Remove Wallet
[bold cyan][0][/bold cyan]  Back
                """,
                title="WALLET TRACKER",
                border_style="yellow",
            )
        )

        choice = input("Select Option > ").strip()

        if choice == "1":
            track_wallet()
        elif choice == "2":
            view_watchlist()
        elif choice == "3":
            remove_wallet()
        elif choice == "0":
            break


def report_menu():

    from modules.report_generator import (
        generate_report,
        view_reports,
        delete_report,
        export_all_cases,
    )
    from modules.pdf_report import generate_pdf_report

    while True:

        os.system("cls" if os.name == "nt" else "clear")

        console.print(
            Panel(
                """
[bold cyan][1][/bold cyan]  Generate TXT Report
[bold cyan][2][/bold cyan]  Generate PDF Report
[bold cyan][3][/bold cyan]  View Reports
[bold cyan][4][/bold cyan]  Export All Cases
[bold cyan][5][/bold cyan]  Delete Report
[bold cyan][0][/bold cyan]  Back
                """,
                title="REPORT GENERATOR",
                border_style="magenta",
            )
        )

        choice = input("Select Option > ").strip()

        if choice == "1":
            generate_report()
        elif choice == "2":
            generate_pdf_report()
        elif choice == "3":
            view_reports()
        elif choice == "4":
            export_all_cases()
        elif choice == "5":
            delete_report()
        elif choice == "0":
            break


def dashboard_menu():

    from modules.dashboard import (
        system_dashboard,
        database_status,
        api_health_check,
        investigation_statistics,
        recent_activity,
        platform_information,
        threat_intelligence,
    )

    while True:

        os.system("cls" if os.name == "nt" else "clear")

        console.print(
            Panel(
                """
[bold cyan][1][/bold cyan]  System Dashboard
[bold cyan][2][/bold cyan]  Database Status
[bold cyan][3][/bold cyan]  API Health Check
[bold cyan][4][/bold cyan]  Investigation Statistics
[bold cyan][5][/bold cyan]  Recent Activity
[bold cyan][6][/bold cyan]  Platform Information
[bold cyan][7][/bold cyan]  Threat Intelligence
[bold cyan][0][/bold cyan]  Back
                """,
                title="SYSTEM DASHBOARD",
                border_style="green",
            )
        )

        choice = input("Select Option > ").strip()

        if choice == "1":
            system_dashboard()
        elif choice == "2":
            database_status()
        elif choice == "3":
            api_health_check()
        elif choice == "4":
            investigation_statistics()
        elif choice == "5":
            recent_activity()
        elif choice == "6":
            platform_information()
        elif choice == "7":
            threat_intelligence()
        elif choice == "0":
            break


if __name__ == "__main__":
    main_menu()
