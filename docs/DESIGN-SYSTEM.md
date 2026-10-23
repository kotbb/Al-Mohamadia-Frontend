# Quiet Ledger — Design System

### Al-Mohamadia Wood Store Operations System

**Version 2.3 (current shell, Noto typography, compact workflows)**

---

## 1. Design Philosophy

**Quiet Ledger** is a modern Arabic business workspace inspired by the clarity, trust, and organization of traditional accounting — not by its appearance. Nothing in the UI should look like paper, wood, or an antique. What carries over from that inspiration is the _discipline_: every number has one obvious place, every action has one obvious color, every status has one obvious meaning.

The product should feel modern, professional, warm, human, calm, and operational — like software built by people who understood the job, not like a themed skin. It should never feel vintage, retro, paper-textured, overly corporate, generic-SaaS, or AI-generated.

Practically, this means: a neutral canvas, one confident brand color, four disciplined semantic colors, and hierarchy built from size, spacing, and placement — not from decoration.

---

## 2. Final Color System

### Brand color rule

**One brand color. Semantic colors communicate system state. They never overlap in role.**

### Light theme (primary environment — design and validate here first)

| Token                       | Value                    | Use                                               |
| --------------------------- | ------------------------ | ------------------------------------------------- |
| `background`                | `#F4F1EA`                | page background — warm cream (mockup canvas)      |
| `surface`                   | `#FFFFFF`                | cards, tables, modals, inputs                     |
| `surface-muted`             | `#F0ECE5`                | table stripes, subtle panel fills, disabled fills |
| `border`                    | `#E1DACD`                | dividers, input borders                           |
| `text-primary`              | `#231E18`                | headings, body, table data                        |
| `text-secondary`            | `#5A5145`                | field labels, table headers, secondary text       |
| `text-muted`                | `#8A8072`                | placeholders, help text, timestamps               |
| `primary`                   | `#6F4428` (warm walnut)  | primary buttons, links, avatar fill               |
| `primary-hover`             | `#5A3620`                | hover / pressed                                   |
| `primary-foreground`        | `#FFFFFF`                | text/icons on `primary`                           |
| `focus-ring`                | `#6F4428`                | visible focus ring on interactive elements        |
| `focus-ring-offset`         | `#FFFFFF` (= `surface`)  | gap color between component edge and focus ring   |
| `sidebar`                   | `#332822`                | navigation rail background                        |
| `sidebar-foreground`        | `#F5F0EA`                | brand + active nav text on sidebar                |
| `sidebar-muted`             | `#C9BDB0`                | inactive nav labels on sidebar                    |
| `sidebar-hover`             | `rgba(255,255,255,0.06)` | nav item hover fill                               |
| `sidebar-active`            | `#6F4428`                | active nav item background                        |
| `sidebar-active-foreground` | `#FFFFFF`                | active nav label                                  |
| `radius-shell`              | `1.5rem` (24px)          | sidebar, main panel, primary cards                |

### Dark theme (derived — designed after light mode is finalized)

| Token                       | Value                                                                                 | Use                                             |
| --------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `background`                | `#171410`                                                                             | page background                                 |
| `surface`                   | `#211D17`                                                                             | cards, tables, modals                           |
| `surface-muted`             | `#1C1812`                                                                             | table stripes, disabled fills                   |
| `border`                    | `#3A3226`                                                                             | dividers, input borders                         |
| `text-primary`              | `#F2EBDF`                                                                             | headings, body                                  |
| `text-secondary`            | `#C6BBA9`                                                                             | labels, table headers                           |
| `text-muted`                | `#928879`                                                                             | help text, timestamps                           |
| `primary`                   | `#CB9A65` (light oak)                                                                 | primary buttons, links, active nav              |
| `primary-hover`             | `#DDB183`                                                                             | hover/pressed                                   |
| `primary-foreground`        | `#1A1510`                                                                             | text on `primary`                               |
| `focus-ring`                | `#E8B87F` (lightened from dark `primary` for stronger contrast against dark surfaces) | visible focus ring                              |
| `focus-ring-offset`         | `#211D17` (= `surface`)                                                               | gap color between component edge and focus ring |
| `sidebar`                   | `#1A1510`                                                                             | navigation rail background                      |
| `sidebar-foreground`        | `#F2EBDF`                                                                             | brand + active nav text                         |
| `sidebar-muted`             | `#9A8D7E`                                                                             | inactive nav labels                             |
| `sidebar-hover`             | `rgba(255,255,255,0.05)`                                                              | nav item hover fill                             |
| `sidebar-active`            | `#8B5A35`                                                                             | active nav item background                      |
| `sidebar-active-foreground` | `#FFFFFF`                                                                             | active nav label                                |

