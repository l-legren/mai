@AGENTS.md

# Accessibility

All interactive and informational UI in the app must be accessible to screen readers (VoiceOver on iOS, TalkBack on Android).

## Rules

- Every `Pressable` must have `accessibilityRole` (`"button"` or `"link"`) and a meaningful `accessibilityLabel` that describes the action, not just the visual content.
- Stateful controls (toggles, checkboxes, segmented filters) must use `accessibilityState` — e.g. `{{ selected: true }}`.
- Decorative views (glow bars, dividers, corner marks, icon arrows) must be hidden from AT with both:
  - `importantForAccessibility="no-hide-descendants"` (Android)
  - `accessibilityElementsHidden={true}` (iOS)
  - Use `"no"` instead of `"no-hide-descendants"` for leaf nodes with no children.
- Avoid Unicode symbols (▲ ▶ ◀ ● ○) as the sole content of an element — screen readers read them as their Unicode name. Hide the Text with `importantForAccessibility="no"` / `accessibilityElementsHidden` and put the label on the parent container.
- Stat/data boxes should use `accessible={true}` + `accessibilityLabel` on the container (e.g. `"Daily allowance: €40"`) and hide child Text nodes individually so VoiceOver reads the group as one unit.
- Images that convey meaning need `accessibilityLabel`; purely decorative images use `accessibilityElementsHidden={true}`.
- Custom gesture interactions that aren't screen-reader friendly (e.g. the resisted-scroll balance reveal) must provide an AT-only fallback action.
- **Semantic structure:** every screen/section/sheet title Text must set `accessibilityRole="header"` so the rotor/heading navigation can jump between sections. Roles beyond `"button"`/`"link"` matter — use them.
- **Adjustable controls** (sliders, steppers) must set `accessibilityValue={{ min, max, now, text }}`, where `text` is the human-readable value (e.g. the formatted `€` amount) — a bare number is not enough.
- **Minimum touch target 44×44 (WCAG 2.5.5):** any interactive element whose visual box is smaller (icon buttons, chevrons, trailing actions) must grow its touch area with `hitSlop` to reach 44px. Compute it from the icon size (`(44 - iconSize) / 2`) rather than guessing.
- **Manage visibility of inactive content:** content that is mounted but off-screen or behind another page (paged/animated reveals, collapsed panels that stay mounted) must toggle `accessibilityElementsHidden` / `importantForAccessibility` in step with its visible state, so AT can't wander into hidden UI. This is distinct from decorative hiding above — it's a real, focusable region that is temporarily inactive.
- **No double announcement:** never set an `accessibilityLabel` that duplicates a visible label already in the AT tree (e.g. a `TextField`'s visible label + the input's own label). Keep one side accessible and hide the other with `importantForAccessibility="no"` / `accessibilityElementsHidden`.
- **Never let a placeholder/sentinel glyph reach a screen reader.** Empty-state or fallback values (`—`, `•`, `--`) that stand in for "no value" must resolve to a worded label ("No amount entered yet"), not be interpolated into an `accessibilityLabel` where they'd be read as the glyph's Unicode name.
- **Data visualizations need a text alternative (WCAG 1.1.1).** This rule is not limited to `<Image>` — charts, graphs, bars, and sparklines convey meaning visually and are invisible to AT. Build an i18n summary string from the underlying data (e.g. `"Daily spend: Mon €12, Tue €0…"`), put it as the `accessibilityLabel` on an `accessible` wrapper, and let that wrapper collapse the chart's internals.
- **Colour contrast must meet WCAG AA (1.4.3).** Every text/background pair must reach **4.5:1** (**3:1** for text ≥18px or bold). This is a property of the palette tokens in `src/constants/theme.ts`, not of a component — when you **add or change any `text*` / `bg` / `card` / `accent` colour, verify the resulting text-on-surface ratios** in both `dark` and `light` before shipping. Muted tiers (`text3`) are the usual offenders.
- **Announce dynamic content (WCAG 4.1.3).** Anything that appears or changes in response to a user action — error/validation messages, async results, live-updating numbers like the keypad total — must be announced, not just rendered. Use `accessibilityLiveRegion` (`"assertive"` for errors, `"polite"` for running values) for Android **and** `AccessibilityInfo.announceForAccessibility` on change for iOS (which ignores live regions). Errors also take `accessibilityRole="alert"`. The shared `FormError` primitive already does this for form errors — reuse it.

