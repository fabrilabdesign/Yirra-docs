/**
 * PDFs live in static/legal/ → served at /legal/… after build.
 *
 * v1.1 roster — Commercial Hardware Licence (CHL) removed. The only
 * commercial instrument alongside the CPA is now the MCLA, and it is
 * never auto-applied.
 */
export const LEGAL_PDFS = {
  complianceGuide: '/legal/Yirra_Replicant_GEN1_Compliance_Guide_v1.1.pdf',
  mcla: '/legal/Yirra_Master_Commercial_Hardware_License_v1.1.pdf',
  partnerAgreement: '/legal/Yirra_Replicant_GEN1_Commercial_Partner_Agreement_v1.1.pdf',
  // Plain-English one-pagers — the 10-second decision sheets.
  onePagerCern: '/legal/Yirra_One_Pager_CERN_v1.0.pdf',
  onePagerCpa: '/legal/Yirra_One_Pager_CPA_v1.0.pdf',
  onePagerMcla: '/legal/Yirra_One_Pager_MCLA_v1.0.pdf',
} as const;

export type LegalDocId = keyof typeof LEGAL_PDFS;
