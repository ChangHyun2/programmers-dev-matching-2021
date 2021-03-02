import Component from './Component.js';
import Modal from '../UI/Modal.js';

export default class CatInfoModal extends Modal {
  constructor($parent, data) {
    const { url, name, temperament, origin } = data;

    super(
      $parent,
      `<div class="content-wrapper pd-5 card">
        <div class="title mb-3">
          <span>${name}</span>
          <div class="close btn">x</div>
        </div>
        <div class="img-wrapper mb-3">
          <img src="${url}" alt="${name}"/>        
        </div>
        <div class="description">
          <div>성격: ${temperament}</div>
          <div>태생: ${origin}</div>
        </div>
      </div>`,
      {
        className: 'CatInfoModal',
        tabIndex: 0,
        styles: {
          transition: 'opacity 300ms',
          opacity: 0,
        },
      }
    );

    this.$.focus();
    this.$.classList.add('fade-in');

    this.data = data;
    this.bindEvents();
  }

  removeWithFadeOut = () => {
    this.$.classList.remove('fade-in');
    this.$.classList.add('fade-out');
    this.$.ontransitionend = () => this.$.remove();
  };

  onClick = (e) => {
    if (e.target === this.$.querySelector('.close') || e.target === this.$) {
      this.removeWithFadeOut();
    }
  };

  onKeyDown = (e) => {
    e.key === 'Escape' && this.removeWithFadeOut();
  };
}
