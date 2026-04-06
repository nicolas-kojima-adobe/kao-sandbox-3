import { renderHero } from '../blocks/hero/hero-view.js';

export default {
  title: 'Blocks/Hero',
  parameters: {
    layout: 'fullscreen',
  },
};

/**
 * Mirrors EDS section wrapper classes so hero.css layout rules apply.
 * @param {Record<string, string>} args renderHero props
 */
const Template = (args) => {
  const container = document.createElement('div');
  container.className = 'hero-container hero-storybook';
  const wrapper = document.createElement('div');
  wrapper.className = 'hero-wrapper';
  wrapper.innerHTML = renderHero(args);
  container.append(wrapper);
  return container;
};

export const Default = Template.bind({});
Default.args = {
  title: 'Edge Delivery + AEM',
  subtitle: 'Blazing fast content, authored your way.',
  imageUrl: 'https://picsum.photos/seed/edshero/1600/900',
  imageAlt: '',
};

export const WithoutSubtitle = Template.bind({});
WithoutSubtitle.args = {
  title: 'Title only',
  subtitle: '',
  imageUrl: 'https://picsum.photos/seed/edshero2/1600/900',
  imageAlt: 'Decorative hero image',
};

export const WithoutImage = Template.bind({});
WithoutImage.args = {
  title: 'No image',
  subtitle: 'Picture omitted when imageUrl is empty.',
  imageUrl: '',
  imageAlt: '',
};
