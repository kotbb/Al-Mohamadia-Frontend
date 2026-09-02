# Quiet Ledger — Design System
### Al-Mohamadia Wood Store Operations System
**Version 2.2 (shell refresh — mockup-aligned palette + Cairo)**

---

## 1. Design Philosophy

**Quiet Ledger** is a modern Arabic business workspace inspired by the clarity, trust, and organization of traditional accounting — not by its appearance. Nothing in the UI should look like paper, wood, or an antique. What carries over from that inspiration is the *discipline*: every number has one obvious place, every action has one obvious color, every status has one obvious meaning.

The product should feel modern, professional, warm, human, calm, and operational — like software built by people who understood the job, not like a themed skin. It should never feel vintage, retro, paper-textured, overly corporate, generic-SaaS, or AI-generated.

Practically, this means: a neutral canvas, one confident brand color, four disciplined semantic colors, and hierarchy built from size, spacing, and placement — not from decoration.

---

## 2. Final Color System

### Brand color rule
**One brand color. Semantic colors communicate system state. They never overlap in role.**

### Light theme (primary environment — design and validate here first)

| Token | Value | Use |
|---|---|---|
| `background` | `#F4F1EA` | page background — warm cream (mockup canvas) |
| `surface` | `#FFFFFF` | cards, tables, modals, inputs |
| `surface-muted` | `#F0ECE5` | table stripes, subtle panel fills, disabled fills |
| `border` | `#E1DACD` | dividers, input borders |
| `text-primary` | `#231E18` | headings, body, table data |
| `text-secondary` | `#5A5145` | field labels, table headers, secondary text |
| `text-muted` | `#8A8072` | placeholders, help text, timestamps |
| `primary` | `#6F4428` (warm walnut) | primary buttons, links, avatar fill |
| `primary-hover` | `#5A3620` | hover / pressed |
| `primary-foreground` | `#FFFFFF` | text/icons on `primary` |
| `focus-ring` | `#6F4428` | visible focus ring on interactive elements |
| `focus-ring-offset` | `#FFFFFF` (= `surface`) | gap color between component edge and focus ring |
| `sidebar` | `#332822` | navigation rail background |
| `sidebar-foreground` | `#F5F0EA` | brand + active nav text on sidebar |
| `sidebar-muted` | `#C9BDB0` | inactive nav labels on sidebar |
| `sidebar-hover` | `rgba(255,255,255,0.06)` | nav item hover fill |
| `sidebar-active` | `#6F4428` | active nav item background |
| `sidebar-active-foreground` | `#FFFFFF` | active nav label |
| `radius-shell` | `1.5rem` (24px) | sidebar, main panel, primary cards |

### Dark theme (derived — designed after light mode is finalized)

| Token | Value | Use |
|---|---|---|
| `background` | `#171410` | page background |
| `surface` | `#211D17` | cards, tables, modals |
| `surface-muted` | `#1C1812` | table stripes, disabled fills |
| `border` | `#3A3226` | dividers, input borders |
| `text-primary` | `#F2EBDF` | headings, body |
| `text-secondary` | `#C6BBA9` | labels, table headers |
| `text-muted` | `#928879` | help text, timestamps |
| `primary` | `#CB9A65` (light oak) | primary buttons, links, active nav |
| `primary-hover` | `#DDB183` | hover/pressed |
| `primary-foreground` | `#1A1510` | text on `primary` |
| `focus-ring` | `#E8B87F` (lightened from dark `primary` for stronger contrast against dark surfaces) | visible focus ring |
| `focus-ring-offset` | `#211D17` (= `surface`) | gap color between component edge and focus ring |
| `sidebar` | `#1A1510` | navigation rail background |
| `sidebar-foreground` | `#F2EBDF` | brand + active nav text |
| `sidebar-muted` | `#9A8D7E` | inactive nav labels |
| `sidebar-hover` | `rgba(255,255,255,0.05)` | nav item hover fill |
| `sidebar-active` | `#8B5A35` | active nav item background |
| `sidebar-active-foreground` | `#FFFFFF` | active nav label |

