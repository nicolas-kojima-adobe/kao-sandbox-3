/* eslint-disable import/prefer-default-export */

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
 * Initial block markup for the cards block (before `decorate`).
 * @param {Array<{ imageUrl?: string, imageAlt?: string, title: string, text: string }>} cards
 * @returns {string}
 */
export function renderCardsInitialHtml(cards) {
  return cards
    .map((card) => {
      const imgPart = card.imageUrl
        ? `<div><picture><img src="${escapeAttr(card.imageUrl)}" alt="${escapeAttr(card.imageAlt || '')}"></picture></div>`
        : '<div></div>';
      const bodyPart = `<div><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.text)}</p></div>`;
      return `<div>${imgPart}${bodyPart}</div>`;
    })
    .join('');
}
