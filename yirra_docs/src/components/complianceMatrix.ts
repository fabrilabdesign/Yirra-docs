export type CriterionLevel = 'hidden' | 'optional' | 'required';

const ORDER: CriterionLevel[] = ['hidden', 'optional', 'required'];

function merge(a: CriterionLevel, b: CriterionLevel): CriterionLevel {
  return ORDER[Math.max(ORDER.indexOf(a), ORDER.indexOf(b))] as CriterionLevel;
}

/** Use-type codes from Step 1 — must match ComplianceWizard options */
const ROWS: Record<string, Record<string, CriterionLevel>> = {
  personal: { C1: 'hidden', C2: 'hidden', C3: 'hidden', C4: 'hidden', C5: 'hidden', C6: 'hidden' },
  commercial_unmodified: {
    C1: 'required',
    C2: 'hidden',
    C3: 'required',
    C4: 'required',
    C5: 'optional',
    C6: 'hidden',
  },
  modified_dist: {
    C1: 'required',
    C2: 'required',
    C3: 'required',
    C4: 'required',
    C5: 'required',
    C6: 'required',
  },
  modified_products: {
    C1: 'required',
    C2: 'required',
    C3: 'required',
    C4: 'required',
    C5: 'required',
    C6: 'required',
  },
  mixed_dist: {
    C1: 'required',
    C2: 'hidden',
    C3: 'required',
    C4: 'required',
    C5: 'required',
    C6: 'hidden',
  },
  reinstatement: {
    C1: 'required',
    C2: 'required',
    C3: 'required',
    C4: 'required',
    C5: 'required',
    C6: 'required',
  },
};

const IDS = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'] as const;

export function criteriaForUseTypes(useTypes: string[]): Record<string, CriterionLevel> {
  const out: Record<string, CriterionLevel> = {
    C1: 'hidden',
    C2: 'hidden',
    C3: 'hidden',
    C4: 'hidden',
    C5: 'hidden',
    C6: 'hidden',
  };
  for (const ut of useTypes) {
    const row = ROWS[ut];
    if (!row) continue;
    for (const id of IDS) {
      out[id] = merge(out[id], row[id]);
    }
  }
  return out;
}

export const USE_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'personal', label: 'Personal use only' },
  { value: 'commercial_unmodified', label: 'Commercial manufacture — unmodified design' },
  { value: 'modified_dist', label: 'Distributing modified design files' },
  { value: 'modified_products', label: 'Selling products based on modified design' },
  { value: 'mixed_dist', label: 'Distributing alongside proprietary add-ons' },
  { value: 'reinstatement', label: 'Reinstatement after a breach' },
];
