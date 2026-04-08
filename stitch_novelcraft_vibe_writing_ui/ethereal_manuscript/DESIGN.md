# Design System Specification: The Ethereal Manuscript

## 1. Overview & Creative North Star
This design system is built to transform the act of novel planning from a chaotic data-entry task into a meditative, editorial experience. We are moving away from the "productivity dashboard" aesthetic and toward a **Creative North Star we call "The Digital Curator."**

The system rejects the rigid, boxy constraints of standard SaaS interfaces. Instead, it utilizes intentional asymmetry, expansive whitespace, and sophisticated tonal layering. We treat the screen not as a grid of containers, but as a vast, ethereal canvas where story elements float with purpose. By blending high-end editorial typography with "glassmorphic" depth, we create a sanctuary for writers—a place that feels as light as a blank page but as structured as a finished manuscript.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a soft, breathable base (`surface: #fcf8ff`) punctuated by authoritative, scholarly tones.

### The "No-Line" Rule
**Explicit Instruction:** Use of 1px solid borders for sectioning or containment is strictly prohibited. 
Boundaries must be defined through **Background Tonal Shifts**. For example, a sidebar should not be "lined" off; it should be rendered in `surface_container_low` against a `surface` background. This creates a "soft edge" that reduces cognitive load and maintains the "Zen" atmosphere.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, fine papers.
*   **Base Layer:** `surface` (#fcf8ff)
*   **Secondary Sections:** `surface_container_low` (#f6f2f9)
*   **Interactive/Elevated Elements:** `surface_container_lowest` (#ffffff) for maximum "pop" or `surface_container_high` (#eae7ee) for recessive depth.
*   **Signature Texture:** All main graph backgrounds must feature a subtle grid pattern using `outline_variant` at 15% opacity to provide a sense of scale without visual noise.

### The Glass & Gradient Rule
To prevent the UI from feeling "flat," use Glassmorphism for floating tooltips and overlays.
*   **Tooltip Fill:** `surface` at 70% opacity with a `20px` backdrop-blur.
*   **CTA Soul:** For primary actions, use a subtle linear gradient from `primary` (#2c2abc) to `primary_container` (#4648d4) at a 135-degree angle. This adds a "lithographic" depth that flat hex codes lack.

---

## 3. Typography
We use **Manrope** exclusively. It is a modern, geometric sans-serif that retains an organic warmth, bridging the gap between digital precision and human storytelling.

*   **Display (Editorial Moments):** Use `display-lg` and `display-md` for chapter titles or high-level manuscript stats. These should have generous letter-spacing (-0.02em) to feel premium.
*   **Headlines (Structural Hierarchy):** `headline-sm` is your workhorse for graph section headers.
*   **Body (The Narrative):** `body-lg` is optimized for readability. In the knowledge graph context, use `body-md` for descriptions to keep the "manuscript" feel.
*   **Labels (The Metadata):** `label-md` and `label-sm` should be used for node tags and timestamps, often in `on_surface_variant` (#464554) to keep them secondary to the story content.

---

## 4. Elevation & Depth
Hierarchy in this system is achieved through **Tonal Layering** rather than structural lines.

*   **The Layering Principle:** Place a `surface_container_lowest` card on a `surface_container_low` section to create a natural, "paper-on-desk" lift.
*   **Ambient Shadows:** For elements that truly float (e.g., the graph's main control floating action button), use the signature shadow: `0 12px 40px rgba(27, 27, 35, 0.06)`. This shadow color is a tinted version of `on_surface`, ensuring it looks like natural ambient light, not a "dirty" grey drop shadow.
*   **The Ghost Border:** If accessibility requires a stroke (e.g., on an input field), use the "Ghost Border" method: `outline_variant` at 20% opacity. Never use a 100% opaque border.

---

## 5. Components

### Knowledge Graph Nodes (The Core)
Nodes are the "ink" of the system. They must be distinct but harmonious.
*   **Characters (Circles):** Use `primary` (#2c2abc). These are the anchors of the story.
*   **Events (Diamonds):** Use `tertiary_container` (#904900). The diamond shape implies a "point in time" or a "decision point."
*   **Locations (Rectangles):** Use `secondary` (#575992). The rectangle suggests a "container" or a physical space.
*   *Interaction:* On hover, nodes should increase in scale by 10% and trigger a glassmorphic tooltip.

### Buttons
*   **Primary:** Gradient fill (Primary to Primary Container), `rounded-full`, no border.
*   **Secondary:** `surface_container_high` fill, `on_surface` text, `rounded-full`.
*   **States:** On hover, primary buttons should gain the signature Ambient Shadow.

### Cards & Lists
*   **Constraint:** No divider lines. 
*   **Separation:** Use `spacing-6` (2rem) of vertical whitespace to separate list items, or alternate background tints between `surface` and `surface_container_low`.

### Tooltips
*   **Style:** Glassmorphic. `surface` at 80% opacity, `blur(12px)`, `rounded-md`.
*   **Shadow:** Apply the signature Ambient Shadow to give the tooltip "float."

### Input Fields
*   **Style:** No background, just a "Ghost Border" bottom-stroke.
*   **Focus State:** The bottom-stroke transitions to `primary` with a thickness of 2px.

---

## 6. Do's and Don'ts

### Do
*   **Do** embrace "uncomfortable" amounts of whitespace. It is the "Zen" in the system.
*   **Do** use asymmetrical layouts for the knowledge graph sidebar to make it feel like a curated scrapbook rather than a table.
*   **Do** use `primary_fixed_dim` for subtle highlights in text-heavy areas.

### Don't
*   **Don't** use pure black (#000000) for shadows or text; use `on_surface` (#1c1b20).
*   **Don't** use sharp corners. Follow the Roundedness Scale (`md: 0.75rem`) for most containers to maintain the "Soft Minimalism" feel.
*   **Don't** add borders to cards. If a card isn't visible, increase the tonal contrast of the background behind it.