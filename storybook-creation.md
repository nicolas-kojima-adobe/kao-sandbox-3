# Storybook on an AEM Edge Delivery Services (EDS) front-end repo

Living document: append new entries under **Update log** as you run commands and change the repo. Goal: capture **what** we did, **why**, **exact commands**, and **outcomes** so the next person (or future you) can reproduce or debug the setup.

**Project context:** `kao-sandbox-3` — Adobe Helix / Edge Delivery boilerplate style repo: **vanilla JS** blocks (`blocks/*/*.js`), **no React/Vue app**, minimal `package.json` (lint + build only). That shape matters for Storybook’s installer.

---

## Why Storybook on EDS at all?

- **Storybook** is useful for **isolated UI development** and a **component catalog** if you invest in stories that call your block `decorate()` functions with realistic DOM.
- **EDS default workflow** is often **`aem up`** + **`drafts/*.html`** (see [AGENTS.md](./AGENTS.md)) — no bundler, no framework. Storybook **adds** Vite/Webpack and a separate dev server; it is **optional**, not required by Adobe for EDS.

---

## Prerequisites (Storybook 10.x)

| Requirement | Notes |
|-------------|--------|
| **Node.js** | Storybook **10.x** requires **Node 20.19+** or **22.12+**. **20.17** (and similar) fails the CLI with an explicit version error. **Action:** upgrade Node (e.g. `nvm install 20.19 && nvm use 20.19`) before running the installer. |
| **Package manager** | npm / pnpm / yarn — Storybook CLI supports all; examples below use **npm** with explicit `--package-manager npm` when needed. |

---

## What does *not* work (lessons learned)

### 1. `npm run storybook` with no setup

**Command:**

```bash
npm run storybook
```

**Result:** `Missing script: "storybook"` — nothing installed yet; `package.json` has no `storybook` script.

**Why:** Run the Storybook **create/init** flow first; it adds scripts and dependencies.

---

### 2. `npx storybook@latest init` with no project type (auto-detect only)

**Command:**

```bash
npx storybook@latest init
```

**Result (EDS repo):** *Unable to initialize Storybook… couldn't detect a supported framework or configuration.*

**Why:** The CLI looks for **React, Vue, Next.js, etc.** in dependencies and config. An EDS boilerplate repo has **none of those** — only ESLint/Stylelint and block JS. Detection stops **before** any interactive “choose HTML” step.

**Lesson:** For vanilla / EDS repos you must **force the project type** (see working commands below). Docs that say “run init and choose HTML” assume the wizard runs; here it often **does not** until you pass `--type html`.

---

### 3. Wrong: bare `html` as a positional argument

**Command (incorrect):**

```bash
npm create storybook html
# or anything that invokes: create-storybook html
```

**Result:** `error: too many arguments. Expected 0 arguments but got 1.` (installer receives `html` as a positional arg.)

**Why:** The CLI expects **`--type html`**, not a bare word `html`.

---

### 4. Mis-typed create command

**Command (incorrect pattern):**

```bash
npx storybook@latest init
# without --type, on EDS → fails detection
```

**Command (incorrect pattern):**

```bash
create-storybook html
```

Use the **official** `npm create storybook@latest` flow with **`--type html`** (see below).

---

## What *should* work (official Storybook 10 install)

Storybook docs: if auto-detection fails, pass **`--type`** explicitly. For vanilla markup/JS blocks, use **`html`**, not `web_components`, unless you use **Custom Elements / Lit**.

### Recommended: npm with `--` so flags reach `create-storybook`

**Command:**

```bash
cd /path/to/your-eds-repo
npm create storybook@latest -- --type html --package-manager npm
```

**Why the `--`:** For **npm**, everything after `--` is forwarded to the `create-storybook` binary. That avoids npm swallowing flags or misparsing `html`.

### Alternatives

**pnpm:**

```bash
pnpm create storybook@latest --type html
```

**yarn:**

```bash
yarn create storybook --type html
```

**Why:** Same installer; package manager matches your repo.

---

## After a successful install (expected artifacts)

When setup completes, you typically get:

- **`.storybook/`** — `main` config, preview, framework (e.g. `@storybook/html-vite`).
- **`storybook` / `build-storybook` scripts** in `package.json`.
- **Sample stories** (often under `src/stories/` — path may vary).
- **Dev dependency** Storybook packages (versions pinned by the CLI).

**Run locally:**

```bash
npm run storybook
```

Default URL is usually **http://localhost:6006**.

---

## EDS-specific follow-up (not done by the CLI)

The installer does **not** wire your **`blocks/hero/hero.js`** patterns automatically. You still need to:

