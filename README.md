# MatchCV — Career Engine / Career Setup v0.4

A Next.js career evidence workspace implementing the supplied **Product Kit v1**: an optional40-question career interview, a reusable fact registry, job analysis and evidence-grounded PDF/DOCX generation. The interface follows **Career Atelier**, with **Executive Clarity** and **Modern Studio** documents.

**Interactive synthetic review:** https://matchcv-mvp-review.jakub-stefaniak17.chatgpt.site

The review is private to the owner (Continue with ChatGPT if requested). It uses the same product components and deterministic engine with browser-local data. Import, real account management and AI require configured production services; the demonstration labels these boundaries explicitly. Do not enter real confidential information into the review.

## v0.4 changes

Career Engine2.0 builds approved relational context and employment chronology, separates semantic candidate retrieval/ranking from evidence verification, and validates redacted claims independently of the model. Professional generation requires the configured AI provider; failure saves no automatic substitute. A basic fact-based draft is an explicit choice and retains original wording/language warnings.

Career Setup1.0 routes `/welcome`, `/setup`, `/setup/1`–`/setup/5` persist versioned setup on the account. The40-question interview remains unchanged, with five selected optional questions during setup. New accounts are guarded on direct protected URLs; database failures never reset progress. Truth confirmation and publication consent are distinct. The primary navigation is Moja kariera / Stwórz CV / Moje dokumenty.

See [v0.4 plan](docs/v04/implementation-plan.md) and [online configuration / safe merge](docs/v04/deployment-and-merge.md). Real Supabase/AI acceptance requires staging credentials; synthetic review does not prove it.

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
3. `supabase/migrations/202611010001_onboarding.sql`
4. `supabase/seed.sql`

For an existing installation, apply only unapplied migrations and the current seed. The v0.4 onboarding migration preserves existing histories and grants an optional supplementary setup. It archives99 old questions, preserves their answers/facts and CV contents, activates the new40 bank and adds typed answers/stale-write guards. Seed is idempotent; regenerate with `npm run seed:questions`.

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

No paid service is activated by this code. API use can incur configured-provider charges. Missing AI uses explicitly labeled extraction/text-analysis fallbacks and preserves saved data. Professional composition fails without creating a substitute; the user may explicitly choose a basic draft.

## Main workflow

Register → import text-based PDF/DOCX (5MB) → review facts and coverage → answer any subset of40 questions with autosave → paste job ad → review requirements and evidence → choose Executive Clarity/Modern Studio → generate → edit/reorder/hide sections → approve → download real PDF/DOCX.

Private compensation, career-boundary answers and forbidden information never enter generation. A skipped answer is unknown, not lack of competence. Extracted candidates need user confirmation plus separate permission for inclusion. Missing job evidence is not a negative competency judgment.

The engine permits evidence-grounded editorial rewriting. Hard anchors and new substantive details cannot be approved merely as style; uncertain neutral wording requires explicit source-bound editorial consent. Conservative validation can reject valid translations or require factual confirmation. Basic drafts retain exact source wording. See docs/v04/acceptance.md for remaining limits.

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
