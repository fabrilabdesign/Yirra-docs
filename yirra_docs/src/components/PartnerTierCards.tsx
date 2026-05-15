import React from "react";
import { OPEN_BATTERY_PRICE_AUD, PARTNER_TIERS } from "../data/partnerTiers";
import styles from "./PartnerTierCards.module.css";

export default function PartnerTierCards(): React.ReactElement {
  return (
    <div className={styles.grid}>
      {PARTNER_TIERS.map((t, idx) => (
        <div
          key={t.key}
          className={`${styles.card} ${idx === 1 ? styles.cardFeatured : ""}`}
        >
          {idx === 1 && <div className={styles.featureBadge}>Most popular</div>}
          <div className={styles.name}>{t.name}</div>
          <div className={styles.vol}>{t.volume}</div>

          <div className={styles.price}>
            <span className={styles.priceBig}>
              AUD ${t.annualFeeAud.toLocaleString("en-AU")}
            </span>
            <span className={styles.priceUnit}>/ year</span>
          </div>
          <div className={styles.royalty}>
            + ${t.perUnitRoyaltyAud} / unit royalty
          </div>

          <div className={styles.batteryBlock}>
            <div className={styles.batteryLabel}>Batteries</div>
            <div className={styles.batteryPrice}>
              ${t.batteryPriceAud}{" "}
              <span className={styles.batteryStrike}>${OPEN_BATTERY_PRICE_AUD}</span>
            </div>
            <div className={styles.batterySave}>
              save ${t.batterySavingAud} / unit vs open route
            </div>
          </div>

          <ul className={styles.highlights}>
            {t.highlights.map((h) => (
              <li key={h}>
                <span className={styles.check}>✓</span>
                {h}
              </li>
            ))}
          </ul>

          <a
            className={`${styles.btn} ${idx === 1 ? styles.btnFeatured : ""}`}
            href={t.buyUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Buy on yirrasystems.com ↗
          </a>
          <div className={styles.skuLine}>Stripe product · {t.stripeProductId}</div>
        </div>
      ))}
    </div>
  );
}
