# Agent Guidelines and Repository Conventions

This repository contains core packages, component libraries, and sandbox applications for `tinkuy-react`. All AI agents working on this codebase MUST follow the instructions and standards outlined below.

---

## 1. Architecture Decision Records (ADRs)

All Architecture Decision Records (ADRs) in this repository are **Living ADRs** that transition and evolve alongside the project's codebase.

Before making architectural, tooling, or structural changes, you MUST:
1. First read the central ADR index at **[docs/adr/README.md](docs/adr/README.md)** to discover the active Living ADRs.
2. Read the specific, relevant Living ADRs that correspond to the user's prompt and current task:
   - **[ADR Index & Living ADR Paradigm](docs/adr/README.md)**
   - **[ADR 0001: Monorepo Topology, Package Layout, and Emergent Verification Probe](docs/adr/adr-001-project-structure.md)**
   - **[ADR 0002: Core Tech Stack, Runtime Standards, Bundling, and Default Styling](docs/adr/adr-002-tech-stack.md)**

---

## 2. Framework, Runtime & Testing Rules

1. **React 19 & Next.js 16 Always:**
   - React 19 (`^19.0.0`) and Next.js 16 (`^16.0.0`) are mandatory across all packages and apps.
2. **Strict Prohibition of Deprecated React APIs:**
   - NEVER use deprecated or legacy React APIs (such as `React.createElement`).
   - ALWAYS write components using standard React 19 JSX syntax (`<Component />`).
3. **React Component Testing:**
   - Standardized unit/integration testing MUST use `@testing-library/react` with Vitest in `jsdom` environments.
   - Root `vitest.config.ts` uses Vitest `projects` configuration to automatically discover tests across `public-packages/*`, `private-packages/*`, and `sandbox-apps/*`.
4. **Component Isolation:**
   - Storybook using `storybook-react-rsbuild` is the monorepo standard for isolated component development and visual verification.

---

## 3. Package Management & Build Pipeline

1. **pnpm Workspaces & `workspace:*` Protocol:**
   - All internal dependencies between workspace packages MUST use `"@computerwwwizards/...": "workspace:*"`.
2. **Rslib for Library Bundling:**
   - All packages under `public-packages/` and `private-packages/` use Rslib (`@rslib/core`) for multi-entry ESM and `.d.ts` generation.
3. **Development Exports vs. Publish Config:**
   - Package `package.json` files set root `exports` directly to TypeScript source files (`./src/index.tsx`) for development, while `publishConfig.exports` point to `./dist/` build artifacts.