**Dark mode methodology:** Dark mode is derived from the same semantic token structure and visual relationships as the finalized light theme, then individually reviewed and visually validated for contrast, hierarchy, readability, and long-session comfort. It is **not** produced by mechanical inversion. The process:

1. Finalize and validate the light theme first — it remains the canonical, primary environment.
2. Preserve the same token _meanings_ in dark mode (`background` is still the page canvas, `primary` is still the only brand/action color, semantic tokens still mean the same states).
3. Derive initial dark-mode values from the light system's relationships (relative contrast steps between background/surface/border, relative saturation of `primary` and semantics).
4. Individually review every dark token for: WCAG AA contrast, hierarchy (does `text-secondary` still sit clearly between `text-primary` and `text-muted`?), readability at table density, eye comfort over long sessions, `text-muted` visibility, border visibility against `surface`, tinted-surface legibility (badge tints, selected-row tints), semantic color intensity (raw hues that work in light mode often need desaturating — not just lightening — for dark backgrounds), and focus-ring visibility.
5. Screenshot-review the major screens — Dashboard, New Invoice, Invoice List, Inventory, Customers — in dark mode only after light mode is fully signed off, as a distinct validation pass, not a parallel design track.

### Semantic colors (confirmed final)

| Token     | Light     | Dark      | Use                                                                                |
| --------- | --------- | --------- | ---------------------------------------------------------------------------------- |
| `success` | `#2E8F52` | `#5FBB80` | paid, saved, in-stock                                                              |
| `warning` | `#B8862B` | `#D9A854` | low stock, pending, balances requiring attention                                   |
| `danger`  | `#C13B2E` | `#E27567` | negative stock, cancelled invoices, critical/blocked balances, destructive actions |
| `info`    | `#2E6FA6` | `#79ADD9` | neutral system information                                                         |

Activation actions use `success-action` (`#267344` light, `#5FBB80` dark) with
`success-action-foreground` (white light, dark ink dark). This stronger green
keeps button labels readable while the regular `success` token remains for
status badges and text.

### Usage rules

- `primary` is used **only** for actions and navigation state — never for a status badge, never to indicate "this is important information" (that's typography/size's job).
- Semantic colors are used **only** for system state — never for a button that isn't a genuine success/warning/danger action.
- `warning` (amber) and `primary` (walnut) are both warm hues but are kept far enough apart in hue and always disambiguated by icon + label — amber never appears on an interactive button, walnut never appears on a badge.
- Customer and supplier balances legitimately use neutral/`warning`/`danger` tiers (see §4), but are additionally distinguished by directional labels so the two balance tables are never visually interchangeable.

### What colors must never be used for

- `primary` must never appear in a status badge.
- Semantic colors must never appear on a primary/navigation/branding surface.
- No second general-purpose accent is introduced anywhere in the system.
- Pure black/pure white are never used as a token value — always the warm-tinted equivalents.

---

## 3. Brand Action Hierarchy

**No second color. Hierarchy is built entirely from placement, size, label clarity, and whitespace.**

- **New Invoice** is the highest-frequency, highest-value action in the app. It is emphasized by:
  - **Fixed position** — always in the leading corner of the primary header (top-right in RTL), on every screen where it's relevant, so its location becomes muscle memory.
  - **Size** — the single largest button in its header row.
  - **Isolation** — generous whitespace around it; never placed directly adjacent to another `primary`-colored button.
  - **Icon + label together** — a plus icon and the label "فاتورة جديدة", reinforcing recognition beyond color alone.
  - **Solid fill** — it is the _only_ solid-filled `primary` button typically visible on the dashboard/list screens at once; other primary-toned actions on the same screen (e.g., "Add Customer" inside a table toolbar) are smaller and more secondary in placement.

- **Primary actions** (Save, Save & Print, Add Customer, Add Item): solid `primary` fill, sized and placed relative to their context — a toolbar "Add Customer" button is smaller than the page-level "New Invoice" button even though both are `primary`-colored. Hierarchy within the same color is achieved by **scale and context**.

- **Secondary actions** (Cancel, Export PDF, Filter, Back): outline style — `border` + `text-primary`, transparent fill.
- **Invoice WhatsApp actions:** use WhatsApp green `#25D366` with white text and a 20px icon as the branded exception; keep Print in the walnut primary style.

