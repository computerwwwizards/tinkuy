# ADR 0002: Core Tech Stack, Runtime Standards, Bundling, and Default Styling

- **Status:** Living
- **Date:** 2026-10-18
- **Deciders:** Core Maintainers (`@computerwwwizards`)
- **Target Scope:** Entire Monorepo Framework, Runtime, Bundling & Styling Standards

---

## 1. Context and Problem Statement

`tinkuy-react` and its ecosystem of packages require clear, standardized guidelines regarding node runtimes, React framework versions, component styling engines, library bundlers, testing infrastructure, and component isolation tools to maintain high quality and cohesion across all workspace packages.

---

## 2. Decision Drivers

- **Modern React 19 Paradigms:** Full alignment with React 19 features (Server Components, Compiler compatibility, modern JSX runtime).
- **High Development Velocity & Atomic Styling:** Rapid UI development without custom CSS boilerplate or runtime style overhead.
- **Fast Rust-Based Tooling:** Speed up bundling, testing, and component isolation across all workspace packages.
- **Strict Standards:** Prevent usage of deprecated APIs and inconsistent styling approaches.

---

## 3. Decisions

### 3.1 Runtime, Package Management & Versioning: Node.js 26 + `pnpm` (`^12.14.0`) + Changesets
- **Node.js `26.x`:** Enforced via `engines` and `devEngines` in the root `package.json`.
- **`pnpm` `^12.14.0`:** Enforced package manager for workspace management and strict `node_modules` dependency resolution.
- **Changesets (`@changesets/cli`):** Standard tool for versioning, changelog generation, and publishing releases.

### 3.2 Framework Versions & Strict React Standards: React 19 + Next.js 16
- **React 19 (`^19.0.0`) & Next.js 16 (`^16.0.0`):** Mandatory across all public packages, private packages, and sandbox applications.
- **Strict Prohibition of Deprecated React APIs:** Legacy React APIs (such as manual `React.createElement` calls) are explicitly forbidden. All components **must** be written using standard React 19 JSX syntax (`<Component />`) relying on the automatic JSX runtime.

### 3.3 Default Styling Solution: Tailwind CSS (v4)
- **Tailwind CSS (v4) as Default:** Tailwind CSS is designated as the default styling solution for all component packages and sandbox applications in the workspace.
- **Prohibition of Inline `style` Props:** The usage of inline `style={{ ... }}` props is strictly prohibited across components and applications in the workspace. All layout, spacing, and visual styling must be implemented using Tailwind CSS utility classes or component stylesheets.
- **Strict Flat `(0, 1, 0)` CSS Specificity via `:where()`:** Custom component stylesheets must avoid high-specificity selector nesting. Child element selectors and state pseudo-classes inside component classes must be wrapped in `:where()` (e.g., `.input-frame :where(input)`, `.input-frame:where(:has(...))`) to maintain a flat `(0, 1, 0)` specificity weight, allowing consumer Tailwind utility overrides without resorting to `!important`.
- **Rationale (Velocity & Atomicity):**
  - **Velocity:** Utility-first class names drastically accelerate UI development, eliminating context switching between stylesheets and JSX.
  - **Atomicity:** Atomic utility classes ensure zero CSS duplication, minimal bundle size overhead, predictable style composition, and clean integration with `tinkuy-react` bridge factories.

### 3.4 Library Bundler: Rslib (`^1.0.0`)
- Public and private component packages (`public-packages/tinkuy-react`, `private-packages/example-ui`) use **Rslib (`^1.0.0`)** (powered by Rspack/Rsbuild).
- **Rationale:** Native support for multi-entry ESM output, preserving `'use client'` module boundaries (`*.client.tsx`) and generating TypeScript `.d.ts` declarations with path redirection.

### 3.5 Component Isolation: Storybook (`storybook-react-rsbuild`)
- **Storybook:** Global standard for isolated UI component development and visual testing.
- **Rsbuild Integration (`storybook-react-rsbuild`):** Leverages Rspack/Rsbuild for fast HMR and build configuration alignment with Rslib.

### 3.6 Testing Stack: Vitest (`^3.0.0`) + React Testing Library
- **Vitest Workspace Projects:** Configured in root `vitest.config.ts` using the `projects` setting to discover tests in `public-packages/*`, `private-packages/*`, and `sandbox-apps/*`.
- **React Testing Library (`@testing-library/react`):** Standard tool for component unit and integration testing alongside `jsdom` environments.

### 3.7 Inversion of Control & Dependency Injection: `@computerwwwizards/dependency-injection`
- **`@computerwwwizards/dependency-injection` as Workspace Standard:** Used across workspace packages and applications for Inversion of Control (IoC) and dependency resolution.
- **Rationale:** Lightweight, callback-based DI container without proxies or decorator magic. Supports explicit lifecycles (`singleton`, `transient`) and plugin middleware patterns compatible with modern bundlers and React environments.

### 3.8 Service Worker Tooling & Next.js Lifecycle: Workbox CLI + Next.js Client Instrumentation
- **Workbox CLI (`workbox-cli`):** Workspace standard for service worker generation, precache manifest creation, and routing strategy management.
- **Next.js Client Instrumentation (`instrumentation-client.ts`):** Standard entry point for registering service workers in client environments in Next.js applications.
- **Rationale:** Standardizes progressive web app capabilities across sandbox apps and workspace tools using Workbox's fluent routing and precaching APIs, while keeping client-side service worker registration decoupled via Next.js client instrumentation files (`instrumentation-client.ts`).

### 3.9 HTTP Client: `openapi-fetch`
- **`openapi-fetch` as Workspace Standard:** Used across applications and service layers for type-safe HTTP queries against OpenAPI backends.
- **Type-Safety with Generated Schemas:** Utilizes schema interfaces generated by `openapi-typescript` (`paths`) to guarantee end-to-end compile-time type-safety for requests and responses.
- **IoC Container Lifecycle:** Instances of `openapi-fetch` client are bound as `singleton` services inside the application Inversion of Control (IoC) container and injected into domain service layer abstractions.
- **Rationale:** Lightweight (<2KB), ultra-fast native `fetch` wrapper with built-in TypeScript inferencing that avoids heavy runtime HTTP abstractions or code generation boilerplate while ensuring strict schema compliance.

---

## 4. Consequences

### Positive
- **Velocity:** Tailwind CSS enables rapid component styling with utility-first atomic CSS.
- **Consistency:** Unifies React 19 standards, prohibiting deprecated React functions, inline style props, and high-specificity selectors across the codebase.
- **Performance:** Rslib + Rsbuild + Vitest provide lightning-fast builds and test runs.

### Trade-offs
- **Styling Dependency:** Component packages adopting default styling need Tailwind CSS (v4) available in consumer projects or declared as peer dependencies.
