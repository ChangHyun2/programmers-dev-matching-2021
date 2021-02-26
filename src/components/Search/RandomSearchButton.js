import Component from '../Component.js';
import api from '../../api/api.js';
import store from '../../store.js';
import { localStorage } from '../../utils/index.js';

export default class RandomSearchButton extends Component {
  constructor($parent) {
    super($parent, 'button', {
      textContent: '랜덤 고양이 검색하기',
    });

    this.bindEvents();
  }

  updateSearchResult = async () => {
    const data = await this.tryFetchData(api.getRandomCats, {
      cache: false,
      cb: ({ data }) => data,
      errorTypes: ['api'],
    });

    if (data.length) {
      store.set('search-result', data);
      localStorage.set('cats-search-result', data);
    }
  };

  onClick = async () => {
    this.$el.disabled = true;
    this.updateSearchResult();
    this.$el.disabled = false;
  };
}
