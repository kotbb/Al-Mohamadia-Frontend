# Al-Mohamadia — Google Stitch prompts

Ready-to-paste prompts for the **full Al-Mohamadia MVP** (Quiet Ledger design system).  
Design system: [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)
Build phases: [PHASES.md](./PHASES.md)  
Layout reference mockups: [UI/README.md](../UI/README.md) (structure only — remap colors to Quiet Ledger). Legacy Stitch `.jpg` names in prompts below are deprecated.

## How to use

1. **First** (new Stitch project or theme reset): paste **Theme setup — Quiet Ledger** once.
2. **Before every authenticated screen:** in Stitch, **select** a frame that already has the **full** App Shell (floating sidebar + main panel + header controls). Prefer **Duplicate** the shell master (§1) first, then select the copy — Stitch edits the selection; it does not hunt the project for a frame by name.
3. Paste the **Shared preamble**, then the screen prompt (each primary prompt already includes edit-selected wording — do **not** also paste a separate Shell lock unless noted).
4. Generate **one screen per prompt**, in [Screen order](#screen-order) below.
5. **Reference images:** when a prompt says attach **Image HM** (or **Image NI**, **Image IV**, etc.), upload the matching file from `UI/` **before** pasting. Journey images = prior Stitch screens in this module. Cap at **2–3** attachments per generate.
6. Stitch is for **structure + journey + approximate Quiet Ledger color**. **Do not import Stitch HTML into the codebase.** Rebuild from design-system tokens and shared React components.
7. **Light mode + RTL first** (English default UI copy; Arabic optional). Dark mode is a second pass — see §28 checklist only; do not parallel-track dark frames in Stitch v1.
8. **UI mockups use navy/orange** — treat them as **wireframes**. Remap every color to Quiet Ledger tokens (walnut `#7A4A22`, cream `#F7F5F1`, etc.). Never copy mockup hex values.

**If Stitch thinks forever / produces nothing:** cancel, re-select the shell frame, use only the screen prompt (no Theme redo). Do not ask it to "find" or "use EXISTING Navigation" without a selection.

**If Stitch returns an empty sidebar or strips nav rows:** reject the result. Undo or discard → re-select a **full** shell duplicate → paste again. Do not continue the journey from a stripped shell.

### Design-system pattern images

Screenshot or upload these from `UI/` before the prompts that reference them. Name the attachment in Stitch to match the label.

| Label | What to attach | Source file | Use on |
|---|---|---|---|
| **Image HM** | Dashboard — full shell + KPI row + chart | `UI/Home.jpg` | **§1** Dashboard (required — shell master) |
| **Image NI** | New Invoice — customer search, line items, totals | `UI/New Invoice.jpg` | **§3** New Invoice; optional **§11** (line-item pattern) |
| **Image IV** | Invoice list — filters, table, status columns | `UI/Invoices.jpg` | **§4** Invoice List, **§5** Invoice Detail, **§12**, **§21**, **§25** |
| **Image CU** | Customers list — debt total, balance column | `UI/Customers.jpg` | **§7** Customers List, **§8** Customer Detail, **§10** Merge |
| **Image ST** | Stock / inventory list — qty, low-stock flags | `UI/Stock.jpg` | **§13** Inventory List, **§14** Stock Adjustment |
| **Image SU** | Suppliers list — owed total, supplier rows | `UI/Suppliers.jpg` | **§15** Suppliers List, **§16** Supplier Detail, **§11** |
| **Image PR** | Items & pricing — categories, price columns | `UI/Prices.jpg` | **§18** Items, **§19** Add/Edit Item, **§20** Price History |
| **Image US** | Users / admins — role, status table | `UI/Users.jpg` | **§22** Users, **§23** Create Admin |

**Journey screenshots** (your Stitch results — attach when noted):

| Label | What to attach | Use on |
|---|---|---|
| **Image ID** | Invoice Detail frame (§5) | **§6** Cancel modal, **§26** PDF preview, **§27** WhatsApp share |
| **Image CD** | Customer Detail frame (§8) | **§9** Record Payment modal |
| **Image SD** | Supplier Detail frame (§16) | **§17** Purchase history section |

**Rules for pattern images:** Match **layout** (sections, columns, density, CTA placement). Do **not** let a pattern image replace App Shell chrome (sidebar, header, theme/lang toggles). Do **not** copy mockup navy/orange — remap to Quiet Ledger.

### Canonical App Shell (screens §1, §3–§24)

Use **§1 Dashboard** as the **master** shell frame, then **Duplicate** it for every authenticated screen — switch only the **active nav item** and the **main content** below the page header.

| Step | Action |
|---|---|
| §1 | Build **Dashboard** once — includes full floating App Shell (master). |
| §3–§24 | **Duplicate** §1 → set active sidebar item + replace main content only. |
| §6, §9, §10, §14, §23 | **Duplicate** parent screen → keep chrome + page **dimmed** → **add** modal overlay. |
| §5, §8, §16 | **Duplicate** list frame (§4, §7, §15) → replace table with detail layout. |

**Shell layout (locked on every authenticated frame):**

```
┌─ background #F7F5F1 — outer padding 16–20px ─────────────────┐
│ ┌──────────────┐   gap   ┌────────────────────────────────┐  │
│ │ Sidebar      │         │ Main panel (surface, rounded-xl)│  │
│ │ المحمدية     │         │ H1 page title + subtitle       │  │
│ │ tagline      │         │ theme toggle · language toggle │  │
│ │              │         │                                │  │
│ │ nav (8 rows) │         │ [spaced content cards]         │  │
│ │              │         │                                │  │
│ └──────────────┘         └────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**Sidebar nav (exact Arabic labels, icon + label, RTL):**

1. الرئيسية  
2. فاتورة جديدة  
3. الفواتير  
4. العملاء  
5. المخزون  
6. الموردين  
7. الأصناف والأسعار  
8. المستخدمين (super-admin only — show muted/disabled for non–super-admin contexts if needed)

**Active nav:** `primary` leading-edge bar (2px) + `primary/10` tinted background + `primary` label/icon — **not** a solid filled pill.

**Header controls (top of main panel, end side in RTL):** pill-shaped theme toggle (فاتح / داكن) + language toggle (عربي / English) + logout when authenticated.

**Page title rule:** H1 = Arabic page title; subtitle = one muted line below. Content sections use **spaced white cards** (`surface` + `border`, 12px radius, 32–48px gap between sections).

### Screen order

| # | Screen | App shell? | Reference image |
|---|---|---|---|
| — | Theme setup — Quiet Ledger | — | DESIGN-SYSTEM.md |
| 1 | Dashboard (shell master) | **Build master** | **Image HM** |
| 2 | Login | No shell | — |
| 3 | New Invoice | Duplicate §1; nav **فاتورة جديدة** | **Image NI** |
| 4 | Invoice List | Duplicate §1; nav **الفواتير** | **Image IV** |
| 5 | Invoice Detail | Duplicate §4 | **Image IV** |
| 6 | Cancel Invoice modal | Modal on §5 | Image ID = §5 |
| 7 | Customers List | Duplicate §1; nav **العملاء** | **Image CU** |
| 8 | Customer Detail | Duplicate §7 | **Image CU** |
| 9 | Record Payment modal | Modal on §8 | Image CD = §8 |
| 10 | Merge Customers modal | Modal on §7 | **Image CU** |
| 11 | New Purchase Invoice | Duplicate §1; nav **الموردين** | **Image SU** + **Image NI** |
| 12 | Purchase Invoice List | Duplicate §1 or §15 | **Image IV** |
| 13 | Inventory / Stock List | Duplicate §1; nav **المخزون** | **Image ST** |
| 14 | Manual Stock Adjustment modal | Modal on §13 | Image ST = §13 |
| 15 | Suppliers List | Duplicate §1; nav **الموردين** | **Image SU** |
| 16 | Supplier Detail | Duplicate §15 | **Image SU** |
| 17 | Supplier Purchase History | Duplicate §16 | Image SD = §16 |
| 18 | Items & Pricing | Duplicate §1; nav **الأصناف والأسعار** | **Image PR** |
| 19 | Add / Edit Item | Duplicate §18 | **Image PR** |
| 20 | Price History (per item) | Duplicate §18 | **Image PR** |
| 21 | Audit Log | Duplicate §1 | **Image IV** (table density) |
| 22 | Users / Admins | Duplicate §1; nav **المستخدمين** | **Image US** |
| 23 | Create Admin modal | Modal on §22 | **Image US** |
| 24 | Access Denied | Duplicate §1 | — |
| 25 | Invoice List — empty state | Duplicate §4 | **Image IV** |
| 26 | Invoice PDF / Print preview | Overlay on §5 | Image ID = §5 |
| 27 | WhatsApp share sheet | Overlay on §5 | Image ID = §5 |
| 28 | Dark mode second-pass checklist | — | DESIGN-SYSTEM.md §2 |

**Order note:** Finish §1 before all authenticated screens. Finish §4 before §5; §7 before §8–§10; §13 before §14; §15 before §16–§17; §18 before §19–§20; §22 before §23; §5 before §6, §26, §27.

---

## Edit-selected shell (default for authenticated screens)

Primary prompts below already include this pattern. Reference block if you need it alone:

```
Edit this selected screen only — PIXEL-PRESERVE chrome.

CHROME LOCK (hard rules — violate any → failed output):
1) Keep the **entire** sidebar nav list exactly as drawn — all 8 rows with Arabic labels + icons. Do NOT delete, hide, collapse, or simplify any row.
2) Keep the soft shell layout: cream outer background (#F7F5F1), floating white sidebar card, gap, floating white main panel — both rounded-xl with border.
3) Keep header controls unchanged: theme toggle (فاتح/داكن), language toggle (عربي/English), logout when shown.
4) Change **only** active nav highlight + main content below the page H1:
   - Active nav: primary leading-edge bar + primary/10 tint + primary label (NOT solid filled pill).
   - Main content: spaced surface cards inside the main panel.