- **Destructive actions** (Cancel Invoice, Delete, Merge Customers): solid `danger` fill, always behind a confirmation dialog that states the consequence in plain Arabic.

- **Tertiary/utility actions** (Merge Duplicates, Adjust Stock inline): text-only or ghost-button style using `text-secondary`.

New Invoice doesn't need to be a different _color_ to be unmistakable — it needs to be the biggest, most consistently placed, most isolated button on the screen, and it is.

---

## 4. Financial Balance Semantics

**Customer and supplier balances use three tiers, built entirely from existing tokens — no new colors introduced.**

| Tier                           | Visual treatment                                                                                                                                                      | Example triggers                                                                                                          |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Normal outstanding balance** | `text-primary`, Medium/SemiBold weight, no color coding, no badge — prominence comes from typography and placement (right-aligned, larger size in the balance column) | any ordinary open balance within normal terms                                                                             |
| **Requires attention**         | `warning` — tinted badge or `warning`-colored balance text, plus a short label                                                                                        | overdue payment, unusually high balance relative to history, approaching a configured credit limit, flagged for follow-up |
| **Critical / problematic**     | `danger` — tinted badge or `danger`-colored balance text, plus a short label                                                                                          | severely overdue debt, credit limit exceeded, blocked account, serious payment issue                                      |

An ordinary customer who owes money for a routine, current purchase is **not** visually flagged as a problem — the number is simply legible and prominent. Color is reserved for balances that genuinely need the shopkeeper's attention or intervention.

**Unchanged / always `danger`:**

- Negative stock.
- Cancelled invoices.
- Genuinely destructive actions (Delete, Cancel Invoice, Merge).

**Customer vs. supplier disambiguation** — the two balance tables must never be visually confusable despite sharing the same tier logic. This is enforced through label direction, not color:

- Customer owes the store: **"العميل عليه"** / **"مستحق للمحل"**
- Store owes the supplier: **"مستحق للمورد"** / **"رصيد مستحق للمورد"**

Icons (a small directional arrow — money-in vs. money-out) reinforce the label but are never the only indicator; the Arabic label text is always present alongside color and icon.

---

## 5. Focus Token System

Focus is never indicated by `primary` alone or by a border-color change alone — it uses dedicated, independent tokens: `focus-ring` and `focus-ring-offset` (values in §2). Keeping these as separate tokens (rather than reusing `primary` directly) means focus contrast can be tuned independently of the brand color if a future accessibility audit requires it.

**Rules:**

- Every interactive element (buttons, inputs, table rows, dropdown triggers, nav items) gets a **2px solid `focus-ring`**, offset **2px** from the element's edge via `focus-ring-offset` — a visible gap, not a ring drawn flush against the border.
- **Primary-filled buttons:** the ring sits _outside_ the button's own border, using `focus-ring-offset` as the gap so the ring doesn't visually merge into the button's solid `primary` fill.
- **Secondary/outline buttons:** ring appears outside the existing border, same offset rule.
- **Inputs:** ring replaces the default `border` emphasis on focus — border still shows `primary`, and the ring sits outside it, so focus is legible both as a border-color change _and_ as a ring.
- **Table rows (keyboard-navigable):** ring appears as a full-row outline, not just around a single cell.
- **Dark mode:** `focus-ring` is intentionally a lighter, higher-contrast value than dark-mode `primary` itself, since a ring at the same value as `primary` risks under-contrasting against `surface`/`surface-muted` in dark mode.
- Focus indicators are **never removed**, never replaced by a color-only state change, and never disabled without a replacement.

---

## 6. Typography

### Decision: **Noto Sans Arabic paired with Noto Sans**, for both Arabic and Latin/numeral content.

**Why Noto Sans Arabic:** Highly legible, ultra-clean, and neutral sans-serif designed specifically for digital displays and multi-script harmony. Combining `Noto Sans Arabic` with its Latin counterpart `Noto Sans` provides smooth, friendly letterforms with clear distinction at all sizes (from 12px table metadata to 28px dashboard KPIs), completely eliminating serif fallbacks and rendering glitches in mixed Arabic/English text and invoice numbers.

**Fallback stack:** `"Noto Sans Arabic", "Noto Sans", "Segoe UI", system-ui, sans-serif`.

**Weights:** Regular (400) — body/table data. Medium (500) — labels, secondary emphasis, table headers. SemiBold (600) — headings, section titles, invoice totals. Bold (700) — reserved for the grand-total line on an invoice and critical/destructive confirmations only.

