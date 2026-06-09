# Product

## Register

product

## Users

Platform operators and integration engineers who manage a multi-tenant integration hub day to day. Primary personas:

- **Super Admin** — oversees all tenants, system health, provider catalog, and platform settings
- **Ops Manager** — monitors executions, DLQ, circuit breakers, and failure trends across tenants
- **Integration Engineer** — configures connections, designs integration flows, and troubleshoots failed runs

They work at desks, often with multiple monitors, under operational pressure. Sessions are long, task-focused, and interruption-heavy. They need dense information, fast scanning, and clear status at a glance.

## Product Purpose

CommerceOne Integration Hub Admin Portal is the control plane for an enterprise integration platform. It stores metadata only (providers, connections, integrations, executions) and is not an OMS, WMS, ERP, or CRM.

Success means operators can onboard tenants, configure connections, design flows, monitor executions, triage DLQ records, and adjust platform policies without leaving the portal. The UI must feel like a real operations tool, not a demo dashboard.

## Brand Personality

**Precise. Dense. Trustworthy.**

Voice is direct and operational: labels say what happens, statuses are scannable, numbers are exact. The interface favors clarity over decoration. Confidence comes from information architecture and consistent patterns, not marketing language or visual flair.

Reference feel (specific qualities, not copies):

- **Datadog** — metric density, trend charts, status color coding, operational urgency without chaos
- **AWS Console** — hierarchical navigation, service-oriented tables, restrained blue accent on neutral chrome
- **Atlassian Admin** — tabbed detail views, wizards for setup flows, audit trail visibility
- **Linear** — tight spacing, crisp typography, minimal chrome, fast perceived performance

## Anti-references

- Generic SaaS landing-page aesthetics inside the app (hero metrics, gradient accents, oversized empty space)
- Consumer-style dashboards with identical icon + heading + blurb card grids
- Warm cream/sand body backgrounds and muted gray body text that fails contrast
- Marketing buzzwords in UI copy ("seamless", "enterprise-grade", "next-generation")
- Decorative motion, glassmorphism, or gradient text used for visual interest alone
- Side-stripe accent borders on cards and alerts
- Tiny uppercase tracked eyebrows above every section heading

## Design Principles

1. **Operations first** — every screen answers "what is the state?" and "what do I do next?" before anything else
2. **Density with hierarchy** — show more data per screen than a marketing site, but use scale, weight, and color to guide the eye
3. **Status is sacred** — execution states, connection health, circuit breaker states, and DLQ severity must be instantly readable via consistent badges and color
4. **Progressive depth** — list → detail → timeline/logs; never force users through modals for information they need repeatedly
5. **Production posture** — forms validate, empty states explain next steps, wizards have clear step progress, errors are specific

## Accessibility & Inclusion

- Target **WCAG 2.1 AA** for all operator-facing surfaces
- Status must never rely on color alone; badges include text labels
- Body text contrast ≥ 4.5:1 against backgrounds; large text ≥ 3:1
- All interactive controls keyboard-reachable with visible focus states
- Respect `prefers-reduced-motion`; no content gated behind entrance animations
- Tables and charts need readable labels; dense data views should remain usable at 200% zoom
