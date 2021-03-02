import Component from '../components/Component.js';

export default class Backdrop extends Component {
  constructor(target, attributes) {
    super(target, 'div', {
      ...attributes,
      className: 'Backdrop' + (attributes.className || ''),
      styles: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        position: 'fixed',
        zIndex: 2000,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        ...attributes.styles,
      },
    });
  }
}
