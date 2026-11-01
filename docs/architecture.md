# v0.4 architecture

Next.js App Router retains Supabase server authentication, owned queries and private Storage. Career Setup is isolated in app/(onboarding), with PostgreSQL onboarding_progress as authoritative state. Its RPC locks rows and checks version; protected layouts redirect incomplete accounts and fail closed on DB errors. Historical accounts are migrated without resetting their career data.

Career Engine2.0 separates context.ts (approved relational snapshots), semantic.ts (candidate retrieval/ranking/verification), editorial.ts (hard anchors and wording assessment), fingerprint.ts (source-bound consent), language.ts and engine.ts (chronology/composition/validation). The AI workflow receives only eligible statements plus approved structured context, never raw source excerpts or private interview answers. It may rewrite prose, but cannot grant editorial approval or invent credentials/numbers/responsibility. Server save/export revalidate against current approved evidence. The server-owned review helper discards incoming approval hashes.

Import proposes typed entities; grouped human review confirms truth separately from publication. A confirmed import materializes a separate owned entity and preserves the import path/quote in provenance. Historical drafts retain adapters. Unknown dates remain unknown; year/month precision stays in approved metadata.

Professional generation failure creates no replacement CV. Explicit basic mode is a source-based draft with warnings. Complete relational chronology replaces flat-only generation; unrelated existing facts remain available as additional experience. Shared document blocks drive both retained PDF/DOCX templates.

The existing Sites review shares UI/pure engine, but uses synthetic browser-local transport and has no production auth/import/AI. It must not be used to assert real end-to-end acceptance. Runtime setup, safe merge and known limits are in docs/v04/.
