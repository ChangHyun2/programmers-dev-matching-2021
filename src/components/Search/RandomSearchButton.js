import Component from '../Component.js';
import api from '../../api.js';
import store from '../../store.js';
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
      const { data } = await api.getRandomCats();

      store.set('search-result', data);
      localStorage.set('cats-search-result', data);
    } catch (e) {
      let message;

      if (e.type === 'api') {
        message = e.message;
      } else {
        message = `알 수 없는 에러가 발생했습니다 : ${e.message}`;
        console.error(e);
      }

      new ErrorMessage(this.$el, message, e.status);
    } finally {
      loading.$el.remove();
      this.$el.disabled = false;
    }
  };

  onClick = async () => {
    this.$el.disabled = true;
    this.updateSearchResult();
  };
}
