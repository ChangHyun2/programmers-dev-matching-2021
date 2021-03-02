import Component from '../components/Component.js';
import Backdrop from './Backdrop.js';

export default class Modal extends Backdrop {
  constructor(target, content, attributes) {
    super(target, {
      ...attributes,
      className: 'Modal ' + (attributes.className || ''),
      styles: {
        ...attributes.styles,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
    });

    if (typeof content === 'string') {
      this.addHTML(this.$, content);
    } else if (typeof content === 'function') {
      this.$content = new content(this.$);
    }

    this.bindEvents();
  }

  render() {
    this.$content && this.$content.render && this.$content.render();
  }
}
