import {
  getMetadata,
  loadCSS,
  loadScript,
} from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Last `<meta name="...">` content for this name. Prefer over `getMetadata` when duplicate
 * tags must not be comma-joined into one string.
 * @param {string} name
 */
function getLastMetaContent(name) {
  const nodes = [...document.head.querySelectorAll(`meta[name="${name}"]`)];
  if (!nodes.length) return '';
  const raw = nodes[nodes.length - 1].getAttribute('content');
  return raw ? raw.trim() : '';
}

/**
 * Page metadata names AEM may emit for the header XF path (hyphen, camel, lowercase).
 */
function resolveAemContentPath() {
  const names = ['aem-content-path', 'aemContentPath', 'aemcontentpath'];
  return names.map((n) => getLastMetaContent(n)).find(Boolean) || '';
}

/** AEM publish base URL; override with meta aem-publish-url. */
const DEFAULT_AEM_PUBLISH_BASE_URL = 'https://publish-p192772-e2003561.adobeaemcloud.com';

/** Default /etc.clientlibs/{app}/clientlibs app id; override via meta aem-clientlib-app. */
const DEFAULT_AEM_CLIENTLIB_APP = 'kao-sandbox-3';

/**
 * Builds the header URL for a given AEM content path.
 * @param {string} contentPath - e.g. '/content/kao-sandbox-3/us/en'
 * @param {string} baseUrl - AEM publish base URL
 * @returns {string}
 */
function buildHeaderUrl(contentPath, baseUrl) {
  const normalized = contentPath.startsWith('/') ? contentPath : `/${contentPath}`;
  return `${baseUrl.replace(/\/$/, '')}${normalized}.eds-header.html`;
}

/**
 * Resolves the AEM clientlib base URL (folder containing clientlib-*.css/js).
 * @param {string} baseUrl
 */
function getAemClientlibBase(baseUrl) {
  const fromMeta = getMetadata('aem-clientlib-base');
  if (fromMeta) return fromMeta.replace(/\/$/, '');
  const app = getMetadata('aem-clientlib-app') || DEFAULT_AEM_CLIENTLIB_APP;
  return `${baseUrl.replace(/\/$/, '')}/etc.clientlibs/${app}/clientlibs`;
}

/**
 * Fetches the header HTML snippet from AEM for the given content path.
 * @param {string} contentPath
 * @param {string} baseUrl
 * @returns {Promise<string>}
 */
async function fetchHeaderHtml(contentPath, baseUrl) {
  const url = buildHeaderUrl(contentPath, baseUrl);
  const response = await fetch(url, { credentials: 'omit', cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`[header] Failed to fetch header from AEM for path "${contentPath}": ${response.status} ${response.statusText}`);
  }
  return response.text();
}

/**
 * Loads AEM clientlibs (CSS and JS) required for the header XF to display correctly.
 * @param {string} baseUrl - AEM publish base URL
 */
async function injectAemClientlibs(baseUrl) {
  const clientlibBase = getAemClientlibBase(baseUrl);
  const styles = [
    `${clientlibBase}/clientlib-dependencies.css`,
    `${clientlibBase}/clientlib-site.css`,
  ];
  const scripts = [
    `${clientlibBase}/clientlib-dependencies.js`,
    `${clientlibBase}/clientlib-site.js`,
  ];
  await Promise.all([
    ...styles.map((href) => loadCSS(href)),
    ...scripts.map((src) => loadScript(src)),
  ]);
}

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  if (navSections) {
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener('focus', focusNavSection);
      });
    }
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const contentPath = resolveAemContentPath();
  if (contentPath) {
    const baseUrl = getLastMetaContent('aem-publish-url') || getLastMetaContent('aempublishurl')
      || DEFAULT_AEM_PUBLISH_BASE_URL;
    try {
      const html = await fetchHeaderHtml(contentPath, baseUrl);
      block.innerHTML = html;
      block.classList.add('header-aem-xf');
      await injectAemClientlibs(baseUrl);
      return;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[header] Error loading AEM header:', e);
      block.classList.remove('header-aem-xf');
      block.innerHTML = '';
      return;
    }
  }

  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) {
    return;
  }

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('.button');
    if (brandLink) {
      brandLink.className = '';
      brandLink.closest('.button-container').className = '';
    }
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