# Repository structure

pnpm workspace monorepo. The Expo React Native app lives at `apps/mobile/` (LEG-97 moved it out of
the repo root, which is now pure workspace glue — no app code of its own). A growing set of
`packages/*` holds pieces the app used to own directly:

```
apps/
  mobile/
    src/
      app/        → Expo Router screens (UI layer)
      hooks/      → React Query cache/state layer
      services/   → business logic + domain models
      data/       → local device persistence (AsyncStorage) only — theme preference, etc.
      components/  → shared + screen-specific UI (components/ui = design primitives)
      constants/   → theme tokens, categories
      i18n/        → i18next setup + locale files
    assets/       → fonts, images, icons
    app.json, tsconfig.json, jest.config.js, eslint.config.mjs, .env → app-scoped config

packages/
  config/     → shared tsconfig/eslint/prettier bases
  schemas/    → framework-agnostic zod row schemas (@moniq/schemas)
  api/        → the Supabase-backed data layer (@moniq/api) — see "Data architecture" below

agent/        → standalone AI agent package, its own tsconfig/deps

`pnpm test` (root) → `turbo run test`, fanning out to each package's own `test` script
                      (apps/mobile, packages/api), cached independently per package.
```

Every `src/...` path referenced elsewhere in this doc is relative to `apps/mobile/`, unless stated otherwise.

# React Compiler

The **React Compiler is enabled** and stable (`babel-plugin-react-compiler@1.x`), via `"reactCompiler": true` in `app.json`.

The compiler auto-memoizes components, values, and functions. **Do not hand-write memoization:**

- No `useMemo`, no `useCallback`, no `React.memo` / `memo()` for performance.
- Write plain functions and object literals in component bodies; the compiler keeps their references stable (so context values and props passed down stay stable without manual wrapping).
- Only reach for `useMemo` if a value is expensive to compute _and_ the compiler provably can't memoize it (rare) — and leave a comment saying why.
- `useRef`, `useState`, `useEffect` are unaffected — keep using them normally.

# Component conventions

- **Name every component's props type after the component** — `ButtonProps`, `SheetProps`, `RecurringSectionProps` — never a generic local `Props`. Applies to all components, including small ones defined inline in the same file.
- **Extract nested or repeated JSX into its own named component** rather than leaving it inline — a `.map()` item body, an overlay, a section header. Prefer small focused components.
- **Type props and parameters precisely.** Define a domain union (e.g. `AmountKey`) in the layer that owns it (usually a service) and use it, rather than `string`/`any`.
- **No nested or chained ternary operators.** A single `a ? b : c` is fine, but never chain them (`a ? b : c ? d : e`). Use early returns, a small resolver function, or a lookup map keyed by the discriminant instead.

# Data architecture

The codebase uses a strict layer separation. Never collapse layers or skip one.

```
src/app/        → screens          (call hooks only)
src/hooks/      → React Query       (import services only)
src/services/   → business logic    (import @moniq/api + src/data only)
@moniq/api      → Supabase data layer (see "packages/api" below)
src/data/       → local device persistence (AsyncStorage only — theme preference)
```

Data flows **app → hooks → services → (`@moniq/api` + `src/data`)**; imports only ever point one level down. Services are the one layer allowed to import from both — most resources live in `@moniq/api` (Supabase), a couple (currently just the theme preference) live in `src/data` (AsyncStorage) — these are genuinely different data sources, not two names for the same layer.

