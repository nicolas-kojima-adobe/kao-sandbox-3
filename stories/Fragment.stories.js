import { renderFragmentStoryDemoHtml } from '../blocks/fragment/fragment-view.js';

export default {
  title: 'Blocks/Fragment',
  parameters: { layout: 'fullscreen' },
};

/**
 * Static demo — real `decorate` fetches `{path}.plain.html` and replaces the block.
 */
const Template = (args) => {
  const wrap = document.createElement('div');
  wrap.className = 'default-content-wrapper';
  wrap.innerHTML = renderFragmentStoryDemoHtml({
    fragmentPath: args.fragmentPath,
    loadedTitle: args.loadedTitle,
    loadedBody: args.loadedBody,
  });
  return wrap;
};

export const LoadedContentExample = Template.bind({});
LoadedContentExample.args = {
  fragmentPath: '/fragments/example',
  loadedTitle: 'Fragment body (example)',
  loadedBody: 'After publish, this markup would come from the fragment document.',
};
