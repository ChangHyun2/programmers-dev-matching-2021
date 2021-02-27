import Component from './Component.js';

export default class ImageInfo extends Component {
  constructor($parent, data) {
    super($parent, 'div', {
      className: 'ImageInfo',
      tabIndex: 0,
    });

    this.data = data;
    this.bindEvents();
  }

  removeWithFadeOut = () => {
    this.$.classList.remove('fade-in');
    this.$.classList.add('fade-out');
    this.$.ontransitionend = () => this.$.remove();
  };

  onClick = (e) => {
    const clickedClassName = e.target.className;
    if (
      clickedClassName === 'close' ||
      clickedClassName.indexOf('ImageInfo') !== -1
    ) {
      this.removeWithFadeOut();
    }
  };

  onKeyDown = (e) => {
    e.key === 'Escape' && this.removeWithFadeOut();
  };

  render = () => {
    const { url, name, temperament, origin } = this.data;

    this.HTML(`
    <div class="content-wrapper">
      <div class="title">
        <span>${name}</span>
        <div class="close">x</div>
      </div>
      <div class="img-wrapper">
        <img src="${url}" alt="${name}"/>        
      </div>
      <div class="description">
        <div>성격: ${temperament}</div>
        <div>태생: ${origin}</div>
      </div>
    </div>`);

    this.$.focus();
    this.$.classList.add('fade-in');
  };
}
