# @mai/schemas

Framework-agnostic zod schemas + inferred types for the raw Supabase **row** shapes (what the DB
returns). No React/Expo/Supabase imports — a single source of truth any consumer can validate
against (the mobile data layer today; a future `apps/web` later).

Write-shapes (`New*Row`, `*RowUpdate`) intentionally stay in the data layer — they describe what a
client sends, not what the DB returns, and move to `@mai/api` with the data layer (LEG-124).

```ts
import { ExpenseRowSchema, type ExpenseRow } from '@mai/schemas';
```
