/** Commercial / OEM / licensing — single source for CTAs across docs */
export const BUSINESS_EMAIL = 'business@yirrasystems.com' as const;
export const CONTACT_PAGE_URL = 'https://yirrasystems.com/contact' as const;
export const COMMERCIAL_PROGRAMS_DOC = '/docs/commercial-programs' as const;

export function mailtoCommercial(subject: string, body?: string): string {
  const params = new URLSearchParams();
  params.set('subject', subject);
  if (body) params.set('body', body);
  return `mailto:${BUSINESS_EMAIL}?${params.toString()}`;
}
