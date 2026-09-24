# SafeByte alignment for SIH26182 and SIH26183

## Submission identity

**Product name:** SafeByte CryptoTrace VASP

**Primary problem statement:** SIH26182

**Closely related workflow:** SIH26183

**Organization:** Ministry of Home Affairs, Indian Cyber Crime Coordination Centre

**Theme:** Blockchain and Cybersecurity

## Problem addressed

Investigators often receive a cryptocurrency wallet from a victim complaint without knowing which exchange or custodial service ultimately received the funds. Manual tracing takes time, particularly when a fraudster moves funds through intermediary wallets, bridges, mixers, or several chains.

SafeByte converts the reported wallet into a structured investigation case. It collects available blockchain evidence, shows recent fund movement, checks known risky entities, calculates a risk score, and records whether the current evidence supports an attribution. The case can then move to a verified blockchain-intelligence source and the relevant VASP for lawful action.

## Investigation workflow

1. **Complaint intake:** Record an NCRP, SAHYOG, or manual LEA case ID and the reported wallet.
2. **Chain recognition:** Detect the wallet format and choose the relevant blockchain endpoint.
3. **Evidence collection:** Capture balance, transaction history, activity dates, and recent counterparties where available.
4. **Risk checks:** Compare the wallet against known high-risk records and score observable activity.
5. **Fund-flow analysis:** Display recent incoming and outgoing paths around the subject wallet.
6. **VASP attribution:** Report a known entity only when the registry provides a supporting match. Otherwise mark the result as inconclusive and request a deeper trace.
7. **Evidence export:** Generate a structured JSON package with the case details, findings, evidence, limitations, and recommended action.
8. **Lawful follow-up:** Validate the attribution and route the preservation, disclosure, or freezing request to the relevant VASP.

## Architecture

| Layer | Present prototype | Next implementation |
|---|---|---|
| Intake | Browser form for NCRP, SAHYOG, and manual references | Authenticated NCRP and SAHYOG API adapters |
| Chain adapter | Etherscan, Blockchain.info, and TronGrid | Solana, Polygon, BNB Chain, and indexed archival nodes |
| Graph engine | Recent one-hop counterparties | Breadth-first multi-hop tracing with value and time filters |
| Entity intelligence | Demonstration high-risk registry | Versioned VASP clusters, deposit wallets, hot wallets, mixers, bridges, and sanctions data |
| Attribution | Exact-match evidence status | Weighted multi-signal confidence model with analyst review |
| Case output | JSON evidence package | Signed PDF, hash manifest, chain of custody, and role-based case storage |
| Deployment | Browser prototype | Secure LEA deployment with audit logs and controlled data retention |

## Honest prototype boundary

The current interface must not claim that a wallet belongs to a particular exchange unless the available registry contains evidence for that match. Public chain data alone does not establish beneficial ownership. Any enforcement action requires analyst validation and an approved attribution source.

## Demonstration sequence

1. Open **CryptoTrace VASP**.
2. Enter a sample complaint ID and choose NCRP or SAHYOG.
3. Run a normal Ethereum or Bitcoin address to demonstrate live evidence collection and an inconclusive attribution.
4. Run the supplied sanctioned demonstration address to show an exact high-risk registry match.
5. Review the risk explanation, recent transactions, and fund-flow evidence.
6. Download the JSON evidence package and show the recorded limitations.
7. Explain how the production graph engine would continue tracing until it reaches a verified VASP cluster.

## Development priorities

### Priority 1

- Preserve a stable case ID throughout the investigation.
- Add two-hop and three-hop traversal for Ethereum and Bitcoin.
- Store complete transaction hashes and counterparties in the evidence package.
- Add a versioned VASP registry schema with source and last-verified fields.

### Priority 2

- Add BNB Chain, Polygon, Solana, and Tron transaction adapters.
- Detect bridges, mixers, rapid peeling chains, and consolidation patterns.
- Calculate attribution confidence from independent evidence signals.
- Add an analyst confirmation step before a case becomes actionable.

### Priority 3

- Integrate approved NCRP and SAHYOG interfaces.
- Add signed reports, audit logs, access control, and evidence retention rules.
- Deploy an internal indexer for scale and predictable response time.

## Supporting SafeByte modules

- **FraudEye** can validate phishing URLs and UPI evidence attached to the original complaint.
- **Malware Detector** can inspect files submitted with a ransomware or fraud case.
- **VulnHawk** can assess exposed infrastructure connected to a malicious service.
- **Desktop tools** can support local evidence collection, but they remain supporting modules rather than the core SIH solution.
