---
name: CommerceOne Integration Hub
description: Dense, operations-first admin console for multi-tenant integration control
colors:
  primary: "oklch(0.45 0.18 260)"
  primary-foreground: "oklch(0.99 0 0)"
  primary-subtle: "oklch(0.94 0.04 260)"
  primary-subtle-foreground: "oklch(0.35 0.12 260)"
  background: "oklch(0.99 0.002 240)"
  foreground: "oklch(0.15 0.02 240)"
  card: "oklch(1 0 0)"
  card-foreground: "oklch(0.15 0.02 240)"
  muted: "oklch(0.96 0.008 240)"
  muted-foreground: "oklch(0.5 0.02 240)"
  border: "oklch(0.91 0.01 240)"
  input: "oklch(0.91 0.01 240)"
  ring: "oklch(0.55 0.15 260)"
  destructive: "oklch(0.577 0.245 27.325)"
  destructive-subtle: "oklch(0.94 0.04 25)"
  destructive-subtle-foreground: "oklch(0.45 0.15 25)"
  success: "oklch(0.55 0.15 155)"
  success-subtle: "oklch(0.94 0.04 155)"
  success-subtle-foreground: "oklch(0.35 0.1 155)"
  warning: "oklch(0.65 0.16 55)"
  warning-subtle: "oklch(0.94 0.05 55)"
  warning-subtle-foreground: "oklch(0.4 0.12 55)"
  info: "oklch(0.45 0.18 260)"
  info-subtle: "oklch(0.94 0.04 260)"
  info-subtle-foreground: "oklch(0.35 0.12 260)"
  link: "oklch(0.45 0.18 260)"
  link-hover: "oklch(0.38 0.16 260)"
  chart-success: "oklch(0.55 0.15 155)"
  chart-failed: "oklch(0.577 0.245 27.325)"
  chart-retry: "oklch(0.65 0.16 55)"
  chart-dlq: "oklch(0.55 0.18 300)"
  chart-primary: "oklch(0.45 0.18 260)"
typography:
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.33
    letterSpacing: "0.01em"
rounded:
  sm: "0.3rem"
  md: "0.4rem"
  lg: "0.5rem"
  xl: "0.7rem"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.lg}"
    padding: "0.625rem 1rem"
    height: "2rem"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.lg}"
    padding: "0.625rem 1rem"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "0.625rem 1rem"
    height: "2rem"
  button-ghost:
    backgroundColor: "{colors.background}"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.lg}"
    padding: "0.625rem 1rem"
  input-default:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    height: "2rem"
    padding: "0.25rem 0.625rem"
  nav-active:
    backgroundColor: "{colors.primary-subtle}"
    textColor: "{colors.primary-subtle-foreground}"
    rounded: "{rounded.md}"
    padding: "0.375rem 0.75rem"
  status-badge-success:
    backgroundColor: "{colors.success-subtle}"
    textColor: "{colors.success-subtle-foreground}"
    rounded: "{rounded.lg}"
    padding: "0.125rem 0.5rem"
  card-default:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.xl}"
    padding: "1rem"
---

# Design System: CommerceOne Integration Hub

## 1. Overview

**Creative North Star: "The Control Plane"**

CommerceOne Integration Hub is an operations console, not a marketing surface. The visual system exists to help platform operators scan state, triage failures, and configure integrations under pressure. Density is a feature: tables carry real data, charts encode execution health, and navigation stays shallow so engineers can move from tenant list to DLQ record in two clicks.

The aesthetic inherits the restrained confidence of Datadog and AWS Console: cool neutral chrome, a single indigo-blue accent used sparingly, and semantic color reserved for status. Decoration never competes with data. What this system explicitly rejects: generic SaaS landing-page aesthetics inside the app, consumer card grids, warm cream backgrounds, and visual flair that does not encode operational meaning.

**Key Characteristics:**

- Cool-tinted neutral surfaces with one indigo-blue primary accent (hue 260)
- Semantic status colors (success, warning, destructive, info) on subtle tinted backgrounds
- Geist sans for UI copy, Geist Mono for codes, IDs, and status labels
- Flat-by-default elevation; depth via borders and tonal layering, not heavy shadows
- 8px base radius (`0.5rem`) on interactive controls; slightly larger on cards
- WCAG 2.1 AA contrast targets on all operator-facing text

## 2. Colors: The Operations Palette

A cool, slightly blue-tinted neutral foundation with a disciplined indigo accent and a full semantic status vocabulary. All tokens are defined in OKLCH in `src/app/globals.css`.

### Primary

- **Control Plane Indigo** (`oklch(0.45 0.18 260)`): Primary CTAs, logo mark, active chart series, focus rings. Used on ≤10% of any screen. Never as a page background.
- **Primary on Accent** (`oklch(0.99 0 0)`): Text and icons on primary-filled surfaces.
- **Active State Wash** (`oklch(0.94 0.04 260)` / foreground `oklch(0.35 0.12 260)`): Top-nav active items, wizard step selections, tenant tab indicators. Signals "you are here" without full primary fill.