**Dark mode methodology:** Dark mode is derived from the same semantic token structure and visual relationships as the finalized light theme, then individually reviewed and visually validated for contrast, hierarchy, readability, and long-session comfort. It is **not** produced by mechanical inversion. The process:
1. Finalize and validate the light theme first — it remains the canonical, primary environment.
2. Preserve the same token *meanings* in dark mode (`background` is still the page canvas, `primary` is still the only brand/action color, semantic tokens still mean the same states).
3. Derive initial dark-mode values from the light system's relationships (relative contrast steps between background/surface/border, relative saturation of `primary` and semantics).
4. Individually review every dark token for: WCAG AA contrast, hierarchy (does `text-secondary` still sit clearly between `text-primary` and `text-muted`?), readability at table density, eye comfort over long sessions, `text-muted` visibility, border visibility against `surface`, tinted-surface legibility (badge tints, selected-row tints), semantic color intensity (raw hues that work in light mode often need desaturating — not just lightening — for dark backgrounds), and focus-ring visibility.
5. Screenshot-review the major screens — Dashboard, New Invoice, Invoice List, Inventory, Customers — in dark mode only after light mode is fully signed off, as a distinct validation pass, not a parallel design track.

### Semantic colors (confirmed final)

| Token | Light | Dark | Use |
|---|---|---|---|
| `success` | `#2E8F52` | `#5FBB80` | paid, saved, in-stock |
| `warning` | `#B8862B` | `#D9A854` | low stock, pending, balances requiring attention |
| `danger` | `#C13B2E` | `#E27567` | negative stock, cancelled invoices, critical/blocked balances, destructive actions |
| `info` | `#2E6FA6` | `#79ADD9` | neutral system information |

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
  - **Solid fill** — it is the *only* solid-filled `primary` button typically visible on the dashboard/list screens at once; other primary-toned actions on the same screen (e.g., "Add Customer" inside a table toolbar) are smaller and more secondary in placement.

- **Primary actions** (Save, Save & Print, Add Customer, Add Item): solid `primary` fill, sized and placed relative to their context — a toolbar "Add Customer" button is smaller than the page-level "New Invoice" button even though both are `primary`-colored. Hierarchy within the same color is achieved by **scale and context**.

- **Secondary actions** (Cancel, Export PDF, Filter, Back): outline style — `border` + `text-primary`, transparent fill.

- **Destructive actions** (Cancel Invoice, Delete, Merge Customers): solid `danger` fill, always behind a confirmation dialog that states the consequence in plain Arabic.

- **Tertiary/utility actions** (Merge Duplicates, Adjust Stock inline): text-only or ghost-button style using `text-secondary`.

New Invoice doesn't need to be a different *color* to be unmistakable — it needs to be the biggest, most consistently placed, most isolated button on the screen, and it is.

---

## 4. Financial Balance Semantics

**Customer and supplier balances use three tiers, built entirely from existing tokens — no new colors introduced.**

| Tier | Visual treatment | Example triggers |
|---|---|---|
| **Normal outstanding balance** | `text-primary`, Medium/SemiBold weight, no color coding, no badge — prominence comes from typography and placement (right-aligned, larger size in the balance column) | any ordinary open balance within normal terms |
| **Requires attention** | `warning` — tinted badge or `warning`-colored balance text, plus a short label | overdue payment, unusually high balance relative to history, approaching a configured credit limit, flagged for follow-up |
| **Critical / problematic** | `danger` — tinted badge or `danger`-colored balance text, plus a short label | severely overdue debt, credit limit exceeded, blocked account, serious payment issue |

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
- **Primary-filled buttons:** the ring sits *outside* the button's own border, using `focus-ring-offset` as the gap so the ring doesn't visually merge into the button's solid `primary` fill.
- **Secondary/outline buttons:** ring appears outside the existing border, same offset rule.
- **Inputs:** ring replaces the default `border` emphasis on focus — border still shows `primary`, and the ring sits outside it, so focus is legible both as a border-color change *and* as a ring.
- **Table rows (keyboard-navigable):** ring appears as a full-row outline, not just around a single cell.
- **Dark mode:** `focus-ring` is intentionally a lighter, higher-contrast value than dark-mode `primary` itself, since a ring at the same value as `primary` risks under-contrasting against `surface`/`surface-muted` in dark mode.
- Focus indicators are **never removed**, never replaced by a color-only state change, and never disabled without a replacement.

