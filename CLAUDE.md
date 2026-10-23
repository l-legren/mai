# Repository structure

pnpm workspace monorepo. `apps/mobile/` is the Expo React Native app. `apps/web/` is a Next.js
App Router app (landing + auth so far). A growing set of `packages/*` holds pieces shared between
them — no longer just things carved out of mobile. Each app has its own `CLAUDE.md`
(`apps/mobile/CLAUDE.md`, `apps/web/CLAUDE.md`) for rules scoped to that app only; this file is for
rules that apply repo-wide or to the shared `packages/*`.

```
apps/
  mobile/     → see apps/mobile/CLAUDE.md
  web/        → see apps/web/CLAUDE.md

packages/
  config/     → shared tsconfig/eslint/prettier bases
  schemas/    → framework-agnostic zod row schemas (@mai/schemas)
  api/        → the Supabase-backed data layer (@mai/api) — see "Shared packages" below
  auth/       → shared auth business logic (@mai/auth) — see "Shared packages" below

agent/        → standalone AI agent package, its own tsconfig/deps

design-system/ → reference-only design export for apps/web UI work — see apps/web/CLAUDE.md's
                 "Design system" section, not first-party source (excluded from format:check)

`pnpm test` (root) → `turbo run test`, fanning out to each package's own `test` script
                      (apps/mobile, apps/web, packages/api, packages/auth), cached independently per package.
```

# Mobile is not under active development

`apps/mobile` is not being developed further. Do not factor its impact into backend/infra/architecture decisions elsewhere in the repo (e.g. shared services like `agent/`) — design for the apps that are actively developed, not for keeping mobile working.

# Shared packages

`@mai/api` and `@mai/auth` are consumed by both `apps/mobile` and `apps/web` — rules here apply
regardless of which app you're working in.

## `packages/api` (`@mai/api`) — the actual data layer

- Talks to Supabase (Postgres + Storage + Edge Functions + Auth). Returns raw persisted row/value shapes.
- Framework-agnostic — no React/React Native imports, and **no client singleton**. Every exported function takes the Supabase client as its **first parameter** (e.g. `getExpenseRows(client, ...)`) instead of reaching for one internally. This is what lets the package be shared safely by both `apps/mobile` (one client for the whole app lifetime, built once in `src/data/supabase.ts` — AsyncStorage-backed, imported directly by mobile's `services/` layer) and `apps/web`'s server-rendered code (a fresh client per request, built via `@supabase/ssr` inside whichever Server Action/Server Component needs it). A module-level singleton — the package's original design — can't serve both: a Node server handles many concurrent users through one process, so a shared mutable "current client" variable would race across requests. Each app owns building its own client; this package only ever receives one as an argument.
- Functions that need the signed-in user's id (`getCurrentUserId`) are themselves called internally by several other data functions (expenses, avatar, profile, recurring, savings, savings-targets) — thread `client` into those internal cross-file calls too, not just each function's own exported signature. The compiler will catch anything missed once a signature changes.
- File naming: `<resource>.data.ts` (e.g. `savings.data.ts`), exported through the package's single `index.ts` barrel — callers import everything from `'@mai/api'`, never a submodule path.
- Raw stored types (`ExpenseRow`, `RecurringRow`, …) live in `@mai/schemas` (the zod schema + its inferred type) and are re-exported from each `<resource>.data.ts` / the barrel. Write-shape types (`New<Resource>Row`, `<Resource>RowUpdate`) — what a caller sends, not what the DB returns — stay defined in the data file itself, not in `@mai/schemas`.
- **Types that come from the database must be runtime-typed with `zod`**, not just asserted via TypeScript — define the schema in `packages/schemas` and derive the type with `z.infer<>` rather than hand-writing a `type`/`interface`. A compile-time type is not a guarantee about what Supabase actually returns.
- Tests build a plain mock client object and pass it directly into the function under test — no client-seam module to mock.

## `packages/auth` (`@mai/auth`) — shared auth, business logic and raw calls together

- Framework-agnostic sign-in/sign-up validation, error-code mapping (`AuthError` / `AuthErrorCode`), session handling, **and** the raw `client.auth.*`/`client.rpc(...)` Supabase calls behind them, all in one file — shared because both `apps/mobile` and `apps/web` implement the same auth feature against the same Supabase project. Same client-as-first-parameter rule as `packages/api`, for the same reason.
- **Does not depend on `@mai/api`.** This package does _not_ follow the `packages/api` (raw) → `services/` (business rules) split — unlike `getCurrentUserId` (which stays in `@mai/api` because six unrelated resources call it directly), nothing outside this package ever calls `signInWithPassword`/`signUpWithPassword`/etc., so there's no cross-package reuse to justify keeping a separate raw layer. Every error this package's public functions can throw is an `AuthError` — never a lower-level `ApiError`.
- Each app's own auth entry point (`apps/mobile/src/services/auth.service.ts`, `apps/web/lib/auth.ts`) binds this app's one Supabase client to `@mai/auth`'s functions and re-exports the bound versions — kept so callers (mobile's hooks, web's `AuthForm`) never pass a client explicitly and never need to know `@mai/auth` exists, and so each app's own layering rules still hold.

# Component conventions

- **Name every component's props type after the component** — `ButtonProps`, `SheetProps`, `RecurringSectionProps` — never a generic local `Props`. Applies to all components, including small ones defined inline in the same file.
- **Extract nested or repeated JSX into its own named component** rather than leaving it inline — a `.map()` item body, an overlay, a section header. Prefer small focused components.
- **Type props and parameters precisely.** Define a domain union (e.g. `AmountKey`) in the layer that owns it (usually a service) and use it, rather than `string`/`any`.
- **No nested or chained ternary operators.** A single `a ? b : c` is fine, but never chain them (`a ? b : c ? d : e`). Use early returns, a small resolver function, or a lookup map keyed by the discriminant instead.

# Comments

Only comment when necessary — most code needs none. When one is warranted, **one line, hard cap ~250 characters**. No multi-line/multi-paragraph docstrings explaining rationale, history, or comparisons to other code, even to match a neighboring file's existing verbose style.

# Error handling in backend calls

Any call to something outside the process that can fail at runtime — Postgres, another internal
service, a third-party API — must be wrapped in `try`/`catch`, never left to bubble as an
unhandled exception. An uncaught throw isn't just a worse error message: it reaches the client as
a bare 500 with no body and leaves nothing in the logs to diagnose from. This bit us for real in
`agent/src/server.ts`'s `/ask-mai/remember` route, which swallowed an `ENETUNREACH` from a
misconfigured DB connection string into a content-free 500 — invisible until the call was wrapped.

- `console.error` the real underlying error with a short, specific prefix naming the failing
  operation (e.g. `'ask-mai remember: saveUserMemory failed'`), not a generic message — so the
  actual cause is visible in the host's logs (Railway, Vercel) even though the client only gets a
  mapped status code.
- Return a typed/coded error response instead of letting the exception propagate. Reference
  pattern: `apps/web/app/api/ask-mai/route.ts`'s `fetch` try/catch (logs, then `502`) and
  `agent/src/server.ts`'s `runAskMai`/`saveUserMemory` try/catches (log, then `500`).
- Applies to routes, Server Actions, and service calls doing real I/O — not to pure in-process
  logic, which shouldn't grow a defensive `try`/`catch` it can never actually hit (see this file's
  "What NOT to test" — same principle: don't handle a failure mode that can't occur here).