### Secondary

- **Secondary Surface** (`oklch(0.96 0.01 240)` / foreground `oklch(0.25 0.04 240)`): Secondary buttons, low-emphasis actions, badge fallbacks for in-progress states.

### Tertiary

- **Info Signal** (`oklch(0.45 0.18 260)` on `oklch(0.94 0.04 260)`): Running executions, active pipeline stages, timeline active nodes. Shares hue with primary but applied as subtle fill, not solid accent.

### Neutral

- **Console Background** (`oklch(0.99 0.002 240)`): Page canvas. Cool near-white, not warm cream.
- **Ink** (`oklch(0.15 0.02 240)`): Primary body text, headings, table cell values.
- **Card Surface** (`oklch(1 0 0)`): Elevated panels, stat cards, wizard review blocks.
- **Muted Fill** (`oklch(0.96 0.008 240)`): Input backgrounds, hover states, secondary chrome.
- **Muted Label** (`oklch(0.5 0.02 240)`): Column headers, descriptions, timestamps. Must meet 4.5:1 on background; never lighter.
- **Divider** (`oklch(0.91 0.01 240)`): Borders, table rules, card rings at 10% foreground opacity.

### Semantic Status

- **Healthy Green** (`oklch(0.55 0.15 155)` / subtle `oklch(0.94 0.04 155)`): COMPLETED, HEALTHY, ACTIVE, success trends in charts.
- **Alert Amber** (`oklch(0.65 0.16 55)` / subtle `oklch(0.94 0.05 55)`): QUEUED, RETRY_PENDING, WARNING, retry chart series.
- **Failure Red** (`oklch(0.577 0.245 27.325)` / subtle `oklch(0.94 0.04 25)`): FAILED, ERROR, DLQ, OPEN circuit breakers.
- **DLQ Violet** (`oklch(0.55 0.18 300)`): DLQ-specific chart series only; not a general UI accent.

### Named Rules

**The Status Is Sacred Rule.** Semantic colors appear only on status badges, chart series, timeline nodes, pipeline stages, and error messages. Never use success green or failure red for decorative emphasis or navigation.

**The One Accent Rule.** Primary indigo is for CTAs, links, logo mark, and active navigation. If more than ~10% of a viewport reads as primary blue, the screen is over-branded.

**The No Cream Rule.** Backgrounds stay cool-tinted near-white or true dark gray in dark mode. Warm sand, beige, and parchment tones are prohibited.

## 3. Typography

**Display Font:** Geist (with ui-sans-serif, system-ui fallback)
**Body Font:** Geist (same stack; no separate display face)
**Label/Mono Font:** Geist Mono (with ui-monospace fallback)

**Character:** Technical and crisp. Geist's geometric clarity supports dense tables and small labels without feeling cold. Mono is reserved for operational identifiers (tenant codes, execution IDs, integration codes, status badges) where character-level distinction matters.

### Hierarchy

- **Display** (600, 1.5rem / 24px, line-height 1.25): Page titles on tenant detail and dashboard section headers.
- **Headline** (600, 1.25rem / 20px, line-height 1.3): Card titles, wizard step headings, dialog titles.
- **Title** (500, 1rem / 16px, line-height 1.4): Table column group labels, stat card titles, tab labels.
- **Body** (400, 0.875rem / 14px, line-height 1.5): Default UI text, table cells, form labels, descriptions. Max line length 65–75ch in prose blocks.
- **Label** (500, 0.75rem / 12px, Geist Mono, letter-spacing 0.01em): Status badges, metadata timestamps, code snippets.

### Named Rules

**The Mono for Meaning Rule.** Geist Mono is for codes, IDs, statuses, and configuration keys. Never set body paragraphs in mono.

**The No Eyebrow Rule.** Do not add tiny uppercase tracked labels above every section. Section titles are sentence case, medium weight, and stand on their own.

## 4. Elevation

This system is flat by default. Depth is conveyed through tonal layering (background → card → muted inset), 1px borders at 60% opacity, and subtle ring outlines (`ring-1 ring-foreground/10`) on cards. Heavy drop shadows are not part of the vocabulary.

Stat cards and dashboard panels may use `shadow-sm` for a barely perceptible lift. The sticky top nav uses backdrop blur (`bg-background/95 backdrop-blur`) to separate chrome from scrolling content without a shadow stack.

### Shadow Vocabulary

- **Ambient lift** (`0 1px 2px 0 rgb(0 0 0 / 0.05)`): Stat cards, chart containers. Optional; border alone is acceptable.
- **No structural shadows.** Modals and dialogs rely on overlay scrim and border, not deep elevation.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadow appears only on optional dashboard cards, never on tables, nav, or form fields.

