// Single source of truth for the Yirra licensing funnel (v1.1 legal docs).
//
// Three doors, no retroactive fallback:
//   1. Free        — CERN-OHL-W-2.0 (no fee, auditable open-source route)
//   2. Partner     — CPA, up to 2,000 units/yr (three tiers below)
//   3. Enterprise  — MCLA, 2,000+ units or exclusivity/defence
//
// Stripe product IDs live on yirrasystems.com. Product URLs are
// https://yirrasystems.com/product/<stripe_product_id>.

export const YIRRA_STORE = "https://yirrasystems.com";

// ─── Partner (CPA) ──────────────────────────────────────────────────────────

export interface PartnerTier {
  key: "maker" | "commercial" | "scale";
  name: string;
  volume: string;            // human range, e.g. "1 – 25 units / yr"
  unitRangeLow: number;
  unitRangeHigh: number;     // inclusive; Scale capped at 2,000
  unitCapLabel: string;
  annualFeeAud: number;      // setup, paid annually
  perUnitRoyaltyAud: number; // AUD per unit
  batteryPriceAud: number;   // partner battery price
  batterySavingAud: number;  // $ saved vs non-partner price
  stripeProductId: string;
  buyUrl: string;
  highlights: readonly string[];
}

export const OPEN_BATTERY_PRICE_AUD = 229;

export const PARTNER_TIERS: readonly PartnerTier[] = [
  {
    key: "maker",
    name: "Maker",
    volume: "1 – 25 units / yr",
    unitRangeLow: 1,
    unitRangeHigh: 25,
    unitCapLabel: "Up to 25 units per year",
    annualFeeAud: 1100,
    perUnitRoyaltyAud: 20,
    batteryPriceAud: 175,
    batterySavingAud: 54,
    stripeProductId: "prod_UORr4MD5dsoGap",
    buyUrl: `${YIRRA_STORE}/product/prod_UORr4MD5dsoGap`,
    highlights: [
      "Listed on yirrasystems.com as a Yirra Partner",
      "Use the \u201cYirra Partner\u201d badge",
      "Batteries at $175 (save $54 / unit)",
      "Email support",
    ],
  },
  {
    key: "commercial",
    name: "Commercial",
    volume: "26 – 500 units / yr",
    unitRangeLow: 26,
    unitRangeHigh: 500,
    unitCapLabel: "Up to 500 units per year",
    annualFeeAud: 4500,
    perUnitRoyaltyAud: 15,
    batteryPriceAud: 149,
    batterySavingAud: 80,
    stripeProductId: "prod_UORtGZ8q0L47I9",
    buyUrl: `${YIRRA_STORE}/product/prod_UORtGZ8q0L47I9`,
    highlights: [
      "Listed on yirrasystems.com as a Yirra Partner",
      "Use the \u201cYirra Partner\u201d badge",
      "Batteries at $149 (save $80 / unit)",
      "Design-file updates as released",
    ],
  },
  {
    key: "scale",
    name: "Scale",
    volume: "501 – 2,000 units / yr",
    unitRangeLow: 501,
    unitRangeHigh: 2000,
    unitCapLabel: "Up to 2,000 units per year",
    annualFeeAud: 13500,
    perUnitRoyaltyAud: 9,
    batteryPriceAud: 125,
    batterySavingAud: 104,
    stripeProductId: "prod_UORwQUDhIIqmQU",
    buyUrl: `${YIRRA_STORE}/product/prod_UORwQUDhIIqmQU`,
    highlights: [
      "Listed on yirrasystems.com as a Yirra Partner",
      "Use the \u201cYirra Partner\u201d badge",
      "Batteries at $125 (save $104 / unit)",
      "Priority engineering & early access to new releases",
    ],
  },
] as const;

export function partnerTier(key: PartnerTier["key"]): PartnerTier {
  const t = PARTNER_TIERS.find((x) => x.key === key);
  if (!t) throw new Error(`Unknown partner tier: ${key}`);
  return t;
}

// ─── Enterprise (MCLA) ──────────────────────────────────────────────────────
// MCLA is never auto-applied. Every MCLA is signed, every number is negotiated
// from these floors. AUD, ex-GST.

export const ENTERPRISE_SETUP_FROM_AUD = 45000;
export const ENTERPRISE_UNITS_MIN = 2000;

export interface ExclusivityOption {
  key: "territory" | "vertical" | "combined";
  label: string;
  feeFloorAud: number;
  covers: string;
}

export const EXCLUSIVITY_OPTIONS: readonly ExclusivityOption[] = [
  {
    key: "territory",
    label: "Territory only",
    feeFloorAud: 25000,
    covers: "We won\u2019t licence anyone else in that country/region.",
  },
  {
    key: "vertical",
    label: "Vertical only",
    feeFloorAud: 35000,
    covers: "We won\u2019t licence anyone else in that industry (e.g. mining, agri).",
  },
  {
    key: "combined",
    label: "Territory + vertical",
    feeFloorAud: 60000,
    covers: "Both, for the term of the agreement.",
  },
] as const;

// ─── Routing helper ─────────────────────────────────────────────────────────
// Given an estimated annual unit count, return the recommended door.
// Used by the path-helper wizard.

export type DoorKey = "free" | "partner-maker" | "partner-commercial" | "partner-scale" | "enterprise";

export function recommendDoor(opts: {
  commercial: boolean;      // are they selling / manufacturing commercially?
  annualUnits: number;      // estimated units/yr
  wantsExclusivity?: boolean;
  defenceOrGov?: boolean;
}): DoorKey {
  if (!opts.commercial) return "free";
  if (opts.wantsExclusivity || opts.defenceOrGov) return "enterprise";
  if (opts.annualUnits >= ENTERPRISE_UNITS_MIN) return "enterprise";
  if (opts.annualUnits <= 25) return "partner-maker";
  if (opts.annualUnits <= 500) return "partner-commercial";
  return "partner-scale";
}