# Testing

Every new piece of functionality or logic ships with a test that would **fail if the behaviour broke** — and nothing more. Tests exist to protect behaviour worth protecting, not to inflate coverage. Runner and per-package paths live in each package's own `CLAUDE.md` (`apps/mobile/CLAUDE.md`, `apps/web/CLAUDE.md`).

## What to test

- **Business logic first** — pure functions with clear inputs/outputs (services, mappers, formulas, aggregation) are the highest-value targets.
- Cover the **happy path, boundaries, and known edge cases** — a few focused cases, not exhaustive permutations of the same branch.
- A regression that bit you once deserves a test so it can't come back.

## What NOT to test (avoids bloat)

- Don't write a test that can't fail for a real bug — no restating the implementation, asserting that a mock was called, or checking trivial pass-through getters/constants.
- Don't test third-party libraries, the React Compiler's output, styling, or static copy.
- Don't add a test just to raise a coverage number. If you can't name the bug a test guards against, don't write it.

Prefer deleting a low-value test over keeping it. Quality and relevance over quantity.

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
- `scope`: required — the layer or feature touched (`app`, `hooks`, `services`, `data`, `db`, `web`, or a feature name like `savings-targets`)
- `summary`: imperative, lowercase, no trailing period
- Reference the Linear ticket in the body (`Refs LEG-60`), not the summary line
- Do not add a `Co-Authored-By: Claude` trailer

Examples: `feat(savings-targets): add button + prompt + review/confirm flow`, `fix(data): grant table access missing from RLS-only setup`

# Internationalisation

Every string displayed in the app UI must come from i18next — no hardcoded string literals in JSX or accessibility label props. This section covers what's true for both apps; see each app's own `CLAUDE.md` for its locale file paths and initialisation.

## Rules

- Use `const { t } = useTranslation()` and call `t('namespace.key')` for every visible string, including accessibility labels and descriptions.
- Add new keys to the app's locale file first. English (`en.json`) is the source of truth — keep its keys the master list. If other locale files exist for the same namespace, add the key there too.
- Hardcoded data that is not copy (merchant names, transaction descriptions, category ids, dates, account nicknames, addresses, URLs) does not need to go through i18next. Category **ids** stay in code; their display labels are i18n strings.
- Interpolated values use the `{{variable}}` syntax in the JSON value, e.g. `"memberSince": "Member since {{year}}"`.
- Never call `t()` outside a React component or hook — i18next must be initialised first.
