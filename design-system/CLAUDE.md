# Mai design system — rules for generated UI

Anything you build for Mai's web app follows this file. It is the contract, not a suggestion.

## Hard rules

1. **Never invent a color.** Every color comes from a custom property in `design-system/styles.css`. If you need a value that isn't there, stop and ask — do not add a hex literal.
2. **One accent per view.** `--mq-accent` (#FF4FA3) marks the single thing the user should act on. Exactly one *filled* accent element per screen. Everything else is outline, secondary, or quiet.
3. **`--mq-over` (#D2596C) is only for over budget.** It is not a general error color. Form errors are one plain hint line in `--mq-text-3`, never red.
4. **Every write asks first.** Any change to money — a budget, a category, a recurring item — renders a `ConfirmCard` (before → after) or an `AgentNote` with actions, and does nothing until the primary action is pressed. Read-only answers need no gate.
5. **Plus Jakarta Sans only**, via `--mq-font`. No second family.
6. **Minimums:** body text never below 14px, tap targets never below 44px.
7. **Layout uses flex/grid with `gap`.** No margin-based spacing between siblings.

## Tokens

`design-system/styles.css` is the source of truth. Import it once at the app root. Use the custom properties directly (`var(--mq-surface-raised)`) — do not duplicate the values into a JS theme object, a Tailwind config, or a second stylesheet.

Groups: surfaces (`--mq-bg`, `--mq-surface`, `--mq-surface-raised`, `--mq-field`, `--mq-field-focus`, `--mq-surface-accent`, `--mq-hover`, `--mq-bubble`), accent (`--mq-accent`, `--mq-accent-ink`, `--mq-accent-tint`, `--mq-accent-border`), signal (`--mq-over` over budget/breakeven, `--mq-good`/`--mq-good-tint`/`--mq-good-border` money in or under budget, `--mq-savings` the savings slice of the income breakdown), ink ramp (`--mq-text` → `--mq-text-6`), lines (`--mq-border`, `--mq-border-2`, `--mq-border-3`, `--mq-fill`, `--mq-track`), radii (`--mq-r-xs` → `--mq-r-xl`, `--mq-r-pill`), shadows, type scale.

`--mq-good`/`--mq-savings` are status colors for the Recurring page's income/spend breakdown (data-viz slices, not interactive affordances) — they don't count against rule 2's "one filled accent" any more than `--mq-over` does on `BudgetBar`.

## Components

`design-system/types/*.d.ts` are the prop contracts. Match these signatures exactly — same names, same unions. If a screen needs a variant that isn't in the union, add it to the `.d.ts` in the same change, don't pass a one-off style prop.

| Component | Use for |
|---|---|
| `Logo` | Mark + wordmark. |
| `Button` | All actions. `primary` is the one filled element; `quiet` for toolbar actions. |
| `Pill` | Eyebrow marker above a hero. |
| `Field` | Text input. 54px, flat; accent border **only** on focus. |
| `Card` | Panel surface. `accent` is reserved for the agent. `flush` for row lists. |
| `StatCard` | One figure + one plain-English consequence. |
| `TransactionRow` | Merchant, "Category · time", amount. `past` dims earlier days. |
| `BudgetBar` | Spent vs limit; switches to `--mq-over` when over. |
| `NavItem` | Sidebar row and `collapsed` 68px rail. The accent dot is reserved for Ask Mai. |
| `AgentNote` | In-page agent suggestion with its confirm gate. |
| `ChatBubble` | `user` gets a container; `agent` talks bare with an optional status line. |
| `ConfirmCard` | Before → after for any write. |
| `Tooltip` | Labels for the collapsed rail. |
| `Menu` | Account menu. `"-"` renders a divider. |
| `Avatar` | Tinted initial. Never a photo. |

`design-system/reference/*.jsx` shows intended structure and exact values. **It is reference, not production code** — inline styles, no tests, no a11y wiring. Reimplement in this codebase's own component conventions; keep the values.

## Layout

- Sidebar **252px** expanded / **68px** rail. Collapsed state is a cookie read server-side so there's no flash of the wrong width.
- Breakpoints: **≥1280** sidebar expanded, 3-col grid · **1024–1279** rail, 3-col stats + stacked panels · **768–1023** rail, 2-col · **<768** rail is replaced by the mobile pill nav, 1-col.
- Nothing is dropped at narrow widths — views reorder and stack. The one exception: landing nav links collapse into a menu button below 1024.
- Chat threads cap at **720px** regardless of window width.
- Card padding steps 24 → 20 → 18. Radii never change with width.

## Voice

Say the number, then what it means. "You're at €310 since Monday. Dining is doing what dining does." Never a metric without a consequence, never a dashboard sentence. The agent is direct and slightly dry, never congratulatory.