1. Import **block CSS** in preview or per-story.
2. Build **DOM** that matches what AEM delivers (or minimal `div.section` / `div.block` structure).
3. **`import decorate from '../../blocks/foo/foo.js'`** and `await decorate(blockEl)` where needed.
4. **Mock `window.hlx`**, `fetch`, or globals if blocks assume full page / AEM CLI context.

Many teams **skip Storybook** and use **`drafts/` + `aem up`** for fidelity with real pipeline markup.

---

## Hero block — EDS layout aligned with Storybook (`kao-sandbox-3`)

Goal: keep **one visual source of truth** (`hero.css` + shared markup) while letting Storybook render the hero without AEM.

### Folder structure (matches EDS)

```text
blocks/hero/
  hero.js        # decorate(block) — runs on real pages; reads DOM → renderHero props
  hero.css       # block styles (imported in Storybook preview too)
  hero-view.js   # renderHero(props) — pure HTML string; used by EDS + Storybook
stories/
  Hero.stories.js
.storybook/
  preview.js     # global EDS CSS + `body.appear` workaround (see below)
```

### What we implemented

| File | Purpose |
|------|--------|
| [`blocks/hero/hero-view.js`](./blocks/hero/hero-view.js) | **`renderHero({ title, subtitle, imageUrl, imageAlt })`** builds the same **`.hero`** DOM string used after decoration. Uses **`picture` → `h1` → optional `p`** order to match auto-block **`buildBlock('hero', { elems: [picture, h1] })`** (picture before heading). Text is **escaped** for safe `innerHTML`. |
| [`blocks/hero/hero.js`](./blocks/hero/hero.js) | **`decorate(block)`** reads `img` / `h1` / `p`, maps to props, **`block.innerHTML = renderHero(props)`**. |
| [`stories/Hero.stories.js`](./stories/Hero.stories.js) | **Blocks/Hero** stories wrap output in **`.hero-container` > `.hero-wrapper`** so rules in [`hero.css`](./blocks/hero/hero.css) (full-width wrapper) apply. Variants: **Default**, **WithoutSubtitle**, **WithoutImage**. Demo images use **picsum.photos** URLs (needs network in browser). |
| [`.storybook/preview.js`](./.storybook/preview.js) | Imports **`styles/fonts.css`**, **`styles/styles.css`** (tokens, typography), **`blocks/hero/hero.css`**. **Decorator** adds **`body.appear`** because global [`styles/styles.css`](./styles/styles.css) uses **`body { display: none }`** until EDS adds **`.appear`** for LCP — without this, the Storybook iframe would stay blank. **`layout: 'fullscreen'`** on the hero story matches the docs recommendation. |

### Commands to verify

```bash
npm run lint
npm run storybook
# open sidebar: Blocks → Hero
```

**Build check (optional):** `npm run build-storybook`

### Known gaps / follow-ups (may not “just work” first try)

- **Fonts:** `preview.js` imports **`fonts.css`**; if font files 404 (paths/base URL), typography may still fall back — check the Network tab.
- **External images:** **picsum.photos** can be blocked offline or by corporate proxy; swap **`Default.args.imageUrl`** in `Hero.stories.js` for a local static asset under `stories/assets/` if needed.
- **Other blocks:** repeat the **`{block}-view.js` + `renderX` + story** pattern; add each block’s **`.css`** to `preview.js` (or split imports per story).
- **decorate vs render in Storybook:** Stories use **`renderHero` only** (simpler). Alternatively call **`decorate(blockEl)`** with synthetic AEM-shaped markup — closer to integration testing, more setup (**`window.hlx`**, etc.).

---

## Update log

Append **newest entries at the bottom** (or top — stay consistent). Use this shape:

```text
### YYYY-MM-DD — short title
- **Command(s):** …
- **Result:** …
- **Why:** …
- **Notes:** …
```

### 2026-04-03 — Discovery: no script, Node version, detection failure, wrong CLI args

- **Context:** Attempting to add Storybook to `kao-sandbox-3` (EDS / Helix boilerplate).
- **`npm run storybook`:** Failed — no `storybook` script in `package.json`.
- **Storybook 10 CLI:** Requires **Node 20.19+** or **22.12+**; **Node 20.17.0** was rejected by the installer.
- **`npx storybook@latest init`:** Failed — *could not detect a supported framework* (no React/Vue/Next in repo).
- **Explanation documented:** EDS repos are **vanilla JS**; must use **`npm create storybook@latest -- --type html`** (or equivalent), not bare `init` without type.
- **Failed attempt:** `create-storybook html` / positional `html` → *too many arguments*.
- **`package.json` state after this doc was created:** Storybook **not** yet installed (no `.storybook/`, no storybook dependencies). Next step is upgrade Node, then run the **working** `npm create` command above and record the result in this log.

### 2026-04-03 — Installer prompt: Vite vs Webpack 5 vs Rsbuild