---

## 6. Typography

### Decision: **Cairo, single system-wide family**, for both Arabic and Latin/numeral content.

**Why Cairo:** Matches the approved UI mockups — a geometric Arabic sans-serif with clear hierarchy at ERP table density. It reads modern and operational without decorative personality. A single family keeps one weight system and trivial mixed-script balance.

**Fallback stack:** `"Cairo", "Noto Sans Arabic", "Segoe UI", system-ui, sans-serif`.

**Weights:** Regular (400) — body/table data. Medium (500) — labels, secondary emphasis, table headers. SemiBold (600) — headings, section titles, invoice totals. Bold (700) — reserved for the grand-total line on an invoice and critical/destructive confirmations only.

**Type scale (base 16px):**

| Token | Size | Use |
|---|---|---|
| `text-xs` | 12px | timestamps, helper text |
| `text-sm` | 14px | table body (compact density), secondary labels |
| `text-base` | 16px | default body, form inputs, table body (comfortable density) |
| `text-lg` | 18px | card titles, section headings |
| `text-xl` | 22px | page titles |
| `text-2xl` | 28px | dashboard KPI numbers only |

**Line-height:** Arabic — 1.7 at body sizes, 1.4 at heading sizes. English/Latin — 1.5 at body sizes, 1.3 at heading sizes (used only for stray Latin words/codes).

**Numbers:** Western (Latin) digits throughout, in every context — matches real Arabic business/ERP/invoicing convention and stays unambiguous at small sizes.

**Tabular figures:** enabled everywhere numbers appear in a column — invoice line totals, price lists, balances, dashboard KPIs — so digits align vertically. Not required in inline prose numbers.

**Mixed RTL/LTR behavior:** paragraph/field direction follows Arabic (RTL); embedded numerals, currency, and item codes render as LTR runs within the RTL flow (standard Unicode bidi behavior) — never force-mirrored, never manually reversed. Currency (م.ج) sits as a fixed suffix directly after the number, same run.

---

## 7. UI Density System

Two tiers, sharing the same token scale — only the values assigned to spacing/sizing tokens change between them.

### Comfortable (default, system-wide, required in some contexts)

| Element | Value |
|---|---|
| Table row height | 52px |
| Table cell padding | 12px vertical / 16px horizontal |
| Input height | 44px |
| Button height | 44px (primary/secondary), 40px (tertiary/text) |
| Form field vertical spacing | 20px |
| Section spacing | 32–48px |

### Compact (opt-in, per-table, pointer/desktop only)

| Element | Value |
|---|---|
| Table row height | 40px |
| Table cell padding | 8px vertical / 12px horizontal |
| Input height | 40px |
| Button height | 40px (primary/secondary), 36px (tertiary/text) |
| Form field vertical spacing | 16px |
| Section spacing | 24–32px |

**Comfortable is required (not just default) for:** New Invoice and any payment-entry workflow; any touch-primary device (tablet or touchscreen POS at the counter); all standard day-to-day workflows unless a screen is explicitly opted into Compact.

**Compact is allowed only on:** Invoice List, Inventory, Audit Log — and only on pointer/desktop devices. It is never offered as an option on New Invoice, any payment/critical-financial-entry workflow, or any touch-primary context.

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

**Density is a per-table, per-user preference — never a single global app-wide setting.** Expose a small, persistent density toggle in the toolbar of each eligible table, remembered per user.

---

## 7.1 App Shell Layout (v2.2)

Authenticated pages use a **two-rail shell** aligned to the Users mockup:

