# Design — Rest Coder Academy

The UI reference for this repo. Two files:

| File | What it is |
|---|---|
| `ui-template.html` | The visual template. Open it in a browser — colours, type scale, every button and form state, the course card, spacing, radius, breakpoints and the rules. |
| `tokens.css` | The same values as CSS variables. This one is imported by the app; the template is what you look at. |

## Using it

Import the tokens once, above every other stylesheet:

```js
// src/main.jsx
import "../design/tokens.css";
```

Then use variables instead of literals:

```css
/* no */
background: rgb(3, 8, 76);
border-radius: 10px;

/* yes */
background: var(--rca-navy);
border-radius: var(--rca-radius-lg);
```

If a value you need isn't in `tokens.css`, add it there first, then use it. That is the whole
rule — it is why the palette holds together instead of drifting a shade per component.

## Where the values came from

Nothing here is a new brand. The palette is the one already in `src/styles/colors.css`
(navy `#03084C`, blue `#146389`, orange `#FF9800`) and the face is Montserrat, already loaded in
`src/styles/fonts.css`. The template writes them down once so they stop being re-typed per file.

Three things were consolidated, not invented:

- **Font.** Montserrat is loaded but only applies through the `.ff-MS` class. The real body font is
  `Segoe UI`, forced in `src/index.css:8` with `!important`. The navbar and footer use Tilt Neon,
  and Dancing Script is loaded in `index.html` and never used. Montserrat stays; the rest go.
- **Radius.** The app ships ten different values. The template has four.
- **Button states.** `ButtonComponent` has no hover, pressed, focus or loading state today. The
  template defines all six.

## Scope

This covers the **UI only**. Hosting (Cloudflare) and SEO are owned by Nik and are deliberately
not specified here.
