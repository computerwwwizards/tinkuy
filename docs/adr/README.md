# Architecture Decision Records (ADRs)

Welcome to the central Architecture Decision Records (ADR) index for `tinkuy-react` and its associated workspace packages.

---

## Living ADRs Paradigm

In this repository, Architecture Decision Records are treated as **Living ADRs** rather than static, immutable historical records.

### What is a Living ADR?
Traditional ADRs often capture a point-in-time decision and remain untouched forever, leading to drift between documentation and the evolving reality of the codebase. A **Living ADR**:
- **Transitions and Evolves:** As our system architecture, framework capabilities (e.g., React, Next.js), and development standards progress, living ADRs are actively updated to reflect current state and future architectural trajectory.
- **Single Source of Architectural Truth:** AI agents, maintainers, and contributors consult these ADRs to understand not only *why* a decision was originally made, but *how* it currently operates and is expected to evolve.
- **Explicit Lifecycle & Superseding:** When an architectural paradigm undergoes a fundamental transformation, existing living ADRs transition state (e.g., *Living/Active*, *Transitioning*, *Superseded*) with references to the successor ADR.

---

## ADR Index

| ID | Title | Status | Scope |
| :--- | :--- | :--- | :--- |
| **[ADR 0001](adr-001-project-structure.md)** | Project Structure, Monorepo Topology, and Emergent Verification Stack | **Living** | Repository Structure & Topology |
| **[ADR 0002](adr-002-tech-stack.md)** | Core Tech Stack, Runtime Standards, Bundling, and Default Styling | **Living** | Framework, Runtime, Tooling & Styling |
| **[ADR 0003](adr-003-react-client-ioc.md)** | React Client-Side Inversion of Control (IoC) Container Pattern | **Living** | React Client Components & IoC Architecture |

---

## Guidelines for Agents & Contributors

1. **Always Check the Index:** AI agents working on this codebase must first read this index to identify relevant ADRs before embarking on architectural, structural, or tooling changes.
2. **Context Matching:** Select and read the specific Living ADRs that directly pertain to the prompt or task at hand (e.g., package structure vs. runtime dependencies vs. styling).
3. **Evolving ADRs:** If your task introduces an intentional architectural shift, ensure the corresponding Living ADR is updated or a new ADR is created and linked here.
