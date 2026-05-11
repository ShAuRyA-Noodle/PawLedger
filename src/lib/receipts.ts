import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatMoney } from "./money";

type ReceiptInput = {
  receiptNumber: string;
  donationId: string;
  donorName: string;
  donorEmail: string;
  amountSubunits: bigint;
  currency: "INR" | "USD";
  capturedAt: Date;
  animalName: string;
  shelterName: string;
  shelterLegalName: string;
  shelter80g: string;
  shelter12a: string;
  shelterPan: string;
};

export async function generate80GReceiptPDF(input: ReceiptInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const courier = await doc.embedFont(StandardFonts.Courier);

  const ink = rgb(0.1, 0.1, 0.13);
  const slate = rgb(0.4, 0.4, 0.45);
  const marigold = rgb(0.91, 0.55, 0.13);

  // Header bar
  page.drawRectangle({ x: 0, y: height - 14, width, height: 14, color: marigold });

  // Logo + brand
  page.drawText("PAWLEDGER", { x: 50, y: height - 50, size: 18, font: helvBold, color: ink });
  page.drawText("Compassion you can prove.", { x: 50, y: height - 65, size: 9, font: helv, color: slate });

  // Title
  page.drawText("Donation Receipt — Section 80G", { x: 50, y: height - 110, size: 14, font: helvBold, color: ink });
  page.drawLine({ start: { x: 50, y: height - 118 }, end: { x: width - 50, y: height - 118 }, thickness: 0.5, color: slate });

  // Receipt info
  let y = height - 145;
  const left = (label: string, value: string) => {
    page.drawText(label, { x: 50, y, size: 9, font: helv, color: slate });
    page.drawText(value, { x: 50, y: y - 13, size: 11, font: helvBold, color: ink });
  };
  const right = (label: string, value: string) => {
    page.drawText(label, { x: width - 250, y, size: 9, font: helv, color: slate });
    page.drawText(value, { x: width - 250, y: y - 13, size: 11, font: helvBold, color: ink });
  };

  left("RECEIPT NUMBER", input.receiptNumber);
  right("DATE OF DONATION", input.capturedAt.toISOString().slice(0, 10));
  y -= 40;

  left("DONOR", input.donorName);
  right("DONOR EMAIL", input.donorEmail);
  y -= 40;

  left("AMOUNT", formatMoney(input.amountSubunits, input.currency));
  right("PURPOSE", `Care of ${input.animalName}`);
  y -= 60;

  // Shelter section
  page.drawText("Issued by (recipient organisation)", { x: 50, y, size: 9, font: helv, color: slate });
  y -= 18;
  page.drawText(input.shelterName, { x: 50, y, size: 13, font: helvBold, color: ink });
  y -= 16;
  page.drawText(`Legal name: ${input.shelterLegalName}`, { x: 50, y, size: 10, font: helv, color: ink });
  y -= 14;
  page.drawText(`PAN: ${input.shelterPan}`, { x: 50, y, size: 10, font: helv, color: ink });
  y -= 14;
  page.drawText(`12A registration: ${input.shelter12a}`, { x: 50, y, size: 10, font: helv, color: ink });
  y -= 14;
  page.drawText(`80G registration: ${input.shelter80g}`, { x: 50, y, size: 10, font: helv, color: ink });

  // Spacer
  y -= 36;
  page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 0.5, color: slate });
  y -= 18;

  // Statutory text
  const para = `This receipt is issued under section 80G of the Income Tax Act, 1961, for which the Income Tax exemption certificate is valid as of the date of donation. The contribution is eligible for deduction subject to applicable limits and verification under the Act. Donor may use this receipt for filing of income tax returns. Original donor verification: keep this PDF and the Razorpay/Stripe charge confirmation email together.`;
  const wrap = (text: string, max: number) => {
    const words = text.split(" ");
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      if ((line + " " + w).length > max) { lines.push(line); line = w; } else line = line ? line + " " + w : w;
    }
    if (line) lines.push(line);
    return lines;
  };
  for (const line of wrap(para, 90)) {
    page.drawText(line, { x: 50, y, size: 9, font: helv, color: slate });
    y -= 12;
  }

  // Footer with hash + verifier link
  y = 70;
  page.drawText(`Donation ID: ${input.donationId}`, { x: 50, y, size: 8, font: courier, color: slate });
  page.drawText(`Verify at: https://pawledger.org/transparency/receipts/${input.receiptNumber}`, { x: 50, y: y - 12, size: 8, font: courier, color: slate });
  page.drawText("PawLedger · Tamper-evident public ledger · Re-issuable on demand", { x: 50, y: y - 28, size: 8, font: helv, color: slate });

  return await doc.save();
}
