import decorate from '../blocks/columns/columns.js';
import { renderColumnsInitialHtml } from '../blocks/columns/columns-view.js';

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default {
  title: 'Blocks/Columns',
  parameters: { layout: 'fullscreen' },
};

const Template = (args) => {
  const cells = args.columns.map((col) => {
    if (col != null && typeof col === 'object' && 'html' in col) {
      return col.html;
    }
    return `<p>${escapeHtml(String(col))}</p>`;
  });
  const block = document.createElement('div');
  block.className = 'columns block';
  block.innerHTML = renderColumnsInitialHtml([cells]);
  decorate(block);
  return block;
};

export const TwoColumns = Template.bind({});
TwoColumns.args = {
  columns: ['First column copy.', 'Second column copy.'],
};

export const ImageAndText = Template.bind({});
ImageAndText.args = {
  columns: [
    { html: '<picture><img src="https://picsum.photos/seed/colimg/600/400" alt=""></picture>' },
    { html: '<p>Text column beside the image.</p>' },
  ],
};
