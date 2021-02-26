import { TypeError, localStorage } from '../../utils/index.js';
import Component from '../Component.js';
import api from '../../api/api.js';
import store from '../../store.js';

export default class SearchInput extends Component {
  constructor($parent) {
    super($parent, 'input', {
      placeholder: '고양이를 검색해보세요',
      className: 'SearchInput',
    });

    this.bindEvents();
  }

  updateSearchResult = async (keyword) => {
    const cats = await this.tryFetchData(api.getCats, keyword, {
      cb: ({ data }) => {
        if (!data.length) {
          throw new TypeError(
            '검색하신 고양이 이미지가 존재하지 않습니다. 다른 고양이를 검색해주세요',
            'data'
          );
        }

        return data;
      },
      errorTypes: ['api', 'data'],
    });

    if (cats) {
      store.set('search-result', cats);
      localStorage.set('cats-search-result', cats);
    }
  };

  updateSearchHistory = (keyword) => {
    const searchHistory = store.get('search-history');

    if (searchHistory.length === 5) searchHistory.shift();

    store.set('search-history', [...searchHistory, keyword]);
  };

  onKeyUp = (e) => {
    const keyword = e.target.value;

    if (e.keyCode === 13) {
      this.updateSearchHistory(keyword);
      this.updateSearchResult(keyword);
    }
  };

  onClick = (e) => {
    this.$el.value = '';
  };
}
