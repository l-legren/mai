# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

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

```
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
```

Every `src/...` path in this doc is relative to this directory (`apps/mobile/`). See the root `CLAUDE.md`'s "Shared packages" section for `@mai/api`/`@mai/auth`, which this app consumes but doesn't own.

# React Compiler

The **React Compiler is enabled** and stable (`babel-plugin-react-compiler@1.x`), via `"reactCompiler": true` in `app.json`.

The compiler auto-memoizes components, values, and functions. **Do not hand-write memoization:**

- No `useMemo`, no `useCallback`, no `React.memo` / `memo()` for performance.
- Write plain functions and object literals in component bodies; the compiler keeps their references stable (so context values and props passed down stay stable without manual wrapping).
- Only reach for `useMemo` if a value is expensive to compute _and_ the compiler provably can't memoize it (rare) — and leave a comment saying why.
- `useRef`, `useState`, `useEffect` are unaffected — keep using them normally.

# Data architecture

The codebase uses a strict layer separation. Never collapse layers or skip one.

```
src/app/        → screens          (call hooks only)
src/hooks/      → React Query       (import services only)
src/services/   → business logic    (import @mai/api + @mai/auth + src/data only)
@mai/api      → Supabase data layer (see root CLAUDE.md's "Shared packages" section)
@mai/auth     → shared auth business logic (see root CLAUDE.md's "Shared packages" section)
src/data/       → local device persistence (AsyncStorage only — theme preference)
```

Data flows **app → hooks → services → (`@mai/api` + `@mai/auth` + `src/data`)**; imports only ever point one level down. Services are the layer allowed to import from all three — most resources live in `@mai/api` (Supabase), auth logic lives in `@mai/auth` (its own package, not built on `@mai/api` — see root `CLAUDE.md` for why), and a couple of resources (currently just the theme preference) live in `src/data` (AsyncStorage) — these are genuinely different data sources, not different names for the same layer.

## `src/data/` — local device persistence

- The AsyncStorage-only remainder of the old data layer: currently just the theme preference (`storage.ts`, `settings.data.ts`) and `supabase.ts` (builds the client — see root `CLAUDE.md`, not itself a data resource).
- Never imports from `services/` or `hooks/`.
- **Swap point if this ever needs a backend too:** if AsyncStorage-only settings ever need to sync to Supabase, only this module changes.

## `src/services/` — business layer

- Owns domain models (camelCase, e.g. `Expense`, `Income`, `Cost`), mappers, merges, and business rules (allowance/daily-budget formulas, insights aggregation, money formatting).
- Composes multiple `@mai/api`/`@mai/auth` (and, for local device settings, `src/data`) calls and applies rules.
- Never imports from `hooks/`.
- File naming: `<resource>.service.ts`.
- Mappers (e.g. `mapRowToExpense`) live here and are exported for unit testing.

## `src/hooks/` — React Query layer

- Imports only from `services/`. Never imports from `data/` directly.
- Owns React Query `useQuery` / `useMutation` wrappers and optimistic updates.
- All React Query cache keys must come from `src/hooks/query-keys.ts` — no hardcoded string arrays.

## Adding a new query

1. Add the key to `src/hooks/query-keys.ts` first.
2. Add the row schema (if new) to `packages/schemas/index.ts`, then the data function to `packages/api/src/<resource>.data.ts` — takes `client: SupabaseClient` as its first parameter; export both from `packages/api/src/index.ts`.
3. Add the service function to `src/services/<resource>.service.ts`, importing from `'@mai/api'` and passing through the app's own `supabase` client (from `src/data/supabase.ts`).
4. Add the hook in `src/hooks/`.

## Query keys

`queryKeys` is a typed factory object at `src/hooks/query-keys.ts`.

- When adding a new query, add its key here first.
- Cross-hook invalidations must reference `queryKeys` — never a raw string.

# Testing

Runner: **Jest** (`jest-expo` preset). Test files live next to the code as `<name>.test.ts`. Run with `pnpm test`. See root `CLAUDE.md`'s "Testing" section for what to test and what not to — this section only covers this app's runner and paths.

- **Business logic first.** The `src/services` layer (formulas, mappers, aggregation, money formatting) and non-trivial `src/data`/`src/hooks` logic are the high-value targets — pure functions with clear inputs/outputs.

## Supabase smoke test

Jest mocks `@mai/api`'s Supabase client seam (`@mai/api/supabase-client`, see
`packages/api/jest.setup.cjs`), so `pnpm test` can't catch a wrong column name, a missing RLS
policy, or a missing table grant — only a real request to Postgres can.
`apps/mobile/scripts/smoke-test-supabase.mjs` round-trips every Supabase-backed resource
(insert/read/update/delete, cleaning up after itself) against the local container. It has already
caught real bugs mocks missed (a missing `note`/`category` column, and `authenticated` role grants
that RLS alone doesn't provide).

Run it with `pnpm --dir apps/mobile smoke` (requires `supabase start` running locally) whenever you
change a `packages/api/src/*.ts` or `src/services/*.ts` file that touches Supabase — before
considering the change done, not just before committing.

# Internationalisation

See root `CLAUDE.md`'s "Internationalisation" section for the general rules (every string via `t()`, interpolation syntax, etc.) — this section only covers this app's paths and initialisation.

- Add new keys to `src/i18n/locales/en.json` first. If other locale files exist for the same namespace, add the key there too.
- Locale files live in `src/i18n/locales/<locale>.json`. English (`en.json`) is the source of truth — keep its keys the master list.
- i18next is initialised via `import '@/i18n'` in `_layout.tsx` — never call `t()` outside a React component or hook, since nothing guarantees i18next has initialised yet outside that tree.
