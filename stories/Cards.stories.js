import decorate from '../blocks/cards/cards.js';
import { renderCardsInitialHtml } from '../blocks/cards/cards-view.js';

export default {
  title: 'Blocks/Cards',
  parameters: { layout: 'fullscreen' },
};

const Template = (args) => {
  const block = document.createElement('div');
  block.className = 'cards block';
  block.innerHTML = renderCardsInitialHtml(args.cards);
  decorate(block);
  return block;
};

export const SingleCard = Template.bind({});
SingleCard.args = {
  cards: [
    {
      imageUrl: 'https://picsum.photos/seed/card1/750/560',
      imageAlt: '',
      title: 'Card title',
      text: 'Short supporting text for the card body.',
    },
  ],
};

export const TwoCards = Template.bind({});
TwoCards.args = {
  cards: [
    {
      imageUrl: 'https://picsum.photos/seed/card2/750/560',
      imageAlt: '',
      title: 'First',
      text: 'Body one.',
    },
    {
      imageUrl: 'https://picsum.photos/seed/card3/750/560',
      imageAlt: '',
      title: 'Second',
      text: 'Body two.',
    },
  ],
};
