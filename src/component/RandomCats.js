import api from '../api.js';

export default class RandomCats {
  constructor($parent, data) {
    this.$parent = $parent;
    this.data = data;

    const $el = document.createElement('ul');
    $el.className = 'RandomCats';
    this.$el = $el;

    this.$parent.append = this.$el;
  }

  render() {
    this.$el.innerHTML = this.data.map(
      ({ id, url, name }) => `
      <li id=${id}>
        <img src=${url}/>
        <div>${name}</div>
      </li>
    `
    );
  }
}
