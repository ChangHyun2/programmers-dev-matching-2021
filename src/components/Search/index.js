import Component from '../Component.js';
import localStorage from '../../utils/localStorage.js';
import SearchInput from './SearchInput.js';
import RandomSearchButton from './RandomSearchButton.js';
import api from '../../api.js';
import SearchHistory from './SearchHistory.js';

export default class Search extends Component {
  constructor($parent) {
    super($parent, 'div', {
      className: 'Search',
      innerHTML: `
        <div class="Search-cats">
        </div>
        <div class="Search-history">
        </div>
      `,
    });

    const $searchCats = this.$el.querySelector('.Search-cats');
    const $searchHistory = this.$el.querySelector('.Search-history');

    this.children = [
      new SearchInput($searchCats),
      new RandomSearchButton($searchCats),
      new SearchHistory($searchHistory),
    ];
  }

  render() {
    this.children.forEach((child) => child.render && child.render());
  }
}
