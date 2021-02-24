import Component from '../Component.js';
import store from '../../store.js';
import localStorage from '../../utils/localStorage.js';

export default class SearchHistory extends Component {
  constructor($parent) {
    super($parent, 'ul', {
      className: 'SearchHistory',
    });

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
