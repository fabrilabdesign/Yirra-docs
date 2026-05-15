import React from 'react';
import { LEGAL_PDFS } from '@site/src/data/legalDocs';
import {
  ENTERPRISE_SETUP_FROM_AUD,
  EXCLUSIVITY_OPTIONS,
  PARTNER_TIERS,
} from '@site/src/data/partnerTiers';
import styles from './styles.module.css';

/**
 * Legal hub — three doors: Free (CERN) · Partner (CPA) · Enterprise (MCLA).
 *
 * v1.1 legal roster. The v1.0 "Commercial Hardware Licence" is intentionally
 * absent — that instrument was removed. CERN breach is a copyright problem
 * with a 30-day cure, NOT a retroactive commercial licence.
 */
export default function CommercialFallback(): React.JSX.Element {
  return (
    <div className={styles.wrapper}>
      {/* ── Top callout — route to the three doors ── */}
      <div
        style={{
          background: 'rgba(99, 153, 34, 0.10)',
          border: '1px solid #639922',
          borderRadius: 10,
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
        }}>
        <h3 style={{ margin: '0 0 0.5rem', color: '#b6f08a', fontSize: '1.05rem' }}>
          Three ways to license. Pick the one that fits.
        </h3>
        <p style={{ margin: '0 0 0.75rem', color: '#e6edf3', lineHeight: 1.6, fontSize: '0.92rem' }}>
          <strong>Free</strong> under CERN-OHL-W-2.0 (makers, research, teaching).{' '}
          <strong>Partner</strong> up to 2,000 units / yr — <strong>AUD $1,100 – $13,500 / yr</strong>{' '}
          plus per-unit royalties from <strong>$9 – $20</strong>. <strong>Enterprise</strong> for
          2,000+ units, exclusivity, or defence — setup from AUD $45,000, negotiated per deal. No retroactive
          penalties, no hidden escalators.
        </p>
        <p style={{ margin: 0, fontSize: '0.92rem' }}>
          <a
            href="/docs/compliance"
            style={{
              display: 'inline-block',
              background: '#3d6b1f',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: 8,
              fontWeight: 600,
              textDecoration: 'none',
              marginRight: 10,
            }}>
            Three doors — compare →
          </a>
          <a href="/docs/compliance/partner">Partner door</a>
          {' · '}
          <a href="/docs/compliance/enterprise">Enterprise door</a>
        </p>
      </div>

      {/* ── Plain-English split ── */}
      <div className={styles.glanceGrid}>
        <div className={styles.glanceCard}>
          <h4 className={styles.glanceTitle}>Free — CERN-OHL-W-2.0</h4>
          <p className={styles.glanceBody}>
            Use and share the CAD under <strong>CERN-OHL-W-2.0</strong>. Build, fork, teach, research.
            If you modify and distribute, publish your modified source on the same terms, keep notices,
            and follow the <a href="/docs/compliance-guide">compliance guide</a>. No fees while you
            remain in conformance. Breach is a <strong>copyright</strong> problem with a{' '}
            <strong>30-day cure</strong> (CERN §7) — not a retroactive commercial invoice.
          </p>
        </div>
        <div className={`${styles.glanceCard} ${styles.glanceCardAccent}`}>
          <h4 className={styles.glanceTitle}>Commercial — Partner or Enterprise</h4>
          <p className={styles.glanceBody}>
            If you're selling, pick the <a href="/docs/compliance/partner">Partner door (CPA)</a> for up
            to 2,000 units / yr, or the <a href="/docs/compliance/enterprise">Enterprise door (MCLA)</a>{' '}
            above that / for exclusivity / for defence. Every commercial instrument is{' '}
            <strong>signed</strong>. None is ever auto-applied.
          </p>
        </div>
      </div>

      {/* ── Partner fee summary ── */}
      <h3 className={styles.docsHeading}>Partner tiers (CPA v1.1)</h3>
      <table className={styles.feeTable}>
        <thead>
          <tr>
            <th>Tier</th>
            <th>Annual volume</th>
            <th>Annual fee (AUD)</th>
            <th>Per-unit royalty (AUD)</th>
            <th>Battery price (AUD)</th>
          </tr>
        </thead>
        <tbody>
          {PARTNER_TIERS.map((t) => (
            <tr key={t.key}>
              <td>{t.name}</td>
              <td>{t.volume}</td>
              <td>${t.annualFeeAud.toLocaleString('en-AU')} / year</td>
              <td>${t.perUnitRoyaltyAud}</td>
              <td>${t.batteryPriceAud} <span style={{ color: '#8b949e' }}>(save ${t.batterySavingAud})</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.note}>
        All AUD, ex-GST. Setup paid annually. Report &amp; royalty due within 14 days of each quarter-end.
        Unit cap: <strong>2,000 / yr</strong>. Above that → Enterprise.
      </p>

      {/* ── Enterprise floors ── */}
      <h3 className={styles.docsHeading}>Enterprise (MCLA v1.1)</h3>
      <p className={styles.note}>
        Setup from <strong>AUD ${ENTERPRISE_SETUP_FROM_AUD.toLocaleString('en-AU')}</strong>. Royalty
        negotiated per deal. Exclusivity floors:
      </p>
      <table className={styles.feeTable}>
        <thead>
          <tr>
            <th>Exclusivity type</th>
            <th>Fee floor (AUD / yr)</th>
            <th>What it covers</th>
          </tr>
        </thead>
        <tbody>
          {EXCLUSIVITY_OPTIONS.map((e) => (
            <tr key={e.key}>
              <td>{e.label}</td>
              <td>${e.feeFloorAud.toLocaleString('en-AU')}</td>
              <td>{e.covers}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Official documents ── */}
      <h3 className={styles.docsHeading}>Official documents (PDF)</h3>
      <p className={styles.docsLead}>
        Authoritative v1.1 wording. The plain-English one-pagers are the 10-second decision sheets.
      </p>

      <details className={styles.agreementDetails}>
        <summary className={styles.agreementSummary}>
          <span className={styles.agreementSummaryTitle}>
            Commercial Partner Agreement v1.1
          </span>
          <span className={styles.agreementSummaryMeta}>Partner door — up to 2,000 units / yr</span>
        </summary>
        <div className={styles.agreementBody}>
          <p>
            The <strong>standard commercial instrument</strong> for Partner tiers (Maker / Commercial /
            Scale). Covers tiers, royalties, reporting, partner listing, battery pricing, and the Good
            Standing Certificate. Sign once, pay annually, report quarterly.
          </p>
          <div className={styles.docActions}>
            <a className={`${styles.btn} ${styles.btnDoc}`} href={LEGAL_PDFS.partnerAgreement} download>
              Download PDF (v1.1)
            </a>
            <a
              className={`${styles.btn} ${styles.btnOutline}`}
              href={LEGAL_PDFS.onePagerCpa}
              target="_blank"
              rel="noopener noreferrer">
              One-pager (PDF)
            </a>
            <a className={`${styles.btn} ${styles.btnOutline}`} href="/docs/compliance/partner">
              Partner door →
            </a>
          </div>
        </div>
      </details>

      <details className={styles.agreementDetails}>
        <summary className={styles.agreementSummary}>
          <span className={styles.agreementSummaryTitle}>
            Master Commercial License Agreement v1.1
          </span>
          <span className={styles.agreementSummaryMeta}>Enterprise door — 2,000+ / exclusivity / defence</span>
        </summary>
        <div className={styles.agreementBody}>
          <p>
            The <strong>enterprise framework</strong> for 2,000+ units / yr, exclusive territory or
            vertical, and defence / government programs. Setup from AUD $45,000, per-deal royalty,
            exclusivity fee floors, export-control provisions. Every MCLA is signed — nothing is
            auto-applied.
          </p>
          <div className={styles.docActions}>
            <a className={`${styles.btn} ${styles.btnDoc}`} href={LEGAL_PDFS.mcla} download>
              Download PDF (v1.1)
            </a>
            <a
              className={`${styles.btn} ${styles.btnOutline}`}
              href={LEGAL_PDFS.onePagerMcla}
              target="_blank"
              rel="noopener noreferrer">
              One-pager (PDF)
            </a>
            <a className={`${styles.btn} ${styles.btnOutline}`} href="/docs/compliance/enterprise">
              Enterprise door →
            </a>
          </div>
        </div>
      </details>

      <details className={styles.agreementDetails}>
        <summary className={styles.agreementSummary}>
          <span className={styles.agreementSummaryTitle}>
            Replicant GEN 1 — CERN-OHL-W-2.0 Compliance Guide v1.1
          </span>
          <span className={styles.agreementSummaryMeta}>Free door — what &quot;in conformance&quot; means</span>
        </summary>
        <div className={styles.agreementBody}>
          <p>
            Yirra's published guide to <strong>practical conformance</strong> with CERN-OHL-W-2.0 for
            this platform. Not a substitute for the CERN licence text, but it's what we point builders
            and distributors to for expectations and evidence.
          </p>
          <div className={styles.docActions}>
            <a className={`${styles.btn} ${styles.btnDocSecondary}`} href={LEGAL_PDFS.complianceGuide} download>
              Download PDF (v1.1)
            </a>
            <a
              className={`${styles.btn} ${styles.btnOutline}`}
              href={LEGAL_PDFS.onePagerCern}
              target="_blank"
              rel="noopener noreferrer">
              One-pager (PDF)
            </a>
            <a className={`${styles.btn} ${styles.btnOutline}`} href="/docs/compliance-guide">
              Web compliance guide
            </a>
          </div>
        </div>
      </details>

      <div className={styles.contactBlock}>
        <p>
          <strong>Next step.</strong> Unsure which door? Run the{' '}
          <a href="/docs/compliance">three-doors wizard</a>. Partner signups happen through{' '}
          <a href="/docs/commercial-programs">commercial programs</a>. Enterprise enquiries go to{' '}
          <a href="mailto:partners@yirrasystems.com?subject=MCLA%20enquiry">partners@yirrasystems.com</a>.
        </p>
      </div>
    </div>
  );
}
