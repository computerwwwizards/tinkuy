# RFC: Booting animation

## Summary

This RFC specifies a **stateless, compositor-driven vertical curtain reveal** for the Pokédex boot sequence. The design utilizes two independent viewport-pinned panels—each occupying exactly half of the dynamic viewport height (`50dvh`) as sibling root elements without an encapsulating full-screen wrapper—driven by a predetermined, time-based animation timeline. It also outlines the geometric strategies for rendering the split semi-circular Pokéball emblem across the central horizontal equator without introducing coupling to a specific styling framework or DOM structure.

## Motivation

* **Zero Runtime Orchestration:** Relying on client-side state mutations to trigger the opening transition delays the boot sequence until script execution and hydration complete. A declarative, time-driven animation timeline begins at the initial document paint.
* **Flat Topology:** Omitting a full-screen wrapper container prevents hit-testing interception over the revealed center strip as the panels part, allowing immediate user interaction with the underlying application without needing wrapper node removal or hit-test delegation.
* **Zero Layout Shift (CLS):** Because the two panels operate on an independent fixed layer above the document flow, the underlying Pokédex interface renders in its final geometry from frame zero.

# Guide-level explanation

The boot curtain consists of two sibling top-level regions—an upper panel and a lower panel—each occupying exactly 50% of the dynamic viewport height (`50dvh`).

1. **Initial Hold Phase:** On first paint, both panels sit flush against the horizontal center equator. Each panel displays its corresponding semi-circular half of the central Pokéball emblem anchored directly against its inner seam.
2. **Vertical Split Phase:** Once a predefined hold duration expires, both panels execute a vertical translation on the GPU compositor thread. The upper panel translates upward (-100% along the Y-axis), and the lower panel translates downward (+100% along the Y-axis). Because the panels part vertically from the center, the middle horizontal band of the Pokédex application is exposed first and expands outward toward the top and bottom edges of the viewport.
3. **Terminal State:** Upon reaching the end of the timeline, both panels lock into their off-screen positions and transition their visibility state to hidden, removing them from paint and hit-testing cycles without requiring runtime node removal.

# Reference-level explanation

## 1. Viewport-Pinned Curtain Mechanics

Each curtain half is anchored independently to the top and bottom viewport boundaries as a fixed element with height `50dvh` and spans the full viewport width. No full-screen wrapper element is used. Both panels share a single animation timeline definition parameterized by a directional vector:

* **Upper Panel:** Pinned to the top edge (`fixed top-0 left-0 right-0 h-[50dvh]`), bordered along its bottom seam, and configured with a negative vertical translation vector.
* **Lower Panel:** Pinned to the bottom edge (`fixed bottom-0 left-0 right-0 h-[50dvh]`), bordered along its top seam, and configured with a positive vertical translation vector.
* **Timeline Execution:** The animation holds at 0% translation for a fixed delay constant, interpolates to the directional vector over a fixed duration using an ease-in-out timing curve, and persists its final state forward while toggling visibility off at the final frame.
* **Pointer Pass-Through:** Each panel carries pointer pass-through behavior (`pointer-events-none`) or releases hit-testing so that the underlying Pokédex interface is immediately interactive as panels part.

## 2. Constructing the Semi-Circular Pokéball Halves

To render the central Pokéball so that it cleanly splits along the horizontal seam, the architecture supports two high-level geometric patterns:

### Pattern A: Intrinsic Semi-Circle Geometry via Concentric Gradients
Instead of clipping a complete circle, each panel renders a true geometric semi-circle (a 2:1 width-to-height aspect ratio box) anchored flush against its inner seam edge.

* **Upper Hemisphere:** Anchored to the bottom-center of the upper panel with rounded top corners and flat bottom corners. A radial gradient originating at the bottom-center coordinate (50% horizontal, 100% vertical) draws the concentric rings—inner button core, light gray ring, dark structural band, and red outer shell—using hard color stops.
* **Lower Hemisphere:** Anchored to the top-center of the lower panel with rounded bottom corners and flat top corners. A radial gradient originating at the top-center coordinate (50% horizontal, 0% vertical) mirrors the exact same concentric hard stops, substituting the outer shell fill with white.

### Pattern B: Shared Full-Circle Coordinate Offset with Boundary Clipping
If the emblem is represented as a unified 1:1 square asset (such as a vector graphic or pre-existing component), both panels enforce strict boundary clipping on their overflow.

* **Upper Hemisphere:** Instantiates the full-scale emblem centered horizontally, offsetting its bottom edge downward by exactly half of the emblem's total height. The panel boundary naturally clips the lower half at the equator.
* **Lower Hemisphere:** Instantiates the full-scale emblem centered horizontally, offsetting its top edge upward by exactly half of the emblem's total height. The panel boundary naturally clips the upper half at the equator.

# Drawbacks

* **Fixed Hold Duration vs. Network Variance:** Because the hold delay is a predetermined time constant rather than an event-driven callback, the curtain will open on schedule even if asynchronous client-side data fetching is still in progress (exposing loading skeletons underneath).

# Rationale and alternatives

* **Why Two Sibling Panels over a Single Clipping Mask or Outer Wrapper?** Animating two sibling fixed panels directly avoids unnecessary wrapper DOM layers, preventing pointer interception over the exposed viewport center while keeping the DOM structure minimal.
* **Why Concentric Gradients (Pattern A) over Nested Nodes?** Representing the concentric rings of the Pokéball (outer shell, dark band, inner ring, center button) using discrete DOM elements requires multiple nested nodes per panel. Encoding the rings as hard radial stops originating from the seam edge collapses the graphic into a single paint layer with zero child nodes.

# Prior art

* **Clamshell Hardware Transitions:** Dual-screen handheld Pokédex designs utilize physical top-and-bottom shutters anchored to a central circular latch that split vertically to reveal the primary display.
* **Split-Panel Viewport Curtains:** Classic two-panel sliding door transitions adapted to operate along the vertical axis via compositor-only translations and forward-filling timelines rather than script-toggled classes.

# Resolved questions

* How should reduced-motion accessibility preferences be handled? Handled by bypassing transition and immediately setting panels to hidden for users preferring reduced motion.
* Panel height and topology: Both panels use exact dynamic viewport height (`50dvh`) anchored as sibling root elements without outer wrapper containers or pixel height offsets.
