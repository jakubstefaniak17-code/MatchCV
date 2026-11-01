# Online setup and safe merge — v0.4

The GitHub application is the real Next.js/Supabase backend. The existing Sites review is a separate synthetic, browser-local review; it cannot verify registration, cross-device persistence, private uploads or paid model calls. Supabase and Vercel plugins remain declined. No service is purchased or activated by this change.

## Operator configuration

1. Select/create a Supabase staging project (account owner action if unavailable to this session). In SQL Editor run ALL repository migrations in timestamp order, including 202610310001, 202610310002 and 202611010001_onboarding.sql. Then run supabase/seed.sql. Do not rerun already applied non-idempotent migrations; use the migration ledger. The40-question seed is idempotent.
2. Verify private career-documents Storage bucket/policies created by the initial migration. Keep it private. Check all user-owned tables including onboarding_progress have RLS. Authenticated table writes to onboarding_progress are intentionally revoked; its RPC applies optimistic version checks.
3. Enable Supabase email/password auth. Configure SMTP and verification/recovery policy. Add exact HTTPS app origin and /auth/callback URL to allowed redirects, including an explicit staging origin. Use separate synthetic staging accounts for tests.
4. Import this same GitHub repository/feature branch into an existing or new Vercel project. Next.js preset, Node22, npm ci, npm run build, default output. The code does not require a local machine/LLM. Confirm plan request-body/runtime limits before enabling uploads; source upload cap is5MB but platform limits may be smaller.
5. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (browser-safe public key only), APP_URL to the exact HTTPS origin, and server-only SUPABASE_SERVICE_ROLE_KEY for account deletion. Never put the service-role key in NEXT_PUBLIC variables or Git.
6. Configure server-only AI_API_KEY, AI_BASE_URL (HTTPS OpenAI-compatible /v1 endpoint), AI_MODEL and actual AI_INPUT_USD_PER_MILLION / AI_OUTPUT_USD_PER_MILLION prices. Verify selected model JSON output and12000-output-token capacity. This requires operator agreement to provider processing/cost; no paid activation is inferred. Raw private-only answers are not generation input.
7. JOB_FETCH_ALLOWED_HOSTS can remain empty; pasted job text works. Add only reviewed exact public hostnames if URL retrieval is required. Do not bypass blocked websites.
8. Deploy staging and execute real acceptance: registration/verification → first-login setup redirect → PDF andDOCX import → grouped review with separate truth/publication → selected questions → finalize → job → professionalAI CV → editorial review → both downloads → logout/login/cross-device resume. Test a second account against first account IDs, stale-version conflicts, AI outage, and account export/deletion. Never run deletion with a real personal fixture.
9. Configure E2E_BASE_URL,E2E_EMAIL,E2E_PASSWORD only for dedicated synthetic staging. Without them, real-service tests are skipped. A successful production build does not substitute for acceptance.

## Safe merge

Review the new PR as a complete successor to PR2: the v0.4 branch already contains PR1 andPR2 ancestors. Do not merge all three in parallel or cherry-pick overlapping changes. Wait for checks and review migration/security changes. Back up staging/production first; run migrations on staging before app release. After real acceptance and user review, merge the v0.4 PR into main using ordinary merge or squash, never force push. Retain previous branches and data. Close superseded draft PRs explicitly after the replacement is accepted. No PR merge is performed automatically by this implementation.

If rollout needs rollback, restore the previous application deployment while preserving additive tables/columns; do not drop career/onboarding data. Migrations mark old accounts with existing career history completed+legacy_supplement, so mandatory setup does not lock them out. Missing database state or read errors produce a retry screen, not a fresh account reset.
