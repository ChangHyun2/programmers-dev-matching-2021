import Component from '../Component.js';
import SearchInput from './SearchInput.js';
import RandomSearchButton from './RandomSearchButton.js';
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

    const $searchCats = this.$.querySelector('.Search-cats');
    const $searchHistory = this.$.querySelector('.Search-history');

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
