/* eslint-disable import/prefer-default-export */

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Static footer inner markup for Storybook (skips `loadFragment`).
 * Matches loose structure expected by footer.css (`footer .footer > div`).
 * @param {string[]} paragraphs
 * @returns {string} HTML to place inside `div.footer.block`
 */
export function renderFooterStoryHtml(paragraphs) {
  const inner = paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('');
  return `<div><div>${inner}</div></div>`;
}
