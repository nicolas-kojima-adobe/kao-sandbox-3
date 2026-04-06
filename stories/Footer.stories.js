import { renderFooterStoryHtml } from '../blocks/footer/footer-view.js';

export default {
  title: 'Blocks/Footer',
  parameters: { layout: 'fullscreen' },
};

/**
 * Static preview only — real footer `decorate` fetches `/footer.plain.html` (no server in Storybook).
 */
const Template = (args) => {
  const footerEl = document.createElement('footer');
  const block = document.createElement('div');
  block.className = 'footer block';
  block.setAttribute('data-block-status', 'loaded');
  block.innerHTML = renderFooterStoryHtml(args.paragraphs);
  footerEl.append(block);
  return footerEl;
};

export const Default = Template.bind({});
Default.args = {
  paragraphs: [
    '© 2026 Example Co. All rights reserved.',
    'Privacy · Terms',
  ],
};
