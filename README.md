# MatchCV — Product Kit MVP v0.3

A Next.js career evidence workspace implementing the supplied **Product Kit v1**: an optional40-question career interview, a reusable fact registry, job analysis and evidence-grounded PDF/DOCX generation. The design follows **Calm Confidence**, with **Executive Clarity** and **Modern Studio** documents.

**Interactive synthetic review:** https://matchcv-mvp-review.jakub-stefaniak17.chatgpt.site

The review is private to the owner (Continue with ChatGPT if requested). It uses the same product components and deterministic engine with browser-local data. Import, real account management and AI require configured production services; the demonstration labels these boundaries explicitly. Do not enter real confidential information into the review.

## Source of truth

| Area | Implementation |
| --- | --- |
| Exact40 questions, IDs and metadata | `data/interview-40.json` (unmodified supplied JSON) |
| Source contracts and runtime schemas | `lib/interview/types.ts`, `lib/interview/schema.ts` |
| One-question interview/autosave | `components/interview/interview.tsx` |
| Design tokens and components | `styles/tokens.css`, `app/globals.css`, `components/shell.tsx` |
| Two template definitions and document rendering | `lib/resume/engine.ts`, `lib/documents/render.ts` |
| Provenance, user review, privacy | `lib/career/provenance.ts`, `app/api/interview/`, `app/api/workspace/` |
| Authoritative supplied written specs | `docs/product-kit/` |
| Conflicts and deliberate decisions | `docs/product-kit-decisions.md` |

## Setup

Node22.16+ and npm. Do not commit credentials or real CV fixtures.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open `/demo` for the clearly labeled synthetic review without Supabase. Real protected routes remain authenticated. There is no production authentication bypass.

For a new Supabase project, apply these files in order through its SQL editor or link Supabase CLI and run `supabase db push`:

1. `supabase/migrations/202610310001_core.sql`
2. `supabase/migrations/202610310002_product_kit.sql`
3. `supabase/seed.sql`

For an existing installation, apply only the new migration and current seed. It archives99 old questions, preserves their answers/facts and CV contents, activates the new40 bank and adds typed answers/stale-write guards. Seed is idempotent; regenerate with `npm run seed:questions`.

Enable Email auth. Set Site URL and allowed callback to `http://localhost:3000/auth/callback` and production equivalent. Configure SMTP/verification policy before real invitations. Private `career-documents` Storage policies are included in the migration. See docs/database.md.

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public client key constrained by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only, administrative account deletion |
| `APP_URL` | Exact application origin for auth callbacks and mutation origin checks |
| `AI_API_KEY` | Optional server-side compatible provider key |
| `AI_BASE_URL` | HTTPS compatible `/v1` URL, default OpenAI |
| `AI_MODEL` | Model supporting JSON mode |
| `AI_INPUT_USD_PER_MILLION`, `AI_OUTPUT_USD_PER_MILLION` | Operator-maintained usage pricing; unset = unknown cost |
| `JOB_FETCH_ALLOWED_HOSTS` | Exact approved public HTTPS hosts; empty means pasted text only |

No paid service is activated by this code. API use can incur configured-provider charges. Missing AI uses conservative extraction/text-analysis/composition fallbacks and preserves saved data.

## Main workflow

Register → import text-based PDF/DOCX (5MB) → review facts and coverage → answer any subset of40 questions with autosave → paste job ad → review requirements and evidence → choose Executive Clarity/Modern Studio → generate → edit/reorder/hide sections → approve → download real PDF/DOCX.

Private compensation, career-boundary answers and forbidden information never enter generation. A skipped answer is unknown, not lack of competence. Extracted candidates need user confirmation plus separate permission for inclusion. Missing job evidence is not a negative competency judgment.

The current engine retains exact approved factual wording; new phrasing/translation can be saved and confirmed as another source fact, then selected in the editor. This deliberate limit is documented rather than presenting unverified rewriting as complete.

## Validation and deployment

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

See `docs/product-kit-validation.md` for actual evidence and limits. The optional real staging browser test needs E2E_EMAIL/E2E_PASSWORD for an isolated synthetic account. Local Playwright also needs its official Chromium installation; CI installs it.

Deploy to Vercel using Next.js preset, Node22.x, `npm ci`, `npm run build`, default output. Add environment values, apply migrations and configure auth callbacks, then verify the complete staged signup/import/generation/export/deletion flow. For a custom domain, add it in Vercel Domains, apply the provider-returned DNS records, then update APP_URL and Supabase redirects. See docs/deployment.md and docs/security.md.

The owner declined Supabase/Vercel connections in this task. Their integration code and setup are provided, but no external signup, SMTP, provider or Vercel deployment success is claimed. Privacy/terms remain legal-review drafts, not a GDPR compliance assertion.
