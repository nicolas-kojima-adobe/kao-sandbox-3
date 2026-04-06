/* eslint-disable import/prefer-default-export -- named export shared by EDS + Storybook */

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(text) {
  return escapeHtml(text).replace(/\n/g, ' ');
}

/**
 * Pure presentation for the hero block — same markup for EDS and Storybook.
 * @param {Object} props
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {string} [props.imageUrl]
 * @param {string} [props.imageAlt]
 * @returns {string} HTML snippet (single root `.hero`)
 */
export function renderHero({
  title,
  subtitle = '',
  imageUrl = '',
  imageAlt = '',
}) {
  const parts = ['<div class="hero">'];
  if (imageUrl) {
    parts.push(
      `<picture><img src="${escapeAttr(imageUrl)}" alt="${escapeAttr(imageAlt || title)}"></picture>`,
    );
  }
  parts.push(`<h1>${escapeHtml(title)}</h1>`);
  if (subtitle) {
    parts.push(`<p>${escapeHtml(subtitle)}</p>`);
  }
  parts.push('</div>');
  return parts.join('');
}
