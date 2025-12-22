# AGENTS.md

## Repository Overview

This is a **Bun-first Turborepo monorepo**.

- Package manager: **Bun only**
- Task orchestration & caching: **Turborepo**
- Backend app: **Next.js (App Router)**
- Frontend app: **React + Vite**
- Shared code: **packages/**

Do not introduce npm, yarn, or pnpm.

---

## Directory Structure

```
apps/
  web/
    backend/        # Next.js app
    frontend/       # Vite + React app

packages/
  ui/             # Shared UI components (built package)
  utils/          # Shared TS utilities (no build step)
  types/          # Shared TS types (no build step)

turbo.json
package.json      # Root workspace config
bun.lockb
tsconfig.base.json
```

---

## Tooling Rules (Strict)

### Package Management
- Use **bun install**
- Use **bun run**
- Do NOT generate:
  - package-lock.json
  - pnpm-lock.yaml
  - yarn.lock

### Task Execution
- Run tasks via **Turborepo from repo root**
  ```bash
  bun run dev
  bun run build
  bun run lint
  ```

Do not run apps individually unless explicitly instructed.

---

## App-Specific Rules

### apps/web/backend (Next.js)
- Uses **App Router**
- ESLint must be run via:
  ```bash
  next lint
  ```
- Do NOT replace with plain ESLint
- Respect React Server Components boundaries
- Assume `use client` is required unless proven otherwise

### apps/web/frontend (Vite)
- Uses standard ESLint
- No Next.js assumptions
- Browser-only APIs allowed

---

## Shared Packages Rules

### packages/ui
- Built package
- Source in `src/`
- Output in `dist/`
- Must expose public API via `exports` in `package.json`
- Never import from `src` directly outside the package
- Changes require running `build`

### packages/utils / packages/types
- TypeScript-only
- No build step unless explicitly requested
- Can be imported directly via workspace resolution

---

## TypeScript Rules

- All projects extend `tsconfig.base.json`
- Prefer **explicit exports**
- Avoid deep imports across package boundaries
- Do not loosen `strict` settings without justification

---

## Linting Rules

- Linting must be deterministic
- No lint rules at repo root
- Each app/package owns its lint config (or none)

---

## Monorepo Expectations

- Shared code must live in `packages/`
- Apps must not duplicate shared logic
- Do not add cross-app imports
- Changes should minimize rebuild scope (Turbo cache aware)

---

## CI & Caching Assumptions

- `turbo run build` is the source of truth
- Cacheable outputs:
  - `.next/**`
  - `dist/**`
- Dev tasks are **not cached**

---

## What NOT to Do

- Do not add new tools without justification
- Do not add global configs unless shared by multiple projects
- Do not bypass Turborepo
- Do not assume Node APIs that Bun does not support
- Do not introduce implicit behavior

---

## Default Mindset for Agents

- Be explicit over clever
- Prefer simplicity over abstraction
- Optimize for maintainability and CI performance
- If uncertain, ask before restructuring

End of file.
