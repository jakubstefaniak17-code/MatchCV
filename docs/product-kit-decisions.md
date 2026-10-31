# Product Kit v1 implementation decisions

The supplied Product Kit replaces earlier assumptions. The active interview is the exact Polish 40-question JSON (`MCV-Q001`–`MCV-Q040`), not the previous99 bank. Its original content is preserved byte-for-byte in data/interview-40.json. Source contracts are in lib/interview/types.ts; raw metadata is seeded into PostgreSQL. Legacy99 questions/answers stay archived under their original IDs; there is no fabricated mapping between semantically different questions.

The supplied kit is Polish-only. The product interview therefore follows its Polish wording rather than inventing unreviewed English translations. CV document headings still support Polish/English; full factual translation/rephrasing requires confirmed source wording.

Exactly two templates are selectable: Executive Clarity and Modern Studio. Their supplied DOCX/PDF references informed single-column A4 layout, hierarchy, rules, color and section priorities. Source DOCX detail text includes8/8.5pt styles, but the written product specification forbids less than9pt. The implementation follows the9pt minimum. Source Inter font was not embedded in the supplied files; PDF uses embedded DejaVu Sans regular/bold with Polish glyphs, while DOCX has ordinary editable font styles. This preserves selectable text and layout without relying on proprietary fonts.

Legacy template identifiers map to their nearest intended design without removing/reordering historical CV claims. Newly generated documents use the chosen new template's section priorities. A manual template switch preserves text and explicit user ordering; users can reorder sections in the editor.

Private-only questions never enter external model extraction or CV composition. Career facts from other answers start unconfirmed and excluded; confirming factual wording and granting publication are distinct user actions. Preferences/interpretations are separated in source metadata and are not silently promoted to accomplishments. Exact user exclusion phrases suppress matching facts before model calls and again at save/export.

Import coverage is a reviewed proposal. Model keyword overlap cannot complete a question. Full coverage requires an explicit user coverage confirmation plus a confirmed eligible source fact; partial imported context remains visible to help answer the missing contribution/context.

The generation engine remains intentionally conservative: factual wording must equal an approved canonical fact, including numbers, dates, employers and qualifications. Users can add and confirm improved wording, then select that source in the editor. Unrestricted AI paraphrasing is not represented as completed.
