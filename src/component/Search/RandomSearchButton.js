import api from '../../api.js';
import { ErrorMessage, Loading } from '../../UI/index.js';
import localStorage from '../../utils/localStorage.js';

export default class RandomSearchButton {
  constructor($target) {
    this.$target = $target;

    this.$el = document.createElement('button');
    this.$el.textContent = '랜덤 고양이 검색하기';
    this.$target.append(this.$el);

    this.onClick = this.onClick.bind(this);
    this.bindEvents();
  }

  async updateSearchResult() {
    const loading = new Loading();

    try {
      const { data } = await api.fetchRandomCats();

      store.set('search-result', data);
      localStorage.set('cats-search-result', data);
    } catch (e) {
      // 콘솔 로그
      console.warn(e);

      // 유저 UI 에러 처리
      new ErrorMessage({
        $target: this.$el,
        message: '서버가 원활하지 않습니다. 잠시 후 다시 시도해주세요.',
      });
    } finally {
      loading.$el.remove();
      this.$el.disabled = false;
    }
  }

  async onClick() {
    this.$el.disabled = true;
    this.updateSearchResult();
  }

  bindEvents() {
    this.$el.addEventListener('click', this.onClick);
  }
}
