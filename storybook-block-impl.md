# Storybook blocks for AEM Edge Delivery (EDS) — implementation guide

Use this document in **any EDS front-end repo** (or paste into Cursor) to add or extend Storybook stories for `blocks/*` the same way. It is **not** tied to `storybook-creation.md` (installer / Node / CLI history).

## Goals

- **One visual source of truth:** reuse real **`blocks/{name}/{name}.css`** in Storybook.
- **Safe HTML:** pure “view” functions escape text when they build strings for **`innerHTML`**.
- **Clear split:**
  - **`decorate(block)`** — real pages; reads AEM-style DOM, network, `window.hlx`, etc.
  - **`*-view.js`** — optional helpers that output **initial** or **static** markup for stories (and can be reused from `decorate` when it fits, as with **Hero**).

## Folder layout (align with EDS)

```text
blocks/
  {block}/
    {block}.js       # export default function decorate(block)
    {block}.css
    {block}-view.js  # optional: render*, build*InitialHtml, etc. (no fetch)
stories/
  {Block}.stories.js # CSF; title: 'Blocks/{Block}'
.storybook/
  preview.js         # global CSS + decorators
  {block}-storybook.css   # optional: Storybook-only overrides
```

## 1. Register styles in Storybook

In **`.storybook/preview.js`** import:

1. **Fonts / tokens / globals** your site needs (e.g. `styles/fonts.css`, `styles/styles.css`).
2. **Each block’s CSS** you will show in stories (e.g. `../blocks/cards/cards.css`).

Order matters: **design tokens / `styles.css` first**, then **block CSS**, then **Storybook-only overrides**.

### EDS: `body { display: none }` until `.appear`

If global CSS hides **`body`** until **`.appear`** (LCP pattern), add a **preview decorator**:

```javascript
decorators: [
  (Story) => {
    document.body.classList.add('appear');
    return Story();
  },
],
```

## 2. Choose a story strategy per block

| Block pattern | Story approach | Example in this repo |
|---------------|----------------|----------------------|
| **Sync `decorate`**, transforms given DOM | Build **initial HTML** in `*-view.js`, create `div.{name}.block`, set `innerHTML`, call **`decorate(block)`** | **Columns**, **Cards** |
| **`decorate` uses `renderX` for final HTML** | Story calls **`renderX(args)`** only (or also **`decorate`** on synthetic markup) | **Hero** |
| **`decorate` async fetch** (fragment, header, footer) | **Static preview** in `*-view.js` + story; document that real behavior needs **`aem up` / publish** | **Footer**, **Header**, **Fragment** |

Do **not** block Storybook on **`fetch('/nav.plain.html')`** unless you run a mock server or MSW.

## 3. Add `{block}-view.js`

**Exports:** one or more **named** functions (avoid default export if ESLint `import/prefer-default-export` complains — use `/* eslint-disable import/prefer-default-export */` at top of the file).

**Naming:**

- **`render{Name}StoryHtml`** — static markup for Storybook only.
- **`render{Name}InitialHtml`** — string inserted into **`div.block`** **before** `decorate` runs.
- **`render{Name}(props)`** — final hero-style HTML shared by EDS + Storybook (see **Hero**).

**Escaping:** Any user- or author-controlled string in HTML must go through **`escapeHtml` / `escapeAttr`** (copy the small helpers from **`blocks/hero/hero-view.js`** or **`blocks/cards/cards-view.js`**).

## 4. Add `stories/{Block}.stories.js`

**CSF conventions:**

```javascript
export default {
  title: 'Blocks/{Block}',  // sidebar group
  parameters: { layout: 'fullscreen' },
};
```

**Sync decorate pattern:**

```javascript
import decorate from '../blocks/columns/columns.js';
import { renderColumnsInitialHtml } from '../blocks/columns/columns-view.js';

const Template = (args) => {
  const block = document.createElement('div');
  block.className = 'columns block';
  block.innerHTML = renderColumnsInitialHtml([/* rows of cell HTML */]);
  decorate(block);
  return block;
};

export const Default = Template.bind({});
Default.args = { /* … */ };
```

**Async `decorate` (if you must):** use Storybook 7+ **`render: async (args) => { ... }`** or load data in **`play`** — prefer **static** preview for simplicity.

