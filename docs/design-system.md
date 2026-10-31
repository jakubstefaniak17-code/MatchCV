# MatchCV — Calm Confidence

Implemented from the supplied Product Kit UX blueprint, HTML reference and developer tokens. The reference is visual guidance: application routes, persistence and controls remain functional application code.

## Foundations

`styles/tokens.css` contains the original palette and system values. `app/globals.css` imports it and provides existing workspace compatibility aliases. The interface uses Inter when available, then native system fonts without a runtime font download.

| Role | Token / value |
| --- | --- |
| Ink | `--mcv-ink` / `#1D2638` |
| Primary / progress | `--mcv-primary` / `#167C80` |
| Analysis | `--mcv-blue` / `#5571B5` |
| Interview / discovery | `--mcv-violet` / `#7864A3` |
| Decorative warmth | `--mcv-coral` / `#D57866` |
| Canvas | `--mcv-paper` / `#F8F9F6` |
| Surfaces | `--mcv-surface` / `#FFFFFF` |
| Borders | `--mcv-line` / `#E3E8ED` |

Coral is decorative and does not carry small text or error semantics. Labels always accompany color statuses. Tinted backgrounds use explicit darker text derivatives because the original accent colors alone narrowly miss 4.5:1 on those tints.

Typography: display 40–58 px responsively; workspace H1 32/40, H2 24/32, H3 18/26, body 15/24, small 13/20, micro 11/16. Layout uses a 240 px sidebar, maximum 1120 px content interior, 20 px cards, 12 px controls, 180 ms transitions and mostly flat separators. Dashboard statistics are grouped in one open strip rather than separate decorative cards.

## Navigation and responsive behavior

Desktop uses the left sidebar. At 768 px and below the sidebar reduces to the brand, with fixed five-item bottom navigation. The overview remains accessible through the top breadcrumb. All interactive controls target at least 44×44 px; checkbox/radio labels extend the touch target. The application has a keyboard skip link, visible 2 px focus outline, no animation under reduced-motion preferences and responsive single-column forms. The interview controls remain above the mobile navigation with bottom safe-area support.

Navigation continues to use actual routes, including `/demo/...` destinations in demo mode. The landing offers import and conversation entrances plus a clearly labeled working demo with fictional data.

## Interview and documents

The `.interview-*` classes support one active question, chapter navigation, real save/error states, large narrative inputs, optional follow-ups and private-question disclosures. No simulated save state or percentage animation is added by styling.

The two document preview classes are `.resume-paper.executive_clarity` and `.resume-paper.modern_studio`. Both retain a single reading column and selectable text. Executive uses navy uppercase section labels; Modern uses teal titlecase labels with decorative coral bullet markers. Preview colors stay light for consistent paper rendering even when the app theme is dark. PDF/DOCX are generated from the same document model; exact pagination depends on the actual renderer and content, so HTML preview is not claimed to be pixel-identical to exports.

## Contrast audit

Ratios calculated with WCAG relative sRGB luminance, rounded to two decimal places. This is a token contrast audit, not a claim of overall WCAG conformance or a substitute for browser and keyboard testing.

| Foreground / background | Ratio |
| --- | ---: |
| Ink `#1D2638` / Paper `#F8F9F6` | 14.33:1 |
| Muted `#617084` / Paper | 4.78:1 |
| White / Primary `#167C80` | 4.97:1 |
| White / Blue `#5571B5` | 4.76:1 |
| White / Violet `#7864A3` | 5.06:1 |
| Teal text derivative `#11696D` / Mint `#E7F3EF` | 5.66:1 |
| Blue text derivative `#4863A4` / Blue tint `#EEF2FC` | 5.21:1 |
| Violet text derivative `#6D5899` / Violet tint `#F2EFF8` | 5.27:1 |
| Dark muted `#A8B7C7` / Dark paper `#141C28` | 8.37:1 |
| Dark muted / Dark surface `#1C2735` | 7.38:1 |
| Dark primary `#82CBCC` / Dark mint `#213C3D` | 6.39:1 |
| Dark button text `#14242E` / Dark primary | 8.60:1 |

The original coral has 3.13:1 against white and is intentionally excluded from body text. Original teal on mint is 4.37:1, blue on its tint 4.25:1 and violet on its tint 4.45:1; darker context derivatives correct those combinations.

Default theme is light. Dark theme preserves a separate accessible palette and remains a user choice stored in browser preferences. The app still renders and theme switching works for the visit if browser preference storage is unavailable.
