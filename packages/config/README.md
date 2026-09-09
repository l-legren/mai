# @mai/config

Shared tooling bases for the monorepo. Each base is referenced **by package name** so it survives
future moves (e.g. the app → `apps/mobile` in LEG-97).

| File                 | For                                          | Consumed by                                |
| -------------------- | -------------------------------------------- | ------------------------------------------ |
| `prettier.json`      | Formatting (universal)                       | the app + every package                    |
| `tsconfig.base.json` | TS compiler options for **library** packages | `agent` (and the upcoming `schemas`/`api`) |
| `eslint.base.mjs`    | Flat ESLint base for **library** packages    | `agent` (and the upcoming `schemas`/`api`) |

The Expo **app** deliberately does not extend `tsconfig.base.json` / `eslint.base.mjs` — it stays on
`expo/tsconfig.base` + `eslint-config-expo`, which a Node library base can't stand in for. It shares
only `prettier.json`.

## Consuming

```jsonc
// package.json
"prettier": "@mai/config/prettier.json"
```

```jsonc
// tsconfig.json
"extends": "@mai/config/tsconfig.base.json"
```

```js
// eslint.config.js
import base from '@mai/config/eslint.base.mjs';
export default [...base, { ignores: ['dist/**'] }];
```
