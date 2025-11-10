Great—then let’s staff it *optimally* for speed without tripping over each other. The sweet spot is **6 engineers** with crisp ownership and minimal overlap.

# Team & Roles

* **E1 – Platform/K8s Lead:** k3s node, hostNetwork/LB, cert-manager, storage, ingress/firewall.
* **E2 – Mailstack:** Postfix, Dovecot, Rspamd/Redis, ClamAV, Sieve; delivered as single Pod (co-located).
* **E3 – Security & Deliverability:** SPF/DKIM/DMARC, MTA-STS/TLS-RPT, PTR/rDNS, policy baselines, postscreen/URIBL.
* **E4 – SRE/Observability/Backups:** metrics, logging, alerting, restic snapshots/restore drills, runbooks.
* **E5 – Webmail & SSO:** SnappyMail/SOGo, ActiveSync/CalDAV/CardDAV, optional Keycloak/OIDC, client profiles.
* **E6 – QA/Release & Docs:** test plans, smoke/soak tests, failure drills, change control, final docs & handover.

---

# DNS & Cloudflare Integration Notes

* **Cloudflare DNS:** All DNS records (MX, SPF, DKIM, DMARC, MTA-STS, PTR) managed via Cloudflare dashboard
* **SSL Termination:** Cloudflare handles SSL termination; internal services use HTTP with Cloudflare origin certs
* **Rate Limiting:** Configure Cloudflare WAF rules for SMTP ports if needed
* **DNS Propagation:** Allow 24-48 hours for DNS changes to propagate globally

---

# Phase Plan (parallelizable "waves")

## Wave 0 – Guardrails & Prereqs

* **T0.1 Scope note (OFFICIAL/O:S only)** – Owner: E3
  **Done:** Written scope + risk register.
* **T0.2 IP/DNS/PTR readiness** – Owner: E1 (E3 consulted)
  **Done:** Static public IP(s) confirmed; PTR ticket raised for `mail.gaudy.com.au`; firewall plan.

## Wave 1 – Platform Foundations

* **T1.1 k3s mail node** – Owner: E1
  Label/taint node, open **25/465/587/993**, host firewall hardened.
  **Done:** External port probes succeed.
* **T1.2 cert-manager + ACME (DNS-01 preferred)** – Owner: E1
  Issuer + token secret; issue test cert.
  **Done:** Valid cert issued to `test.gaudy.com.au`.
* **T1.3 Storage/PVC policy** – Owner: E1 (E4)
  local-path storage class with snapshot class; encryption at rest if available.
  **Done:** `vmail-pvc` exists; snapshot policy documented.

## Wave 2 – Mail Core (single Pod)

* **T2.1 Configs in Git** – Owner: E2
  Postfix `main.cf/master.cf` (TLS, texthash maps, postscreen), Dovecot `dovecot.conf` (IMAPS, LMTP, Sieve hooks).
  **Done:** Lint passes; peer review E3.
* **T2.2 Co-located Pod (DaemonSet hostNetwork)** – Owner: E2 (E1)
  One Pod with Postfix+Dovecot, shared `/var/spool/postfix/private`, bind **25/465/587/993**.
  **Done:** Pod healthy; ports listening.
* **T2.3 Rspamd/Redis/ClamAV** – Owner: E2
  Rspamd local.d (DKIM/ARC/DMARC, antivirus, milter), Redis configured, ClamAV with seeded DB.
  **Done:** GTUBE flagged, EICAR quarantined.

## Wave 3 – Security & Deliverability

* **T3.1 DNS Auth Suite** – Owner: E3
  Publish **SPF (mx)**, **DKIM (s1)**, **DMARC p=none**, **TLS-RPT**, **MTA-STS TXT (id)**; **MX/A/AAAA**.
  **Done:** `dig` checks pass; external validators green.
* **T3.2 MTA-STS site (mode=testing)** – Owner: E1/E3
  Serve `/.well-known/mta-sts.txt` via Ingress; TLS OK.
  **Done:** Remote fetch OK; TLS-RPT begins.
* **T3.3 PTR/HELO alignment** – Owner: E3
  PTR → `mail.<domain>` and forward A/AAAA → same IP(s).
  **Done:** Alignment verified against major receivers.
* **T3.4 Baseline hardening** – Owner: E3
  Disable legacy auth; submission rate limits; postscreen enabled; greylisting as policy allows.
  **Done:** Policy doc + applied config.

## Wave 4 – Webmail & Clients

* **T4.1 Webmail** – Owner: E5
  Pick **SnappyMail** (lean) or **SOGo** (mail+cal+contacts+ActiveSync), deploy behind Ingress.
  **Done:** TLS OK; login with real mailbox.
* **T4.2 Client baselines** – Owner: E5 (E3)
  Thunderbird ESR profiles; iOS/Android (IMAPS/SMTP or SOGo ActiveSync).
  **Done:** Golden workstation + mobile validated.
* **T4.3 Optional SSO** – Owner: E5 (E1/E2)
  Keycloak + Dovecot OAuth2 (XOAUTH2), webmail behind OIDC.
  **Done:** Passwordless demo account working.

## Wave 5 – Observability, Backup, DR

* **T5.1 Metrics** – Owner: E4
  Postfix exporter, Rspamd exporter, Grafana boards (queue depth, reject rate, symbols, 2xx/4xx/5xx).
  **Done:** Dashboards live with alerts.
* **T5.2 Logs** – Owner: E4
  Vector/Fluent Bit → SIEM; parse postfix/rspamd/dovecot auth patterns with saved queries.
  **Done:** Searchable logs; alert rules firing on anomalies.
