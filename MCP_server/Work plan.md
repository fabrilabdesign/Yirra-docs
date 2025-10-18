Work plan

Here’s a clean split you can hand to a small squad (3–5 engineers). It keeps work parallel, minimizes blocking, and gives each person crisp deliverables + acceptance checks.

# Team & Ownership

**E1 – Platform/Infra (Lead)**

* Owns k3s plumbing, Kustomize base/overlays, namespaces, Deployments/Services.
* Owns cloudflared Deployment + ConfigMap and the prod/staging route tables.

**E2 – Network/Security**

* Owns Cloudflare DNS + Access apps (prod & staging), rate limits/WAF.
* Owns NetworkPolicies for `tools` & `tools-staging`, secret handling, image digests.

**E3 – App Integrations**

* Owns PM MCP (adapter config + scopes), Filesystem, Fetch, n8n MCP tool lists.
* Coordinates with app owners to verify endpoints/auth and staging write paths.

**E4 – Data/Payments/DB**

* Owns DB MCP (RO posture, DB user/URL), Git MCP (deploy key, allow-list), Stripe MCP (keys/modes).
* Adds minimal metrics/logging flags across all MCPs.

**(Optional) EM/Release Manager (could be E1 @ 10%)**

* Cuts tickets, runs check-ins, merges, and greenlights the rollout.

---

# Work Breakdown (tickets & acceptance)

## 1) K3s + Kustomize (E1)

**Tickets**

* Create `MCP_server/base` (Deployment/Service with probes + requests/limits).
* Create `overlays/prod` + `overlays/staging` namespaces, aggregate kustomizations.
* Add one overlay skeleton per MCP (pm, fs, git, db, fetch, stripe, n8n).

**Acceptance**

* `kubectl apply -k overlays/prod` creates 7 Deployments + Services in `tools`.
* Same in `tools-staging` with no image pulls failing (use placeholder images until E3/E4 set them).
* Every Service exposes `port: 80` (target 8080).

## 2) Cloudflare Tunnel (E1)

**Tickets**

* Add `cloudflared` Deployment/ConfigMap/Secret (tunnel creds).
* Populate ingress with your chosen hostnames:

  * **Prod:** `pm-mcp/fs-mcp/git-mcp/db-mcp/fetch-mcp/stripe-mcp.yirrasystems.com`, `n8n-mcp.addiaire.com`.
  * **Staging:** single-word subs (`pm-mcpstaging…`) and `n8n-mcpstaging.addiaire.com`.

**Acceptance**

* `kubectl -n tools logs deploy/cloudflared` shows all routes healthy.
* Hitting any hostname returns `403` until Access grants (good).

## 3) Cloudflare DNS + Access (E2)

**Tickets**

* Create **CNAME** for each hostname → your tunnel’s `*.cfargotunnel.com` (orange cloud ON).
* Create **Access** apps for each hostname (prod + staging). Issue **Service Tokens** for headless tools.
* Add WAF/Rate limits: 60 req/min/IP, burst 120; rule to block >5× 401/403/min.

**Acceptance**

* `dig CNAME pm-mcp.yirrasystems.com` points to `*.cfargotunnel.com`.
* Curl with Access headers returns `200` from `/healthz` on each MCP; without headers returns `403`.

## 4) Secrets & Policies (E2)

**Tickets**

* Create Secrets (out-of-band): `pm-mcp-secrets`, `git-mcp-secrets`, `db-mcp-secrets`, `stripe-mcp-secrets`, `n8n-mcp-secrets` in both namespaces.
* Add minimal NetworkPolicies:

  * `allow-cloudflared-to-mcps` (Ingress: TCP/80 from cloudflared).
  * `allow-dns-egress` (UDP/TCP 53 to kube-dns).
* (Optional) default-deny egress + explicit allows later.

**Acceptance**

* Pods start without CrashLoop due to missing env.
* NetworkPolicies don’t block cloudflared → MCP (healthz passes).

## 5) PM/FS/Fetch/n8n MCPs (E3)

**Tickets**

* PM MCP:

  * Write `pm-tools.json` mapping `list_projects`, `list_tasks`, `get_task`, `ai_plan`.
  * Set `ALLOWLIST=https://app.yirrasystems.com`, `MODE=read-only` (prod).
* Filesystem MCP:

  * Mount `/srv/docs` and `/srv/shop-content` as RO in prod; `ROOTS_JSON`, `MAX_BYTES=1048576`.
* Fetch MCP:

  * Set strict allowlist: `^(https://(yirrasystems\.com|app\.yirrasystems\.com|flows\.addiaire\.com))$`.
