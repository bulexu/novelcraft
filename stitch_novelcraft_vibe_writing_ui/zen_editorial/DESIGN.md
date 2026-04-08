# Design System Document

## 1. Overview & Creative North Star: The Ethereal Manuscript
This design system is built for the focused novelist. Our Creative North Star is **"The Ethereal Manuscript"**—a digital environment that mimics the focused clarity of a high-end editorial office, stripped of the mechanical clutter of traditional software. 

The aesthetic moves away from the "industrial" look of typical sidebars. We embrace **The Zen Editorial** style by prioritizing depth over lines and atmosphere over structure. By utilizing intentional asymmetry, tonal shifts, and glassmorphism, we create a side panel that feels like a floating pane of frosted glass resting atop the writer's work, rather than a rigid container.

---

## 2. Color & Tonal Surface Strategy
Color in this system is not used for decoration; it is used for **environmental architecture**. 

### The "No-Line" Rule
Explicitly prohibited: 1px solid borders for sectioning or containment. Traditional borders create visual "friction" that disrupts the writing flow. Instead:
- **Boundaries** are defined through background shifts (e.g., a `surface_container_highest` card sitting on a `surface_container_high` background).
- **Hierarchy** is established through the stacking of tiers.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of semi-transparency:
- **Base Layer (The Canvas):** `surface_container_high` (#e9e6f3). This provides a soft, warm-neutral foundation that reduces eye strain.
- **Interactive Layer (The Cards):** `surface_container_highest` (#e4e1ed) at **80% opacity** with a **24px backdrop-blur**. This "frosted glass" effect allows the writer’s manuscript colors to bleed through subtly, maintaining a sense of place.
- **Nesting:** When placing an element *inside* a card (like an AI suggestion block), use `surface_container_low` (#f5f2ff) to create a "recessed" or "inset" feel.

### The "Glass & Gradient" Signature
- **Primary CTAs:** Do not use flat fills. Use a linear gradient from `primary_container` (#4648d4) to a custom vibrance (#6063ee). This provides a "soul" to the action buttons, making them feel pressurized and tactile.
- **Secondary/Warning:** Use `tertiary_container` (#904900). This earthy tone provides a sophisticated contrast to the cool lavenders of the surface tokens without the "emergency" feel of a standard red.

---

## 3. Typography: The Compact Editorial
We utilize **Manrope** for its geometric clarity and modern humanist touch. To fit the complex needs of a novel-writing assistant within a narrow side panel, our scale is **compact and dense**.

*   **Display/Headline:** Use `headline-sm` (1.5rem) for major feature titles. Keep tracking tight (-0.02em).
*   **Title/Subheading:** `title-sm` (1rem) in Bold. Use these for card headers.
*   **Body:** `body-sm` (0.75rem) or `body-md` (0.875rem). The goal is high information density with maximum legibility.
*   **Labels:** `label-sm` (0.6875rem) in All Caps with +0.05em tracking for metadata or small UI hints.

**The Editorial Voice:** Use high contrast between `on_surface` (#1b1b24) for text and `on_surface_variant` (#464554) for secondary descriptions to guide the eye without needing dividers.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are replaced by **Ambient Occlusion** and **Tonal Stacking**.

*   **The Layering Principle:** Depth is achieved by placing lighter surfaces on darker ones. A `surface_container_lowest` (#ffffff) element should only be used for the most urgent floating popovers.
*   **Ambient Shadows:** If an element must "float" (like a context menu), use a shadow with a 32px blur, 0px offset, and 6% opacity. The shadow color must be derived from `on_surface` (#1b1b24) to ensure the shadow feels like a natural lighting effect on the lavender background.
*   **The Ghost Border:** If accessibility requires a stroke (e.g., high-contrast mode), use `outline_variant` (#c6c5d7) at **15% opacity**. It should be felt, not seen.

---

## 5. Components
All components follow the `ROUND_EIGHT` (8px) shape token.

### Buttons & Pill Indicators
*   **Primary Action:** Gradient fill (#4648d4 to #6063ee), white text, 8px radius. 
*   **Pill Tabs:** Use a "pill-style" indicator for navigation. Active states use the `primary` token (#2c2abc) as a soft background fill; inactive states remain transparent.
*   **Focus Beads:** Instead of heavy focus rings, use **Focus Beads**. A small 4px dot (Primary color) appears to the left of the active input or selected list item to indicate focus.

### Input Fields
*   **Text Areas:** Use `surface_container_highest` at 80% opacity. No borders. On focus, the background shifts to `surface_container_low` (#f5f2ff) to create a "sunken" focus state.

### Cards & Lists
*   **No Dividers:** Never use lines to separate list items. Use **Spacing Scale 4 (0.9rem)** to create clear groupings. 
*   **AI Suggestions:** Rendered as Glassmorphic cards. Use the 24px blur to distinguish them from the "hard" sidebar background.

### Custom Component: The "Drafting Pulse"
*   For AI processing states, use a subtle "breathing" opacity animation (from 80% to 100%) on the `surface_container_highest` card rather than a spinning loader.

---

## 6. Do’s and Don'ts

### Do:
*   **Do** use `surface_container_low` for nested items to create a sense of physical carving into the UI.
*   **Do** rely on Manrope’s bold weight for hierarchy rather than increasing font size.
*   **Do** use the Spacing Scale (specifically `2.5` and `4`) to maintain a "dense but breathable" editorial feel.

### Don’t:
*   **Don't** use 1px solid borders. If the UI feels "muddy," increase the contrast between the surface tiers instead.
*   **Don't** use standard "Error Red." Use the `tertiary` (#6d3600) or `tertiary_container` (#904900) for a more organic, high-end warning system.
*   **Don't** use pure black for text. Always use `on_surface` (#1b1b24) to maintain the soft tonal harmony of the lavender palette.