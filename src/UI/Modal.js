import Component from '../components/Component.js';
import Backdrop from './Backdrop.js';

export default class Modal extends Component {
  constructor(target, content, attributes) {
    super(target, 'div', {
      ...attributes,
      className: 'Modal ' + attributes.className,
      styles: {
        ...attributes.styles,
        zIndex: 2000,
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    });

    this.backdrop = new Backdrop(this.$);
    console.log(this.backdrop);

    if (typeof content === 'string') {
      this.addHTML(this.backdrop.$, content);
    } else if (typeof content === 'function') {
      this.$content = new content(this.backdrop.$);
    }

    this.bindEvents();
  }

  render() {
    this.$content && this.$content.render && this.$content.render();
  }

  onClick = (e) => {
    if (e.target === this.$backdrop) this.$.remove();
  };
}
