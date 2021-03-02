console.log('app is running!');
import DarkModeToggler from './components/DarkModeToggler.js';
import Search from './components/Search/index.js';
import SearchResult from './components/SearchResult.js';
import Banner from './components/Banner.js';
import Component from './components/Component.js';

export default class App extends Component {
  constructor(target) {
    super(target, 'div');

    this.children = [
      new DarkModeToggler(this.$),
      new Banner(this.$),
      new Search(this.$),
      new SearchResult(this.$),
    ];
  }

  render() {
    this.children.forEach((child) => child.render && child.render());
    document.querySelector('input').focus();
  }
}
