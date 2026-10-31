# MatchCV — MVP 0.3

A Next.js career evidence workspace: tell your career story once, review its facts, and build role-specific CVs. Polish-first interface, bilingual 99-question interview, Polish/English document headings. Uses Supabase PostgreSQL/Auth/Storage and an optional OpenAI-compatible provider. Deploy to Vercel; no personal computer or local LLM is required.

## Local setup

Requires Node.js 22.16+ and npm. Never place real CVs in repository fixtures.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Create a Supabase project, then either link the Supabase CLI and run `supabase db push`, or execute `supabase/migrations/202610310001_core.sql` followed by `supabase/seed.sql` in the project's SQL editor. The migration creates the private `career-documents` bucket and auth profile triggers. Seed is idempotent and contains exactly 99 bilingual question definitions. Regenerate it with `npm run seed:questions`.

Enable Email provider in Supabase Auth. Configure Site URL and Redirect URLs for `http://localhost:3000/auth/callback` and your production `/auth/callback`. Email confirmation is controlled by Supabase. Use production SMTP before inviting real users. Registration intentionally gives generic responses; reset responses do not disclose whether an email exists.

Existing accounts created before the migration need rows inserted into `profiles` (`id=user_id`) and `career_profiles` (`user_id`); new accounts are initialized by the auth trigger.

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon/publishable key, constrained by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only**, account deletion administrative call; never prefix with NEXT_PUBLIC |
| `APP_URL` | Exact origin, e.g. `https://matchcv.example.com`; origin checks and auth redirects |
| `AI_API_KEY` | Optional server-only compatible provider credential |
| `AI_BASE_URL` | HTTPS OpenAI-compatible `/v1` base, default OpenAI |
| `AI_MODEL` | Explicit model accepted by your provider; configure before enabling AI |
| `AI_INPUT_USD_PER_MILLION` | Operator-maintained input price; omit to record unknown cost |
| `AI_OUTPUT_USD_PER_MILLION` | Operator-maintained output price; omit to record unknown cost |
| `JOB_FETCH_ALLOWED_HOSTS` | Exact comma-separated public hosts approved for fetching; empty disables URL retrieval |

Without Supabase, public pages work and protected pages show a setup screen. There is no in-memory auth bypass or fake dashboard. Without AI, saved interview answers, manual career editing, conservative job text parsing, evidence retrieval and exact-fact CV composition remain available. Document import falls back to lines for manual review.

## Working flow

1. Register and verify email if enabled; sign in.
2. Import PDF/DOCX (5 MB max, text-based PDF; OCR is not included) or add career entities/facts manually.
3. Review each candidate, classify it, edit, confirm or reject. Only explicitly confirmed or document-supported facts are eligible. Imported facts are **not verified**.
4. Answer any useful subset of the interview. Save incrementally, skip without implying a negative answer, resume or edit later. Extract answer candidates and confirm them in Profile.
5. Paste an advertisement. URL retrieval is opt-in per host, HTTPS-only, DNS-pinned, public-IP-only, with robots checks, no redirects or access-control bypass. Paste text when unavailable.
6. Review mandatory/preferred/responsibility requirements and suggested evidence. Automatic lexical overlap is **partial**, never proof of qualification.
7. Choose language/template and generate. Confirmed evidence is ranked and selected for the target role. All factual claims carry canonical fact IDs.
8. Edit the draft, reorder/hide sections, approve and save. Export PDF/DOCX. Editing factual wording requires first saving and confirming that wording in the career registry; this conservative MVP does not use AI to certify its own paraphrases.

The same synthetic profile includes infrastructure, energy and transformation evidence plus three job advertisements. Import demo only into an empty fact registry; explicitly confirm its fictional facts before generating demonstration documents. Never mix the demo with a real professional profile.

## Checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

See [docs/validation.md](docs/validation.md) for executed results and environment limits. Tests are not substitutes for a real Supabase staging smoke test. In particular, email delivery, provider billing, production Storage policies and Vercel runtime must be checked against configured services.

## Deployment

See [docs/deployment.md](docs/deployment.md), [docs/security.md](docs/security.md), [docs/database.md](docs/database.md) and [docs/architecture.md](docs/architecture.md).

No deployment is implied by this repository. Privacy and terms pages are drafts for legal review. Security controls do not themselves establish GDPR compliance.