**Type scale (base 16px):**

| Token       | Size | Use                                                         |
| ----------- | ---- | ----------------------------------------------------------- |
| `text-xs`   | 12px | timestamps, helper text                                     |
| `text-sm`   | 14px | table body (compact density), secondary labels              |
| `text-base` | 16px | default body, form inputs, table body (comfortable density) |
| `text-lg`   | 18px | card titles, section headings                               |
| `text-xl`   | 22px | page titles                                                 |
| `text-2xl`  | 28px | dashboard KPI numbers only                                  |

**Line-height:** Arabic — 1.7 at body sizes, 1.4 at heading sizes. English/Latin — 1.5 at body sizes, 1.3 at heading sizes; English pages use LTR layout.

**Numbers:** Western (Latin) digits throughout, in every context — matches real Arabic business/ERP/invoicing convention and stays unambiguous at small sizes.

**Tabular figures:** enabled everywhere numbers appear in a column — invoice line totals, price lists, balances, dashboard KPIs — so digits align vertically. Not required in inline prose numbers.

**Mixed RTL/LTR behavior:** paragraph/field direction follows the locale (`ar` RTL, `en` LTR); embedded numerals, currency, and invoice numbers render as LTR runs within the RTL flow (standard Unicode bidi behavior) — never force-mirrored, never manually reversed. Currency (ج.م) sits as a fixed suffix directly after the number, same run.

---

## 7. UI Density System

Two tiers, sharing the same token scale — only the values assigned to spacing/sizing tokens change between them.

### Comfortable (default, system-wide, required in some contexts)

| Element                     | Value                                          |
| --------------------------- | ---------------------------------------------- |
| Table row height            | 52px                                           |
| Table cell padding          | 12px vertical / 16px horizontal                |
| Input height                | 44px                                           |
| Button height               | 44px (primary/secondary), 40px (tertiary/text) |
| Form field vertical spacing | 20px                                           |
| Section spacing             | 32–48px                                        |

### Compact (screen-specific desktop layout)

| Element                     | Value                                          |
| --------------------------- | ---------------------------------------------- |
| Table row height            | 40px                                           |
| Table cell padding          | 8px vertical / 12px horizontal                 |
| Input height                | 40px                                           |
| Button height               | 40px (primary/secondary), 36px (tertiary/text) |
| Form field vertical spacing | 16px                                           |
| Section spacing             | 24–32px                                        |

**Invoice forms:** Sales and purchase create/edit use compact horizontal line layouts on desktop: item, quantity, price/cost, note, total, remove. Meter dimensions occupy a second row for stocked items; free-amount lines show only an entered amount and optional note, with no quantity or dimension controls; dimensions are optional for piece-priced items and required for cubic items. Multiple presets offer editable choices; single presets auto-fill. Fields stack on mobile. Inputs and line action buttons retain a 44px minimum height, labels are 14px, line padding is 12px, and line gaps are 8px. A single dashed Add line button sits below the rows at the logical end of the card. Form headers and customer/supplier sections use reduced spacing.

**Comfortable is required for:** Any payment-entry workflow; any touch-primary device (tablet or touchscreen POS at the counter); all standard day-to-day workflows unless a screen is explicitly opted into Compact. Invoice forms retain comfortable touch targets within their compact layout.

**Compact table density is allowed only on:** Invoice List, Inventory, Audit Log — and only on pointer/desktop devices. Invoice forms use the horizontal layout described above with 44px controls. Payment-entry workflows and touch-primary contexts use comfortable control sizing.

**Explicit sizing rule:**

```
Pointer/desktop, Compact mode:
  Secondary or tertiary controls (filters, icon buttons, row actions): 36–40px minimum.
  Primary or otherwise touch-important controls: 44px minimum, even inside a Compact table
  (e.g., a row's own "Save"/"Edit" primary action does not shrink below 44px
  just because the surrounding table is Compact).

Touch-primary devices (tablet, touchscreen POS):
  Comfortable density is required system-wide. Compact is not offered as an option.

Font size floor:
  14px minimum in both densities — never reduced further to fit more rows.
```

**Current implementation:** compact inventory and invoice layouts are selected by
the screen, not a persisted per-user density toggle. No density-switch preference
is implemented. Retain readable labels, horizontal overflow where needed, and
44px touch-important actions; treat the sizing tables above as design targets.

---

## 7.1 App Shell Layout (v2.2)

Authenticated pages use a sidebar plus scrolling workspace, with the global
user-menu header inside the main workspace:

