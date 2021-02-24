console.log('app is running!');
import DarkModeToggler from './component/DarkModeToggler.js';
import Search from './component/Search/index.js';
import SearchResult from './component/SearchResult.js';

export default class App {
  $target = null;
  data = [];

  constructor($target) {
    this.$target = $target;

    this.children = [
      new DarkModeToggler(this.$target),
      new Search(this.$target),
      new SearchResult(this.$target),
    ];
  }

  render() {
    this.children.forEach((child) => child.render && child.render());
    this.$target.querySelector('.SearchInput').focus();
  }
}