## `packages/api` (`@moniq/api`) — the actual data layer

- Talks to Supabase (Postgres + Storage + Edge Functions + Auth). Returns raw persisted row/value shapes.
- Framework-agnostic — no React/React Native imports. The Supabase client itself is built by the **app** (`src/data/supabase.ts`, which owns the RN-specific bits: `AsyncStorage` as the auth token store, `react-native-url-polyfill`, the Android-emulator URL rewrite) and handed to the package once via `configureSupabaseClient(client)`, called from that same file. Every function inside the package reads it back via `getSupabaseClient()` (`packages/api/src/supabase-client.ts`) rather than importing a client directly — this is what keeps the package reusable by a future non-RN consumer.
- File naming: `<resource>.data.ts` (e.g. `savings.data.ts`), exported through the package's single `index.ts` barrel — services import everything from `'@moniq/api'`, never a submodule path.
- Raw stored types (`ExpenseRow`, `RecurringRow`, …) live in `@moniq/schemas` (the zod schema + its inferred type) and are re-exported from each `<resource>.data.ts` / the barrel. Write-shape types (`New<Resource>Row`, `<Resource>RowUpdate`) — what a caller sends, not what the DB returns — stay defined in the data file itself, not in `@moniq/schemas`.
- **Types that come from the database must be runtime-typed with `zod`**, not just asserted via TypeScript — define the schema in `packages/schemas` and derive the type with `z.infer<>` rather than hand-writing a `type`/`interface`. A compile-time type is not a guarantee about what Supabase actually returns.

## `src/data/` — local device persistence

- The AsyncStorage-only remainder of the old data layer: currently just the theme preference (`storage.ts`, `settings.data.ts`) and `supabase.ts` (builds the client — see above, not itself a data resource).
- Never imports from `services/` or `hooks/`.
- **Swap point if this ever needs a backend too:** if AsyncStorage-only settings ever need to sync to Supabase, only this module changes.

## `src/services/` — business layer

- Owns domain models (camelCase, e.g. `Expense`, `Income`, `Cost`), mappers, merges, and business rules (allowance/daily-budget formulas, insights aggregation, money formatting).
- Composes multiple `@moniq/api` (and, for local device settings, `src/data`) calls and applies rules.
- Never imports from `hooks/`.
- File naming: `<resource>.service.ts`.
- Mappers (e.g. `mapRowToExpense`) live here and are exported for unit testing.

## `src/hooks/` — React Query layer

- Imports only from `services/`. Never imports from `data/` directly.
- Owns React Query `useQuery` / `useMutation` wrappers and optimistic updates.
- All React Query cache keys must come from `src/hooks/query-keys.ts` — no hardcoded string arrays.

## Adding a new query

1. Add the key to `src/hooks/query-keys.ts` first.
2. Add the row schema (if new) to `packages/schemas/index.ts`, then the data function to `packages/api/src/<resource>.data.ts` — export both from `packages/api/src/index.ts`.
3. Add the service function to `src/services/<resource>.service.ts`, importing from `'@moniq/api'`.
4. Add the hook in `src/hooks/`.

## Query keys

`queryKeys` is a typed factory object at `src/hooks/query-keys.ts`.

- When adding a new query, add its key here first.
- Cross-hook invalidations must reference `queryKeys` — never a raw string.

# Testing

Every new piece of functionality or logic ships with a test that would **fail if the behaviour broke** — and nothing more. Tests exist to protect behaviour worth protecting, not to inflate coverage.

Runner: **Jest** (`jest-expo` preset). Test files live next to the code as `<name>.test.ts`. Run with `pnpm test`.

## What to test

- **Business logic first.** The `src/services` layer (formulas, mappers, aggregation, money formatting) and non-trivial `src/data`/`src/hooks` logic are the high-value targets — pure functions with clear inputs/outputs.
- Cover the **happy path, boundaries, and known edge cases** — a few focused cases, not exhaustive permutations of the same branch.
- A regression that bit you once deserves a test so it can't come back.

