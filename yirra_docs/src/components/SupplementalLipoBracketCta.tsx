import React, { useId } from 'react';
import { COMMERCIAL_PROGRAMS_DOC } from '@site/src/commercialContact';
import styles from './SupplementalLipoBracketCta.module.css';

/** Store listing: supplemental bracket (STL / printed) for standard LiPo on Yirra rail */
export const SUPPLEMENTAL_LIPO_BRACKET_PRODUCT_URL =
  'https://yirrasystems.com/product/c169b602-7322-442f-82c5-4d1fe3c2e7c5' as const;

export default function SupplementalLipoBracketCta() {
  const headingId = useId();
  return (
    <aside className={styles.wrap} aria-labelledby={headingId}>
      <div className={styles.media}>
        <img
          src="/img/3MF%20screen%20shots/Battery_rail_male.png"
          alt="Battery rail interface — supplemental bracket uses the same rail geometry for standard LiPo packs"
          loading="lazy"
          className={styles.mediaImg}
        />
        <span className={styles.mediaCaption}>Rail-ready add-on</span>
      </div>
      <div className={styles.body}>
        <span className={styles.eyebrow}>Your pack, our geometry</span>
        <h3 id={headingId} className={styles.title}>
          Supplemental bracket for a standard 6S LiPo
        </h3>
        <p className={styles.lead}>
          The <strong>Yirra modular battery</strong> is intentionally <strong>closed source</strong> — we do not
          publish enclosure CAD, weld maps, or cell sourcing docs. That keeps safety liability and field
          performance where they belong: on a pack we control end-to-end.
        </p>
        <p className={styles.lead}>
          If you would rather run a <strong>conventional hardcase LiPo</strong> on the same rail, use the{' '}
          <strong>supplemental bracket</strong>: it adapts standard packs to the Replicant rail interface. Grab a{' '}
          <strong>printable STL</strong> for your own printer farm, or buy a <strong>printed bracket</strong> from
          the store — no obligation to buy our battery.
        </p>
        <div className={styles.actions}>
          <a
            className={styles.ctaPrimary}
            href={SUPPLEMENTAL_LIPO_BRACKET_PRODUCT_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Get the bracket (STL / printed)
            <span className={styles.ctaArrow} aria-hidden>
              →
            </span>
          </a>
          <a className={styles.ctaGhost} href="/docs/battery">
            Battery system deep dive
          </a>
        </div>
        <p className={styles.oemHint}>
          OEM, fleet, or volume?{' '}
          <a href={COMMERCIAL_PROGRAMS_DOC}>Commercial programs</a>
          {' — '}
          licensing, pricing tiers, and integration help.
        </p>
      </div>
    </aside>
  );
}
