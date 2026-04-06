/* eslint-disable import/prefer-default-export */

/**
 * Initial block markup for the columns block (before `decorate`).
 * Storybook (and tests) can inject this into a `.columns.block` container.
 * @param {string[][]} rows Each row is an array of HTML strings per cell (caller escapes text).
 * @returns {string}
 */
export function renderColumnsInitialHtml(rows) {
  return rows
    .map((cells) => `<div>${cells.map((cell) => `<div>${cell}</div>`).join('')}</div>`)
    .join('');
}
