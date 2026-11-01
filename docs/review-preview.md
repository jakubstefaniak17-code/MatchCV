# Interactive product review

Live owner-private demonstration: https://matchcv-mvp-review.jakub-stefaniak17.chatgpt.site

The hosting gate may ask the owner to Continue with ChatGPT. This is distinct from the application's Supabase login. Do not broaden access without an explicit request.

The preview uses the same React product components, interview bank, evidence engine and document renderer as the Next.js application. A small standalone Vite shell adapts Next navigation to hash routes for static hosting. It is a demonstration for product review, not the production Supabase deployment. Its state consists only of a fictional seeded career and browser-local edits. It does not call AI, private import endpoints or authenticated account APIs. No real personal/confidential data should be entered.

Available: dashboard, normalized profile/fact editing, interview save/skip/resume, pasted job analysis and evidence, role-specific generation, CV editing/hiding/reordering/approval, browser-local document generation and local data export. Production import, account creation/deletion and external AI require configured Supabase/provider services and are explicitly unavailable in the demonstration.

The canonical Next.js application also exposes this mode at `/demo`. `npm run dev`, then open `/demo` to review without Supabase; protected production routes continue to enforce authentication.

## Keeping the hosted copy aligned

Sites project identity is `appgprj_6ae657f09ca08191aa08a8efb0cac7f8`. Reopen that existing Site source through the Sites workflow, then run `node scripts/sync-review-preview.mjs /absolute/path/to/its/checkout` from this repository. The script copies only product components/pure libraries/static fonts and preserves the Site hosting identity and navigation adapters. Build, browser-check, save and deploy the existing private Site. Never create a second Site for routine edits.

Verification for this increment: 44 unit/component/service/PostgreSQL tests, strict typecheck and ESLint passed; both Next.js and standalone production builds passed. Browser review verified populated dashboard, navigation to a CV, and approval enabling export. The cloud browser did not expose a download event; actual file downloads in that browser remain unverified. Existing document roundtrip tests still passed and new Playwright review-flow tests cover browser download/persistence in CI.
