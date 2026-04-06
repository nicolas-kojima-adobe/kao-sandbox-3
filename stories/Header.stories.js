import { renderHeaderNavStoryHtml } from '../blocks/header/header-view.js';

export default {
  title: 'Blocks/Header',
  parameters: { layout: 'fullscreen' },
};

/**
 * Static nav preview only — real header uses AEM `.eds-header.html` or `/nav` fragment + JS behavior.
 */
const Template = (args) => {
  const headerEl = document.createElement('header');
  const block = document.createElement('div');
  block.className = 'header block';
  block.setAttribute('data-block-status', 'loaded');
  block.innerHTML = renderHeaderNavStoryHtml({ siteTitle: args.siteTitle });
  headerEl.append(block);
  return headerEl;
};

export const NavShell = Template.bind({});
NavShell.args = {
  siteTitle: 'Kao Sandbox',
};
