import Component from '../components/Component.js';

const DURATION = 2000;

export default class ErorrMessage extends Component {
  constructor($parent = document.body, message, status) {
    super([$parent, 'afterend'], 'div', {
      className: 'ErrorMessage',
      innerHTML: `
        ${status ? `<div>${status} Error!</div>` : ''}
        <div>${message}</div>
      `,
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
