import React, { useId } from 'react';
import {
  BUSINESS_EMAIL,
  COMMERCIAL_PROGRAMS_DOC,
  CONTACT_PAGE_URL,
  mailtoCommercial,
} from '@site/src/commercialContact';
import styles from './CommercialProgramsPipeline.module.css';

const MAIL_SUBJECT = 'Commercial inquiry: volume, licensing, or custom integration';

export default function CommercialProgramsPipeline({ compact }: { compact?: boolean }) {
  const headingId = useId();
  const mailHref = mailtoCommercial(MAIL_SUBJECT);

  return (
    <aside
      className={compact ? `${styles.wrap} ${styles.wrapCompact}` : styles.wrap}
      aria-labelledby={headingId}
    >
      <div className={styles.headerRow}>
        <span className={styles.eyebrow}>Teams & OEMs</span>
        <h3 id={headingId} className={styles.title}>
          Volume pricing, licensing & custom integration
        </h3>
      </div>
      <p className={styles.lead}>
        If you are scaling production, need cells integrated into your program, or want a custom rail-mounted
        solution, <strong>talk to us first</strong>. Reverse-engineering the pack or routing around the official
        path costs more in time, liability, and rework than most teams expect — and we would rather ship with you
        than against you.
      </p>
      <ul className={styles.bullets}>
        <li>
          <strong>Volume discounting</strong> — structured programs for repeat and high-quantity orders.
        </li>
        <li>
          <strong>Battery licensing</strong> — straightforward, affordable terms where OEM use of our pack design
          makes sense for your product line.
        </li>
        <li>
          <strong>Design & integration services</strong> — we help you implement Replicant-class power and mounting
          without guessing rail geometry, thermal paths, or certification edge cases alone.
        </li>
      </ul>
      <div className={styles.actions}>
        <a className={styles.ctaPrimary} href={mailHref}>
          Email {BUSINESS_EMAIL}
        </a>
        <a className={styles.ctaSecondary} href={CONTACT_PAGE_URL} target="_blank" rel="noopener noreferrer">
          Contact form
        </a>
        <a className={styles.ctaGhost} href={COMMERCIAL_PROGRAMS_DOC}>
          Full overview →
        </a>
      </div>
    </aside>
  );
}
