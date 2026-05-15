import React, { useCallback, useMemo, useState } from "react";
import Link from "@docusaurus/Link";
import { LEGAL_PDFS } from "../data/legalDocs";
import {
  ENTERPRISE_SETUP_FROM_AUD,
  ENTERPRISE_UNITS_MIN,
  EXCLUSIVITY_OPTIONS,
  OPEN_BATTERY_PRICE_AUD,
  PARTNER_TIERS,
  partnerTier,
} from "../data/partnerTiers";
import ComplianceEvidenceForm from "./ComplianceEvidenceForm";
import styles from "./ComplianceWizard.module.css";

type WizardStep = 1 | 2 | 3 | "result";
type WizardMode = "funnel" | "evidence";
type Q1 = "personal" | "commercial" | "partner" | "enterprise" | "unsure" | null;
type Q2Volume = "maker" | "commercial" | "scale" | "enterprise" | null;
type Q3Excl = "none" | "exclusive" | "defence" | null;

// ─── Routes ─────────────────────────────────────────────────────────────────
const DOOR_FREE = "/docs/compliance/free";
const DOOR_PARTNER = "/docs/compliance/partner";
const DOOR_ENTERPRISE = "/docs/compliance/enterprise";
const COMMERCIAL_PROGRAMS = "/docs/commercial-programs";
const COMPLIANCE_GUIDE_DOC = "/docs/compliance-guide";
const LICENSE_DOC = "/docs/license";

// ─── Copy ───────────────────────────────────────────────────────────────────
const CERN_PROMISES = [
  "Publish your changes — if you modify the design and share it, you share the design files too",
  "Credit Yirra Systems and the Replicant GEN 1 project",
  "Don\u2019t imply Yirra endorses you or your fork",
  "Don\u2019t attack other users with patents",
] as const;

const PARTNER_PROMISES = [
  "Report unit counts within 14 days of every quarter-end",
  "Pay royalties within 14 days of submitting that report",
  "Build with genuine batteries and approved flight controllers",
  "Keep records so we can reconcile your reports",
  "Don\u2019t export to parties blocked under Australian or applicable law",
] as const;

interface TierResult {
  tier: "free" | "maker" | "commercial" | "scale" | "enterprise" | "partner-unsure";
  title: string;
  body: React.ReactNode;
  variant: "green" | "partner" | "enterprise";
  ctaLabel: string;
  ctaHref: string;
  ctaExternal?: boolean;
  secondaryHref?: string;
  secondaryLabel?: string;
}

