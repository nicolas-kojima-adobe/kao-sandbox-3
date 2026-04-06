/* eslint-disable import/prefer-default-export */

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Minimal nav shell for Storybook only. Real pages use `decorate` (AEM XF or `/nav` fragment).
 * Structure matches classes expected by header.css (nav-wrapper, nav-hamburger, nav-brand, …).
 * @param {Object} opts
 * @param {string} [opts.siteTitle]
 * @returns {string} HTML inside `div.header.block`
 */
export function renderHeaderNavStoryHtml({ siteTitle = 'Site' } = {}) {
  const title = escapeHtml(siteTitle);
  return `
<div class="nav-wrapper">
  <nav id="nav" aria-expanded="false">
    <div class="nav-hamburger">
      <button type="button" aria-controls="nav" aria-label="Open navigation">
        <span class="nav-hamburger-icon"></span>
      </button>
    </div>
    <div class="nav-brand">
      <p><a href="#">${title}</a></p>
    </div>
    <div class="nav-sections">
      <div class="default-content-wrapper">
        <ul>
          <li><a href="#">Section A</a></li>
          <li><a href="#">Section B</a></li>
        </ul>
      </div>
    </div>
    <div class="nav-tools"></div>
  </nav>
</div>`.trim().replace(/\n+/g, '');
}
