import Component from '../Component.js';

export default class SearchHistory extends Component {
  constructor($parent) {
    super($parent, 'ul', {
      className: 'SearchHistory',
    });

    this.set([]).on('search-history', 'local');
    this.subscribe('search-history');
  }

  render() {
    this.HTML(
      this.get('search-history', 'local')
        .map((searched) => `<li>${searched}</li>`)
        .join('')
    );
  }
}
