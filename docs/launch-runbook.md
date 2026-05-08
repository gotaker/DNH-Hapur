# Launch runbook (phase 9)

This is the operational playbook for taking the new dnhhapur.com from
its first deploy to a DNS cutover. Everything below is the maintainer's
view; institutional decisions (real photography, content review,
DNS handover) are flagged and require sign-off before the relevant step.

## 1. Environments

| Environment | URL | Purpose |
|---|---|---|
| Local | `http://localhost:3000` | Maintainer development. Runs against the docker-compose Postgres. |
| Staging | `https://new.dnhhapur.com` | Pre-launch parallel site. Real Payload, real Postgres, real photography (where available). |
| Production | `https://dnhhapur.com` | Cutover target. |

## 2. Hosting

Railway is the chosen target (single project, three services):

1. **Web** — Next.js app, deployed from `Dockerfile` at the `runner` stage. `pnpm build` runs in the build step. `start` runs `node server.js` from the standalone output.
2. **Postgres** — Railway managed Postgres v17. Snapshot weekly via Railway, additional backups via `scripts/backup-postgres.sh` cron-scheduled into a private S3 bucket.
3. **Object storage** (optional, phase 9.x) — Railway volume or Backblaze B2 for Payload media. Until the institution provides real photography, `media` collection is unused beyond test uploads.

## 3. Environment variables (production)

Railway → web service → Variables:

```
NEXT_PUBLIC_SITE_URL=https://dnhhapur.com
DATABASE_URI=${{ Postgres.DATABASE_URL }}
PAYLOAD_SECRET=<generated via openssl rand -base64 32>
RESEND_API_KEY=<from resend.com>
CONTACT_TO_EMAIL=enquiry@dnhhapur.com
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=dnhhapur.com
```

Staging mirrors the above with `NEXT_PUBLIC_SITE_URL=https://new.dnhhapur.com` and a separate Postgres + bucket.

## 4. First deploy

1. Push `main` to Railway (auto-deploy on the web service).
2. From a Railway shell on the web service, run:
   - `pnpm payload migrate`
   - `pnpm payload generate:importmap`
   - `pnpm seed`
3. Visit `https://new.dnhhapur.com/admin`, create the first admin user (Payload prompts on first visit).
4. Smoke-check the public site:
   - `/hi`, `/en` render.
   - `/hi/patients/departments/<slug>` renders for at least three departments.
   - `/hi/patients/doctors/<slug>` renders for at least three doctors.
   - `/api/health` returns `{ ok: true }`.
   - `/sitemap.xml` lists the locale-prefixed URLs.
   - `/hi/news/rss.xml` and `/en/news/rss.xml` parse as valid RSS.

## 5. Backups

- Railway native Postgres snapshots run daily; retention 14 days.
- `scripts/backup-postgres.sh` runs daily at 03:00 IST from a small Railway cron service, writing to a private S3 bucket with 30-day retention.
- Restore drill: monthly. Restore the latest backup into a throwaway Postgres on the staging service and verify the admin still loads.

## 6. Analytics (privacy-friendly)

- Plausible self-hosted (`https://analytics.dnhhapur.com`) or Plausible Cloud.
- No cookies, no personal data, no GDPR/DPDP banner needed.
- The `<Analytics />` component only emits the script when `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set.

## 7. Content review with the institution

Before the DNS cutover:

1. **Bilingual proofread** — institution's own staff verifies Hindi spellings of doctor names, department names, and the address. Treat the seeder as a starting point; the Payload admin is the source of truth post-launch.
2. **Doctor roster** — confirm OPD timings and registration numbers. Replace placeholder portraits with consented institutional photography.
3. **Accreditations** — confirm exact certifications (NABH, NABL, NMC, FOGSI, ESIC, Ayushman Bharat). Add or remove as needed in the trust strip.
4. **Phone numbers** — current `lib/site.ts` lists two numbers. Replace with the institution's department-wise list and update the contact page in Payload.
5. **Emergency content** — a clinical lead reviews the Emergency page copy and the print-ready layout.
6. **News and camps** — at least three real items live before launch.

## 8. Performance and accessibility audits (pre-cutover)

Run from the staging URL:

```bash
pnpm test:e2e        # Playwright cross-browser smoke
pnpm test:a11y       # axe WCAG 2.2 AA across all key pages × both locales
```

Open Lighthouse on `/hi` and `/en` and confirm:

- LCP < 2.5s on Slow 4G
- CLS < 0.05
- INP < 200ms
- Accessibility ≥ 95
- SEO ≥ 95

## 9. DNS cutover

When all of the above pass:

1. Lower TTL on the existing `dnhhapur.com` records to 5 minutes ~24 hours before cutover.
2. Update the apex `A` record (or `ALIAS`/`ANAME`) and `www` `CNAME` to Railway's web service.
3. Confirm SSL is provisioned by Railway (Let's Encrypt automatic).
4. Verify production smoke list (section 4 above) on `https://dnhhapur.com`.
5. Restore TTL to 1 hour after a clean 24 hours.

## 10. Rollback

If anything regresses post-cutover:

- Re-point DNS to the old WordPress origin (recorded in this runbook before cutover).
- Investigate on staging without time pressure.

The DNS cutover is **the only step that is irreversible without a propagation window**. Everything else can be redeployed.
