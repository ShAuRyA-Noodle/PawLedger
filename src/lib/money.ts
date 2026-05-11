// All amounts internally are stored in the smallest unit of currency (paise for INR, cents for USD)
// as bigint. Display helpers below.

export type Currency = "INR" | "USD";

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  INR: "₹",
  USD: "$",
};

export const SUBUNITS_PER_UNIT: Record<Currency, number> = {
  INR: 100,
  USD: 100,
};

export const TIERS: Record<Currency, { value: number; label: string; impact: string; isDefault?: boolean }[]> = {
  INR: [
    { value: 100, label: "₹100", impact: "1 vaccine dose" },
    { value: 300, label: "₹300", impact: "1 week of food + 1 vet check", isDefault: true },
    { value: 500, label: "₹500", impact: "Full week of care for one animal" },
    { value: 1000, label: "₹1,000", impact: "Surgery contribution + 2 weeks food" },
  ],
  USD: [
    { value: 5, label: "$5", impact: "1 day of food" },
    { value: 25, label: "$25", impact: "1 week of food + meds for one animal", isDefault: true },
    { value: 50, label: "$50", impact: "2 weeks of full care" },
  ],
};

export function toSubunits(amount: number, currency: Currency): bigint {
  return BigInt(Math.round(amount * SUBUNITS_PER_UNIT[currency]));
}

export function fromSubunits(amount: bigint | number, currency: Currency): number {
  const n = typeof amount === "bigint" ? Number(amount) : amount;
  return n / SUBUNITS_PER_UNIT[currency];
}

export function formatMoney(amount: bigint | number, currency: Currency, opts?: { compact?: boolean; noSymbol?: boolean }): string {
  const value = fromSubunits(amount, currency);
  const symbol = opts?.noSymbol ? "" : CURRENCY_SYMBOL[currency];
  if (opts?.compact && value >= 100_000) {
    if (currency === "INR") {
      if (value >= 10_000_000) return `${symbol}${(value / 10_000_000).toFixed(1)}Cr`;
      if (value >= 100_000) return `${symbol}${(value / 100_000).toFixed(1)}L`;
    }
    if (currency === "USD") {
      if (value >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(1)}M`;
      if (value >= 1_000) return `${symbol}${(value / 1_000).toFixed(1)}k`;
    }
  }
  const formatter = new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatter.format(value)}`;
}

// Platform fee — 4% retained, plus optional donor-cover for processing fees
export const PLATFORM_FEE_BPS = 400; // 4% in basis points
// Razorpay fees: 2% domestic cards/UPI/netbanking; 0% for UPI ≤ ₹2k
// Stripe fees: 2.9% + $0.30 (or 2.2% + $0.30 nonprofit rate)
export const PROCESSING_FEE_BPS_INR = 200;
export const PROCESSING_FEE_BPS_USD = 290;
export const PROCESSING_FEE_FIXED_USD_CENTS = 30n;

export function calcFees(amountSubunits: bigint, currency: Currency, donorCoversFees: boolean) {
  const platformFee = (amountSubunits * BigInt(PLATFORM_FEE_BPS)) / 10_000n;
  const processingFee = currency === "INR"
    ? (amountSubunits * BigInt(PROCESSING_FEE_BPS_INR)) / 10_000n
    : (amountSubunits * BigInt(PROCESSING_FEE_BPS_USD)) / 10_000n + PROCESSING_FEE_FIXED_USD_CENTS;
  // If donor covers fees, gross up the charge so that net to shelter = original amount
  const grossAmount = donorCoversFees ? amountSubunits + platformFee + processingFee : amountSubunits;
  const netToShelter = donorCoversFees ? amountSubunits : amountSubunits - platformFee - processingFee;
  return { platformFee, processingFee, netToShelter, grossAmount };
}