**The Border Not Stripe Rule.** Dividers are full-width 1px borders or ring outlines. Colored left-border accent stripes on cards and alerts are prohibited.

## 5. Components

Operational primitives built on shadcn/ui + Tailwind v4. Shape language is consistently rounded (8px base, 12px on cards).

### Buttons

- **Shape:** Gently rounded (8px / `rounded-lg`), compact height 32px default, 44px minimum on mobile CTAs (`min-h-11`).
- **Primary:** Control Plane Indigo fill, white text, hover at 80% opacity. Used for main wizard actions and creation flows.
- **Outline:** Background fill, border divider, hover to muted. Cancel and secondary actions.
- **Ghost:** No fill; muted text, hover to muted background. Table row actions, icon buttons.
- **Destructive:** Destructive red at 10% fill, red text. Delete and irreversible actions only.
- **Hover / Focus:** `transition-all`; focus ring 3px at `ring/50` opacity. Active state: 1px translate-y press on non-popup buttons.

### Status Badges (Chips)

- **Style:** Pill shape (`rounded-4xl`), Geist Mono 12px, semantic subtle backgrounds with matching foreground.
- **State mapping:** Success states → green subtle; in-progress → info or warning subtle; failure → destructive subtle; unknown → outline.
- **Rule:** Badge text always spells the status (e.g. `FAILED`, `RUNNING`). Color never carries meaning alone.

### Cards / Containers

- **Corner Style:** 12px (`rounded-xl`).
- **Background:** White card surface on console background.
- **Shadow Strategy:** Optional `shadow-sm`; default is ring outline only.
- **Border:** `ring-1 ring-foreground/10` or `border-border/60`.
- **Internal Padding:** 16px (`--card-spacing: 1rem`).

### Inputs / Fields

- **Style:** 8px radius, 1px input border, transparent or muted/40 background in search contexts.
- **Focus:** Border shifts to ring color, 3px focus ring at 50% opacity.
- **Error:** Destructive border + ring; inline error text at 12px destructive color with `role="alert"`.
- **Disabled:** 50% opacity, input/50 background.

### Navigation

- **Top nav:** Sticky, 56px height, horizontal link row with icon + label. Active: primary-subtle fill. Inactive: muted-foreground, hover to foreground + muted/60.
- **Tenant tabs:** Bottom border indicator. Active tab: 2px primary bottom border + primary-subtle-foreground text. Horizontal scroll on narrow viewports.
- **Mobile:** Nav labels remain visible; search collapses below `md`. Touch targets ≥44px on primary actions.

### Data Tables

- **Desktop:** Horizontal scroll region with labeled columns, focusable rows via `rowHref`.
- **Mobile:** Card layout with labeled fields per row; `hideOnMobile` for low-priority columns.
- **Character:** Dense, scannable, no zebra striping. Status column always uses StatusBadge.

### Wizards

- **Progress:** Horizontal step bar, 4px height segments, primary fill for completed/current steps.
- **Validation:** Per-step Zod validation, inline field errors, server-side re-validation on submit.
- **Review step:** Definition list layout on muted/40 background before final action.

## 6. Do's and Don'ts

Concrete guardrails for AI agents and engineers extending this portal.

### Do:

- **Do** use semantic status tokens (`success-subtle`, `warning-subtle`, `destructive-subtle`) for badges, charts, timelines, and pipeline stages.
- **Do** keep primary indigo on CTAs, links, logo, and active nav only.
- **Do** use Geist Mono for tenant codes, execution IDs, integration codes, and status labels.
- **Do** validate forms with Zod + React Hook Form; show specific inline errors near fields.
- **Do** design tables for density: more rows visible, clear column headers, responsive card fallback on mobile.
- **Do** respect `prefers-reduced-motion`; gate no content behind entrance animations.
- **Do** maintain WCAG AA contrast: body text ≥4.5:1, large text ≥3:1.

### Don't:

- **Don't** use generic SaaS landing-page aesthetics inside the app (hero metrics, gradient accents, oversized empty space).
- **Don't** build consumer-style dashboards with identical icon + heading + blurb card grids.
- **Don't** use warm cream/sand body backgrounds or muted gray body text that fails contrast.
- **Don't** use marketing buzzwords in UI copy ("seamless", "enterprise-grade", "next-generation").
- **Don't** add decorative motion, glassmorphism, or gradient text for visual interest alone.
- **Don't** use side-stripe accent borders on cards and alerts.
- **Don't** add tiny uppercase tracked eyebrows above every section heading.
- **Don't** hard-code Tailwind color utilities (`blue-600`, `emerald-600`, hex values) in components; use design tokens from `globals.css`.
- **Don't** rely on color alone for status; every status indicator includes a text label.
