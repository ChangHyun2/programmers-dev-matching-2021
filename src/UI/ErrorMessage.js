import Component from '../components/Component.js';

const DURATION = 1500;

export default class ErorrMessage extends Component {
  constructor($parent = document.body, message) {
    super([$parent, 'afterend'], 'div', {
      className: 'ErrorMessage',
      textContent: message,
      styles: {
        position: 'fixed',
        zIndex: 1001,
      },
    });

    const { bottom, left } = $parent.getBoundingClientRect();
    this.$el.style.left = left + 'px';
    this.$el.style.top = `${bottom + 50}px`;

    this.$el.classList.add('fade-in');

    setTimeout(() => {
      this.$el.classList.remove('fade-in');
      this.$el.classList.add('fade-out');
      this.$el.ontransitionend = () => this.$el.remove();
    }, DURATION);
  }
}
