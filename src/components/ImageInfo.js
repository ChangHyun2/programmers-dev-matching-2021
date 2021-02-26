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
    this.$el.classList.remove('fade-in');
    this.$el.classList.add('fade-out');
    this.$el.ontransitionend = () => this.$el.remove();
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

    this.$el.innerHTML = `
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
    </div>`;

    this.$el.focus();
    this.$el.classList.add('fade-in');
  };
}