## What NOT to test (avoids bloat)

- Don't write a test that can't fail for a real bug — no restating the implementation, asserting that a mock was called, or checking trivial pass-through getters/constants.
- Don't test third-party libraries, the React Compiler's output, styling, or static copy.
- Don't add a test just to raise a coverage number. If you can't name the bug a test guards against, don't write it.

Prefer deleting a low-value test over keeping it. Quality and relevance over quantity.

## Supabase smoke test

Jest mocks `@moniq/api`'s Supabase client seam (`@moniq/api/supabase-client`, see
`packages/api/jest.setup.cjs`), so `pnpm test` can't catch a wrong column name, a missing RLS
policy, or a missing table grant — only a real request to Postgres can.
`apps/mobile/scripts/smoke-test-supabase.mjs` round-trips every Supabase-backed resource
(insert/read/update/delete, cleaning up after itself) against the local container. It has already
caught real bugs mocks missed (a missing `note`/`category` column, and `authenticated` role grants
that RLS alone doesn't provide).

Run it with `pnpm --dir apps/mobile smoke` (requires `supabase start` running locally) whenever you
change a `packages/api/src/*.ts` or `src/services/*.ts` file that touches Supabase — before
considering the change done, not just before committing.

# Branching & commits

`develop` is the integration branch (GitHub default branch) — everything branches from and merges into `develop` via PR. `main` is production/release-only — updated only by merging a release from `develop`, never targeted directly by feature PRs.

## Branch naming

```
<type>/<TICKET-ID>-<kebab-case-summary>
```

- `type`: `feat` | `fix` | `chore` | `refactor` | `docs` | `test` | `ci`
- `TICKET-ID`: Linear ID, uppercase (e.g. `LEG-60`) — omit only for no-ticket housekeeping
- No personal-name prefix (author is already visible via git/PR)

Examples: `feat/LEG-60-savings-targets-add-button`, `chore/upgrade-expo-sdk`

Enforced by a pre-commit hook (`scripts/check-branch-name.mjs`) — `main` and `develop` are always allowed.

## Commit messages

[Conventional Commits](https://www.conventionalcommits.org/), enforced by commitlint (`commitlint.config.js`) via a `commit-msg` hook:

```
<type>(<scope>): <summary>
```

- `type`: `feat` | `fix` | `chore` | `refactor` | `docs` | `test` | `ci` | `perf` | `style` | `revert`
- `scope`: required — the layer or feature touched (`app`, `hooks`, `services`, `data`, `db`, or a feature name like `savings-targets`)
- `summary`: imperative, lowercase, no trailing period
- Reference the Linear ticket in the body (`Refs LEG-60`), not the summary line
- Do not add a `Co-Authored-By: Claude` trailer

Examples: `feat(savings-targets): add button + prompt + review/confirm flow`, `fix(data): grant table access missing from RLS-only setup`

# Internationalisation

Every string displayed in the app UI must come from i18next — no hardcoded string literals in JSX or `accessibilityLabel` props.

## Rules

- Use `const { t } = useTranslation()` and call `t('namespace.key')` for every visible string, including accessibility labels and descriptions.
- Add new keys to `src/i18n/locales/en.json` first. If other locale files exist for the same namespace, add the key there too.
- Locale files live in `src/i18n/locales/<locale>.json`. English (`en.json`) is the source of truth — keep its keys the master list.
- Hardcoded data that is not copy (merchant names, transaction descriptions, category ids, dates, account nicknames, addresses, URLs) does not need to go through i18next. Category **ids** stay in code; their display labels are i18n strings.
- Interpolated values use the `{{variable}}` syntax in the JSON value, e.g. `"memberSince": "Member since {{year}}"`.
- Never call `t()` outside a React component or hook — i18next must be initialised first (done via `import '@/i18n'` in `_layout.tsx`).
