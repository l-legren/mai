# mai

A daily-allowance budgeting app for iOS, Android, and web, built with Expo.

mai turns your monthly income, fixed costs, and savings goal into a single number: **how much you can spend today**. Log expenses against that daily allowance, track recurring income and fixed costs, and review spending patterns over time — all with a fully accessible, offline-first mobile UI.

## Core concept

The daily allowance is the monthly surplus spread evenly across the month:

```
dailyAllowance = (monthlyIncome − fixedCosts − savingsGoal) / 30
```

Each day starts with that budget; logging an expense reduces what's left for today. The **Today** tab shows the live balance, **Recurring** manages the income/cost items that feed the formula, and **Insights** aggregates historical spending by week/month and category.

## Screens

| Screen                 | Purpose                                                                           |
| ---------------------- | --------------------------------------------------------------------------------- |
| `(tabs)/index` (Today) | Daily allowance, remaining balance, quick expense entry                           |
| `(tabs)/recurring`     | Recurring income and fixed-cost items (monthly/yearly, perpetual or term-limited) |
| `(tabs)/insights`      | Spending aggregated by period and category, charts                                |
| `add-expense`          | Log a new expense                                                                 |
| `breakdown`            | Category/period breakdown detail                                                  |
| `detail`               | Single expense/recurring item detail                                              |
| `settings`             | Savings goal, preferences                                                         |
| `login`                | Supabase email/password auth                                                      |

## Architecture

This is a pnpm workspace monorepo. The app lives at `apps/mobile/` and enforces a strict
one-directional layering under `apps/mobile/src/`, so each layer only knows about the one beneath
it:

```
apps/mobile/src/app/      screens (Expo Router)   → call hooks only
apps/mobile/src/hooks/    React Query cache layer → import services only
apps/mobile/src/services/ business logic          → import @mai/api + src/data only
packages/api/             Supabase data layer (@mai/api)
apps/mobile/src/data/     local device persistence → AsyncStorage only (theme preference)
```

- **`apps/mobile/src/app/`** — file-based routes (Expo Router). Screens are presentation only; all state and logic is delegated to hooks.
- **`apps/mobile/src/hooks/`** — TanStack React Query wrappers (`useQuery`/`useMutation`, optimistic updates). All cache keys are centralized in `apps/mobile/src/hooks/query-keys.ts`.
- **`apps/mobile/src/services/`** — pure business logic: the allowance formula, expense/recurring/savings domain models and mappers, insights aggregation, auth rules. No framework or storage dependencies — this is the most heavily unit-tested layer.
- **`packages/api/`** (`@mai/api`) — the Supabase data layer: auth/session, expenses, recurring items, savings goal, savings targets, avatar storage. Framework-agnostic (no React Native imports) — the app builds the Supabase client and hands it in, so this package could be reused by a future non-mobile client.
- **`apps/mobile/src/data/`** — the one remaining local-only persistence layer: currently just the theme preference, via `AsyncStorage`.

Supporting directories (all under `apps/mobile/src/`):

- `components/` — shared UI (`ui/` = design-system primitives) plus screen-specific components (`today/`, `insights/`, `recurring/`, `detail/`, `settings/`, `auth/`).
- `constants/` — theme tokens (colors, spacing) and category definitions.
- `i18n/` — i18next setup and locale strings (`locales/en.json`); all UI copy is externalized, no hardcoded strings.
- `utils/` — small framework-agnostic helpers (dates, ids).
- `types/` — shared TypeScript types.

Plus `packages/config` (shared tsconfig/eslint/prettier bases), `packages/schemas` (framework-agnostic zod row schemas), and `agent/` (a standalone AI agent package, its own tsconfig/deps).

### Workspace dependency graph

```mermaid
flowchart TB
    ROOT["// (true repo root)<br/>pnpm-workspace.yaml, turbo.json,<br/>husky, commitlint"]
    APP["apps/mobile<br/>pkg name: mai"]
    API["packages/api<br/>@mai/api"]
    SCHEMAS["packages/schemas<br/>@mai/schemas"]
    CONFIG["packages/config<br/>@mai/config"]
    AGENT["agent<br/>@mai/agent"]

    APP -.->|workspace:*| API
    APP -.->|workspace:*| SCHEMAS
    APP -.->|workspace:*| CONFIG
    API -.->|workspace:*| SCHEMAS
    API -.->|workspace:*| CONFIG
    SCHEMAS -.->|workspace:*| CONFIG
    AGENT -.->|workspace:*| CONFIG

    style ROOT fill:#374151,color:#fff
```

Dotted arrows are `package.json` dependencies (how pnpm resolves symlinks) — `turbo.json` never references them with `^task`, so this graph doesn't drive turbo's execution order, only module resolution.

### Turborepo task pipeline

