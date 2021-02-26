import BaseComponent from '../components/BaseComponent.js';

const DURATION = 2000;

export default class ErrorMessage extends BaseComponent {
  constructor(message, { status, position }) {
    super(position ? position.$parent : document.body, 'div', {
      className: 'ErrorMessage',
      innerHTML: `
        ${status ? `<div>${status} Error!</div>` : ''}
        <div>${message}</div>
      `,
      styles: {
        position: 'fixed',
        zIndex: 1001,
        left: '50%',
        top: '100px',
        transform: 'translate(-50%, -50%)',
      },
    });

    if (position) {
      const { $parent = document.body, x = 0, y = 0 } = position;

      const { bottom, left } = $parent.getBoundingClientRect();

      this.$el.style.left = `${left + x}px`;
      this.$el.style.top = `${bottom + y}px`;
    }

    this.$el.classList.add('fade-in');

    setTimeout(() => {
      this.$el.classList.remove('fade-in');
      this.$el.classList.add('fade-out');
      this.$el.ontransitionend = () => this.$el.remove();
    }, DURATION);
  }
}
