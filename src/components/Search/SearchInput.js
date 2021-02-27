import { TypeError, localStorage } from '../../utils/index.js';
import Component from '../Component.js';
import api from '../../api/api.js';

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
      this.set(cats).on('search-result', ['local', 'web']);
    }
  };

  updateSearchHistory = (keyword) => {
    const searchHistory = this.get('search-history', 'local');

    searchHistory.length === 5 && searchHistory.shift();

    this.set([...searchHistory, keyword]).on('search-history', 'local');
  };

  onKeyUp = (e) => {
    const keyword = e.target.value;

    if (e.keyCode === 13) {
      this.updateSearchHistory(keyword);
      this.updateSearchResult(keyword);
    }
  };

  onClick = (e) => {
    this.$.value = '';
  };
}
