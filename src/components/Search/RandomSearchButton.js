import Component from '../Component.js';
import api from '../../api/api.js';

export default class RandomSearchButton extends Component {
  constructor($parent) {
    super($parent, 'button', {
      textContent: '랜덤 고양이 검색하기',
    });

    this.bindEvents();
  }

  async updateSearchResult() {
    const data = await this.tryFetchData(api.getRandomCats, {
      cache: false,
      cb: ({ data }) => data,
      errorTypes: ['api'],
    });

    if (data) {
      this.set(data).on('search-result', ['local', 'web']);
    }
  }

  onClick = async () => {
    this.$.disabled = true;
    this.updateSearchResult();
    this.$.disabled = false;
  };
}