* n8n MCP:

  * Create `n8n-tools.json` with **approved** webhooks; set `N8N_API_KEY`.

**Acceptance**

* From client, prod: PM list calls succeed; write tools return `403 MCP_WRITE_DISABLED`.
* FS: `list/read/search` work; attempts to write in prod blocked.
* Fetch: allowed domains succeed, others 403.
* n8n: approved workflows return 2xx; unknown tool names rejected.

## 6) DB/Git/Stripe MCPs (E4)

**Tickets**

* DB MCP:

  * Create `mcp_ro` user with `SELECT` only; set `DATABASE_URL`, `READ_ONLY=true`, `DENY_DDL/MUTATION=true`, `MAX_ROWS`, `STATEMENT_TIMEOUT_MS`.
* Git MCP:

  * Generate deploy key; add to Git host with RO perms on prod repos.
  * Configure `ALLOW_REPOS` and `GIT_KNOWN_HOSTS`.
* Stripe MCP:

  * Prod: live key + `MODE=read-only`.
  * Staging: test key + `MODE=write` (if you want refund tests).

**Acceptance**

* DB: SELECT queries succeed; `INSERT/UPDATE/DELETE/DDL` rejected server-side.
* Git: `list_repos`, `diff`, `list_prs` succeed; commit/PR attempts blocked in prod.
* Stripe: list/read endpoints OK; refund attempts blocked in prod and succeed against **test** in staging (if enabled).

## 7) Observability & Smoke (E4 with E1)

**Tickets**

* Ensure each MCP exposes `/healthz` (already in base). If images support `/metrics`, enable scrape.
* Provide a `scripts/smoke.sh` that:

  * curls `https://<host>/healthz` for all prod & staging (optional Access headers).
  * exits non-zero on any failure.

**Acceptance**

* `./scripts/smoke.sh` passes for all hosts.
* (Optional) Prometheus shows `mcp_requests_total` and p95 latency panels.

---

# Sequence & Timeline (can fit in ~1–2 working days)

**T0 (Kickoff, 15 min)**

* Agree on owners, confirm tunnel ID, confirm staging write policy.

**Block 1 (Parallel)**

* E1: Base + overlays + cloudflared (Sections 1–2).
* E2: DNS + Access + Secrets + NPs (Sections 3–4).

**Block 2 (Parallel)**

* E3: PM/FS/Fetch/n8n overlays, configs (Section 5).
* E4: DB/Git/Stripe overlays, keys, modes (Section 6).

**Block 3 (Joint)**

* Run smoke tests; wire editor with Access headers; do prod RO checks and staging write checks (Section 7).

---

# Handoffs & Dependencies

* E1 → E2: cloudflared up so E2 can test DNS/Access.
* E2 → E3/E4: secrets present so pods boot.
* E3/E4 → E1: confirm env vars/images before final `apply -k`.

---

# RACI (high-level)

| Area                    | E1 | E2 | E3 | E4 | EM |
| ----------------------- | -- | -- | -- | -- | -- |
| Kustomize base/overlays | R  | C  | C  | C  | A  |
| Cloudflared tunnel      | R  | C  | I  | I  | A  |
| DNS/Access              | I  | R  | I  | I  | A  |
| NetworkPolicies         | C  | R  | I  | I  | A  |
| PM/FS/Fetch/n8n MCP     | C  | C  | R  | I  | A  |
| DB/Git/Stripe MCP       | C  | C  | I  | R  | A  |
| Secrets mgmt            | C  | R  | C  | C  | A  |
| Smoke/Observability     | R  | C  | C  | R  | A  |

(R = Responsible, A = Accountable, C = Consulted, I = Informed)

---

# Definition of Done (hard checks)

* All prod MCPs respond at their hostnames with **read** tools; **any write returns 403**.
* All staging MCPs reachable at single-word subs; enabled writes succeed.
* Cloudflared logs show all routes healthy; `dig CNAME` points to tunnel for each host.
* Secrets present in both namespaces; pods stable ≥10 minutes.
* Optional: `/metrics` scraped (if images support) or logs present in your collector.

---

# Nice-to-haves (post-deploy)

* Pin images by digest; add quarterly token/key rotation tasks.
* Add small alerting: error rate >1% (5m), p95 >1.2s (5m), `write_blocked_total>0` in prod.
* Add a `HOWTO-add-new-MCP.md` (copy an overlay, add tunnel route, add DNS CNAME, apply).

---

If you want, I can turn this into a set of GitHub issues with checklists for each engineer (one label per MCP), plus the `scripts/smoke.sh` content ready to drop in.
