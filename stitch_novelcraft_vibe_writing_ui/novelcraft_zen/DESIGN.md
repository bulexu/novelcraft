# Design System Document: The Zen Editorial

## 1. Overview & Creative North Star
This design system is anchored by a Creative North Star we call **"The Zen Editorial."** For an AI-powered Chinese novel writing assistant, the UI must transcend being a mere "tool" and become a focused, immersive environment. We are moving away from the cluttered, "dashboard-heavy" look of traditional software. Instead, we embrace a high-end editorial aesthetic that mimics the tactile quality of premium stationery and the fluid intelligence of modern AI.

The "Zen Editorial" look is achieved through:
*   **Intentional Asymmetry:** Breaking the rigid grid to guide the eye through the narrative flow.
*   **Tonal Architecture:** Using background shifts instead of lines to define space.
*   **Breathing Room:** Utilizing an aggressive spacing scale to ensure the writer never feels "boxed in."

## 2. Colors & Surface Philosophy
The palette is built on a sophisticated "Off-White" foundation to reduce eye strain during long writing sessions, punctuated by a signature Indigo that feels authoritative yet creative.

### The "No-Line" Rule
**Prohibit 1px solid borders for sectioning.** Traditional borders create visual noise that distracts from the text. Boundaries must be defined solely through:
1.  **Background Color Shifts:** A `surface-container-low` (#f5f2fe) sidebar sitting against a `surface` (#fcf8ff) main workspace.
2.  **Soft Tonal Transitions:** Using `surface-variant` (#e4e1ed) to indicate a change in context without a hard stop.

### Surface Hierarchy & Nesting
Treat the UI as a series of layered sheets. 
*   **Base:** `background` (#fcf8ff).
*   **The Workspace:** `surface-container-lowest` (#ffffff) for the actual manuscript area to provide maximum contrast.
*   **The Utility:** `surface-container` (#efecf8) for secondary panels.
*   **The Tooling:** `surface-container-highest` (#e4e1ed) for floating toolbars or active AI suggestion boxes.

### The "Glass & Gradient" Rule
To elevate the "AI" aspect, use Glassmorphism for floating UI elements. 
*   **Implementation:** Use `surface_container_low` at 80% opacity with a `24px` backdrop-blur. 
*   **Signature Textures:** Main CTAs should not be flat. Apply a subtle linear gradient from `primary` (#4648d4) to `primary_container` (#6063ee) at a 135-degree angle to give the buttons a "lithographic" depth.

## 3. Typography
The typography scale is designed to balance the geometric precision of Latin characters with the density of Chinese glyphs.

*   **Display & Headlines (Manrope):** Chosen for its modern, wide stance. Use `display-md` (2.75rem) for chapter titles to create an editorial feel.
*   **Body (Inter / System Chinese):** Inter provides exceptional legibility for English, while the system fallbacks (like PingFang SC or Microsoft YaHei) are utilized for Chinese text. 
*   **Rhythmic Contrast:** Use `label-md` (0.75rem) in `on_surface_variant` (#464554) for metadata (word counts, timestamps) to keep it subservient to the primary narrative text.

## 4. Elevation & Depth
In this system, depth is a functional tool, not a decoration.

*   **The Layering Principle:** Avoid shadows for static components. Place a `surface-container-lowest` card on a `surface-container-low` background. The subtle shift in hex value creates a "Soft Lift."
*   **Ambient Shadows:** For floating AI suggestion modals, use an "Ambient Shadow": `0 12px 40px rgba(27, 27, 35, 0.06)`. This mimics natural light and prevents the UI from feeling "heavy."
*   **The "Ghost Border" Fallback:** If a UI element (like a search input) risks disappearing, use a "Ghost Border": the `outline_variant` (#c7c4d7) token at 20% opacity. Never use a 100% opaque border.

## 5. Components

### Layout: The Three-Column Narrative
*   **Sidebar (240px):** Set to `surface-container-low`. Contains navigation and manuscript folders.
*   **Main Workspace (Fluid):** Set to `surface`. The "Manuscript Sheet" is a centered `surface-container-lowest` container with a max-width of 800px.
*   **AI Inspector (Variable):** An asymmetrical right-hand panel that uses `surface-container-high` to distinguish it as an "active" assistant layer.

### Buttons
*   **Primary:** Gradient (`primary` to `primary_container`), `8px` (DEFAULT) roundness, `on_primary` text. No border.
*   **Secondary:** `surface-container-highest` background with `primary` text. 
*   **Tertiary:** No background. `primary` text with an underline that appears only on hover.

### Input Fields
*   **Manuscript Area:** No visible input box. The text should feel like it's being written directly onto the "paper."
*   **Search/Metadata:** Use `surface-container-low` with a 10% `outline-variant` ghost border.

### Cards & Lists
*   **Forbid Dividers:** Never use a horizontal line to separate list items. Use `spacing-4` (1rem) of vertical whitespace or a subtle `surface-container-lowest` hover state to define rows.

### Additional Signature Components
*   **The Focus Bead:** A small, `primary` colored dot next to the current paragraph the AI is analyzing, replacing traditional highlight boxes.
*   **The Floating Quill:** A floating action button (FAB) using Glassmorphism and a `primary` icon for "New Chapter."

## 6. Do's and Don'ts

### Do:
*   **DO** use whitespace as a functional element to group related AI suggestions.
*   **DO** utilize the `tertiary` (#904900) color for "Writing Tips" or "Critique" to distinguish human-like advice from system-generated actions.
*   **DO** ensure the `on_surface` (#1b1b23) color is used for body text to maintain high contrast for accessibility.

### Don't:
*   **DON'T** use pure black (#000000) for text. Always use the `on_surface` token.
*   **DON'T** use traditional Material Design shadows (heavy, dark, multi-layered). Stick to Ambient Shadows.
*   **DON'T** use 1px borders to separate the sidebar from the main content. Use the transition from `surface-container-low` to `surface`.
*   **DON'T** cram the 240px sidebar with icons. Rely on `label-md` typography for a cleaner, editorial look.