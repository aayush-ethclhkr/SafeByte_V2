export interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
}

// ── Knowledge Base ─────────────────────────────────────────────────────────────

const KB = {
  company: {
    name: "SafeByte",
    founded: 2018,
    tagline: "Securing the Digital Future",
    description:
      "SafeByte is a full-spectrum cybersecurity consultancy and tooling company. We started as a specialized penetration testing firm in 2018 and have grown into a trusted security partner for enterprises, governments, and high-growth startups.",
    team: "80+ security engineers, researchers, and analysts",
    offices: "6 global offices",
    clientsProtected: "340+",
    assessmentsDone: "4,000+",
    uptime: "99.7%",
    responseTime: "under 4 minutes",
    threatsNeutralized: "2,847",
    industries: "financial services, healthcare, critical infrastructure, and technology",
    location: "Meerut, Uttar Pradesh, India",
  },

  mission:
    "Make enterprise security accessible and effective. We believe every organization, regardless of size, deserves access to world-class security expertise. Our mission is to democratize advanced threat detection and response capabilities through innovative tools and dedicated partnerships.",

  vision:
    "A world where digital trust is the default — where organizations can innovate confidently knowing their digital infrastructure is resilient against evolving threats.",

  values: [
    { name: "Integrity",   desc: "We operate with transparency and uphold the highest ethical standards in every engagement." },
    { name: "Precision",   desc: "Our methodologies are refined through thousands of real-world assessments across industries." },
    { name: "Vigilance",   desc: "Threats don't sleep, neither do we. Continuous monitoring is embedded in everything we build." },
    { name: "Partnership", desc: "We don't just deliver reports — we embed with your team to build lasting security culture." },
  ],

  certifications: ["OSCP", "CISSP", "CEH", "CISM", "AWS Security Specialty", "ISO 27001"],

  trustedBy: ["Meridian Corp", "Vaultline", "Arcsys", "Northgate Labs", "Hexacore"],

  testimonial: {
    quote: "SafeByte transformed our security posture. Their team identified critical vulnerabilities we'd missed for years and deployed solutions within days.",
    author: "Rachel Matsuda",
    role: "CTO, Vaultline Technologies",
  },

  contact: {
    email: "team.safebyte@gmail.com",
    phone: "+91 89238 17932",
    emergency: "+1 (555) 742-9911",
    address: "Meerut, Uttar Pradesh, India",
    responseTime: "within 24 hours",
    freeOffer: "free initial security assessment / consultation",
  },

  services: [
    {
      name: "Penetration Testing",
      keywords: ["pentest", "penetration", "pen test", "red team", "offensive"],
      desc: "Our OSCP-certified team simulates real-world attack scenarios across web applications, APIs, mobile apps, and internal networks. Every test includes manual exploitation, privilege escalation attempts, and detailed proof-of-concept documentation — not just automated scans.",
      features: ["Web & API Testing", "Internal Network Testing", "Mobile Application Testing", "Social Engineering Assessments"],
    },
    {
      name: "Malware Analysis",
      keywords: ["malware", "reverse engineer", "binary", "payload", "virus", "ransomware", "trojan"],
      desc: "Our reverse engineering lab analyzes suspicious binaries, scripts, and payloads to determine capabilities, origin, and impact. We deliver actionable intelligence so your team can respond faster and prevent re-infection.",
      features: ["Static & Dynamic Analysis", "Behavioral Sandboxing", "Indicator of Compromise Extraction", "Threat Intelligence Reports"],
    },
    {
      name: "Risk Assessment",
      keywords: ["risk", "assessment", "nist", "iso 27001", "cis", "compliance", "framework", "posture"],
      desc: "Comprehensive evaluation of your security posture mapped to frameworks like NIST CSF, ISO 27001, and CIS Controls. We identify gaps, prioritize remediation, and build a roadmap aligned with your business objectives.",
      features: ["Framework Compliance Mapping", "Asset Discovery & Classification", "Threat Modeling", "Executive Risk Reports"],
    },
    {
      name: "Network Security",
      keywords: ["network", "firewall", "ids", "ips", "intrusion", "soc", "segmentation"],
      desc: "Design and deploy robust network defenses including firewall configuration, segmentation strategies, and intrusion detection systems. Continuous monitoring ensures threats are identified and contained in real time.",
      features: ["Firewall & IDS/IPS Configuration", "Network Segmentation", "Traffic Analysis", "24/7 SOC Monitoring"],
    },
    {
      name: "Cloud Security",
      keywords: ["cloud", "aws", "azure", "gcp", "s3", "iam", "container", "kubernetes"],
      desc: "Secure your AWS, Azure, and GCP environments with configuration auditing, identity management reviews, and continuous compliance monitoring. We architect cloud-native security controls that scale with your infrastructure.",
      features: ["Cloud Configuration Audit", "IAM Review & Hardening", "Container Security", "Compliance Automation"],
    },
    {
      name: "Incident Response",
      keywords: ["incident", "breach", "hacked", "attack", "response", "forensic", "compromised", "crisis"],
      desc: "When a breach occurs, our rapid response team deploys within hours to contain the threat, preserve evidence, and restore operations. Post-incident, we conduct thorough forensic analysis and deliver recommendations to prevent recurrence.",
      features: ["24/7 Rapid Response", "Digital Forensics", "Evidence Preservation", "Post-Incident Review"],
    },
  ],

  // ── WEB TOOLS ──────────────────────────────────────────────────────────────
  webTools: [
    {
      name: "Malware Detector",
      version: "v1.0.1",
      route: "/tools/malware-scanner",
      keywords: ["malware", "malware detector", "file scan", "virus scan", "file threat", "hash", "virustotal", "pe analysis"],
      desc: "Upload any file for instant static analysis — entirely in your browser. No file ever leaves your device.",
      howItWorks: [
        "Reads the file as raw bytes in the browser",
        "Computes MD5 and SHA-256 hashes using Web Crypto API",
        "Detects file type from magic bytes (EXE, ELF, PDF, ZIP, etc.)",
        "Scans for 15 suspicious string patterns: URLs, PowerShell, CMD, credential strings, persistence locations, crypto references, injection APIs",
        "Analyses Windows PE structure: reads PE header, checks section entropy (>7.0 = packed/encrypted), detects 10 dangerous API names like VirtualAllocEx, CreateRemoteThread, CryptEncrypt",
        "Queries VirusTotal by MD5 hash — returns detection count across 70+ antivirus engines",
        "Calculates a verdict score: MALICIOUS (≥40) / SUSPICIOUS (≥20) / POTENTIALLY UNWANTED (≥5) / CLEAN",
      ],
      techUsed: "Web Crypto API, VirusTotal v3 API, pure JavaScript file processing",
    },
    {
      name: "Vulnerability Assessment Tool",
      shortName: "VulnHawk",
      version: "v1.0.1",
      route: "/tools/vuln-scanner",
      keywords: ["vuln", "vulnerability", "cve", "nvd", "epss", "cvss", "vulnhawk", "software stack", "attack surface"],
      desc: "Enter your software stack and get a full CVE analysis with real exploitation probabilities and a prioritised fix roadmap.",
      howItWorks: [
        "You enter software names and versions (e.g. nginx 1.18.0, openssl 1.1.1)",
        "Queries the NVD (NIST National Vulnerability Database) API for matching CVEs",
        "Fetches EPSS scores from FIRST.org — the probability each CVE is exploited in the wild (0–100%)",
        "Calculates a Priority Score per CVE: CVSS × (EPSS × 10 + 1)",
        "Rewrites technical CVE descriptions into plain English",
        "Computes an Attack Surface Score (0–100): CRITICAL×20, HIGH×10, MEDIUM×4, high EPSS bonus×8",
        "Displays results with expandable CVE cards, fix version info, and references",
      ],
      presets: ["Web Server", "SSH Server", "LAMP Stack", "Node.js App", "Database"],
      techUsed: "NVD API (NIST), EPSS API (FIRST.org)",
    },
    {
      name: "FraudEye Scanner",
      version: "v1.0.1",
      route: "/tools/fraud-scanner",
      keywords: ["fraud", "fraudeye", "qr", "upi", "voice", "deepfake", "url", "scam", "phishing", "payment"],
      desc: "AI-powered fraud detection with three modes: QR Code Scanner, Voice Deepfake Detector, and URL Safety Checker.",
      modes: {
        qr: {
          name: "QR Code Scanner",
          desc: "Detects UPI payment request scams. Parses the UPI string and checks if mode=02 is present — which means the QR is asking YOU to pay money, not receive it. Flags payment request QRs as DANGER immediately.",
        },
        voice: {
          name: "Voice Deepfake Detector",
          desc: "Uses the browser's Web Audio API to analyse audio files (MP3, WAV, M4A, OGG) for AI-synthesis markers without any model download. Analyses 5 acoustic features across thousands of frames: Zero Crossing Rate, Pitch Variance, Energy Variance, Silence Pattern, and Spectral Flatness. A suspicion score ≥55 = DANGER (AI voice), ≥30 = WARNING, <30 = SAFE.",
        },
        url: {
          name: "URL Safety Checker",
          desc: "Runs 9 local regex pattern checks (SQL injection, XSS, command injection, path traversal, phishing, scam patterns) then cross-references with VirusTotal URL reputation API. Merges both results into a final SAFE / WARNING / DANGER verdict.",
        },
      },
      techUsed: "Web Audio API, VirusTotal v3 API, browser-native analysis",
    },
    {
      name: "CryptoTrace AI",
      version: "v1.0.0",
      route: "/tools/crypto-trace",
      keywords: ["crypto", "cryptotrace", "blockchain", "wallet", "bitcoin", "ethereum", "tron", "btc", "eth", "trx", "ofac", "risk score", "wallet trace", "crypto trace", "address", "transaction"],
      desc: "Trace any blockchain wallet — live balance lookup, full transaction intelligence, 0–100 risk scoring, and cross-reference against an OFAC-sanctioned wallet registry. All analysis runs in your browser.",
      supportedChains: ["Ethereum (0x…)", "Bitcoin (1…, 3…, bc1…)", "Tron (T…)", "Litecoin", "Dogecoin", "XRP", "Cardano"],
      howItWorks: [
        "Auto-detects the blockchain network from the wallet address format",
        "Fetches live balance via Etherscan (ETH), Blockchain.info (BTC), or TronGrid (TRX)",
        "Retrieves full transaction history: total count, incoming/outgoing, total received/sent, wallet age, recent 5 transactions",
        "Cross-references the address against a built-in high-risk registry of OFAC-sanctioned addresses (Lazarus Group/DPRK, Tornado Cash relayers) and known darknet-linked wallets",
        "Runs the risk engine: balance tiers per chain + transaction volume + registry hits = score 0–100",
        "Threat levels: LOW (<25) · MEDIUM (<50) · HIGH (<75) · CRITICAL (≥75)",
        "Shows score ring, wallet info, transaction stats, blockchain intelligence, recent TX table, and explorer deep-link",
      ],
      techUsed: "Etherscan v2 API, Blockchain.info API, TronGrid API",
    },
  ],

  // ── DESKTOP / SYSTEM AUDITING TOOLS ───────────────────────────────────────
  desktopTools: [
    {
      name: "Password Manager",
      version: "v2.0.0",
      platform: "macOS · Windows",
      keywords: ["password", "credential", "vault", "password manager", "fernet", "totp", "2fa", "authenticator"],
      desc: "GUI-based credential vault with two-factor protection. No installation needed beyond the app itself.",
      details: [
        "Master password hashed with PBKDF2-HMAC-SHA256 (100,000 iterations)",
        "Vault encrypted with Fernet (AES-128-CBC + HMAC-SHA256)",
        "TOTP second factor via PyOTP — compatible with Google Authenticator",
        "Credentials stored in an encrypted SQLite database",
        "The encryption key is NEVER stored in plaintext",
        "Features: store, retrieve, update, delete credentials + generate strong passwords",
      ],
      downloads: {
        mac: "/downloads/SafeByte-Password-Manager-macOS.zip",
        windows: "/downloads/SafeByte-Password-Manager-Windows.exe",
        guide: "/downloads/password_manager_user_guide.pdf",
      },
    },
    {
      name: "File System Crawler",
      version: "v2.0.0",
      platform: "macOS · Windows",
      keywords: ["file crawler", "file system", "directory scan", "file scanner", "crawl"],
      desc: "Scan any directory for malware and suspicious files using MD5/SHA-256 hashing and VirusTotal's 70+ antivirus engines.",
      details: [
        "Recursively crawls any target directory",
        "Hashes every file with MD5 and SHA-256",
        "Checks each hash against VirusTotal's 70+ antivirus engines",
        "Flags threats using local heuristics: dangerous filenames, suspicious extensions, known persistence locations",
        "Live results table with SAFE / SUSPICIOUS / MALICIOUS verdicts",
        "Export results to CSV or TXT",
      ],
      downloads: {
        mac: "/downloads/SafeByte-File-Crawler-macOS.zip",
        windows: "/downloads/SafeByte-File-Crawler-Windows.exe",
        guide: "/downloads/file_lister_user_guide.pdf",
      },
    },
    {
      name: "USB Detection Tool",
      version: "v2.0.0",
      platform: "macOS · Windows",
      keywords: ["usb", "usb detection", "usb monitor", "device", "external drive", "removable"],
      desc: "Real-time background monitor that detects USB and external device connections/disconnections the moment they happen.",
      details: [
        "Runs silently in the system tray",
        "Detects any USB or external device the moment it is connected or disconnected",
        "Plays an audio beep alert on detection",
        "Sends a native OS notification",
        "Logs every event: timestamp, device name, vendor ID, product ID, serial number",
        "Export event log to CSV at any time",
      ],
      downloads: {
        mac: "/downloads/SafeByte-USB-Monitor-macOS.zip",
        windows: "/downloads/SafeByte-USB-Monitor-Windows.exe",
      },
    },
  ],

  pages: [
    { name: "Home",     path: "/",        desc: "Landing page with hero, services overview, tools highlight, trusted clients, testimonial, and CTA" },
    { name: "About",    path: "/about",   desc: "Company background, mission, vision, core values, team certifications" },
    { name: "Services", path: "/services",desc: "Detailed breakdown of all 6 security services with feature lists" },
    { name: "Tools",    path: "/tools",   desc: "Full tools catalogue — System Auditing Tools (desktop) and Web Tools sections" },
    { name: "Contact",  path: "/contact", desc: "Contact form with auto-reply, plus email, phone, and office address" },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function match(input: string, keywords: string[]): boolean {
  const lower = input.toLowerCase();
  return keywords.some((k) => lower.includes(k.toLowerCase()));
}

// ── Response generator ────────────────────────────────────────────────────────

export function getBotResponse(userInput: string): string {
  const q = userInput.toLowerCase().trim();

  // ── Greeting ────────────────────────────────────────────────────────────────
  if (match(q, ["hi", "hello", "hey", "good morning", "good evening", "howdy", "sup", "yo"])) {
    return "Hey there! 👋 I'm the SafeByte assistant.\n\nI can help you with:\n• **Services** — pen testing, cloud security, incident response\n• **Tools** — our web tools and desktop apps\n• **Company info** — team, certs, mission\n• **Contact** — email, phone, free consultation\n\nWhat would you like to know?";
  }

  // ── Farewell ────────────────────────────────────────────────────────────────
  if (match(q, ["bye", "goodbye", "see you", "thanks", "thank you", "thx", "cheers", "later"])) {
    return "Thanks for reaching out! Stay safe and secure. 🔒 Come back anytime — we're always here.";
  }

  // ── Emergency / active incident ─────────────────────────────────────────────
  if (match(q, ["emergency", "breach", "hacked", "attack", "urgent", "crisis", "compromised", "ransomware hit", "under attack"])) {
    return `🚨 **Active Security Incident?**\n\nCall our 24/7 emergency hotline immediately:\n\n📞 **${KB.contact.emergency}**\n\nOur Incident Response team deploys within hours to:\n• Contain the threat\n• Preserve forensic evidence\n• Restore operations\n• Conduct post-incident analysis\n\nYou can also email ${KB.contact.email} with URGENT in the subject line.`;
  }

  // ── Contact ─────────────────────────────────────────────────────────────────
  if (match(q, ["contact", "email", "phone", "reach", "address", "location", "office", "where are you", "get in touch"])) {
    return `📬 **Contact SafeByte**\n\n• **Email:** ${KB.contact.email}\n• **Phone:** ${KB.contact.phone}\n• **Office:** ${KB.contact.address}\n• **Emergency Hotline (24/7):** ${KB.contact.emergency}\n\nOr use the Contact form on the website — we respond ${KB.contact.responseTime}. We also offer a **free initial consultation**.`;
  }

  // ── Free consultation / assessment ──────────────────────────────────────────
  if (match(q, ["free", "consultation", "free audit", "free assessment", "demo", "get started", "try", "pricing", "cost", "how much", "rate", "fee", "quote", "price"])) {
    return `💬 **Pricing & Free Consultation**\n\nOur pricing is tailored to your organization's size, scope, and requirements.\n\nWe offer a **free initial security consultation** — no strings attached. It's the best way to get an accurate scope and quote.\n\n• **Email:** ${KB.contact.email}\n• **Phone:** ${KB.contact.phone}\n• **Contact Form:** /contact\n\nWe respond ${KB.contact.responseTime}.`;
  }

  // ── About / company ─────────────────────────────────────────────────────────
  if (match(q, ["about", "who are you", "what is safebyte", "company", "safebyte", "founded", "history", "background", "tell me about"])) {
    const c = KB.company;
    return `🛡️ **About SafeByte**\n\n${c.description}\n\n• **Founded:** ${c.founded}\n• **Team:** ${c.team}\n• **Global Offices:** ${c.offices}\n• **Clients Protected:** ${c.clientsProtected}\n• **Security Assessments Done:** ${c.assessmentsDone}\n• **Location:** ${c.location}\n• **Industries Served:** ${c.industries}`;
  }

  // ── Mission ─────────────────────────────────────────────────────────────────
  if (match(q, ["mission", "purpose", "goal", "objective", "why do you exist"])) {
    return `🎯 **Our Mission**\n\n${KB.mission}`;
  }

  // ── Vision ──────────────────────────────────────────────────────────────────
  if (match(q, ["vision", "future", "aspire", "where are you going"])) {
    return `🔭 **Our Vision**\n\n${KB.vision}`;
  }

  // ── Values ──────────────────────────────────────────────────────────────────
  if (match(q, ["values", "principles", "culture", "ethics", "what do you stand for", "integrity", "vigilance"])) {
    const vals = KB.values.map((v) => `• **${v.name}:** ${v.desc}`).join("\n");
    return `💡 **Core Values**\n\n${vals}`;
  }

  // ── Certifications ──────────────────────────────────────────────────────────
  if (match(q, ["cert", "certified", "certification", "oscp", "cissp", "ceh", "cism", "iso 27001", "aws security", "qualification", "credentials"])) {
    return `🏅 **Team Certifications**\n\nOur team holds: **${KB.certifications.join(", ")}**.\n\nWe've completed over **${KB.company.assessmentsDone}** security assessments across ${KB.company.industries}.`;
  }

  // ── Stats ───────────────────────────────────────────────────────────────────
  if (match(q, ["stats", "statistics", "numbers", "how many", "how big", "uptime", "response time", "threats neutralized"])) {
    const c = KB.company;
    return `📊 **SafeByte by the Numbers**\n\n• **Threats Neutralized:** ${c.threatsNeutralized}\n• **Uptime Guaranteed:** ${c.uptime}\n• **Clients Protected:** ${c.clientsProtected}\n• **Avg Response Time:** ${c.responseTime}\n• **Security Assessments Done:** ${c.assessmentsDone}\n• **Team Size:** ${c.team}`;
  }

  // ── Trusted clients ─────────────────────────────────────────────────────────
  if (match(q, ["clients", "customers", "trusted by", "who do you work with", "portfolio", "partners"])) {
    return `🤝 **Trusted By**\n\nLeading organizations including: **${KB.trustedBy.join(", ")}**.\n\nWe work with enterprises, governments, and startups across ${KB.company.industries}.`;
  }

  // ── Testimonial ─────────────────────────────────────────────────────────────
  if (match(q, ["testimonial", "review", "feedback", "what do clients say", "recommendation", "case study"])) {
    const t = KB.testimonial;
    return `⭐ **Client Testimonial**\n\n"${t.quote}"\n\n— **${t.author}**, ${t.role}`;
  }

  // ── All services ────────────────────────────────────────────────────────────
  if (match(q, ["services", "what do you offer", "what you do", "offerings", "solutions", "capabilities"])) {
    const list = KB.services.map((s) => `• **${s.name}**`).join("\n");
    return `🔧 **Our Services**\n\nWe offer 6 core cybersecurity services:\n\n${list}\n\nAsk me about any one for a detailed breakdown, or visit the Services page.`;
  }

  // ── Specific service lookup ─────────────────────────────────────────────────
  for (const service of KB.services) {
    if (match(q, service.keywords)) {
      const features = service.features.map((f) => `  · ${f}`).join("\n");
      return `🔍 **${service.name}**\n\n${service.desc}\n\n**What's included:**\n${features}\n\nInterested? Contact us at ${KB.contact.email} for a free consultation.`;
    }
  }

  // ── All tools (combined) ────────────────────────────────────────────────────
  if (match(q, ["tools", "tool", "toolkit", "suite", "all tools", "what tools", "software", "products", "download"])) {
    const web = KB.webTools.map((t) => `  · **${t.name}** (${t.version}) — browser-based`).join("\n");
    const desktop = KB.desktopTools.map((t) => `  · **${t.name}** (${t.version}) — ${t.platform}`).join("\n");
    return `🛠️ **SafeByte Tools Suite**\n\n**Web Tools** (run in your browser, no install):\n${web}\n\n**System Auditing Tools** (macOS + Windows):\n${desktop}\n\nVisit the Tools page to launch web tools or download desktop apps.`;
  }

  // ── Web tools section ────────────────────────────────────────────────────────
  if (match(q, ["web tool", "browser tool", "online tool", "web based", "no install", "browser based"])) {
    const list = KB.webTools.map((t) => `• **${t.name}** — ${t.desc}`).join("\n");
    return `🌐 **Web Tools** (run entirely in your browser)\n\n${list}\n\nNo installation needed — visit /tools to launch any of them.`;
  }

  // ── Specific web tool lookups ────────────────────────────────────────────────
  for (const tool of KB.webTools) {
    if (match(q, tool.keywords)) {
      let response = `🛠️ **${tool.name}** (${tool.version})\n\n${tool.desc}\n\n**Route:** ${tool.route}\n\n`;

      if ("howItWorks" in tool && tool.howItWorks) {
        response += `**How it works:**\n${tool.howItWorks.map((s) => `  · ${s}`).join("\n")}\n\n`;
      }
      if ("modes" in tool && tool.modes) {
        const modes = Object.values(tool.modes) as { name: string; desc: string }[];
        response += `**Detection Modes:**\n${modes.map((m) => `  · **${m.name}:** ${m.desc}`).join("\n")}\n\n`;
      }
      if ("supportedChains" in tool && tool.supportedChains) {
        response += `**Supported Networks:** ${tool.supportedChains.join(", ")}\n\n`;
      }
      if ("presets" in tool && tool.presets) {
        response += `**Quick Presets:** ${tool.presets.join(", ")}\n\n`;
      }
      response += `**Powered by:** ${tool.techUsed}`;
      return response;
    }
  }

  // ── Desktop / system auditing tools section ──────────────────────────────────
  if (match(q, ["desktop tool", "desktop app", "system audit", "auditing tool", "standalone", "macos", "windows app", "download app"])) {
    const list = KB.desktopTools.map((t) => `• **${t.name}** (${t.version}) — ${t.platform}`).join("\n");
    return `💻 **System Auditing Tools**\n\nStandalone apps available for macOS and Windows:\n\n${list}\n\nVisit the Tools page to download. All tools have both macOS and Windows versions.`;
  }

  // ── Specific desktop tool lookups ────────────────────────────────────────────
  for (const tool of KB.desktopTools) {
    if (match(q, tool.keywords)) {
      const details = tool.details.map((d) => `  · ${d}`).join("\n");
      let response = `💻 **${tool.name}** (${tool.version})\n\n${tool.desc}\n\n**Platform:** ${tool.platform}\n\n**Key Features:**\n${details}\n\n`;
      if (tool.downloads.guide) {
        response += `📄 User guide available on the Tools page.\n`;
      }
      response += `\nDownload from the Tools page — available for both **macOS** and **Windows**.`;
      return response;
    }
  }

  // ── CryptoTrace AI — extra specific questions ────────────────────────────────
  if (match(q, ["ofac", "sanctioned", "lazarus", "tornado cash", "darknet wallet", "blacklisted wallet"])) {
    return `🚨 **OFAC & High-Risk Registry**\n\nCryptoTrace AI cross-references every wallet against a built-in registry of:\n\n• **OFAC-sanctioned addresses** — Lazarus Group (DPRK-linked hackers), Tornado Cash relayers\n• **Known ransomware payment wallets** (publicly flagged by law enforcement)\n• **Darknet market-associated wallets**\n\nIf a match is found, the scan immediately shows a red REGISTRY MATCH alert with the case ID and threat level.\n\nUse CryptoTrace AI at /tools/crypto-trace.`;
  }

  if (match(q, ["risk score", "risk engine", "wallet risk", "crypto risk", "0-100", "threat level crypto"])) {
    return `📊 **CryptoTrace AI — Risk Engine**\n\nEvery wallet gets a 0–100 risk score:\n\n• **Balance tiers** (per chain — e.g. ≥1 ETH +10, ≥10 ETH +20, ≥100 ETH +30)\n• **Transaction volume:** >100 txs +10, >1000 txs +20\n• **Registry hit:** +30 if found in high-risk list\n• **Linked cases:** +5 per case\n\n**Threat levels:**\n  · LOW (< 25)\n  · MEDIUM (< 50)\n  · HIGH (< 75)\n  · CRITICAL (≥ 75)\n\nTry it at /tools/crypto-trace.`;
  }

  // ── FraudEye — specific questions ────────────────────────────────────────────
  if (match(q, ["upi", "upi scam", "qr scam", "mode=02", "payment request qr", "qr fraud"])) {
    const m = KB.webTools[2].modes!.qr;
    return `📱 **${m.name}** (FraudEye Scanner)\n\n${m.desc}\n\n**Key insight:** A QR code with mode=02 is a PAYMENT REQUEST — scanning it takes money FROM your account. Scammers use this to trick victims who think they're receiving money.\n\n**Always check:** Never scan a QR code expecting to receive money.\n\nTry it at /tools/fraud-scanner.`;
  }

  if (match(q, ["deepfake", "voice deepfake", "ai voice", "fake call", "voice fraud", "audio analysis", "zcr", "pitch variance"])) {
    const m = KB.webTools[2].modes!.voice;
    return `🎙️ **${m.name}** (FraudEye Scanner)\n\n${m.desc}\n\n**5 features analysed:**\n  · Zero Crossing Rate — AI voices are unnaturally smooth or buzzy\n  · Pitch Variance — AI voices have suspiciously consistent pitch\n  · Energy Variance — AI voices have unnaturally steady amplitude\n  · Silence Pattern — AI voices have odd silence distributions\n  · Spectral Flatness — AI voices are too flat or too tonal\n\nAll analysis runs in your browser via the Web Audio API — no audio upload to any server.\n\nTry it at /tools/fraud-scanner.`;
  }

  // ── VulnHawk specific ────────────────────────────────────────────────────────
  if (match(q, ["epss", "exploit probability", "exploitation score", "first.org", "nvd", "nist cve"])) {
    return `📉 **EPSS — Exploit Prediction Scoring System**\n\nThe Vulnerability Assessment Tool (VulnHawk) uses EPSS from FIRST.org to show the real-world probability (0–100%) that each CVE will be actively exploited in the next 30 days.\n\nThis is combined with the CVSS severity score to create a **Priority Score = CVSS × (EPSS×10 + 1)** — so you fix the most exploitable vulnerabilities first, not just the highest-rated ones.\n\nTry VulnHawk at /tools/vuln-scanner.`;
  }

  // ── Malware Detector specific ────────────────────────────────────────────────
  if (match(q, ["pe analysis", "pe header", "windows executable", "entropy", "virtualalloc", "createremotethread", "dangerous api"])) {
    return `🔬 **PE Analysis** (Malware Detector)\n\nWhen you upload a Windows executable (.exe/.dll), the Malware Detector reads the PE structure directly in your browser:\n\n• Checks the MZ header and PE offset at 0x3C\n• Reads the machine word (x86 vs x64)\n• Scans all sections — entropy >7.0 bits = file is packed or encrypted\n• Detects 10 dangerous API strings:\n  · **VirtualAllocEx, WriteProcessMemory, CreateRemoteThread** — code injection\n  · **SetWindowsHookEx, GetAsyncKeyState** — keylogging\n  · **CryptEncrypt** — ransomware encryption\n  · **URLDownloadToFile** — dropper malware\n  · **RegSetValueEx** — persistence\n  · **IsDebuggerPresent** — anti-analysis evasion\n\nTry it at /tools/malware-scanner.`;
  }

  // ── Password Manager specific ────────────────────────────────────────────────
  if (match(q, ["pbkdf2", "fernet", "aes", "encryption", "totp", "google authenticator", "2fa", "two factor", "sqlite vault"])) {
    const t = KB.desktopTools[0];
    return `🔐 **${t.name}** — Encryption Details\n\n${t.details.map((d) => `• ${d}`).join("\n")}\n\nAvailable for macOS and Windows — download from the Tools page.`;
  }

  // ── Navigation / pages ────────────────────────────────────────────────────────
  if (match(q, ["pages", "navigate", "where", "find", "site map", "sitemap", "website sections", "what's on the site"])) {
    const list = KB.pages.map((p) => `• **${p.name}** (${p.path}) — ${p.desc}`).join("\n");
    return `🗺️ **SafeByte Website**\n\n${list}`;
  }

  // ── Team ─────────────────────────────────────────────────────────────────────
  if (match(q, ["team", "staff", "people", "engineer", "analyst", "researcher", "employee", "who works"])) {
    return `👥 **Our Team**\n\nSafeByte has **${KB.company.team}** across **${KB.company.offices}**.\n\nCertifications held: ${KB.certifications.join(", ")}.\n\nOver **${KB.company.assessmentsDone}** security assessments completed across ${KB.company.industries}.`;
  }

  // ── AI Red Teamer ────────────────────────────────────────────────────────────
  if (match(q, ["ai red team", "red teamer", "ai redteam", "autonomous testing", "ai attack", "ai adversarial"])) {
    return `🤖 **AI Red Teamer**\n\nOur AI Red Teamer service provides autonomous AI-driven adversarial testing that:\n\n• Simulates sophisticated multi-step attack chains\n• Identifies logic flaws and business logic vulnerabilities\n• Stress-tests your defenses continuously — not just during scheduled engagements\n• Combines AI automation with human analyst review\n\nContact us at ${KB.contact.email} to learn more about this cutting-edge service.`;
  }

  // ── System Auditing Tools (category name) ────────────────────────────────────
  if (match(q, ["system auditing", "auditing tools", "audit tools", "system audit"])) {
    const list = KB.desktopTools.map((t) => `• **${t.name}** — ${t.desc}`).join("\n");
    return `🖥️ **System Auditing Tools**\n\nThree standalone desktop applications, available for both macOS and Windows:\n\n${list}\n\nAll tools are downloadable from the Tools page.`;
  }

  // ── Default fallback ─────────────────────────────────────────────────────────
  return `I'm not sure about that — here's what I can help with:\n\n• **Web Tools:** Malware Detector, VulnHawk, FraudEye Scanner, CryptoTrace AI\n• **Desktop Apps:** Password Manager, File System Crawler, USB Detection Tool\n• **Services:** Pen Testing, Malware Analysis, Risk Assessment, Cloud Security, Incident Response\n• **Company:** About us, team, certifications, mission\n• **Contact:** Email, phone, free consultation\n\nOr visit our Contact page to speak with a real person. 🙂`;
}