| Region | Tokens / rules |
|---|---|
| **Global header** (full width, above rails) | User menu only (initials avatar + dropdown). Theme and language live **inside** the profile menu — not as permanent header pills. Never inside the page title block. |
| **Sidebar rail** | `sidebar` background, `rounded-shell`, brand in `sidebar-foreground`. Active nav: `sidebar-active` fill + `sidebar-active-foreground` text — no leading border bar. |
| **Main workspace card** | `surface` + `rounded-shell` + Elevation 1 shadow. Page title/subtitle in a bordered header strip; content below. |
| **Inner cards / tables** | `rounded-shell` on table wrappers and `SurfaceCard` components. |
| **User avatar** | `primary` circle, two-character initials (`getInitials`), dropdown with profile + logout. |

Login and other unauthenticated screens do **not** use this shell.

---

## 8. Elevation System

A small, closed set of levels. Nothing above Elevation 2 exists in this application — this exists specifically to prevent ad-hoc shadows from being added anywhere.

| Level | Used for | Style |
|---|---|---|
| **Elevation 0 — Default** | Cards, tables, forms, inputs, all normal application surfaces | `surface` background + `border` for separation. No shadow. |
| **Elevation 1 — Floating UI** | Dropdown menus, popovers, floating/contextual menus | Subtle shadow only; border may remain visible alongside it. |
| **Elevation 2 — Modal / Overlay** | Dialogs, modals, critical confirmation overlays | Stronger but still soft, warm-tinted shadow; paired with the standard scrim. |
| **Elevation 3** | Not used anywhere in this application. | — |

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

No component ships until it has been screenshot-reviewed in light mode + RTL + desktop before dark mode or tablet variants are even opened.

---

## 10. Component Guidelines

**Buttons:** one visual style of `primary` button (solid fill), differentiated by size/placement, not by introducing new colors or styles per context. Outline for secondary, solid `danger` for destructive, text-only for tertiary. Disabled: `surface-muted` fill, `text-muted` label, no border.

**Inputs:** 44px height (Comfortable), `border` at rest, `primary` border + `focus-ring`/`focus-ring-offset` on focus, `danger` border + inline message below the field on error. Numeric fields right-aligned internally even inside an RTL form.

**Tables:** `surface` base with `surface-muted` zebra striping; sticky header row in `text-secondary` Medium weight (never bold); numeric columns right-aligned; row height per the density system (§7); selected row gets a `primary`-tinted (8–10% opacity) background plus a leading 2px `primary` border bar — never a full solid-color row fill.

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
Cairo, single family, system-wide, for both Arabic and Latin/numeral content. Western tabular digits throughout. Four-weight system (400/500/600/700), disciplined type scale from 12px to 28px, generous 1.7 line-height for Arabic body text.

### Density
Comfortable (44–52px components) required for New Invoice and any touch-primary surface, and the default everywhere else. Compact (36–40px components) as an explicit, per-table, user-controlled, pointer/desktop-only option on Invoice List, Inventory, and Audit Log.

### Component Style
Flat, border-defined surfaces (Elevation 0) as the default; a closed three-level elevation system (0/1/2) governs the few places shadows are allowed. Small, consistent radii (never fully rounded). Tinted (never solid-fill) status badges always paired with icon + label. Solid-fill buttons reserved for real actions. Full-page flows for complex tasks; modals only for short confirmations. Independent, always-visible focus tokens on every interactive element.

### UX Principles
Invoice creation is the fastest, least-friction, most touch-target-generous flow in the product. Every status is communicated by color + icon + label together, never color alone. An ordinary outstanding balance is not treated as an error — color escalation is reserved for balances that genuinely need attention. Visual hierarchy is built from size, placement, and whitespace — never from introducing new colors. Light mode, RTL, and desktop are the primary design target; tablet and dark mode are validated derivatives, not parallel efforts.

### What to Avoid
A second accent color of any kind. Solid-filled status badges. Fully rounded pill buttons/cards. Drop-shadows outside the defined elevation levels. Paper/vintage/ledger-texture visual motifs. Icon-only navigation or actions. Placeholder-only form labels. Decorative motion. Dense, tile-heavy dashboards beyond four primary KPI cards. Semantic colors used as a generic categorical chart palette. Compact density on New Invoice or touch-primary workflows. Any surface where brand color and semantic color could be mistaken for one another.