function scrollToId(id: string) {
  if (typeof document === "undefined") return;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function fmtAud(n: number) {
  return `AUD $${n.toLocaleString("en-AU")}`;
}

export default function ComplianceWizard(): React.ReactElement {
  const [mode, setMode] = useState<WizardMode>("funnel");
  const [step, setStep] = useState<WizardStep>(1);
  const [q1, setQ1] = useState<Q1>(null);
  const [q2, setQ2] = useState<Q2Volume>(null);
  const [q3, setQ3] = useState<Q3Excl>(null);

  const reset = useCallback(() => {
    setStep(1);
    setQ1(null);
    setQ2(null);
    setQ3(null);
  }, []);

  const goEvidence = useCallback(() => {
    setMode("evidence");
    setTimeout(() => scrollToId("compliance-evidence"), 80);
  }, []);

  const pickQ1 = useCallback((v: NonNullable<Q1>) => {
    setQ1(v);
    if (v === "personal" || v === "partner" || v === "enterprise" || v === "unsure") {
      setStep("result");
      setTimeout(() => scrollToId("wiz-result"), 60);
      return;
    }
    setStep(2);
  }, []);

  const pickQ2 = useCallback((v: NonNullable<Q2Volume>) => {
    setQ2(v);
    if (v === "enterprise") {
      setStep("result");
      setTimeout(() => scrollToId("wiz-result"), 60);
      return;
    }
    setStep(3);
  }, []);

  const pickQ3 = useCallback((v: NonNullable<Q3Excl>) => {
    setQ3(v);
    setStep("result");
    setTimeout(() => scrollToId("wiz-result"), 60);
  }, []);

  const result = useMemo((): TierResult | null => {
    if (step !== "result") return null;

    if (q1 === "personal") {
      return {
        tier: "free",
        variant: "green",
        title: "Free — CERN-OHL-W-2.0",
        body: (
          <>
            Zero dollars. Build, fork, teach, research. If you ever <em>distribute</em> the hardware,
            the four promises below kick in. Read the{" "}
            <Link to={DOOR_FREE}>Free door</Link> and the{" "}
            <Link to={COMPLIANCE_GUIDE_DOC}>compliance guide</Link>.
          </>
        ),
        ctaLabel: "Open the Free door",
        ctaHref: DOOR_FREE,
        secondaryHref: COMPLIANCE_GUIDE_DOC,
        secondaryLabel: "Compliance guide",
      };
    }

    if (q1 === "unsure") {
      return {
        tier: "partner-unsure",
        variant: "partner",
        title: "Start at the Partner door",
        body: (
          <>
            If you\u2019re unsure, the Partner door is the neutral middle path — one agreement, published
            tiers, cheaper batteries, and no retroactive surprises. You can still drop back to Free or
            step up to Enterprise any time.
          </>
        ),
        ctaLabel: "Open the Partner door",
        ctaHref: DOOR_PARTNER,
        secondaryHref: DOOR_FREE,
        secondaryLabel: "Actually, I\u2019m non-commercial",
      };
    }

    if (q1 === "partner") {
      return {
        tier: "partner-unsure",
        variant: "partner",
        title: "Partner door — three tiers",
        body: (
          <>
            Clean commercial lane, partner listing, and batteries up to <strong>45% off</strong> the
            $229 open-route price. Three tiers from <strong>AUD $1,100 / yr</strong>. Cap is{" "}
            <strong>2,000 units / yr</strong>; above that use Enterprise.
          </>
        ),
        ctaLabel: "Open the Partner door",
        ctaHref: DOOR_PARTNER,
        secondaryHref: COMMERCIAL_PROGRAMS,
        secondaryLabel: "Compare tiers",
      };
    }

    if (q1 === "enterprise") {
      return {
        tier: "enterprise",
        variant: "enterprise",
        title: "Enterprise door — MCLA",
        body: (
          <>
            For 2,000+ units / yr, exclusivity (territory, vertical, or both), and
            defence/government programs. Setup from <strong>{fmtAud(ENTERPRISE_SETUP_FROM_AUD)}</strong>,
            royalty negotiated per deal. Every MCLA is signed; nothing is auto-applied.
          </>
        ),
        ctaLabel: "Open the Enterprise door",
        ctaHref: DOOR_ENTERPRISE,
        secondaryHref: `mailto:partners@yirrasystems.com?subject=${encodeURIComponent("MCLA enquiry")}`,
        secondaryLabel: "Email partners@",
      };
    }

    // Commercial → volume → exclusivity
    if (q1 === "commercial") {
      // Enterprise wins: explicit 2,000+ OR exclusivity/defence chosen
      const goEnterprise =
        q2 === "enterprise" || q3 === "exclusive" || q3 === "defence";

      if (goEnterprise) {
        return {
          tier: "enterprise",
          variant: "enterprise",
          title: "Recommended: Enterprise (MCLA)",
          body: (
            <>
              Volume at or above <strong>2,000 units / yr</strong>, exclusivity, or defence/government
              requires an MCLA. Setup from <strong>{fmtAud(ENTERPRISE_SETUP_FROM_AUD)}</strong>, per-deal
              royalty, exclusivity fee floors from{" "}
              <strong>{fmtAud(EXCLUSIVITY_OPTIONS[0].feeFloorAud)}/yr</strong>.
            </>
          ),
          ctaLabel: "Open the Enterprise door",
          ctaHref: DOOR_ENTERPRISE,
          secondaryHref: `mailto:partners@yirrasystems.com?subject=${encodeURIComponent("MCLA enquiry")}`,
          secondaryLabel: "Email partners@",
        };
      }

      if (q2 && q2 !== "enterprise") {
        const t = partnerTier(q2);
        return {
          tier: q2,
          variant: "partner",
          title: `Recommended: Partner · ${t.name} — ${fmtAud(t.annualFeeAud)} / yr + $${t.perUnitRoyaltyAud} / unit`,
          body: (
            <>
              {t.unitCapLabel}. Partner listing, <em>Yirra Partner</em> badge, and batteries at{" "}
              <strong>${t.batteryPriceAud} / unit</strong> (save ${t.batterySavingAud} vs the $
              {OPEN_BATTERY_PRICE_AUD} non-partner price).
            </>
          ),
          ctaLabel: `Buy ${t.name} on yirrasystems.com \u2197`,
          ctaHref: t.buyUrl,
          ctaExternal: true,
          secondaryHref: DOOR_PARTNER,
          secondaryLabel: "Partner door",
        };
      }
    }

    return null;
  }, [step, q1, q2, q3]);

  const legalCards = useMemo(
    () =>
      [
        {
          key: "partner",
          title: "Commercial Partner Agreement",
          meta: "CPA v1.1 · up to 2,000 units/yr",
          desc: "Partner door terms: tiers, royalties, reporting, battery pricing, Good Standing Certificate.",
          pdf: LEGAL_PDFS.partnerAgreement,
          docHref: DOOR_PARTNER,
          docLabel: "Partner door",
          featured: true,
        },
        {
          key: "mcla",
          title: "Master Commercial License Agreement",
          meta: "MCLA v1.1 · enterprise / exclusivity / defence",
          desc: "Enterprise door terms: 2,000+ units, exclusivity floors, defence and government provisions.",
          pdf: LEGAL_PDFS.mcla,
          docHref: DOOR_ENTERPRISE,
          docLabel: "Enterprise door",
          featured: false,
        },
        {
          key: "compliance",
          title: "Compliance Guide",
          meta: "CERN-OHL-W-2.0 · v1.1",
          desc: "Free door obligations in detail. Checklist and evidence for distributors on the open route.",
          pdf: LEGAL_PDFS.complianceGuide,
          docHref: COMPLIANCE_GUIDE_DOC,
          docLabel: "Compliance guide",
          featured: false,
        },
        {
          key: "one-pagers",
          title: "Plain-English one-pagers",
          meta: "CERN · CPA · MCLA",
          desc: "The 10-second decision sheets. Grab whichever matches the door you walked through.",
          pdf: LEGAL_PDFS.onePagerCpa,
          docHref: LICENSE_DOC,
          docLabel: "Legal hub",
          featured: false,
          extraLinks: [
            { label: "CERN (Free)", href: LEGAL_PDFS.onePagerCern },
            { label: "CPA (Partner)", href: LEGAL_PDFS.onePagerCpa },
            { label: "MCLA (Enterprise)", href: LEGAL_PDFS.onePagerMcla },
          ],
        },
      ] as const,
    []
  );

  const dotClass = (dotStep: 1 | 2 | 3) => {
    if (step === "result") return styles.stepDotDone;
    if (dotStep < step) return styles.stepDotDone;
    if (dotStep === step) return styles.stepDotActive;
    return "";
  };

  const maker = partnerTier("maker");
  // 25-unit worked example for the at-a-glance table
  const freeAt25 = 25 * OPEN_BATTERY_PRICE_AUD; // batteries only — CERN is $0 licence
  const partnerAt25 =
    maker.annualFeeAud + 25 * maker.perUnitRoyaltyAud + 25 * maker.batteryPriceAud;

  return (
    <div className={styles.shell}>
      <header className={styles.hero}>
        <p className={styles.heroKicker}>Compliance &amp; licensing · v1.1</p>
        <h1 className={styles.pageTitle}>Three ways to license. Pick the one that fits.</h1>
        <p className={styles.pageSub}>
          Free and open under CERN-OHL-W-2.0. Partner for up to 2,000 units a year. Enterprise for
          anything bigger, exclusive, or defence. If things grow, switch up. No retroactive penalties,
          no hidden escalators.
        </p>
      </header>

      {/* ── Three doors ── */}
      <div className={styles.pathGrid}>
        {/* Door 1 — Free */}
        <div className={styles.pathCard}>
          <div className={`${styles.pathHead} ${styles.pathHeadOpen}`}>
            <div className={styles.pathTag}>Door 1 · Free</div>
            <div className={styles.pathTitle}>Free &amp; Open</div>
            <div className={styles.pathSub}>CERN-OHL-W-2.0 · makers, research, teaching</div>
          </div>
          <div className={styles.pathBody}>
            <div className={styles.pathPrice}>
              <span className={styles.pathPriceBig}>$0</span>
              <span className={styles.pathPriceUnit}>no fee, no account</span>
            </div>
            <div className={styles.pathBattery}>
              Non-partner batteries at <strong>${OPEN_BATTERY_PRICE_AUD} / unit</strong>
            </div>
            <p className={styles.pathLead}>
              You promise (four things):
            </p>
            <ul className={styles.stepList}>
              {CERN_PROMISES.map((text, i) => (
                <li key={i}>
                  <span className={styles.stepNum}>{i + 1}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <p className={styles.pathFinePrint}>
              If you mess up, the licence ends automatically until you fix it. No lawyers — you just
              lose the licence.
            </p>
            <Link className={styles.btnGhost} to={DOOR_FREE}>
              Open the Free door &rarr;
            </Link>
          </div>
        </div>

        {/* Door 2 — Partner (CPA) */}
        <div className={`${styles.pathCard} ${styles.pathCardPartner}`}>
          <div className={`${styles.pathHead} ${styles.pathHeadPartner}`}>
            <div className={`${styles.pathTag} ${styles.pathTagPartner}`}>Door 2 · Partner</div>
            <div className={styles.pathTitle}>Yirra Partner</div>
            <div className={styles.pathSub}>CPA · up to 2,000 units / yr · three tiers</div>
          </div>
          <div className={styles.pathBody}>
            <div className={styles.savingsBanner}>
              <p className={styles.savingsHook}>One agreement. Published tiers.</p>
              <p className={styles.savingsDetail}>
                Listing on yirrasystems.com, the <em>Yirra Partner</em> badge, and batteries up to 45%
                off.
              </p>
            </div>
            <div className={styles.priceRows}>
              {PARTNER_TIERS.map((t) => (
                <div className={styles.priceRow} key={t.key}>
                  <span className={styles.priceLabel}>
                    {t.name} <em>({t.volume})</em>
                  </span>
                  <span>
                    <span className={styles.priceVal}>
                      ${t.annualFeeAud.toLocaleString("en-AU")} + ${t.perUnitRoyaltyAud}/unit
                    </span>
                  </span>
                </div>
              ))}
            </div>
            <p className={styles.pathFinePrint}>
              Above 2,000 units / yr? Use Yirra Enterprise.
            </p>
            <Link className={styles.btnJoinPartner} to={DOOR_PARTNER}>
              Open the Partner door &rarr;
            </Link>
            <div className={styles.stripeRow}>
              {PARTNER_TIERS.map((t) => (
                <a
                  key={t.key}
                  className={styles.stripeMini}
                  href={t.buyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.name} ${t.annualFeeAud.toLocaleString("en-AU")}/yr
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Door 3 — Enterprise (MCLA) */}
        <div className={`${styles.pathCard} ${styles.pathCardEnterprise}`}>
          <div className={`${styles.pathHead} ${styles.pathHeadEnterprise}`}>
            <div className={`${styles.pathTag} ${styles.pathTagEnterprise}`}>Door 3 · Enterprise</div>
            <div className={styles.pathTitle}>Yirra Enterprise</div>
            <div className={styles.pathSub}>MCLA · 2,000+ units · exclusivity · defence</div>
          </div>
          <div className={styles.pathBody}>
            <div className={styles.pathPrice}>
              <span className={styles.pathPriceBig}>
                from ${ENTERPRISE_SETUP_FROM_AUD.toLocaleString("en-AU")}
              </span>
              <span className={styles.pathPriceUnit}>setup + negotiated royalty</span>
            </div>
            <div className={styles.pathBattery}>
              Custom SKUs, serialisation, priority engineering.
            </div>
            <p className={styles.pathLead}>Exclusivity floors (AUD / yr):</p>
            <ul className={styles.priceRows}>
              {EXCLUSIVITY_OPTIONS.map((e) => (
                <li key={e.key} className={styles.priceRow}>
                  <span className={styles.priceLabel}>{e.label}</span>
                  <span>
                    <span className={styles.priceVal}>
                      ${e.feeFloorAud.toLocaleString("en-AU")}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className={styles.pathFinePrint}>
              Every MCLA is signed. Export-control breaches terminate immediately; most other breaches
              get a 30-day cure.
            </p>
            <Link className={styles.btnGhost} to={DOOR_ENTERPRISE}>
              Open the Enterprise door &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* ── At a glance ── */}
      <hr className={styles.sectionDivider} />
      <section aria-labelledby="at-a-glance-heading">
        <h2 id="at-a-glance-heading" className={styles.sectionTitle}>At a glance</h2>
        <p className={styles.sectionSub}>
          Same 25 units, three doors. All figures AUD, ex-GST.
        </p>
        <div className={styles.comparison3}>
          <div className={`${styles.compRow3} ${styles.compRowHead}`}>
            <div className={styles.compCell} />
            <div className={styles.compCell}>Free (CERN)</div>
            <div className={`${styles.compCell} ${styles.compCellPartner}`}>Partner · Maker (CPA)</div>
            <div className={`${styles.compCell} ${styles.compCellEnterprise}`}>Enterprise (MCLA)</div>
          </div>
          {(
            [
              [
                "Annual fee",
                "$0",
                `$${maker.annualFeeAud.toLocaleString("en-AU")}`,
                `from $${ENTERPRISE_SETUP_FROM_AUD.toLocaleString("en-AU")}`,
              ],
              [
                "Per-unit royalty",
                "None",
                `$${maker.perUnitRoyaltyAud} / unit`,
                "negotiated per deal",
              ],
              [
                "Battery price",
                `$${OPEN_BATTERY_PRICE_AUD}`,
                (
                  <>
                    <strong>${maker.batteryPriceAud}</strong>{" "}
                    <span className={styles.tagSave}>save ${maker.batterySavingAud}</span>
                  </>
                ),
                "custom SKUs",
              ],
              [
                "Unit cap",
                "None (non-commercial)",
                `${maker.unitRangeLow.toLocaleString("en-AU")} – ${maker.unitRangeHigh.toLocaleString("en-AU")} / yr`,
                `${ENTERPRISE_UNITS_MIN.toLocaleString("en-AU")}+ / yr`,
              ],
              [
                "Listing & badge",
                "None",
                "Partner listing · \u201cYirra Partner\u201d badge",
                "Partner listing + custom comarketing",
              ],
              [
                "Exclusivity",
                "Not available",
                "Not available",
                "Territory / vertical / both",
              ],
              [
                "If you mess up",
                "Licence ends until fixed (CERN §7)",
                "30-day cure, backpay, delist",
                "30-day cure except export control",
              ],
              [
                "Net cost at 25 units",
                `$${freeAt25.toLocaleString("en-AU")} (batteries only, 9 ongoing obligations)`,
                (
                  <>
                    <strong>${partnerAt25.toLocaleString("en-AU")}</strong>{" "}
                    <span className={styles.tagSave}>all-in, no ongoing obligations beyond reporting</span>
                  </>
                ),
                "\u2014 (N/A under 2,000)",
              ],
            ] as ReadonlyArray<readonly [React.ReactNode, React.ReactNode, React.ReactNode, React.ReactNode]>
          ).map(([label, free, partner, ent], idx) => (
            <div key={idx} className={styles.compRow3}>
              <div className={styles.compCell} style={{ fontWeight: 600 }}>{label}</div>
              <div className={`${styles.compCell} ${styles.compCellMuted}`}>{free}</div>
              <div className={`${styles.compCell} ${styles.compCellPartner}`}>{partner}</div>
              <div className={`${styles.compCell} ${styles.compCellEnterprise}`}>{ent}</div>
            </div>
          ))}
        </div>
        <p className={styles.compFoot}>
          Partner Commercial tier at 200 units: $4,500 + $3,000 royalty + $29,800 batteries ={" "}
          <strong>$37,300</strong> vs <strong>$45,800</strong> on the Free route for the same batteries.
          Switch up when the numbers switch.
        </p>
      </section>

      {/* ── Path helper ── */}
      <hr className={styles.sectionDivider} />

      {mode === "funnel" && (
        <div id="compliance-wizard" className={styles.wizardBox}>
          <h2 className={styles.wizardTitle}>Not sure which door fits?</h2>
          <p className={styles.wizardSub}>
            Three questions. Lands you on the right door.
          </p>

          <div className={styles.stepHeader}>
            <div className={`${styles.stepDot} ${dotClass(1)}`}>1</div>
            <div className={styles.stepLine} />
            <div className={`${styles.stepDot} ${dotClass(2)}`}>2</div>
            <div className={styles.stepLine} />
            <div className={`${styles.stepDot} ${dotClass(3)}`}>3</div>
            <div className={styles.stepLine} />
            <div className={`${styles.stepDot} ${step === "result" ? styles.stepDotDone : ""}`}>✓</div>
          </div>

          {step === 1 && (
            <div>
              <p className={styles.stepQuestion}>Are you building Replicants to sell?</p>
              <button type="button" className={styles.wizOption} onClick={() => pickQ1("personal")}>
                <div className={styles.wizOptTitle}>No — I&rsquo;m a maker / research / teaching</div>
                <div className={styles.wizOptSub}>Free, under CERN-OHL-W-2.0. Four promises, no fee.</div>
              </button>
              <button type="button" className={styles.wizOption} onClick={() => pickQ1("commercial")}>
                <div className={styles.wizOptTitle}>Yes — I want to manufacture and sell</div>
                <div className={styles.wizOptSub}>
                  I&rsquo;ll tell you volume next. We&rsquo;ll route to Partner or Enterprise.
                </div>
              </button>
              <button
                type="button"
                className={`${styles.wizOption} ${styles.wizOptionPartner}`}
                onClick={() => pickQ1("partner")}
              >
                <div className={`${styles.wizOptTitle} ${styles.wizOptTitlePartner}`}>
                  Skip ahead — show me the Partner tiers
                </div>
                <div className={`${styles.wizOptSub} ${styles.wizOptSubPartner}`}>
                  CPA, up to 2,000 units / yr, three published tiers.
                </div>
              </button>
              <button type="button" className={styles.wizOption} onClick={() => pickQ1("enterprise")}>
                <div className={styles.wizOptTitle}>I&rsquo;m large / exclusive / defence</div>
                <div className={styles.wizOptSub}>
                  2,000+ units, exclusivity, government, or bespoke — Enterprise (MCLA).
                </div>
              </button>
              <button type="button" className={styles.wizOption} onClick={() => pickQ1("unsure")}>
                <div className={styles.wizOptTitle}>Not sure yet</div>
                <div className={styles.wizOptSub}>
                  We&rsquo;ll park you at the Partner door and you can move either direction.
                </div>
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className={styles.stepQuestion}>Roughly how many units per year?</p>
              <button type="button" className={styles.wizOption} onClick={() => pickQ2("maker")}>
                <div className={styles.wizOptTitle}>1 – 25 units</div>
                <div className={styles.wizOptSub}>
                  Partner · Maker — AUD $1,100 / yr + $20 / unit · batteries $175 (save $54)
                </div>
              </button>
              <button type="button" className={styles.wizOption} onClick={() => pickQ2("commercial")}>
                <div className={styles.wizOptTitle}>26 – 500 units</div>
                <div className={styles.wizOptSub}>
                  Partner · Commercial — AUD $4,500 / yr + $15 / unit · batteries $149 (save $80)
                </div>
              </button>
              <button type="button" className={styles.wizOption} onClick={() => pickQ2("scale")}>
                <div className={styles.wizOptTitle}>501 – 2,000 units</div>
                <div className={styles.wizOptSub}>
                  Partner · Scale — AUD $13,500 / yr + $9 / unit · batteries $125 (save $104)
                </div>
              </button>
              <button type="button" className={styles.wizOption} onClick={() => pickQ2("enterprise")}>
                <div className={styles.wizOptTitle}>2,000+ units</div>
                <div className={styles.wizOptSub}>
                  Enterprise — MCLA. Setup from AUD $45,000, royalty per deal.
                </div>
              </button>
              <div className={styles.btnRow}>
                <button type="button" className={styles.btn} onClick={() => setStep(1)}>← Back</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className={styles.stepQuestion}>
                Do you need exclusivity, or is this a defence/government program?
              </p>
              <button type="button" className={styles.wizOption} onClick={() => pickQ3("none")}>
                <div className={styles.wizOptTitle}>No — non-exclusive, civilian</div>
                <div className={styles.wizOptSub}>
                  Stay on the Partner path at the tier matching your volume.
                </div>
              </button>
              <button type="button" className={styles.wizOption} onClick={() => pickQ3("exclusive")}>
                <div className={styles.wizOptTitle}>Yes — I want territorial or vertical exclusivity</div>
                <div className={styles.wizOptSub}>
                  Bumps you to Enterprise (MCLA). Floor from AUD $25,000 / yr.
                </div>
              </button>
              <button type="button" className={styles.wizOption} onClick={() => pickQ3("defence")}>
                <div className={styles.wizOptTitle}>Yes — defence, government, or regulated program</div>
                <div className={styles.wizOptSub}>
                  Enterprise (MCLA) with export-control provisions.
                </div>
              </button>
              <div className={styles.btnRow}>
                <button type="button" className={styles.btn} onClick={() => setStep(2)}>← Back</button>
              </div>
            </div>
          )}

          {step === "result" && result && (
            <div id="wiz-result">
              <div
                className={`${styles.resultBox} ${
                  result.variant === "green"
                    ? styles.resultGreen
                    : result.variant === "enterprise"
                      ? styles.resultEnterprise
                      : styles.resultPartner
                }`}
              >
                <div className={styles.resultTitle}>{result.title}</div>
                <p className={styles.resultDesc}>{result.body}</p>
              </div>
              <div className={styles.btnRow}>
                <button type="button" className={styles.btn} onClick={reset}>Start over</button>
                {result.ctaExternal ? (
                  <a
                    className={`${styles.btn} ${styles.btnPartner}`}
                    style={{ display: "inline-flex", alignItems: "center", textDecoration: "none", color: "#fff" }}
                    href={result.ctaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {result.ctaLabel}
                  </a>
                ) : (
                  <Link
                    className={`${styles.btn} ${styles.btnPartner}`}
                    style={{ display: "inline-flex", alignItems: "center", textDecoration: "none", color: "#fff" }}
                    to={result.ctaHref}
                  >
                    {result.ctaLabel} &rarr;
                  </Link>
                )}
                {result.secondaryHref && result.secondaryLabel && (
                  <Link className={styles.btn} to={result.secondaryHref}>
                    {result.secondaryLabel}
                  </Link>
                )}
                {(result.tier === "maker" || result.tier === "commercial" || result.tier === "scale") && (
                  <button type="button" className={styles.btnPrimary} onClick={goEvidence}>
                    Upload compliance evidence
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Evidence wizard ── */}
      {mode === "evidence" && (
        <div id="compliance-evidence" className={styles.evidenceSection}>
          <div className={styles.evidenceHeader}>
            <h2 className={styles.evidenceTitle}>Evidence wizard</h2>
            <button type="button" className={styles.backLink} onClick={() => setMode("funnel")}>
              ← Back
            </button>
          </div>
          <p style={{ fontSize: "0.82rem", color: "#8b949e", margin: "0 0 16px", lineHeight: 1.55 }}>
            Upload compliance artifacts for Yirra review. Runs alongside the checklist in the{" "}
            <a href={LEGAL_PDFS.complianceGuide} target="_blank" rel="noopener noreferrer">
              compliance guide PDF
            </a>.
          </p>
          <ComplianceEvidenceForm />
        </div>
      )}

      {/* ── Legal docs ── */}
      <hr className={styles.sectionDivider} />
      <h2 className={styles.legalSectionTitle}>Official documents (readable + PDF)</h2>
      <p className={styles.legalSectionLead}>
        v1.1 PDFs for records, plus the plain-English one-pagers for the 10-second decision.
      </p>
      <div className={styles.legalGrid}>
        {legalCards.map((c) => (
          <div key={c.key} className={`${styles.legalCard} ${c.featured ? styles.legalCardFeatured : ""}`}>
            <div className={styles.legalCardTitle}>{c.title}</div>
            <div className={styles.legalCardMeta}>{c.meta}</div>
            <p className={styles.legalCardDesc}>{c.desc}</p>
            <div className={styles.docLinks}>
              <a className={`${styles.docLink} ${styles.docLinkPrimary}`} href={c.pdf} target="_blank" rel="noopener noreferrer">
                Download PDF
              </a>
              <Link className={styles.docLink} to={c.docHref}>{c.docLabel}</Link>
            </div>
            {"extraLinks" in c && Array.isArray((c as any).extraLinks) && (
              <div className={styles.docLinks} style={{ marginTop: 6 }}>
                {(c as any).extraLinks.map((x: { label: string; href: string }) => (
                  <a
                    key={x.href}
                    className={styles.docLink}
                    href={x.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {x.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {mode === "funnel" && (
        <div className={styles.skipRow}>
          <button type="button" className={styles.btn} onClick={goEvidence}>
            Skip straight to evidence wizard &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
