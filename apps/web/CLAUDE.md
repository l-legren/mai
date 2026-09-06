# Accessibility

`apps/web` is regular DOM/HTML, not React Native. The rule is **semantic HTML first, ARIA only when there's no element for the job** (WAI-ARIA's "no ARIA is better than bad ARIA").

## Rules

- **Reach for the native element before reaching for a `div`/`span` + `role`/`onClick`.** Landmarks (`<nav>`, `<header>`, `<main>`, `<footer>`, `<section>`), `<button>` for actions, `next/link`'s `<Link>` (renders `<a>`) for navigation, `<label htmlFor>` for form fields, real heading tags for titles. A `div` with an `onClick` gets no keyboard support, no role, and no focus state for free — a `<button>` does. `Sidebar.tsx`, `SiteHeader.tsx`, and `Hero.tsx` already do this (`<nav>`, `<header>`, `<section>`) — match that, don't regress to `div`-soup.
- `span`/`div` are fine for **non-interactive, non-landmark content** — inline text fragments, layout wrappers, an avatar glyph — the kind already used in `Logo.tsx` and `SidebarAccountMenu.tsx`. They only become a problem when they stand in for something the platform already has a real element for.
- **One `<h1>` per page**, and no skipped heading levels. `PageHeading`/`AuthHeader` own the `<h1>` — don't add a second one on the same page.
- **Icon-only buttons/links need an `aria-label`** run through `t()` (see the i18n rules) — e.g. the collapse toggle in `Sidebar.tsx`. If a control has visible text already, don't also add an `aria-label` that duplicates it.
- **Custom widgets that have no native equivalent** (dropdown menus, comboboxes) need the matching ARIA role/state trio — `SidebarAccountMenu.tsx`'s `role="menu"`/`role="menuitem"` + `aria-haspopup`/`aria-expanded` is the reference pattern; copy it rather than inventing a new shape.
- **Every interactive element needs a visible keyboard focus state.** Use the existing `focus-visible:ring-2 focus-visible:ring-[#FF4FA3] focus-visible:ring-offset-2` pattern from `Button.tsx` (or `Input.tsx`'s `focus-visible:border-[#FF4FA3]`) on any new `button`/`a`/input-like element — don't ship one without it. `Sidebar.tsx`'s collapse toggle and `SidebarAccountMenu.tsx`'s buttons currently lack this — match the existing pattern rather than copying them.
- **Decorative content gets `aria-hidden="true"`** (icons, dividers, glyphs like the `•••` in `SidebarAccountMenu.tsx`) — already the convention in `icons.tsx`, keep it there.
- **Announce dynamic content (WCAG 4.1.3).** Reuse `role="alert" aria-live="assertive"` for errors (`FormError.tsx`) and `role="status" aria-live="polite"` for async success/info (`AuthForm.tsx`) rather than inventing a new pattern.
- **Colour contrast must meet WCAG AA (1.4.3)** — 4.5:1 (3:1 for text ≥18px/bold). This is a property of the CSS custom properties in `app/globals.css` (`--text`, `--text-2`, `--text-3` against `--bg`/`--card`), not of a component — verify both the `:root` (light) and `prefers-color-scheme: dark` blocks whenever you add or change a token. `--text-2`/`--text-3` are the usual offenders.

# Component conventions

## Index barrels for component folders

Each folder under `app/components/` (`ui/`, `auth/`, `layout/`, `marketing/`) has an `index.ts` barrel re-exporting everything in it — components (default exports re-exported under their component's name) and their prop types. Any import of one of these components **from outside its own folder** goes through the barrel (`import { Button, Input } from '@/app/components/ui'`), never a deep path (`'@/app/components/ui/Button'`).

- **Within a folder**, siblings import each other directly by relative path (e.g. `Sidebar.tsx` importing `./SidebarAccountMenu`), not through that folder's own barrel — importing your own barrel from inside it risks a circular import.
- When adding a new component to one of these folders, add its export line to that folder's `index.ts` in the same change.
- This convention is scoped to `app/components/*` — it does not apply to `app/actions/`, `lib/`, or `lib/dal/`.

# Data access

Server Components and Server Actions may call `@moniq/api`/`@moniq/auth` directly (via `lib/dal/*.ts`, e.g. `lib/dal/current-user.ts`, `lib/dal/profile.ts`) — they already run server-side, so there's nothing to route through.

**A Client Component must never do this.** It can't anyway — these calls depend on `next/headers`'s `cookies()` to build the per-request Supabase client, which only exists in a server context; importing one of these `lib/dal/*.ts` helpers into a `'use client'` file fails at build/runtime. Instead, wrap the call in a Server Action under `app/actions/*.ts` (`'use server'`) and call that from the Client Component like a normal async function — no `fetch`, no manual JSON/status-code handling. `app/actions/sign-in.ts` / `sign-up.ts` / `sign-out.ts` (called from `AuthForm.tsx`) are the reference pattern — copy their shape rather than inventing a new one, and rather than reaching for a Route Handler (`app/api/.../route.ts`), which this app doesn't use for this purpose.

# Testing

Runner: **Vitest**, environment `node` (no `jsdom` — we're not rendering components, see below). Test files live next to the code as `<name>.test.ts`. Run with `pnpm web:test` (root) or `pnpm test` inside `apps/web`. See root `CLAUDE.md`'s "Testing" section for the general what-to-test/what-not-to-test philosophy — this section only covers what's specific to this app.

**Integration tests are the priority here**, the same way the Supabase smoke test is the highest-value test on `apps/mobile`: exercise the real wiring across layers — a Server Action calling straight through to the real `@moniq/auth`/`@moniq/api` logic — with only the Supabase client itself faked (a plain mock object, same pattern `packages/api`/`packages/auth` already use), rather than mocking our own functions. `app/actions/sign-in.test.ts` and `sign-up.test.ts` are the reference pattern: mock `@/lib/supabase-server`'s `createSupabaseServerClient` and `next/navigation`'s `redirect`, then call the real action and assert on the returned `AuthFormState` / whether `redirect` fired.

- Don't test thin pass-through wrappers with no branching (e.g. `lib/dal/current-user.ts`, `lib/dal/profile.ts` — they're one-line delegations, and the logic they delegate to is already tested in `packages/api`/`packages/auth`). Test the layer where the branching actually happens.
- `app/actions/sign-out.ts` has no branches worth protecting (three sequential calls, no conditionals) — deliberately left untested; don't add a test that would just restate it.

# Internationalisation

See root `CLAUDE.md`'s "Internationalisation" section for the general rules (every string via `t()`, interpolation syntax, etc.) — this section only covers this app's paths and initialisation.

- Locale files live in `i18n/locales/<locale>.json` (currently just `en.json` — the only locale so far).
- i18next is initialised via `I18nProvider` (`app/i18n-provider.tsx`, imports `@/i18n`), mounted once in the root `app/layout.tsx` — never call `t()` outside a React component or hook, since nothing guarantees i18next has initialised yet outside that tree.