```mermaid
flowchart LR
    subgraph apps_mobile["apps/mobile"]
        direction TB
        a1["format:check<br/>(prettier --check)"] --> a2["typecheck<br/>(tsc --noEmit)"] --> a3["lint<br/>(expo lint)"]
    end
    subgraph pkg_api["packages/api"]
        direction TB
        b2["typecheck<br/>(tsc --noEmit)"] --> b3["lint<br/>(eslint .)"]
    end
    subgraph pkg_schemas["packages/schemas"]
        direction TB
        c2["typecheck<br/>(tsc --noEmit)"] --> c3["lint<br/>(eslint .)"]
    end
    subgraph pkg_config["packages/config"]
        direction TB
        d3["lint<br/>(eslint .)"]
    end
    subgraph agent_pkg["agent"]
        direction TB
        e2["typecheck<br/>(tsc --noEmit)"] --> e3["lint<br/>(eslint .)"]
        e2 --> e4["eval<br/>(npx lmnr eval, uncached)"]
    end
    subgraph root_only["// (root-scoped tasks, //# prefix)"]
        direction TB
        r1["//#format:check<br/>(prettier --check .)"] --> r2["//#test<br/>(jest — projects:<br/>apps/mobile + packages/api)"]
    end
```

Each subgraph runs independently and in parallel (turbo caps concurrency by CPU, not by cross-package deps — see above). Within a subgraph, the chain comes from `turbo.json`'s `dependsOn`: `typecheck` waits on that _same package's_ `format:check`, `lint` waits on `typecheck`; a package missing a step (e.g. `packages/config` has no `typecheck`) just skips to the next one it does have. `pnpm exec turbo run typecheck lint format:check test` — what CI and the pre-commit hook both run — fires this whole graph in one invocation.

## Tech stack

- **[Expo](https://expo.dev) / React Native 0.86** — cross-platform app shell (iOS, Android, web), with the **React Compiler** enabled for automatic memoization.
- **[Expo Router](https://docs.expo.dev/router/introduction/)** — file-based, typed navigation.
- **[TanStack React Query](https://tanstack.com/query)** — async state/cache management with optimistic updates.
- **[Supabase](https://supabase.com)** — authentication (email/password) and session management.
- **AsyncStorage** — on-device persistence for expenses, recurring items, savings goal, and settings.
- **[react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) / react-native-gesture-handler** — animations and gestures.
- **[react-native-gifted-charts](https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts)** — insights charts.
- **[i18next](https://www.i18next.com/) / react-i18next** — internationalization.
- **[date-fns](https://date-fns.org/)** — date math for allowance and insights periods.
- **TypeScript** (strict mode) — throughout.
- **Jest / jest-expo** — unit testing, focused on the `services`/`data` layers.

## Accessibility

The app targets full screen-reader support (VoiceOver/TalkBack): every interactive element has an `accessibilityRole` and meaningful label, stateful controls expose `accessibilityState`, decorative elements are hidden from assistive tech, color contrast meets WCAG AA, and dynamic content (errors, live totals) is announced via live regions. See `CLAUDE.md` for the full ruleset.

## Getting started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Configure Supabase — copy `apps/mobile/.env.example` to `apps/mobile/.env` and fill in your project's URL/anon key (either a local `supabase start` instance or a hosted project):

   ```bash
   cp apps/mobile/.env.example apps/mobile/.env
   ```

3. Start the app (from `apps/mobile/`):

   ```bash
   cd apps/mobile
   pnpm start
   ```

   From there, open it in a [development build](https://docs.expo.dev/develop/development-builds/introduction/), Android emulator, iOS simulator, or [Expo Go](https://expo.dev/go). Or target a platform directly with `pnpm ios` / `pnpm android` / `pnpm web`.

## Scripts

Run from the repo root unless noted. Package-scoped commands can also run via `pnpm --dir apps/mobile <script>` instead of `cd`-ing in.

| Command                                              | Description                                                      |
| ---------------------------------------------------- | ---------------------------------------------------------------- |
| `pnpm test`                                          | Run the full Jest suite (app + `@mai/api`)                       |
| `pnpm format` / `format:check`                       | Format/check with Prettier, repo-wide                            |
| `pnpm exec turbo run typecheck`                      | Typecheck every workspace package                                |
| `pnpm exec turbo run lint`                           | Lint every workspace package                                     |
| _(in `apps/mobile/`)_ `pnpm start`                   | Start the Metro dev server                                       |
| _(in `apps/mobile/`)_ `pnpm ios` / `android` / `web` | Start on a specific platform                                     |
| _(in `apps/mobile/`)_ `pnpm lint`                    | Lint the app with `expo lint`                                    |
| _(in `apps/mobile/`)_ `pnpm test:watch`              | Run just the app's tests in watch mode                           |
| _(in `apps/mobile/`)_ `pnpm smoke`                   | Round-trip every Supabase resource against a real local instance |

## Testing

Tests live next to the code they cover (`<name>.test.ts`) and target the `services`/`data` layers (`apps/mobile/`) and `@mai/api` (`packages/api/`) — pure business logic (allowance formula, mappers, aggregation) and persistence behavior. `pnpm test` from the repo root fans out to each package's own `test` script via turbo, cached independently per package.

## Project conventions

Full contributor guidelines — layering rules, component conventions, i18n, accessibility, and testing philosophy — live in [`CLAUDE.md`](./CLAUDE.md) and [`AGENTS.md`](./AGENTS.md).
