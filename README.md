# Distro Disco – iPhone Frame Prototype

A single-page prototype of the Distro Disco app, rendered inside a realistic iPhone-style frame with custom fonts, smooth in-frame scrolling, and a custom touch-style cursor for desktop.

## 🔗 [Visit Website](https://doga-design.github.io/Distro-Disco-App-Prototype/)
---

## Tech stack

- **HTML/CSS/Vanilla JS** – no build tools required
- **Local fonts**:
  - `fonts/GayaTrial/GayaTrial-Regular.otf` / `GayaTrial-Italic.otf` (headlines)
  - `fonts/Geist/...` (body, UI text)

---

## Getting started

1. **Clone the repo**:
   ```bash
   git clone <YOUR_REPO_URL>
   cd <YOUR_REPO_FOLDER>
   ```

2. **Ensure fonts are present** (expected structure):
   ```text
   /fonts
     /GayaTrial
       GayaTrial-Regular.otf
       GayaTrial-Italic.otf
     /Geist
       Geist-VariableFont_wght.ttf
       /static
         Geist-Thin.ttf
         Geist-ExtraLight.ttf
         Geist-Light.ttf
         Geist-Regular.ttf
         Geist-Medium.ttf
         Geist-SemiBold.ttf
         Geist-Bold.ttf
         Geist-Black.ttf
   ```

3. **Run locally** (any static server works). For example with Python:
   ```bash
   python -m http.server 8000
   ```
   Then open `http://localhost:8000/index.html` in your browser.

> You can also just open `index.html` directly in a browser, but a local server is recommended so all paths behave like they will on GitHub Pages or another host.

---

## Key features

- **iPhone frame shell**
  - Pure-CSS frame (`.phone-frame`) sized to 390 × 844 px
  - Side hardware buttons, Dynamic Island, bottom home/navigation treatment

- **App layout**
  - Header, stats “hero” card
  - Upcoming events
  - Hot ticket items
  - Community forum preview
  - Bottom navigation with custom SVG donate icon animation

- **Typography**
  - **Gaya** for large headings (`h1–h4`)
  - **Geist** for body, meta text, buttons, tabs, and nav labels

- **Interaction & motion**
  - `screen-content` is the only scrollable region; outer page is locked to `100vw × 100vh`
  - Smooth scrolling (`scroll-behavior: smooth`, `-webkit-overflow-scrolling: touch`)
  - Tab and bottom-nav active states driven by lightweight JS
  - Donate icon micro-animation using SVG + CSS keyframes

- **Custom touch-style cursor (desktop)**
  - Native cursor hidden on pointer devices via `@media (pointer: fine)`
  - Small white glass “touch” dot that:
    - **Enlarges + turns orange/glassy** when hovering interactive elements
    - **Compresses** on mouse down for a tap-like feel
  - Disabled automatically on touch devices; falls back to normal touch behavior

---

## File overview

- `index.html` – full UI, inline CSS, and JS
- `img/` – icons and navbar imagery
- `fonts/` – local Gaya and Geist font files (see structure above)

---

## Deployment

Because this is a static site:

- You can deploy it directly to **GitHub Pages** (or any static host) by serving the root folder.
- Ensure the `fonts/` and `img/` directories are deployed alongside `index.html` so fonts and assets load correctly.

