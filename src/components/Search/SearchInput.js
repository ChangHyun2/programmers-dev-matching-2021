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
      const res = await api.fetchCats(searchedKeyword);

      if (!res.data.length) throw new Error(errorMessage);

      store.set('search-result', res.data);
      localStorage.set('cats-search-result', res.data);
    } catch (e) {
      console.warn(e);

      new ErrorMessage({
        $parent: this.$el.closest('.Search'),
        message:
          e.message === errorMessage
            ? e.message
            : '서버가 원활하지 않습니다. 잠시 후 다시 시도해주세요.',
      });
    } finally {
      loading.$el.remove();
    }
  };

  updateSearchHistory = (value) => {
    const data = store.get('search-history');

    if (data.length === 5) data.shift();

    store.set('search-history', [...data, value]);
  };

  onKeyUp = async (e) => {
    const searchedKeyword = e.target.value;

    if (e.keyCode === 13) {
      this.updateSearchHistory(searchedKeyword);
      try {
        await this.updateSearchResult(searchedKeyword);
      } catch (e) {
        console.error(e);
      }
    }
  };

  onClick = (e) => {
    this.$el.value = '';
  };
}