FORBIDDEN (instant reject):
- Empty / logo-only / stripped sidebar
- Rebuilding or inventing a new shell
- Navy/orange mockup colors (#0A1628, #FF6A00, etc.)
- Second accent color, paper/wood textures, decorative gradients
- Dense power-user grid (< 44px touch targets on primary actions)
- Searching the project for another shell — edit the selection only

RTL: English default UI in RTL layout (both en and ar). Western digits. Currency suffix ج.م after numbers.
```

For **modals / drawers:** select the parent frame first (or duplicate it), attach the reference image noted in Screen order, then ask to keep chrome + page and **add** the overlay with warm scrim.

---

## Theme setup — Quiet Ledger

Paste before any screen prompts if theme is not already set:

```
Update this Stitch project's design system / theme to Quiet Ledger (Al-Mohamadia).

Quiet Ledger color tokens — light theme (use exactly):
- background (page canvas): #F7F5F1
- surface (cards, panels, inputs): #FFFFFF
- surface-muted (stripes, subtle fills): #F0ECE5
- border: #E1DACD
- text-primary: #231E18
- text-secondary (labels, table headers): #5A5145
- text-muted (placeholders, timestamps): #8A8072
- primary / brand (walnut): #7A4A22
- primary-hover: #603A1A
- primary-foreground (text on primary): #FFFFFF
- success: #2E8F52
- warning: #B8862B
- danger: #C13B2E
- info: #2E6FA6

Typography: IBM Plex Sans Arabic only. Base 16px. Arabic body line-height 1.7.
Western (Latin) digits throughout. Currency: ج.م suffix after amounts.

Layout personality:
- Soft floating shell: cream outer padding, white sidebar + white main panel separated by gap
- Card radius 12px (rounded-xl). Section gaps 32–48px between content cards
- Comfortable density: 44px inputs/buttons, ~52px table rows
- Elevation 0 default (border only, no shadow on cards). Modals use subtle shadow + warm scrim.

Primary button: solid fill #7A4A22, white label, rounded-xl.
Secondary button: outline border #E1DACD, text #231E18.
Active nav: primary leading-edge bar + light primary tint — NOT solid filled pill.
Status badges: tinted semantic background (10–15% opacity) + icon + Arabic label — never solid fill.

FORBIDDEN: navy sidebar, bright orange accent, second brand color, paper/wood textures, pure black #000, pure white #FFF as page tokens, Material purple/indigo, generic SaaS gradients.
```

---

## Shared preamble

Copy above every screen prompt (after Theme setup):

```
Al-Mohamadia — wood store management ERP (Quiet Ledger design system).

Product: English-default RTL business app for a small timber shop in Egypt (Arabic locale optional). Calm, warm, operational — not vintage, not generic SaaS. Font: IBM Plex Sans Arabic.
Visual: background #F7F5F1, surface #FFFFFF, border #E1DACD, text #231E18, muted #8A8072, primary walnut #7A4A22. Semantic: success #2E8F52, warning #B8862B, danger #C13B2E, info #2E6FA6.
One brand color only. Primary buttons and active nav use #7A4A22. Do NOT use mockup navy/orange, Material Design, purple/indigo, black primary, or marketing landing-page look.

Architecture locked:
- Currency: EGP — Western digits + ج.م suffix (e.g. 1,250 ج.م)
- RTL default; embedded numbers/codes stay LTR within RTL flow
- New Invoice ("فاتورة جديدة") = highest-value action: largest primary button, fixed header position, generous whitespace, never adjacent to another primary button
- Customer balance tiers: normal = text only; attention = warning badge+label; critical = danger badge+label. Ordinary debt is NOT danger by default.
- Supplier owed: label "مستحق للمورد" — never confuse with customer "العميل عليه"
- Invoice math: remaining = total − discount − paid
- Tables: comfortable density (~52px rows), zebra surface-muted stripes, numeric columns right-aligned, tabular digits
- Status badges: tinted semantic color + Arabic word + icon — never color-only, never solid-filled pills
- Modals: warm scrim, surface card, one primary + one secondary (or danger for destructive confirms)

Match Quiet Ledger patterns (approximate by name):
- Shell: floating sidebar + main panel on cream background with gap — preserve every nav row
- Content: spaced surface cards (border, 12px radius, no drop shadow on normal surfaces)
- Forms: 44px inputs, labels in text-secondary, primary border + focus ring on focus
- Lists: search + filter chips + table + pagination; primary "New …" in toolbar (smaller than page-level فاتورة جديدة)
- Buttons: Primary (walnut fill), Secondary (outline), Danger (destructive), Ghost (text-secondary)
- Empty states: dashed border card, short Arabic message + optional action

Output: one screen (or the overlay I ask for). Label regions. Realistic Arabic placeholder content for a wood store (MDF, خشب بلدي, ألواح, etc.). Comfortable density — shopkeeper-friendly, not dense enterprise grid.
```

---

## 1 — Dashboard (الرئيسية)

**Before paste:** Start from blank or minimal frame. Attach **Image HM** (`UI/Home.jpg`) for **layout structure only**. This screen is the **App Shell master** for §3–§24.

### Primary prompt

```
[Paste Shared preamble]

Build the Al-Mohamadia App Shell master + Dashboard page. RTL Arabic.

Attach reference: Image HM — use for LAYOUT and SECTION PLACEMENT only. Remap all mockup navy/orange to Quiet Ledger tokens (background #F7F5F1, primary #7A4A22, surface #FFFFFF).

**Shell (locked for all future screens):**
- Outer: cream background #F7F5F1 with 16–20px padding
- Left column in RTL = **end side**: floating white sidebar card (rounded-xl, border #E1DACD), width ~256–288px
  - Brand: "المحمدية" (H1 semibold) + muted tagline "نظام إدارة محل الأخشاب"
  - Nav list (8 items, icon + Arabic label):
    1. الرئيسية (ACTIVE — primary leading bar + primary/10 tint)
    2. فاتورة جديدة
    3. الفواتير
    4. العملاء
    5. المخزون
    6. الموردين
    7. الأصناف والأسعار
    8. المستخدمين
- Gap ~16–20px
- Main panel: floating white card (rounded-xl, border), flex-1
  - Header row: H1 "لوحة التحكم" + subtitle "ملخص اليوم والمبيعات"
  - End side: theme toggle pill (فاتح | داكن) + language pill (عربي | English)
  - **Primary CTA** top-end (RTL leading corner): largest button "فاتورة جديدة" with + icon — walnut #7A4A22, isolated whitespace

**Dashboard content (spaced cards, gap 32–48px):**
1. **CTA banner card** (optional surface-muted fill): "جاهز للبيع؟" + secondary line + prominent "فاتورة جديدة" button
2. **KPI row** (4 cards): مبيعات اليوم · أرباح تقديرية · عدد الفواتير · المحصل — large number (text-2xl) + muted label each
3. **Debt summary strip** card: إجمالي مديونية العملاء · عدد العملاء المدينين — prominent amounts
4. **Chart card**: مبيعات الشهر — bar chart using primary #7A4A22 for main series + neutral muted bars for other months (no rainbow palette)
5. **Top sellers card**: table — الصنف · الكمية · الإيراد (3–4 sample wood items)

Sample data: MDF 18mm, خشب بلدي, ألواح زان. Amounts like 12,450 ج.م.

Density: comfortable — 44px controls, generous card padding.
FORBIDDEN: navy sidebar, orange CTAs, paper texture, shadow on every card, missing nav rows.
Output: ONE frame — this becomes the shell master for duplication.
```

---

## 2 — Login (تسجيل الدخول)

**Before paste:** New frame — **no App Shell**. Optional: duplicate layout from current login if you have a Stitch draft.

### Primary prompt

```
[Paste Shared preamble]

Build Login screen — NO app sidebar. RTL Arabic. Standalone auth page.

**Layout:**
- Full viewport cream background #F7F5F1 with outer padding
- Top-end: theme toggle + language toggle (same pill style as app)
- Two floating white cards side by side on desktop (stack on mobile), gap 16–20px, rounded-xl, border #E1DACD

**Left card (brand panel):**
- H1 "المحمدية"
- Short primary accent line (walnut #7A4A22, 2px height)
- Tagline muted: "نظام إدارة محل الأخشاب"
- No wood texture, no dark hero, no decorative gradients

**Right card (login form):**
- H2 "تسجيل الدخول"
- Subtitle muted: "أدخل بيانات الدخول للمتابعة"
- Field: اسم المستخدم (44px input, rounded-xl)
- Field: كلمة المرور (password input)
- Primary button full width: "دخول" (#7A4A22)
- No social login, no "forgot password" unless placeholder link muted

FORBIDDEN: app shell sidebar, navy panel, orange accents, paper/wood motifs.
Output: ONE frame — login only.
```

---

## 3 — New Invoice (فاتورة جديدة)

**Before paste:** Duplicate §1 (Dashboard). Attach **Image NI**. Select duplicate. Set sidebar **فاتورة جديدة** active.

### Primary prompt

```
[Paste Shared preamble]

Edit this selected screen only — PIXEL-PRESERVE chrome.
CHROME LOCK: full sidebar (all 8 nav rows), floating shell gap, header controls unchanged.
Set active nav: **فاتورة جديدة** (primary leading bar + tint). Deactivate الرئيسية.
Keep header CTA "فاتورة جديدة" visible and largest — same position as §1.

Attach reference: Image NI — layout/sections only; remap colors to Quiet Ledger.

Content: New sales invoice form — H1 "فاتورة جديدة", subtitle "إنشاء فاتورة بيع جديدة".
Goal: Fastest shopkeeper flow — customer, line items, live totals, save.

**Spaced content cards (gap 32–48px):**

Card 1 — Customer:
- Search combobox "ابحث عن عميل…" + chip selected "أحمد محمود"
- Toggle/chip: "بيع نقدي" (cash sale — no customer debt)
- Secondary outline if needed: "عميل جديد"

Card 2 — Line items table:
Columns: الصنف · الكمية · السماكة · العرض · الطول · سعر القطعة · الإجمالي · ملاحظة
- Show dimension columns (سمك/عرض/طول) for cubic-meter items
- Sample rows: MDF 18mm · خشب بلدي · لوح زان
- Dashed "إضافة سطر" row at bottom (+ icon)

Card 3 — Totals (right-aligned numbers, tabular):
الإجمالي · الخصم · المدفوع · المتبقي — emphasize المتبقي semibold
Footer actions: Secondary "إلغاء" · Primary "حفظ" · Primary "حفظ وطباعة" (save slightly smaller than header فاتورة جديدة if both visible)

Inputs 44px. Comfortable row height in table.
Business: remaining = total − discount − paid. Western digits + ج.م.

FORBIDDEN: regenerate shell; navy/orange; compact 36px rows on this screen; missing dimension fields.
Output: ONE edited frame.
```

---

## 4 — Invoice List (قائمة الفواتير)

**Before paste:** Duplicate §1. Attach **Image IV**. Active nav: **الفواتير**.

### Primary prompt

```
[Paste Shared preamble]

Edit this selected screen only — PIXEL-PRESERVE chrome.
CHROME LOCK: full sidebar + shell + header controls. Active nav: **الفواتير**.
Keep header "فاتورة جديدة" CTA (largest primary, isolated).

Attach reference: Image IV — table/filter layout only; Quiet Ledger colors.

Content: H1 "الفواتير", subtitle "عرض وبحث فواتير البيع".

Toolbar card:
- Search "بحث برقم الفاتورة أو العميل…"
- Filter chips: الكل · اليوم · هذا الأسبوع · هذا الشهر
- Chip: "عليها مديونية" (has debt)
- Smaller primary in toolbar: "فاتورة جديدة" (still smaller than header CTA)

Table columns: رقم الفاتورة · التاريخ · العميل · الإجمالي · المتبقي · الحالة · إجراءات
- Status badges (tinted): محفوظة (success) · ملغاة (danger)
- Numeric columns right-aligned
- Sample: INV-1042 · أحمد محمود · 3,200 ج.م · 800 ج.م remaining

Comfortable density ~52px rows. Zebra stripes surface-muted.
Pagination at bottom.

FORBIDDEN: strip sidebar; mockup colors; status color-only without Arabic label.
Output: ONE edited frame.
```

---

## 5 — Invoice Detail (تفاصيل الفاتورة)

**Before paste:** Duplicate §4 (Invoice List). Attach **Image IV**. Navigate context: opened from list row.

### Primary prompt

```
[Paste Shared preamble]

Edit this selected screen only — PIXEL-PRESERVE chrome.
CHROME LOCK: full shell. Active nav: **الفواتير**.
Attach reference: Image IV.

Content: H1 "فاتورة رقم INV-1042", subtitle "أحمد محمود · 15 مارس 2026".
Goal: Read-only review + actions (print, cancel if allowed).

**Cards (spaced):**
1. Header meta: Status badge "محفوظة" (success tint) · تاريخ · نوع البيع (آجل/نقدي)
2. Line items table (same columns as §3, read-only)
3. Totals card: الإجمالي 3,200 ج.م · الخصم 0 · المدفوع 2,400 ج.م · **المتبقي 800 ج.م** (semibold)
4. Actions row: Secondary "رجوع" · Primary "طباعة" · Primary "حفظ وطباعة" · Danger outline "إلغاء الفاتورة" (destructive, not largest)

Optional: payment history snippet if on-invoice payment recorded.

FORBIDDEN: editable line items on detail unless noted; navy/orange; missing totals row.
Output: ONE edited frame — invoice detail.
```

---

## 6 — Cancel Invoice confirmation (إلغاء الفاتورة)

**Before paste:** Duplicate §5. Attach **Image ID** = §5 screenshot. Select duplicate.

### Primary prompt

```
[Paste Shared preamble]

Edit this selected screen only — PIXEL-PRESERVE chrome.
Attach reference: Image ID (Invoice Detail).
Keep full shell + Invoice Detail page **dimmed** behind warm scrim rgba(23,20,16,0.45).

Add centered Modal (~480px, rounded-xl, surface, subtle elevation):

Title: "إلغاء الفاتورة؟"
Body plain Arabic: "سيتم إلغاء الفاتورة رقم INV-1042 وعكس تأثيرها على المخزون والمديونية. لا يمكن التراجع."
Show impact summary muted: المتبقي 800 ج.م سيعاد للعميل · 3 أصناف ستُعاد للمخزون

Footer: Secondary "تراجع" · Danger solid "إلغاء الفاتورة"

FORBIDDEN: full-page replace; dismiss without two buttons; success green on destructive confirm.
Output: ONE frame with modal — detail dimmed behind.
```

---

## 7 — Customers List (العملاء)

**Before paste:** Duplicate §1. Attach **Image CU**. Active nav: **العملاء**.

### Primary prompt

```
[Paste Shared preamble]

Edit this selected screen only — PIXEL-PRESERVE chrome.
CHROME LOCK: full shell. Active nav: **العملاء**. Keep header فاتورة جديدة CTA.

Attach reference: Image CU — layout only; Quiet Ledger colors.

Content: H1 "العملاء", subtitle "إدارة العملاء والمديونيات".

Summary card at top:
- إجمالي المديونية: **45,200 ج.م** (semibold)
- عدد العملاء المدينين: 12

Toolbar: search "بحث بالاسم أو الهاتف…" · filter chip "عليهم مديونية" · Primary "إضافة عميل" (smaller than header CTA)

Table: الاسم · الهاتف · الرصيد · آخر فاتورة · إجراءات
Balance column rules:
- Normal debt: text-primary semibold, right-aligned, no badge — e.g. 1,200 ج.م
- Attention: warning tint badge "يحتاج متابعة" + amount
- Critical: danger tint badge "متأخر جداً" + amount
Label helper in column header muted: "العميل عليه"

Sample: أحمد محمود · 0100… · 800 ج.م · INV-1042

Comfortable table density. Row click affordance.

FORBIDDEN: all balances shown as red; missing total debt summary; mockup navy.
Output: ONE edited frame.
```

---

## 8 — Customer Detail (تفاصيل العميل)

**Before paste:** Duplicate §7. Attach **Image CU**.

### Primary prompt

```
[Paste Shared preamble]

Edit this selected screen only — PIXEL-PRESERVE chrome.
CHROME LOCK: full shell. Active nav: **العملاء**.
Attach reference: Image CU.

Content: H1 "أحمد محمود", subtitle "01001234567".
Goal: Profile, balance, invoices, record payment entry point.

**Cards (spaced):**
1. Profile: phone · address optional · الرصيد الحالي **800 ج.م** with tier label "العميل عليه" (normal outstanding — no danger color)
2. Actions: Primary "تسجيل دفعة" · Secondary "تعديل" · Ghost "دمج مكرر"
3. Invoices table: رقم الفاتورة · التاريخ · الإجمالي · المتبقي · الحالة
4. Payments history table: التاريخ · المبلغ · طريقة · ملاحظة

Secondary "رجوع للقائمة" top-start.

FORBIDDEN: supplier labels on customer screen; danger color on normal balance.
Output: ONE edited frame — customer detail.
```

---

## 9 — Record Payment modal (تسجيل دفعة)

**Before paste:** Duplicate §8. Attach **Image CD** = §8. Select duplicate.

### Primary prompt

```
[Paste Shared preamble]

Edit this selected screen only. Keep Customer Detail dimmed (Image CD). Warm scrim.

Modal ~520px:

Title: "تسجيل دفعة"
Subtitle muted: "أحمد محمود — الرصيد الحالي 800 ج.م"

Fields:
- المبلغ (required) — numeric, right-aligned, placeholder 800
- التاريخ — date picker default today
- ملاحظة — optional textarea

Helper: "ستُخصم الدفعة من مديونية العميل فور الحفظ."

Footer: Secondary "إلغاء" · Primary "حفظ الدفعة"

FORBIDDEN: full-page form; payment that looks like invoice line item.
Output: ONE frame with modal.
```

---

## 10 — Merge Customers modal (دمج العملاء)

**Before paste:** Duplicate §7. Attach **Image CU**. Select duplicate.

### Primary prompt

```
[Paste Shared preamble]

Edit this selected screen only. Customers list dimmed behind scrim. Image CU reference.

Modal ~560px:

Title: "دمج عملاء مكررين"
Body: Two comboboxes — "العميل الرئيسي (يبقى)" · "العميل المدمج (يُحذف)"
Warning alert (tinted warning): "سيتم نقل كل الفواتير والمديونية للعميل الرئيسي. لا يمكن التراجع."

Footer: Secondary "إلغاء" · Danger "دمج"

FORBIDDEN: merge without warning; primary walnut on destructive merge confirm.
Output: ONE frame with modal.
```

---

## 11 — New Purchase Invoice (فاتورة شراء)

**Before paste:** Duplicate §1. Attach **Image SU** + **Image NI** (supplier header from SU, line items from NI). Active nav: **الموردين**.

### Primary prompt

```
[Paste Shared preamble]

Edit this selected screen only — PIXEL-PRESERVE chrome.
CHROME LOCK: full shell. Active nav: **الموردين**.
Attach: Image SU (supplier context) + Image NI (line-item table pattern). Quiet Ledger colors.

Content: H1 "فاتورة شراء", subtitle "تسجيل مشتريات من مورد".

Card 1 — Supplier: combobox "اختر المورد" · selected "شركة الأخشاب المتحدة"

Card 2 — Line items (like §3): الصنف · الكمية · السعر · الإجمالي · ملاحظة
Dashed إضافة سطر

Card 3 — Totals: الإجمالي · المدفوع · المتبقي (مستحق للمورد)

Actions: Secondary إلغاء · Primary حفظ

Business: increases stock + supplier amount owed on save.

FORBIDDEN: customer sale labels; missing supplier selector.
Output: ONE edited frame.
```

---

## 12 — Purchase Invoice List (فواتير الشراء)

**Before paste:** Duplicate §15 or §1. Attach **Image IV** (list pattern). Active nav: **الموردين**.

### Primary prompt

```
[Paste Shared preamble]

Edit this selected screen only — PIXEL-PRESERVE chrome.
Active nav: **الموردين**. Attach Image IV for list density.

Content: H1 "فواتير الشراء", subtitle "مشتريات الموردين".

Toolbar: search · filter by supplier · filter by date chips
Primary "فاتورة شراء جديدة" (toolbar size)

Table: رقم الفاتورة · التاريخ · المورد · الإجمالي · المتبقي · الحالة
Label context: "مستحق للمورد" in subtitle or column helper muted

Sample rows with Western digits + ج.م.

FORBIDDEN: customer invoice columns only; strip shell.
Output: ONE edited frame.
```

---

## 13 — Inventory / Stock List (المخزون)

**Before paste:** Duplicate §1. Attach **Image ST**. Active nav: **المخزون**.

### Primary prompt

```
[Paste Shared preamble]

Edit this selected screen only — PIXEL-PRESERVE chrome.
Active nav: **المخزون**. Attach Image ST.

Content: H1 "المخزون", subtitle "كميات الأصناف والتنبيهات".

Summary cards: قيمة المخزون (بالتكلفة) · عدد الأصناف · أصناف منخفضة المخزون (warning count)

Toolbar: search "بحث بالصنف…" · chip "منخفض المخزون" · chip "رصيد سالب"

Table: الصنف · الفئة · الكمية · حد إعادة الطلب · آخر حركة · إجراءات
- Negative qty: danger text + badge "رصيد سالب"
- Low stock: warning badge "منخفض" + icon
- Normal: success muted or no badge

Row action ghost: "تعديل الرصيد" → opens §14

FORBIDDEN: rainbow stock colors; missing low-stock warning column.
Output: ONE edited frame.
```

---

## 14 — Manual Stock Adjustment modal (تعديل الرصيد)

**Before paste:** Duplicate §13. Attach Image ST = §13.

### Primary prompt

```
[Paste Shared preamble]

Edit this selected screen only. Stock list dimmed. Image ST reference.

Modal ~520px:

Title: "تعديل رصيد يدوي (جرد)"
Fields:
- الصنف (read-only) MDF 18mm
- الكمية الحالية (read-only) 42
- التعديل (+/−) numeric
- الكمية الجديدة (computed preview)
- السبب (required textarea) — placeholder "جرد فعلي — فرق في العد"

Warning muted: "يُسجل التعديل في سجل المراجعة."

Footer: Secondary إلغاء · Primary حفظ التعديل

FORBIDDEN: silent adjustment without reason field.
Output: ONE frame with modal.
```

---

## 15 — Suppliers List (الموردين)

**Before paste:** Duplicate §1. Attach **Image SU**. Active nav: **الموردين**.

### Primary prompt

```
[Paste Shared preamble]

Edit this selected screen only — PIXEL-PRESERVE chrome.
Active nav: **الموردين**. Attach Image SU.

Content: H1 "الموردين", subtitle "إدارة الموردين والمستحقات".

Summary: إجمالي المستحق للموردين **28,500 ج.م**

Toolbar: search · Primary "إضافة مورد"

Table: الاسم · الهاتف · المستحق · آخر شراء · إجراءات
Balance label: "مستحق للمورد" — never use customer debt labels
Tier rules same as customers (normal / warning / danger)

FORBIDDEN: العميل عليه label; mockup colors.
Output: ONE edited frame.
```

---

## 16 — Supplier Detail (تفاصيل المورد)

**Before paste:** Duplicate §15. Attach **Image SU**.

### Primary prompt

```
[Paste Shared preamble]

Edit this selected screen only — PIXEL-PRESERVE chrome.
Active nav: **الموردين**. Attach Image SU.

Content: H1 "شركة الأخشاب المتحدة", subtitle phone.

Cards:
1. Profile + المستحق **15,200 ج.م** — label "مستحق للمورد"
2. Purchase invoices table (see §17 for expanded history)
3. Actions: Secondary تعديل · رجوع

FORBIDDEN: customer terminology; missing owed amount prominence.
Output: ONE edited frame.
```

---

## 17 — Supplier Purchase History (سجل المشتريات)

**Before paste:** Duplicate §16. Attach Image SD = §16. Expand purchase history section.

### Primary prompt

```
[Paste Shared preamble]

Edit this selected screen only — PIXEL-PRESERVE chrome.
Active nav: **الموردين**. Image SD reference.

Same supplier detail shell as §16 — emphasize **سجل فواتير الشراء** card:

Full-width table: رقم الفاتورة · التاريخ · الإجمالي · المتبقي · الحالة
Filter: date range · status
Link row → purchase invoice detail (placeholder)

Optional section below: ملخص المشتريات آخر 90 يوم

FORBIDDEN: sales invoice columns mixed without labels.
Output: ONE edited frame — purchase history focus.
```

---

## 18 — Items & Pricing (الأصناف والأسعار)

**Before paste:** Duplicate §1. Attach **Image PR**. Active nav: **الأصناف والأسعار**.

### Primary prompt

```
[Paste Shared preamble]

Edit this selected screen only — PIXEL-PRESERVE chrome.
Active nav: **الأصناف والأسعار**. Attach Image PR.

Content: H1 "الأصناف والأسعار", subtitle "الفئات والأسعار وسعر المتر المرجعي".

Card: سعر متر الخشب البلدي المرجعي — editable field 1,250 ج.م + helper muted

Grouped sections by category (accordion or stacked cards):
- **MDF**: table الصنف · وحدة البيع (قطعة/م³) · السعر · التكلفة · إجراءات
- **خشب بلدي**
- **ألواح**

Toolbar per section or global: search · Primary "إضافة صنف"

Row actions: تعديل · سجل الأسعار (→ §20)

FORBIDDEN: flat list without categories; missing pricing mode column.
Output: ONE edited frame.
```

---

## 19 — Add / Edit Item (إضافة صنف)

**Before paste:** Duplicate §18. Attach **Image PR**. Can be modal on §18 or full page card.

### Primary prompt

```
[Paste Shared preamble]

Edit this selected screen only — PIXEL-PRESERVE chrome.
Active nav: **الأصناف والأسعار**. Attach Image PR.

Content: H1 "إضافة صنف" (or "تعديل صنف"), subtitle "بيانات الصنف والتسعير".

Form card (comfortable spacing 20px between fields):
- الاسم (required)
- الفئة — select MDF / خشب بلدي / ألواح
- وحدة البيع — segmented: **بالقطعة** | **بالمتر المكعب**
- السعر · التكلفة — numeric right-aligned ج.م
- حد إعادة الطلب — optional number
Helper when م³: "ستظهر حقول السماكة والعرض والطول في الفاتورة"

Actions: Secondary إلغاء · Primary حفظ

FORBIDDEN: missing pricing mode toggle; compact 32px inputs.
Output: ONE edited frame — form focus.
```

---

## 20 — Price History (سجل الأسعار)

**Before paste:** Duplicate §18. Attach **Image PR**.

### Primary prompt

```
[Paste Shared preamble]

Edit this selected screen only — PIXEL-PRESERVE chrome.
Active nav: **الأصناف والأسعار**.

Content: H1 "سجل الأسعار — MDF 18mm", subtitle "تغييرات السعر والتكلفة (للقراءة فقط)".

Read-only table: التاريخ · النوع (سعر/تكلفة) · القيمة السابقة · القيمة الجديدة · بواسطة
Append-only log aesthetic — no edit/delete row actions

Secondary رجوع للأصناف

FORBIDDEN: editable history rows; missing user attribution column.
Output: ONE edited frame.
```

---

## 21 — Audit Log (سجل المراجعة)

**Before paste:** Duplicate §1. Attach **Image IV** for table density. No sidebar item yet — use **الرئيسية** active or add muted future nav row "سجل المراجعة" only if it fits product plan; prefer **الرئيسية** active with audit as main content.

### Primary prompt

```
[Paste Shared preamble]

Edit this selected screen only — PIXEL-PRESERVE chrome.
CHROME LOCK: full shell. Active nav: **الرئيسية** (audit accessed from settings/menu context — subtitle explains).
Attach Image IV for table pattern.

Content: H1 "سجل المراجعة", subtitle "سجل للقراءة فقط — كل العمليات الحساسة".

Filters card: المستخدم · نوع الإجراء · الكيان · من تاريخ · إلى تاريخ · تطبيق

Read-only table: التاريخ · المستخدم · الإجراء · الكيان · التفاصيل
Sample actions: إنشاء فاتورة · إلغاء فاتورة · تعديل سعر · تعديل رصيد · تسجيل دفعة

Badge info/success/warning/danger by action severity — always with Arabic label.

No create button. No row actions.

FORBIDDEN: edit/delete; missing filter row.
Output: ONE edited frame.
```

---

## 22 — Users / Admins (المستخدمين)

**Before paste:** Duplicate §1. Attach **Image US**. Active nav: **المستخدمين**.

### Primary prompt

```
[Paste Shared preamble]

Edit this selected screen only — PIXEL-PRESERVE chrome.
Active nav: **المستخدمين** (super-admin screen). Attach Image US.

Content: H1 "المستخدمين", subtitle "إدارة حسابات المشرفين (مدير عام فقط)".

Toolbar: Primary "إضافة مشرف"

Table: اسم المستخدم · الدور · الحالة · تاريخ الإنشاء · آخر تعديل · إجراءات
Roles: مدير عام · مشرف
Status badges: نشط (success tint) · غير نشط (danger tint)
Actions: تعطيل / تفعيل — no action on مدير عام row (muted "—")

FORBIDDEN: customer-facing copy; missing role column.
Output: ONE edited frame.
```

---

## 23 — Create Admin modal (إضافة مشرف)

**Before paste:** Duplicate §22. Attach **Image US**.

### Primary prompt

```
[Paste Shared preamble]

Edit this selected screen only. Users list dimmed. Image US reference.

Modal ~480px OR inline card on §22 (prefer modal):

Title: "إضافة مشرف جديد"
Fields:
- اسم المستخدم (required)
- كلمة المرور (required) + helper "8 أحرف على الأقل"

Footer: Secondary إلغاء · Primary إنشاء الحساب

FORBIDDEN: role selector for super_admin creation on this form (only admin role).
Output: ONE frame with modal.
```

---

## 24 — Access Denied (غير مصرح)

**Before paste:** Duplicate §1. Active nav: any — content shows denial.

### Primary prompt

```
[Paste Shared preamble]

Edit this selected screen only — PIXEL-PRESERVE chrome.
CHROME LOCK: full shell preserved.

Content: H1 "غير مصرح", subtitle "ليس لديك صلاحية لهذه الصفحة".

Single card centered in main area:
Muted body: "هذه الصفحة متاحة لمدير النظام فقط. تواصل مع مدير المحل إذا كنت تحتاج صلاحية."
Primary "العودة للرئيسية"

No aggressive error illustration. Calm operational tone.

FORBIDDEN: strip shell; full-page red error.
Output: ONE edited frame.
```

---

## 25 — Invoice List — empty state (لا توجد فواتير)

**Before paste:** Duplicate §4. Attach **Image IV**. Replace table with empty state.

### Primary prompt

```
[Paste Shared preamble]

Edit this selected screen only — PIXEL-PRESERVE chrome.
Active nav: **الفواتير**. Attach Image IV.

Same shell and toolbar as §4 but filters show "لا نتائج".

Main content: Empty state card (dashed border, surface-muted background):
- Title: "لا توجد فواتير"
- Description: "ابدأ بإنشاء أول فاتورة بيع."
- Primary "فاتورة جديدة"

Toolbar search can show empty query state.

FORBIDDEN: blank white void without message; missing CTA.
Output: ONE edited frame — empty list variant.
```

---

## 26 — Invoice PDF / Print preview (معاينة الطباعة)

**Before paste:** Duplicate §5. Attach **Image ID**.

### Primary prompt

```
[Paste Shared preamble]

Edit this selected screen only. Invoice detail dimmed or split view.

Add print preview panel (modal large ~80% width or slide-over):

Title bar: "معاينة الفاتورة" · actions: Secondary إغلاق · Primary طباعة

Preview content (A4 proportion, white, printable):
- Shop header: المحمدية · address placeholder
- Invoice INV-1042 · date · customer
- Line items table · totals · remaining
- Footer muted: "شكراً لتعاملكم معنا"

Preview uses same Quiet Ledger typography — print-friendly black on white inside preview only.

FORBIDDEN: Bitrix invoice layout; missing totals.
Output: ONE frame with preview overlay.
```

---

## 27 — WhatsApp share sheet (مشاركة عبر واتساب)

**Before paste:** Duplicate §5. Attach **Image ID**.

### Primary prompt

```
[Paste Shared preamble]

Edit this selected screen only. Invoice detail dimmed.

Small bottom sheet or modal (~400px):

Title: "مشاركة الفاتورة"
Body: "إرسال رابط PDF عبر واتساب إلى:"
Phone input with country code +20 · placeholder 01001234567
Preview link muted: wa.me/… 

Footer: Secondary إلغاء · Primary "فتح واتساب" (primary walnut)

FORBIDDEN: auto-send without showing number; full-page replace.
Output: ONE frame with share sheet.
```

---

## 28 — Dark mode second-pass checklist

**Not a Stitch generate prompt** — use after all light-mode §1–§27 are signed off.

```
Al-Mohamadia dark mode — Quiet Ledger derived tokens (DESIGN-SYSTEM.md §2):

Duplicate each signed-off light frame → apply dark tokens:
- background #171410 · surface #211D17 · surface-muted #1C1812 · border #3A3226
- text-primary #F2EBDF · text-secondary #C6BBA9 · text-muted #928879
- primary #CB9A65 · primary-hover #DDB183 · primary-foreground #1A1510
- focus-ring #E8B87F (lighter than primary for contrast)
- Semantic: success #5FBB80 · warning #D9A854 · danger #E27567 · info #79ADD9

Validate per screen:
[ ] Sidebar + main panel contrast and border visibility
[ ] Table zebra stripes and badge tints readable
[ ] Warning/danger balances not over-saturated
[ ] Primary CTA فاتورة جديدة still most prominent
[ ] Chart series still primary + neutrals (no rainbow)
[ ] Modal scrim and focus rings visible
[ ] 14px minimum font size maintained

Do NOT mechanical invert. Review Dashboard, New Invoice, Invoice List, Customers, Inventory first.
```

---

## Journey glue (optional)

After P0 screens (§1–§5, §7, §13, §15, §18, §22), duplicate frames in Stitch to verify:

1. Dashboard → فاتورة جديدة (§3) via header CTA  
2. §3 Save → §4 list → row → §5 detail  
3. §7 customer row → §8 → §9 payment modal  
4. §13 low stock row → §14 adjustment  

Reject any frame where sidebar nav count ≠ 8 or shell gap disappears.
