import TypeError from '../../utils/TypeError.js';
import Component from '../Component.js';
import { ErrorMessage, Loading } from '../../UI/index.js';
import api from '../../api.js';
import store from '../../store.js';
import localStorage from '../../utils/localStorage.js';

const errorMessage =
  '검색한 고양이가 존재하지 않습니다. 다른 고양이 이름을 검색해주세요.';

export default class SearchInput extends Component {
  constructor($parent) {
    super($parent, 'input', {
      placeholder: '고양이를 검색해보세요',
      className: 'SearchInput',
    });

    this.bindEvents();
  }

  updateSearchResult = async (searchedKeyword) => {
    const loading = new Loading();

    try {
      const res = await api.getCats(searchedKeyword);

      if (!res.data.length)
        throw new TypeError(
          '검색하신 고양이 이미지가 존재하지 않습니다. 다른 고양이를 검색해주세요.',
          'data'
        );

      store.set('search-result', res.data);
      localStorage.set('cats-search-result', res.data);
    } catch (e) {
      let message;

      if (e.type === 'api' || e.type === 'data') {
        console.warn(e);
        message = e.message;
      } else {
        console.error(e);
        message = `알 수 없는 에러가 발생했습니다. ${e.message}`;
      }

      new ErrorMessage(this.$el.closest('.Search'), message, e.status);
    } finally {
      loading.$el.remove();
    }
  };

  updateSearchHistory = (value) => {
    const data = store.get('search-history');

    if (data.length === 5) data.shift();

    store.set('search-history', [...data, value]);
  };

  onKeyUp = (e) => {
    const searchedKeyword = e.target.value;

    if (e.keyCode === 13) {
      this.updateSearchHistory(searchedKeyword);
      this.updateSearchResult(searchedKeyword);
    }
  };

  onClick = (e) => {
    this.$el.value = '';
  };
}