| Region                                      | Tokens / rules                                                                                                                                                       |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Global header** (inside the main workspace) | User menu only (initials avatar + dropdown). Theme and language live **inside** the profile menu — not as permanent header pills. Never inside the page title block. |
| **Sidebar rail**                            | `sidebar` background, `rounded-shell`, brand in `sidebar-foreground`. Active nav: `sidebar-active` fill + `sidebar-active-foreground` text — no leading border bar.  |
| **Main workspace card**                     | `background` canvas with a scrolling main column and centered max-width content. Page title/actions appear below hub navigation; feature cards provide their own surfaces/borders.                                                     |
| **Inner cards / tables**                    | `rounded-shell` on table wrappers and `SurfaceCard` components.                                                                                                      |
| **User avatar**                             | `primary` circle, two-character initials (`getInitials`), dropdown with profile + logout.                                                                            |

Login and other unauthenticated screens do **not** use this shell.

---

## 8. Elevation System

A small, closed set of levels. Nothing above Elevation 2 exists in this application — this exists specifically to prevent ad-hoc shadows from being added anywhere.

| Level                             | Used for                                                      | Style                                                                        |
| --------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Elevation 0 — Default**         | Cards, tables, forms, inputs, all normal application surfaces | `surface` background + `border` for separation. No shadow.                   |
| **Elevation 1 — Floating UI**     | Dropdown menus, popovers, floating/contextual menus           | Subtle shadow only; border may remain visible alongside it.                  |
| **Elevation 2 — Modal / Overlay** | Dialogs, modals, critical confirmation overlays               | Stronger but still soft, warm-tinted shadow; paired with the standard scrim. |
| **Elevation 3**                   | Not used anywhere in this application.                        | —                                                                            |

**Shadow tokens:**

Light mode: `shadow-1`: `0 4px 12px rgba(35, 30, 24, 0.12)` · `shadow-2`: `0 8px 24px rgba(35, 30, 24, 0.18)`

Dark mode: `shadow-1`: `0 4px 12px rgba(0, 0, 0, 0.32)` · `shadow-2`: `0 8px 24px rgba(0, 0, 0, 0.42)`

**Scrim (Elevation 2 only):** `rgba(23, 20, 16, 0.45)` — light and dark alike, warm-tinted, never pure black.

---

## 9. Light-First Design Strategy

Design and implementation proceed in this strict order, each stage validated before the next begins:

1. **Light mode** — every screen, component, and token designed and reviewed for contrast, spacing, and clarity entirely in light mode first. This is the theme real users see most: daytime, shop counter, desktop/tablet screens.
2. **RTL** — once light mode is settled, RTL layout (mirroring, bidi number handling, icon direction, chart legend order) is validated on top of it.
3. **Desktop operational workflows** — the primary device class; New Invoice, Inventory, and the dashboard are built and tested at desktop widths first.
4. **Tablet responsiveness** — layouts adapted for tablet, reusing the same components with responsive spacing/breakpoints.
5. **Dark mode** — only after 1–4 are stable, following the derivation-and-validation process in §2.

Visual review covers light/dark, Arabic RTL, English LTR, desktop and mobile.
It is a manual user check; do not infer completed screenshot verification from
TypeScript/tests/builds or access a browser unless explicitly requested.

---

## 10. Component Guidelines

**Buttons:** one visual style of `primary` button (solid fill), differentiated by size/placement, not by introducing new colors or styles per context. Outline for secondary, solid `danger` for destructive, text-only for tertiary. Disabled: `surface-muted` fill, `text-muted` label, no border.

**Inputs:** 44px height (Comfortable), `border` at rest, `primary` border + `focus-ring`/`focus-ring-offset` on focus, `danger` border + inline message below the field on error. Numeric fields right-aligned internally even inside an RTL form.

**Tables:** `surface` base with `surface-muted` zebra striping; sticky header row in `text-secondary` Medium weight (never bold); numeric columns right-aligned; row height per the density system (§7); selected row gets a `primary`-tinted (8–10% opacity) background plus a leading 2px `primary` border bar — never a full solid-color row fill.

Show monetary values in table cells as formatted numbers without a repeated `ج.م`/`EGP` suffix. Amounts outside tables retain their currency labels.

**Cards:** `surface` + `border`, Elevation 0 (no shadow), 12px radius, used only for dashboard KPIs and entity-summary panels — one big `text-2xl` number, one `text-muted` label, nothing more per card.

