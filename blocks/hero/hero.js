import { renderHero } from './hero-view.js';

/**
 * Decorates the hero block on EDS pages.
 * @param {Element} block
 */
export default function decorate(block) {
  const img = block.querySelector('img');
  const h1 = block.querySelector('h1');
  const p = block.querySelector('p');

  const props = {
    title: h1?.textContent?.trim() ?? '',
    subtitle: p?.textContent?.trim() ?? '',
    imageUrl: img?.currentSrc || img?.src || '',
    imageAlt: img?.alt ?? '',
  };

  block.innerHTML = renderHero(props);
}
