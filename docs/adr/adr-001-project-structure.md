# ADR 0001: Monorepo Topology, Package Layout, and Emergent Verification Probe

- **Status:** Living
- **Date:** 2026-10-18
- **Deciders:** Core Maintainers (`@computerwwwizards`)
- **Target Scope:** Entire Repository Topology & Monorepo Infrastructure

---

## 1. Context and Problem Statement

`tinkuy-react` is an isomorphic headless component bridge factory designed to serve as the core foundational layer for component libraries and applications. Because the library operates across boundaries between server-side build resolution and client-side interactivity, structural organization and workspace isolation are critical:

1. **Subpath Export Resolution:** Consumers rely on subpath exports (`tinkuy-react/headless`, `tinkuy-react/tailwind`). Misconfigurations in `.d.ts` generation or ESM exports ripple across the entire workspace.
2. **Zero-Phantom Dependency Isolation:** Without strict workspace boundaries, packages might accidentally rely on undeclared transitive dependencies.
3. **Genesis Ripple Effects:** Changes to low-level bridge factories create cascading effects downstream. Maintainers require high-friction feedback in realistic consumer environments rather than isolated mocks.

---

## 2. Decision Drivers

- **Strict Package Resolution:** Ensure workspace packages consume exact local builds without falling back to published npm artifacts.
- **Seamless Local Development:** Support hot reloading across workspace packages without requiring constant re-build steps during active development.
- **In-the-Wild Emergent Verification (SSG Dogfooding):** A live sandbox app inside the repo that forces full Next.js Static Site Generation (SSG) against local library builds to catch boundary bugs.

---

## 3. Decisions

### 3.1 Repository Topology
The repository is organized as a multi-package pnpm workspace:

```text
tinkuy-react/
├── public-packages/
│   └── tinkuy-react/               # Core headless bridge library & subpath exports
├── private-packages/
│   └── example-ui/                 # Private UI component library built with tinkuy-react
├── sandbox-apps/
│   └── generic-searcher/           # Next.js 16 (SSG) real-world verification app
├── docs/
│   ├── adr/                        # Living Architecture Decision Records & README index
│   └── rfcs/                       # Request for Comments
├── package.json
└── pnpm-workspace.yaml
```

### 3.2 `workspace:*` Protocol Enforcement
All internal package dependencies within `private-packages/*` and `sandbox-apps/*` **must** use the strict [pnpm `workspace:*` protocol](https://pnpm.io/workspaces):

```json
{
  "dependencies": {
    "@computerwwwizards/tinkuy-react": "workspace:*"
  }
}
```

This guarantees that pnpm links directly to the local workspace packages and refuses to pull from remote registries.

### 3.3 Development Export Strategy (`exports` vs. `publishConfig`)
To balance instant local feedback with clean npm releases:
- Root `exports` in package `package.json` point directly to TypeScript source files (e.g., `./src/index.ts` / `./src/index.tsx`) during workspace development.
- `publishConfig.exports` point to compiled output in `./dist/` (`./dist/index.js`, `./dist/index.d.ts`), which npm/pnpm swaps when publishing releases.

### 3.4 Emergent Verification Probe: `sandbox-apps/generic-searcher` (Next.js 16 SSG)
We maintain `sandbox-apps/generic-searcher`, configured with Next.js 16 Static Site Generation (`output: 'export'` / static prerendering).
- **Why SSG Prerendering?** Next.js SSG executes Server Components at build time, enforces strict React Server Component (RSC) serialization across `'use client'` boundaries, and validates subpath export resolution simultaneously.
- Any change to the core bridge factory immediately triggers verification in `sandbox-apps/generic-searcher` during build steps.

---

## 4. Consequences

### Positive
- **Immediate Ripple Detection:** Breaking changes to exports, subpath entries, or RSC boundaries fail the `sandbox-apps/generic-searcher` build instantly.
- **Fast Local Feedback:** Developers enjoy source-level type checking and hot reloading across workspace packages.

### Trade-offs
- **Build Coordination:** Running Next.js builds in sandbox applications requires local library builds (`rslib build`) to be generated first when testing `dist/` outputs.
