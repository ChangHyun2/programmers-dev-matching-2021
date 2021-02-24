import api from '../api.js';
import { ErrorMessage, Loading } from '../UI/index.js';
export default class ImageInfo {
  constructor($parent, data) {
    this.$parent = $parent;
    this.data = data;

    const $el = document.createElement('div');
    $el.className = 'ImageInfo';
    $el.setAttribute('tabindex', 0);
    this.$el = $el;

    $parent.append($el);

    this.onClick = this.onClick.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.bindEvents();
  }

  onClick(e) {
    const clickedClassName = e.target.className;
    if (
      clickedClassName === 'close' ||
      clickedClassName.indexOf('ImageInfo') !== -1
    ) {
      this.removeWithFadeOut();
    }
  }
  onKeyDown(e) {
    e.key === 'Escape' && this.removeWithFadeOut();
  }

  bindEvents() {
    this.$el.addEventListener('click', this.onClick);
    this.$el.addEventListener('keydown', this.onKeyDown);
  }

  removeWithFadeOut() {
    this.$el.classList.remove('fade-in');
    this.$el.classList.add('fade-out');
    this.$el.ontransitionend = () => this.$el.remove();
  }

  async render() {
    const { url, name, temperament, origin } = this.data;

    console.log(url, name, temperament, origin);

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
  }
}