- **Situation:** After `npm create storybook@latest -- --type html --package-manager npm`, Storybook asked: *We were not able to detect the right builder… select one: Vite / Webpack 5 / Rsbuild.*
- **Choice:** **Vite** (recommended default).
- **Why:** EDS repo has **no existing Webpack** stack; Vite is Storybook’s typical default, fast for local Storybook dev, and well documented for `@storybook/html-vite`. The bundler is **only for Storybook**, not for the Edge-delivered site.
- **When to pick Webpack 5 instead:** Project already uses Webpack 5 for something you must align with. **Rsbuild:** only if your team standardizes on it.

### 2026-04-03 — Installer prompt: Playwright + Chromium for @storybook/addon-vitest

- **Situation:** Storybook asked: *Do you want to install Playwright with Chromium now?* (needed for Vitest browser tests in Storybook.)
- **Choice:** **No** is fine for a quick setup focused on browsing stories; **Yes** if you want component/browser tests ready without running `npx playwright install chromium --with-deps` later.
- **If you chose No:** When tests are needed, run: `npx playwright install chromium --with-deps` from the repo root.

### 2026-04-03 — Install completed; `npm run storybook` smoke test

- **Commands:**
  - `npm create storybook@latest -- --type html --package-manager npm` (builder: **Vite**; Playwright/Chromium: user opted in — binaries installed).
- **Result:** CLI reported *Storybook was successfully installed*; Playwright install succeeded.
- **`npm run storybook`:** Starts Storybook dev server on **http://localhost:6006** (per `package.json` script `storybook dev -p 6006`).
- **Node warning (MODULE_TYPELESS_PACKAGE_JSON):** `.storybook/main.js` uses `export default` while `package.json` has no `"type": "module"`. Node may warn once at startup; **safe to ignore**, or add `"type": "module"` only if you migrate **ESLint to v9 flat config** (see below)—**do not** add `"type": "module"` while keeping `.eslintrc.js` + ESLint 8 without auditing every script.
- **ESLint vs `eslint-plugin-storybook`:** The installer extends `plugin:storybook/recommended`, but **eslint-plugin-storybook 10+ is ESM-only** and **`npm run lint` fails** with ESLint 8 and legacy `.eslintrc.js` (`ERR_REQUIRE_ESM`). **Current repo fix:** `extends` is **`airbnb-base` only**; **`eslint-plugin-storybook` removed** from `package.json`; **`ignorePatterns`** in `.eslintrc.js` for **`stories/**`**, **`vitest.config.js`**, **`.storybook/**`** so sample Storybook/Vitest files do not fail Airbnb rules. Revisit when migrating to ESLint 9 flat config.
- **Packages added (summary):** `storybook`, `@storybook/html-vite`, addons (docs, a11y, vitest, Chromatic), `vitest`, `playwright`, `@vitest/*`. (**`eslint-plugin-storybook`** was removed afterward — incompatible with ESLint 8 + `.eslintrc.js`; see install entry above.)
- **Artifacts:** `.storybook/main.js`, `.storybook/preview.js`, `stories/` (sample stories), `vitest.config.js`.

### 2026-04-03 — Hero block: `hero-view.js`, stories, preview CSS

- **Why:** Align with internal EDS + Storybook pattern — **pure `renderHero`** for markup, **`decorate`** for live pages, **shared CSS** in Storybook.
- **Added/updated files:**
  - `blocks/hero/hero-view.js` — `renderHero` + HTML escaping.
  - `blocks/hero/hero.js` — `decorate` implementation (was empty).
  - `stories/Hero.stories.js` — **Blocks/Hero** with container wrappers + three variants.
  - `.storybook/preview.js` — imports `styles/fonts.css`, `styles/styles.css`, `blocks/hero/hero.css`; **decorator** `document.body.classList.add('appear')` for EDS global `body { display: none }`.
- **Lint:** `npm run lint` passes (`hero-view.js` uses file-level exception for `import/prefer-default-export` because we keep a **named** export for clarity).
- **Not done yet:** `fonts.css` in preview; stories still under `.eslintrc` `ignorePatterns` for `stories/**`.
- **Verify locally:** `npm run storybook` → **Blocks → Hero**.

### YYYY-MM-DD — (template) follow-up

- **Command(s):** …
- **Result:** …

---

## References

- [Storybook: Install](https://storybook.js.org/docs/get-started/install) — `--type` table (`html`, `web_components`, etc.).
- [Storybook: Frameworks](https://storybook.js.org/docs/configure/integration/frameworks) — HTML + Vite/Webpack.
- **This repo:** [package.json](./package.json), [AGENTS.md](./AGENTS.md).

---

## Maintenance

- When you bump Storybook or Node, add a **Update log** entry and refresh **Prerequisites** if versions change.
- If you abandon Storybook for this repo, add one line under **Update log**: *Removed Storybook — using drafts + aem up only.*
