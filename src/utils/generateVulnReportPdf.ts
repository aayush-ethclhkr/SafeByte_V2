import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ReportCVE {
  id: string;
  description: string;
  plainEnglish: string;
  cvss: number;
  cvssVector: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE";
  epss: number;
  epssPercentile: number;
  fixedIn: string;
  published: string;
  references: string[];
  priorityScore: number;
}

export interface ReportServiceResult {
  service: string;
  version: string;
  port?: number;
  cves: ReportCVE[];
  topRisk: ReportCVE | null;
  serviceScore: number;
}

export interface ReportHostInfo {
  targetInput: string;
  resolvedIp: string;
  hostname: string;
  country: string;
  city: string;
  isp: string;
  asn: string;
  openPorts: number[];
  cpes: string[];
  tags: string[];
}

export interface ReportData {
  scanMode: "target" | "stack";
  hostInfo?: ReportHostInfo;
  services: ReportServiceResult[];
  attackSurfaceScore: number;
  attackSurfaceLabel: string;
  totalCVEs: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  topPriority: ReportCVE[];
  scannedAt: string;
}

export function generateVulnReportPdf(data: ReportData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // ── Header Banner (Dark Navy Theme) ───────────────────────────────────────
  doc.setFillColor(11, 16, 23); // #0B1017
  doc.rect(0, 0, pageWidth, 42, "F");

  // Cyan accent line
  doc.setFillColor(0, 229, 255); // #00E5FF
  doc.rect(0, 42, pageWidth, 1.5, "F");

  // Brand Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 229, 255);
  doc.text("SAFEBYTE CYBER DEFENSE", margin, 16);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184); // #94A3B8
  doc.text("THREAT RESEARCH & ATTACK SURFACE INDEXING LAB", margin, 22);

  // Document Title on Right
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("OFFENSIVE SECURITY ASSESSMENT REPORT", pageWidth - margin, 16, { align: "right" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${data.scannedAt}`, pageWidth - margin, 22, { align: "right" });
  doc.text("Classification: STRICTLY CONFIDENTIAL / TLP:AMBER", pageWidth - margin, 27, { align: "right" });

  let y = 52;

  // ── Target Scope Overview Box ──────────────────────────────────────────────
  doc.setFillColor(248, 250, 252); // Light slate
  doc.setDrawColor(216, 226, 236);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 32, 2, 2, "FD");

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("1. Target Scope & Telemetry", margin + 4, y + 7);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);

  if (data.scanMode === "target" && data.hostInfo) {
    const loc = (data.hostInfo.city !== "Unknown" || data.hostInfo.country !== "Unknown")
      ? `${data.hostInfo.city}, ${data.hostInfo.country}`
      : "Unknown / Unresolved";
    const ispText = data.hostInfo.isp !== "Unknown" && data.hostInfo.isp !== "Unknown Provider"
      ? data.hostInfo.isp
      : "Unresolved Network";
    const asnText = data.hostInfo.asn !== "Unknown" ? data.hostInfo.asn : "N/A";

    doc.text(`Target Hostname: ${data.hostInfo.hostname}`, margin + 4, y + 14);
    doc.text(`Resolved IP Address: ${data.hostInfo.resolvedIp}`, margin + 4, y + 20);
    doc.text(`Location: ${loc}`, margin + 4, y + 26);

    const rightCol = margin + 90;
    doc.text(`Network ASN: ${asnText}`, rightCol, y + 14);
    doc.text(`ISP / Hosting: ${ispText}`, rightCol, y + 20);
    doc.text(`Open Ports: ${data.hostInfo.openPorts.join(", ") || "None Detected"}`, rightCol, y + 26);
  } else {
    doc.text(`Scan Scope: Custom Software Stack (${data.services.length} services)`, margin + 4, y + 14);
    const svcNames = data.services.map(s => `${s.service} ${s.version}`.trim()).join(", ");
    doc.text(`Components: ${svcNames.length > 70 ? svcNames.slice(0, 67) + "..." : svcNames}`, margin + 4, y + 20);
    doc.text(`Methodology: NIST SP 800-115 · OWASP ASVS · FIRST.org EPSS`, margin + 4, y + 26);
  }

  y += 38;

  // ── Executive Risk Rating Summary ─────────────────────────────────────────
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("2. Executive Attack Surface Posture", margin, y);
  y += 5;

  // Risk Score Card
  const scoreCardWidth = (pageWidth - margin * 2 - 12) / 5;
  const scoreCards = [
    { label: "Attack Surface Score", val: `${data.attackSurfaceScore}/100`, color: data.attackSurfaceScore >= 50 ? [239, 68, 68] : [34, 197, 94] },
    { label: "Critical Severity", val: String(data.criticalCount), color: [239, 68, 68] },
    { label: "High Severity", val: String(data.highCount), color: [249, 115, 22] },
    { label: "Medium Severity", val: String(data.mediumCount), color: [234, 179, 8] },
    { label: "Total Discovered CVEs", val: String(data.totalCVEs), color: [2, 132, 199] },
  ];

  scoreCards.forEach((c, idx) => {
    const cardX = margin + idx * (scoreCardWidth + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cardX, y, scoreCardWidth, 20, 1.5, 1.5, "FD");

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(c.color[0], c.color[1], c.color[2]);
    doc.text(c.val, cardX + scoreCardWidth / 2, y + 8, { align: "center" });

    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(c.label, cardX + scoreCardWidth / 2, y + 15, { align: "center" });
  });

  y += 27;

  // ── Top Prioritized Vulnerabilities Table ─────────────────────────────────
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("3. Prioritized Vulnerability Matrix (Ranked by CVSS x EPSS)", margin, y);
  y += 3;

  const tableRows = data.topPriority.map(cve => [
    cve.id,
    cve.severity,
    `${cve.cvss.toFixed(1)}`,
    `${(cve.epss * 100).toFixed(1)}%`,
    cve.fixedIn || "Check Advisory",
    cve.plainEnglish.length > 80 ? cve.plainEnglish.slice(0, 77) + "..." : cve.plainEnglish,
  ]);

  autoTable(doc, {
    startY: y,
    head: [["CVE Identifier", "Severity", "CVSS", "EPSS Prob", "Fixed In", "Plain English Impact"]],
    body: tableRows.length > 0 ? tableRows : [["N/A", "CLEAN", "0.0", "0.0%", "N/A", "No weaponized CVEs found for this scope."]],
    theme: "grid",
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: "bold" },
      1: { cellWidth: 18, fontStyle: "bold" },
      2: { cellWidth: 14, halign: "center" },
      3: { cellWidth: 18, halign: "center" },
      4: { cellWidth: 24 },
      5: { cellWidth: "auto" },
    },
    margin: { left: margin, right: margin },
  });

  // @ts-expect-error - jsPDF autoTable extension property
  y = doc.lastAutoTable.finalY + 8;

  // ── Check for Page Break before Section 4 ─────────────────────────────────
  if (y > pageHeight - 65) {
    doc.addPage();
    y = margin + 5;
  }

  // ── Section 4: Service-by-Service Breakdown ───────────────────────────────
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("4. Perimeter Service Profiles", margin, y);
  y += 4;

  const serviceRows = data.services.map(s => [
    s.service.toUpperCase(),
    s.version || "Unspecified",
    `${s.cves.length} CVEs`,
    s.cves.filter(c => c.severity === "CRITICAL").length.toString(),
    s.cves.filter(c => c.severity === "HIGH").length.toString(),
    `${s.serviceScore} / 100`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Service Daemon", "Version", "Total CVEs", "Critical", "High", "Risk Rating"]],
    body: serviceRows,
    theme: "striped",
    headStyles: {
      fillColor: [2, 132, 199], // #0284C7
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
    },
    bodyStyles: {
      fontSize: 7,
    },
    margin: { left: margin, right: margin },
  });

  // @ts-expect-error - jsPDF autoTable extension property
  y = doc.lastAutoTable.finalY + 8;

  if (y > pageHeight - 55) {
    doc.addPage();
    y = margin + 5;
  }

  // ── Actionable Remediation Blueprint ──────────────────────────────────────
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 38, 2, 2, "FD");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("5. Actionable Developer Remediation Blueprint", margin + 4, y + 6);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text("1. Immediate Triage: Patch Critical/High severity CVEs with EPSS > 5% within 24-48 hours.", margin + 4, y + 13);
  doc.text("2. Perimeter Hardening: Block unauthenticated access to database/caching daemons (ports 3306, 6379, 27017).", margin + 4, y + 19);
  doc.text("3. Dependency Upgrades: Upgrade discovered outdated web servers and cryptographic runtimes to patched releases.", margin + 4, y + 25);
  doc.text("4. Continuous Verification: Retest after deployment to confirm attack surface score reduction.", margin + 4, y + 31);

  // ── Footer / Attestation ──────────────────────────────────────────────────
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text(
      "SafeByte Threat Research Lab · Verified Deterministic Exploit Assessment · Confidential",
      margin,
      pageHeight - 8
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: "right" });
  }

  // Save the PDF
  const cleanTarget = (data.hostInfo?.hostname || data.hostInfo?.targetInput || "stack-audit")
    .replace(/[^a-zA-Z0-9.-]/g, "_");
  doc.save(`SafeByte-Vulnerability-Report-${cleanTarget}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
