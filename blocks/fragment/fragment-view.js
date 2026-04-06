/* eslint-disable import/prefer-default-export */

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Static example of fragment output for Storybook (does not call `loadFragment` / `fetch`).
 * @param {Object} opts
 * @param {string} opts.fragmentPath label to show as the link target
 * @param {string} opts.loadedTitle heading shown as “loaded” body
 * @param {string} [opts.loadedBody]
 * @returns {string} HTML suitable for a demo card
 */
export function renderFragmentStoryDemoHtml({ fragmentPath, loadedTitle, loadedBody = '' }) {
  return `
<div class="fragment-storybook-demo">
  <p class="fragment-storybook-demo-label">Fragment source (authoring): <strong>${escapeHtml(fragmentPath)}</strong></p>
  <div class="fragment-storybook-demo-content default-content-wrapper">
    <h3>${escapeHtml(loadedTitle)}</h3>
    ${loadedBody ? `<p>${escapeHtml(loadedBody)}</p>` : ''}
  </div>
</div>`.trim().replace(/\n\s+/g, ' ');
}
