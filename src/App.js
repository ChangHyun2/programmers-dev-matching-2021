console.log('app is running!');
import DarkModeToggler from './components/DarkModeToggler.js';
import Search from './components/Search/index.js';
import SearchResult from './components/SearchResult.js';
import Banner from './components/Banner.js';

export default class App {
  constructor($app) {
    this.$app = $app;

    this.children = [
      new Banner(this.$app),
      new DarkModeToggler(this.$app),
      new Search(this.$app),
      new SearchResult(this.$app),
    ];
  }

  render() {
    this.children.forEach((child) => child.render && child.render());
    this.$app.querySelector('.SearchInput').focus();
  }
}