**Navigation / Sidebar:** same neutral surface system as the rest of the app — active item indicated by a `primary` leading-edge bar + `primary`-colored label/icon, inactive items in `text-secondary`. No filled pill for active state.

**Status badges:** small pill with 4–6px radius (not fully round), semantic-color text on a 10–15%-opacity tint of that color, always icon + short Arabic word. Never solid-filled.

**Modals:** Elevation 2, reserved for short confirmations and quick-add forms only; `surface` background, `border`, 12px radius, warm-tinted scrim, one primary + one secondary button.

**Dropdowns:** Elevation 1; native-feeling, generous row height matching current density setting, current selection always visible in the closed trigger.

**Charts:** for ordinary business metrics (monthly sales, revenue, profit, invoice count, top-selling items), use `primary` for the main series and neutral shades from the existing neutral scale for supporting series — never arbitrary distinct colors per unrelated category (e.g., never "January = green, February = red, March = blue"). Semantic colors appear in a chart **only** when the underlying data itself represents that semantic state (a stock-level chart shifting to `warning`/`danger` at thresholds; a paid-vs-outstanding breakdown using `success` for paid). Highlighting a single data point (e.g., today's bar) uses `primary` for the highlighted value and neutral shades for the rest — no new accent color is introduced for this purpose. Chart colors must never contradict the system-wide meaning of `success`/`warning`/`danger`/`info`.

**Focus states:** see §5 in full — consistent `focus-ring`/`focus-ring-offset` on every interactive element, visible in both themes, never removed or replaced by a color-only change.

**Selected rows:** `primary`-tinted background (8–10% opacity) + leading border bar — the one place `primary` is allowed to tint a background rather than fill a button, kept subtle enough not to be mistaken for a status badge.

---

## 11. Final Design System Specification

### Recommended Design System Name

**Quiet Ledger**

### Visual Personality

A modern Arabic business workspace built on clarity, trust, and order — calm, warm-neutral, and unmistakably operational. Confident without decoration; professional without feeling corporate or generic. No vintage or paper motifs — the "ledger" is a feeling of order, not a texture.

### Color Strategy

One neutral, warm-tinted foundation (background/surface/border/text). One brand color — warm walnut (`#6F4428` light / `#CB9A65` dark) — used exclusively for actions, links, and avatar fill. Dark sidebar rail (`#332822`) with active nav on `sidebar-active`. Four semantic colors (green/amber/red/blue) used exclusively for system status. No second accent color anywhere in the system.

### Typography

Noto Sans Arabic paired with Noto Sans, bundled in `app/font-files/` and loaded through `next/font/local` in `app/fonts.ts` (no build-time Google Fonts requests), for Arabic and Latin/numeral content. Western tabular digits throughout. Four-weight system (400/500/600/700), disciplined type scale from 12px to 28px, generous 1.7 line-height for Arabic body text.

### Density

Comfortable (44–52px components) required for New Invoice and any touch-primary surface, and the default everywhere else. Compact spacing is screen-specific; there is no user density toggle. Invoice and inventory layouts retain 44px touch-important controls.

### Component Style

Flat, border-defined surfaces (Elevation 0) as the default; a closed three-level elevation system (0/1/2) governs the few places shadows are allowed. Small, consistent radii (never fully rounded). Tinted (never solid-fill) status badges always paired with icon + label. Solid-fill buttons reserved for real actions. Full-page flows for complex tasks; modals only for short confirmations. Independent, always-visible focus tokens on every interactive element.

### UX Principles

Invoice creation is the fastest, least-friction, most touch-target-generous flow in the product. Every status is communicated by color + icon + label together, never color alone. An ordinary outstanding balance is not treated as an error — color escalation is reserved for balances that genuinely need attention. Visual hierarchy is built from size, placement, and whitespace — never from introducing new colors. Light mode, RTL, and desktop are the primary design target; tablet and dark mode are validated derivatives, not parallel efforts.

### What to Avoid

A second accent color of any kind. Solid-filled status badges. Fully rounded pill buttons/cards. Drop-shadows outside the defined elevation levels. Paper/vintage/ledger-texture visual motifs. Icon-only navigation or actions. Placeholder-only form labels. Decorative motion. Dense, tile-heavy dashboards beyond four primary KPI cards. Semantic colors used as a generic categorical chart palette. Compact density on New Invoice or touch-primary workflows. Any surface where brand color and semantic color could be mistaken for one another.

### Compact inventory and shared Add actions

Inventory pages show five complete matching categories in backend creation-date order (oldest first, category ID ties), without splitting any category between pages. Preserve the response order in both locales; missing category references remain last. Pagination labels identify category pages, while per-category item counts, collapse controls and KPI semantics stay unchanged. A large category may produce a longer page. Inventory category tables use muted headers, a brown accent, count pill, rounded border and restrained row dividers. Keep horizontal scrolling and 44px action targets. DashedAddButton is the shared plus-button primitive for invoice Add line and dimension Add value. Item forms use compact cards and header Back links. DimensionInput keeps its Add value action after all presets inside the scrollable list, with inline input, hint, validation and saving state.

Inventory KPI cards keep four desktop columns, 12px padding and 20px figures. Desktop cards have a 144px minimum height and grow naturally for wrapped alert labels; mobile cards have no minimum height. Alert filter badges share a horizontal wrapping row with 44px targets. Preserve the existing values, semantic colors and filter actions.

### Current export and loading surfaces

The dedicated invoice export page initially selects PNG A5; PDF A4 remains an
option. Keep format and price visibility controls together, with Print, Download
and WhatsApp actions. Reuse invoice receipt presentation for exports and sharing.
Both sizes use a white receipt with a fixed light-theme primary (`#6F4428`)
item header and white labels. Browser printing includes the header color when
Background graphics is enabled and lets the browser omit it when disabled.
The invoice number and remaining balance use the receipt's orange accent
(`#b85d19`). Receipt print pages use zero page margins so Chromium has no room
to add its automatic time, title, and URL, even if Headers and footers is
enabled. Printed receipts fill the paper width selected in the browser and
use an 8 mm internal inset; the A4 PDF and A5 PNG download sizes remain fixed.
User print settings can override page CSS. In RTL order, show item, quantity,
thickness, width, length, cubic volume when applicable, unit price and line
total; omit meter suffixes in the dimension headers. Cubic volume uses the
saved pricing mode and six-decimal calculation, displayed to five decimals.
The volume sum sits in the `الإجمالي` table-footer row under the cubic column,
including when prices are hidden. Free-amount (مبلغ حر) lines show only item,
optional note, and total; quantity, dimensions, and unit price cells stay blank.
The physical quantity/cubic footer totals exclude those lines. A4 cells use 12 px
horizontal padding; A5 cells use 11 px. Download sheets use 12 mm A4 and 3 mm
A5 padding to give the columns more room while retaining standard page sizes.
Header labels use centered single-line content with smaller header-only side
padding; the canvas clone corrects html2canvas's lower Arabic header baseline
without changing the live preview or print. Long item cells may wrap without
changing table font sizes. Customer-facing
receipts, filenames and share text show the invoice number without its `INV-`
prefix and display the creation date and time in Cairo time. Internal invoice
identifiers retain the prefix. Item labels separate Western digits from adjacent
Arabic text and isolate number runs so the image export matches the preview.
Numeric shared inputs ignore wheel changes while focused. In the preset editor,
Add value appears above Cancel with clear saving/error feedback.

Shared loading screens cover route and authentication transitions. Localized and
global fallback screens keep recovery actions visible. Free-amount item forms
omit price, cost, dimensions, stock, and reorder controls. Sales lines use one
required EGP amount and an optional note, with no quantity or unit-price input.


### Current phone, date and invoice navigation controls

- Egyptian mobile input: fixed Egypt/+20 prefix, English digits, 3/3/4 grouping,
  ten editable digits, and persistent generic `1XX XXX XXXX` guidance in unfilled
  positions. Invalid changed phones are checked on Submit, not typing/blur;
  editing clears the message. The guidance is never a submitted value.
- Invoice neighbors: mode selector plus one labeled Previous/Next pair, 44px
  targets, RTL-aware arrows and disabled unavailable directions. Carry mode in
  neighbor URLs. Avoid reverting to four simultaneous navigation buttons.
- Export/public print notice: yellow warning tokens, icon plus explanatory text,
  outside the captured invoice and hidden on print. Public receipts use Arabic
  PDF guidance. Download is primary brown; Print is the standard outline action.


## Account details and automatic excess payments

Use a compact header with account name/back navigation, one primary New invoice action, secondary Record payment/Edit, with no Account actions button. Activation/deletion remain on list pages. Do not display contact information or merge controls on details. Three financial KPI cards use existing tokens: lifetime net invoices, active payments, current debt/credit. Grid is three columns on desktop, one on narrow screens. Create/edit uses one Balance field: optional starting amount on create, actual current amount on edit. Signed amounts support credit; an unchanged balance is omitted on contact-only saves. Balance corrections are audited automatically without an additional form. Keep invoice and payment histories in separate surfaces.

Ordinary debt remains `text-primary`. Credit uses `success` together with explicit direction: Customer credit / Credit with supplier. Do not rely on a minus sign or color alone. Invoice forms show one **Paid amount** field without an upper cap. When it exceeds invoice net, keep remaining zero and explain the excess account payment inline; retain the resulting debt/credit preview. Sales creation defaults to Customer Sale with a single keyboard-accessible customer search dropdown. Customer-detail invoice history hides the redundant customer column. The creation summary uses a compact payment-breakdown card beside account debt/credit: combined total, invoice portion, previous debt portion. Saved details show combined paid above a conditional parenthesized invoice-plus-previous-debt breakdown; Arabic receipts place the same breakdown beside المدفوع, wrapping only when space requires it. No-extra invoices retain their plain amount. Selected customers use the supplier-style muted summary card with bold name, current debt/credit and Change customer action. All copy is localized; use logical alignment and `<bdi>` for money in RTL. No new colors or fonts are introduced.


### Receipt amount alignment and RTL breakdown

Arabic receipt totals use a shared three-column grid: label, conditional breakdown, fixed money column. Paid/total/remaining amounts align in the money column; breakdown sits immediately to the right of paid. Isolate the full equation as LTR and bind the additional amount and its localized previous-debt label in one inline group, so Arabic direction cannot associate the label with the invoice portion. Detail-page breakdowns reuse this grouping. Additional-payment Notes are metadata labels, with user notes preserved separately.

Sales and purchase invoice item rows share a compact editable combobox in place of the native item select. Search matches item names or category names, with items grouped under category headings. Category headings are bold 16px and item names are regular 16px on the plain surface background; the list scrolls up to `min(32rem, 60dvh)`. Arrow keys, Enter, Escape, click, and blur preserve normal selection behavior. Use the existing input, muted-surface, focus, and dropdown elevation tokens. Paid amount precedes Discount in document and locale reading order. Customer lookup copy names only the customer name.

### Receipt item space and Arabic notes

Receipt tables share `ReceiptTableColumns` across standard/A4, compact/A5, and the invoice modal. All columns visible: item 25%, quantity 10%, thickness/width/length 10% each, cubic volume 11%, unit price 11%, total 13%. Any width freed by hidden columns returns to the item column. Keep column order and the existing paper formats and font sizes.

Compact numeric cells use 2px horizontal padding per side and item cells 6px; standard numeric cells use 4px and item cells 8px. Header and footer padding follow the same split. Item names remain bold with natural wrapping, and long unbroken text can wrap without truncation. Names and line notes share display-only Arabic/number spacing and RTL rendering. Numeric runs are LTR inline blocks aligned to the text baseline; notes use normal font style and relaxed line spacing, rather than italics. Stored names, notes, dimensions, and money remain unchanged.

Sales invoice mode order follows locale reading direction: Customer sale first (default), then Cash sale. The footer has one primary action, Save & print; Save uses the outlined secondary style and Go back uses the ghost style. Customer and supplier lookup share accessible combobox interactions, loading/empty states and keyboard navigation; after selection, retain the account summary and Change action. Gross-profit cards keep their existing layout and labels while incorporating saved free-amount purchase totals.

Manual checks: compare sales and purchase account/item searches in Arabic/English and light/dark, including category search, bold category headings, keyboard selection/Escape, inactive original selections on edit, small screens, and free-amount lines with no quantity/dimensions. Confirm Customer sale first/default and one primary sales footer action.

Items and Categories share catalog pagination controls below the list: secondary Previous/Next buttons with a muted page counter, disabled boundary buttons, localized navigation labels, and no controls for zero or one page. The Items page paginates complete category groups to avoid splitting related items.

Category visibility controls on Items and Inventory use the same outlined secondary button: surface background, subtle border/shadow, primary-colored directional icon, semibold label, and at least a 44px touch target. Keep the action at the end of the category toolbar and allow wrapping on small screens. Individual category headers expose aria-expanded and support native keyboard activation.

The Categories toolbar matches Items: a bordered surface with a growing name-search field and a compact All/Active/Inactive status selector. Stack fields on small screens, preserve locale reading direction, and show filter-specific empty-state guidance.

Item forms and catalog surfaces display names and categories without item-code fields, badges, or generated-code hints. Invoice references remain database IDs internally; do not expose these as replacement item codes.