* **T5.3 Backups** – Owner: E4
  Nightly **restic** of `vmail-pvc` to S3/MinIO; **restore drill** to scratch PVC.
  **Done:** Snapshot retention policy; successful restore report.

## Wave 6 – Policy, Markings, & QA

* **T6.1 Protective markings & Sieve** – Owner: E2 (E3)
  Optional outbound stamping when `X-AUS-GOV-Marking` present; inbound header respect.
  **Done:** Marked test messages verified.
* **T6.2 Test plan & execution** – Owner: E6
  Smoke tests (TLS, auth, DKIM/DMARC pass), soak tests (queue stability), failure drills (kill Rspamd/ClamAV/Pod; node drain).
  **Done:** Test report; issues fixed.
* **T6.3 Runbooks** – Owner: E4 (E2/E3, E6 review)
  User lifecycle, DKIM rotation, blacklist delist, queue triage, disaster restore, SSO fallback.
  **Done:** Docs merged; table-top run-through.

## Wave 7 – Go Live & Warm-Up

* **T7.1 DMARC ramp** – Owner: E3
  `p=none` → `quarantine` → `reject` after RUA/RUF clean.
  **Done:** Policy stepped; no unintended rejects.
* **T7.2 IP reputation warm-up** – Owner: E3 (E6)
  Low-volume sends to majors; monitor bounces/TLS-RPT; optional outbound relay for non-sensitive during warm-up.
  **Done:** Inbox placement acceptable.

---

# Ticket Backlog (ready-to-import)

Each line is **[ID] Title — Owner — Inputs → Outputs — Done**.

* **P0-1** Scope & classification — E3 — context → scope note — scope doc exists.

* **P0-2** Public IP & PTR request — E1 — provider info → PTR to `mail.gaudy.com.au` — reverse/forward match.

* **PL-1** Mail node label/taint & firewall — E1 — node name → labeled, ports open — external probe OK.

* **PL-2** cert-manager + DNS-01 issuer — E1 — DNS token → valid test cert — cert status `True`.

* **PL-3** Storage class & snapshots — E1/E4 — SC config → `vmail-pvc`, snapshot policy — PVC bound & policy doc.

* **MS-1** Postfix config — E2 — domain → `main.cf/master.cf` — lints; reviewed by E3.

* **MS-2** Dovecot config — E2 — domain → `dovecot.conf` (IMAPS/LMTP/Sieve) — lints; reviewed by E3.

* **MS-3** Co-located Pod (DaemonSet) — E2/E1 — configs, secrets, TLS → bound 25/465/587/993 — healthy & listening.

* **MS-4** Rspamd/Redis/ClamAV — E2 — deploy yamls → GTUBE/EICAR — expected verdicts.

* **SEC-1** SPF/DKIM/DMARC/TLS-RPT/MTA-STS TXT — E3 — DNS access → published records — external checks pass.

* **SEC-2** MTA-STS site (testing mode) — E1/E3 — ConfigMap+Ingress → policy reachable — fetch OK.

* **SEC-3** PTR/HELO alignment — E3 — ISP ticket → alignment verified — sample receiver headers show pass.

* **SEC-4** Baseline hardening — E3 — policy doc → applied — legacy auth off, postscreen on.

* **APP-1** Webmail deploy (SnappyMail **or** SOGo) — E5 — selected app → TLS fronted webmail — login OK.

* **APP-2** Client baselines — E5 — servers & ports → TB ESR profile + mobile profile — both send/receive OK.

* **APP-3** Optional Keycloak/OIDC — E5 — realm & client → XOAUTH2 + OIDC front — demo account works.

* **SRE-1** Metrics & dashboards — E4 — exporters → Grafana boards — alerts wired.

* **SRE-2** Central logs & alerts — E4 — Vector/Fluent Bit → SIEM views — saved queries usable.

* **SRE-3** Nightly backups — E4 — restic env → snapshots — successful restore report.

* **SRE-4** Runbooks — E4 — inputs from E2/E3 — docs — peer-reviewed & approved.

* **QA-1** Test plan — E6 — system map → doc — approved by E1/E3.

* **QA-2** Test execution — E6 — plan → report — sign-offs & fixes.

* **QA-3** Release checklist & change control — E6 — inputs → signed release — change log committed.

---

# RACI (snapshot)

| Work Item                          | E1 | E2 | E3 | E4 | E5 | E6 |
| ---------------------------------- | -- | -- | -- | -- | -- | -- |
| k3s, hostNetwork, certs, storage   | R  | C  | C  | C  | -  | C  |
| Postfix/Dovecot/Rspamd/ClamAV      | C  | R  | C  | C  | -  | C  |
| SPF/DKIM/DMARC/MTA-STS/TLS-RPT/PTR | C  | C  | R  | C  | -  | C  |
| Webmail & SSO                      | C  | C  | C  | C  | R  | C  |
| Monitoring/Logging/Backups         | C  | C  | C  | R  | -  | C  |
| Tests/Runbooks/Handover            | C  | C  | C  | C  | C  | R  |

R = Responsible, C = Consulted.

---

# Exit Criteria (ship when all true)

* Inbound/outbound pass **SPF/DKIM/DMARC** (aligned).
* **MTA-STS (testing)** yields clean TLS-RPT; no delivery failures.
* **PTR** and A/AAAA alignment verified by major receivers.
* Rspamd verdicts sane; **EICAR quarantined**, **GTUBE** flagged.
* **Backups** nightly; **restore** proven.
* **Dashboards & alerts** live; logs searchable.
* **Runbooks** complete; failure drills passed.
* Admin UIs **not internet-exposed** (VPN/SSO only).

---

If you want, I can turn this into a **Jira/Linear import CSV** with assignees `E1…E6`, dependencies, and acceptance criteria so you can paste it straight in.
