import '../styles/fonts.css';
import '../styles/styles.css';
import '../blocks/hero/hero.css';
import '../blocks/columns/columns.css';
import '../blocks/cards/cards.css';
import '../blocks/footer/footer.css';
import '../blocks/header/header.css';
import './hero-storybook.css';
import './fragment-storybook.css';

/** @type { import('@storybook/html-vite').Preview } */
const preview = {
  decorators: [
    (Story) => {
      // styles.css sets body { display: none } until .appear (EDS LCP pattern)
      document.body.classList.add('appear');
      return Story();
    },
  ],
  parameters: {
    layout: 'fullscreen',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      test: 'todo',
    },
  },
};

export default preview;
