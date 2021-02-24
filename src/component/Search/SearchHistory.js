import store from '../../store.js';
import localStorage from '../../utils/localStorage.js';

export default class SearchHistory {
  constructor($target) {
    this.$target = $target;

    this.$el = document.createElement('ul');
    this.$el.className = 'SearchHistory';

    this.$target.append(this.$el);

    store.set('search-history', []);
    store.subscribe('search-history', this);
  }

  render() {
    this.$el.innerHTML = store
      .get('search-history')
      .map((searched) => `<li>${searched}</li>`)
      .join('');
  }
}