**Semantic wrappers:** Match live DOM where CSS expects it:

- **Footer:** outer **`<footer>`** → **`div.footer.block`**.
- **Header:** outer **`<header>`** → **`div.header.block`**.

## 5. Storybook-only CSS

When production uses **light text on imagery** but the canvas is **white**, add a **scoped class** on the story root (e.g. **`hero-storybook`**) and rules in **`.storybook/{name}-storybook.css`**, imported **after** the block CSS. **Never** change production CSS just for Storybook unless product agrees.

## 6. ESLint

Sample **`stories/**`** often conflicts with strict Airbnb rules (`storybook/test`, `import/no-unresolved`, etc.). Common approach: **`ignorePatterns: ['stories/**', '.storybook/**']`** in **`.eslintrc.js`**, while **`blocks/*-view.js`** stay linted.

## 7. Verify with `npm run lint` (required)

After you add or change **`*-view.js`**, **`decorate`**, **`.storybook/*`**, or **`package.json`** scripts:

1. Run **`npm run lint`** from the repo root. In Adobe boilerplate-style projects this usually runs **ESLint** (e.g. `eslint .`) and **Stylelint** on block/global CSS — catch issues before Storybook or CI.
2. If the project defines **`npm run lint:fix`**, use it to auto-fix what ESLint/Stylelint allow, then run **`npm run lint`** again until it exits cleanly.

**`stories/**`** may be excluded from ESLint; **`blocks/*-view.js`** typically is **not**, so new view files must pass the same rules as other production-adjacent JS.

Then run **`npm run storybook`** for visual checks, and optionally **`npm run build-storybook`**.

## 8. Checklist — new block `{name}`

1. [ ] **`blocks/{name}/{name}.css`** — import in **`preview.js`**.
2. [ ] **`blocks/{name}/{name}-view.js`** — story helpers / shared `render*` (optional but recommended).
3. [ ] **`stories/{Name}.stories.js`** — `title: 'Blocks/{Name}'`, args, `Template`.
4. [ ] If **sync `decorate`**, build **`div.{name}.block`** + initial inner HTML from the view helper, then **`decorate(block)`**.
5. [ ] If **fetch/async**, add **static** story + one-line note in story description.
6. [ ] **`npm run lint`** — must pass (ESLint + Stylelint per project).
7. [ ] **`npm run storybook`** — manual visual check.
8. [ ] Optional: **`npm run build-storybook`** in CI.

## 9. Reference — blocks in `kao-sandbox-3`

| Block | Story file | View helper | Notes |
|-------|------------|-------------|--------|
| Hero | `stories/Hero.stories.js` | `hero-view.js` | `renderHero`; wrapper **`hero-storybook`** + **`hero-storybook.css`** for text color |
| Columns | `stories/Columns.stories.js` | `columns-view.js` | `renderColumnsInitialHtml` + **`decorate`** |
| Cards | `stories/Cards.stories.js` | `cards-view.js` | `renderCardsInitialHtml` + **`decorate`** |
| Footer | `stories/Footer.stories.js` | `footer-view.js` | **Static** — real block loads **`/footer.plain.html`** |
| Header | `stories/Header.stories.js` | `header-view.js` | **Static nav shell** — real block uses AEM XF or **`/nav`** |
| Fragment | `stories/Fragment.stories.js` | `fragment-view.js` | **Static demo** — real block **`fetch`**es fragment |

## 10. Porting to another repository

1. Copy this guide (or `@`-reference it from your repo docs).
2. Ensure **Storybook HTML + Vite** (or your chosen framework) is installed (`npm create storybook@latest -- --type html`).
3. Re-create **`.storybook/preview.js`** imports for **that** repo’s `styles/` and `blocks/`.
4. For each block, add the **`-view.js` + story** pair using the **strategy table** above.
5. Run **`npm run lint`** until clean, then **`npm run storybook`**.
6. Keep **EDS delivery** free of Storybook-only imports: **only** `preview.js` and `stories/` may import Storybook tooling; **`blocks/*.js`** should remain valid on **`aem.live`** (view files are plain ES modules with no Storybook deps).

---

*This file is meant for humans and AI agents implementing or reviewing Storybook coverage on EDS block repositories.*
