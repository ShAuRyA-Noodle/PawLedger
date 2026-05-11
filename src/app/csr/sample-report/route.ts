import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// Generates a sample CSR-2 + CSR-1 compliant impact report PDF for demo + lead-gen.
export const runtime = "nodejs";

export async function GET() {
  const doc = await PDFDocument.create();
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const courier = await doc.embedFont(StandardFonts.Courier);

  const ink = rgb(0.12, 0.12, 0.14);
  const slate = rgb(0.4, 0.4, 0.45);
  const marigold = rgb(0.85, 0.55, 0.13);
  const sage = rgb(0.45, 0.65, 0.55);

  // ─── COVER PAGE
  let page = doc.addPage([595, 842]);
  let { width, height } = page.getSize();
  page.drawRectangle({ x: 0, y: height - 8, width, height: 8, color: marigold });
  page.drawText("PAWLEDGER", { x: 40, y: height - 50, size: 14, font: helvBold, color: ink });
  page.drawText("CSR Impact Report — Sample", { x: 40, y: height - 68, size: 9, font: helv, color: slate });

  page.drawText("Quarterly CSR", { x: 40, y: height - 200, size: 18, font: helv, color: slate });
  page.drawText("Animal Welfare", { x: 40, y: height - 240, size: 36, font: helvBold, color: ink });
  page.drawText("Impact Report", { x: 40, y: height - 280, size: 36, font: helvBold, color: ink });

  page.drawLine({ start: { x: 40, y: height - 320 }, end: { x: 200, y: height - 320 }, thickness: 2, color: marigold });

  page.drawText("Acme Industries Pvt. Ltd.", { x: 40, y: height - 360, size: 14, font: helvBold, color: ink });
  page.drawText("Q4 FY26 — January to March 2026", { x: 40, y: height - 380, size: 11, font: helv, color: slate });
  page.drawText("Reporting period: 1 Jan 2026 – 31 Mar 2026", { x: 40, y: height - 396, size: 9, font: helv, color: slate });

  // bottom strip
  page.drawText("Compliant with: Companies Act 2013, Section 135 · Schedule VII (iv) animal welfare", { x: 40, y: 70, size: 8, font: helv, color: slate });
  page.drawText("Form CSR-1 attached · CSR-2 ready for board sign-off", { x: 40, y: 56, size: 8, font: helv, color: slate });
  page.drawText("Generated automatically by PawLedger · pawledger.org/csr", { x: 40, y: 40, size: 8, font: courier, color: slate });

  // ─── EXECUTIVE SUMMARY
  page = doc.addPage([595, 842]);
  ({ width, height } = page.getSize());
  page.drawText("Executive summary", { x: 40, y: height - 60, size: 22, font: helvBold, color: ink });
  page.drawLine({ start: { x: 40, y: height - 70 }, end: { x: width - 40, y: height - 70 }, thickness: 0.5, color: slate });

  // Big numbers
  const big = [
    ["₹15,00,000", "Total CSR routed via PawLedger this quarter"],
    ["5", "Shelters supported across 4 cities"],
    ["72", "Animals directly funded"],
    ["1,247", "Vet visits + procedures funded"],
    ["100%", "Funds traceable on the public ledger"],
  ];
  let y = height - 110;
  for (const [n, l] of big) {
    page.drawText(n, { x: 40, y, size: 28, font: helvBold, color: marigold });
    page.drawText(l, { x: 40, y: y - 16, size: 10, font: helv, color: slate });
    y -= 50;
  }

  // ─── ALLOCATION TABLE
  page = doc.addPage([595, 842]);
  ({ width, height } = page.getSize());
  page.drawText("Allocation by shelter", { x: 40, y: height - 60, size: 22, font: helvBold, color: ink });
  page.drawLine({ start: { x: 40, y: height - 70 }, end: { x: width - 40, y: height - 70 }, thickness: 0.5, color: slate });

  const rows = [
    ["Shelter", "City", "Amount", "Animals", "Trust"],
    ["Friends Forever Trust", "Bengaluru", "₹4,00,000", "21", "94/100"],
    ["Karunya Animal Sanctuary", "Chennai", "₹3,50,000", "16", "91/100"],
    ["People for Animals (Pune)", "Pune", "₹3,00,000", "14", "89/100"],
    ["Animal Aid Charitable Trust", "Udaipur", "₹2,50,000", "12", "92/100"],
    ["CARE Foundation", "Hyderabad", "₹2,00,000", "9", "88/100"],
  ];
  let yPos = height - 100;
  for (const [i, row] of rows.entries()) {
    const isHeader = i === 0;
    if (i === 1) { page.drawLine({ start: { x: 40, y: yPos + 8 }, end: { x: width - 40, y: yPos + 8 }, thickness: 0.5, color: slate }); }
    page.drawText(row[0], { x: 40, y: yPos, size: isHeader ? 9 : 11, font: isHeader ? helvBold : helv, color: ink });
    page.drawText(row[1], { x: 220, y: yPos, size: isHeader ? 9 : 11, font: isHeader ? helvBold : helv, color: slate });
    page.drawText(row[2], { x: 320, y: yPos, size: isHeader ? 9 : 11, font: isHeader ? helvBold : helv, color: ink });
    page.drawText(row[3], { x: 420, y: yPos, size: isHeader ? 9 : 11, font: isHeader ? helvBold : helv, color: slate });
    page.drawText(row[4], { x: 480, y: yPos, size: isHeader ? 9 : 11, font: isHeader ? helvBold : courier, color: slate });
    yPos -= 24;
  }

  // ─── COMPLIANCE FOOTER
  page = doc.addPage([595, 842]);
  ({ width, height } = page.getSize());
  page.drawText("Compliance attestations", { x: 40, y: height - 60, size: 22, font: helvBold, color: ink });
  page.drawLine({ start: { x: 40, y: height - 70 }, end: { x: width - 40, y: height - 70 }, thickness: 0.5, color: slate });
  const attest = [
    "All recipient shelters carry valid 12A and 80G registrations (verified Mar 2026 via Income Tax e-filing portal)",
    "Two recipient shelters carry AWBI recognition; remaining three are AWBI-eligible and applying",
    "All transactions appear on the PawLedger public hash-chained ledger",
    "Form CSR-1 references on file: CSR000123456 (Acme Industries → PawLedger Pvt Ltd → recipient shelters)",
    "Form CSR-2 board sign-off section provided in appendix B (page 12)",
    "Spending classified under Schedule VII (iv) — Ensuring environmental sustainability, ecological balance, animal welfare",
    "Audit trail available on request to internal audit and statutory auditor; Form 9 (board CSR committee minutes) attached as appendix C",
  ];
  let y2 = height - 100;
  for (const a of attest) {
    page.drawCircle({ x: 48, y: y2 + 4, size: 2, color: sage });
    page.drawText(a, { x: 60, y: y2, size: 10, font: helv, color: ink });
    y2 -= 22;
  }

  page.drawText("This is a sample report. Production reports include shelter receipts (PDF), photo diary,", { x: 40, y: 70, size: 8, font: helv, color: slate });
  page.drawText("vet visit log with ledger hashes, and live verification URLs for each line item.", { x: 40, y: 56, size: 8, font: helv, color: slate });
  page.drawText("Generated by PawLedger · contact csr@pawledger.org for the live demo.", { x: 40, y: 40, size: 8, font: courier, color: slate });

  const bytes = await doc.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="pawledger-csr-sample-report.pdf"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
