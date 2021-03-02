import Component from '../components/Component.js';

export default class Bakcdrop extends Component {
  constructor(target) {
    super(target, 'div', {
      styles: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zindex: 1999,
      },
    });

    this.bindEvents();
  }

  onClick = (e) => {
    if (e.target === this.$) {
      this.$parent.remove();
    }
  };
}
