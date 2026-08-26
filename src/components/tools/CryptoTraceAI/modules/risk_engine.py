# Risk thresholds are expressed in each network's native unit.
# Values are approximate "significant holding" levels per chain.

_BALANCE_TIERS = {
    #  network    : (low,  mid,  high)  — native coin amounts
    "Ethereum":    (1,     10,   100),
    "Bitcoin":     (0.05,  0.5,  5),
    "Tron":        (1000,  10000, 100000),
    "Litecoin":    (5,     50,   500),
    "Dogecoin":    (5000,  50000, 500000),
    "XRP":         (100,   1000, 10000),
    "Cardano":     (500,   5000, 50000),
}

_DEFAULT_TIERS = (1, 10, 100)


def calculate_risk(balance, tx_count, registry_hit, linked_cases, network="Ethereum"):
    """
    Calculate a 0-100 risk score and threat level label.

    Parameters
    ----------
    balance      : float  — wallet balance in native coin units
    tx_count     : int    — total transaction count
    registry_hit : bool   — wallet found in high-risk registry
    linked_cases : list   — list of linked case IDs
    network      : str    — detected network name (default "Ethereum")

    Returns
    -------
    (score: int, threat_level: str)
    """
    score = 0

    low, mid, high = _BALANCE_TIERS.get(network, _DEFAULT_TIERS)

    # Balance scoring — tiered per network
    if balance >= low:
        score += 10
    if balance >= mid:
        score += 20
    if balance >= high:
        score += 30

    # Transaction volume scoring — same across all networks
    if tx_count > 100:
        score += 10
    if tx_count > 1000:
        score += 20

    # Registry hit
    if registry_hit:
        score += 30

    # Linked case penalty
    score += len(linked_cases) * 5

    # Cap at 100
    score = min(score, 100)

    if score < 25:
        threat_level = "LOW"
    elif score < 50:
        threat_level = "MEDIUM"
    elif score < 75:
        threat_level = "HIGH"
    else:
        threat_level = "CRITICAL"

    return score, threat_level
