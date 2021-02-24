import Component from '../Component.js';
import api from '../../api.js';
import { ErrorMessage, Loading } from '../../UI/index.js';
import localStorage from '../../utils/localStorage.js';

export default class RandomSearchButton extends Component {
  constructor($parent) {
    super($parent, 'button', {
      textContent: '랜덤 고양이 검색하기',
    });

    this.bindEvents();
  }

  updateSearchResult = async () => {
    const loading = new Loading();

    try {
      const { data } = await api.fetchRandomCats();

      store.set('search-result', data);
      localStorage.set('cats-search-result', data);
    } catch (e) {
      console.warn(e);

      new ErrorMessage({
        $parent: this.$el,
        message: '서버가 원활하지 않습니다. 잠시 후 다시 시도해주세요.',
      });
    } finally {
      loading.$el.remove();
      this.$el.disabled = false;
    }
  };

  onClick = async () => {
    console.log(this.$el);
    this.$el.disabled = true;
    this.updateSearchResult();
  };
}
