import ImageInfo from './ImageInfo.js';
import store from '../store.js';
import api from '../api.js';
import { Loading, ErrorMessage } from '../UI/index.js';
import localStorage from '../utils/localStorage.js';
import lazyLoad from '../utils/lazyLoad.js';

const errorMessage = '선택하신 고양이 상세 정보를 불러올 수 없습니다.';

export default class SearchResult {
  constructor($parent) {
    this.isLoading;

    this.$parent = $parent;
    this.$el = document.createElement('div');
    this.$el.className = 'SearchResult';
    $parent.append(this.$el);

    store.set('search-result', localStorage.get('cats-search-result') || []);
    store.subscribe('search-result', this);

    this.onClick = this.onClick.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onMouseOver = this.onMouseOver.bind(this);
    this.bindEvents();
  }

  async getCatInfo($catCard) {
    if ($catCard.dataset.catInfo) {
      return JSON.parse($catCard.dataset.catInfo);
    }

    const loading = new Loading();

    try {
      const { data } = await api.fetchCatById($catCard.dataset.id);

      if (!Object.keys(data).length) {
        throw new Error(errorMessage);
      }

      $catCard.dataset.catInfo = JSON.stringify(data);

      const { id, url, name, temperament, origin } = data;

      return { id, url, name, temperament, origin };
    } catch (e) {
      console.error(e);

      throw new Error(
        e.message === errorMessage
          ? e.message
          : '서버가 원활하지 않습니다. 잠시 후 다시 시도해주세요.'
      );
    } finally {
      loading.$el.remove();
    }
  }

  onMouseOver(e) {
    const item = e.target.closest('.item');
    if (!item) return;

    if (item.querySelector('.item-name')) return;

    const name = item.dataset.name;

    const $itemName = document.createElement('span');
    $itemName.textContent = name;
    $itemName.className = 'item-name';

    item.querySelector('.img-wrapper').append($itemName);
  }

  onMouseOut(e) {
    const item = e.target.closest('.item');
    if (!item) return;

    item.querySelector('.item-name').remove();
  }

  async onClick(e) {
    if (this.isLoading) return;
    this.isLoading = true;

    const $catCard = e.target.closest('.item');

    if (!$catCard) {
      return;
    }

    try {
      const catInfo = await this.getCatInfo($catCard);

      new ImageInfo(document.body, catInfo).render();
    } catch (e) {
      new ErrorMessage($catCard, e.message);
    } finally {
      this.isLoading = false;
    }
  }

  render() {
    this.$el.innerHTML = store
      .get('search-result')
      .map(
        (cat) => `
        <div class="item" data-id=${cat.id} data-name=${cat.name}>
          <div class="img-wrapper lazy">
            <img data-src=${cat.url} alt=${cat.name}  />
            <div class="img-placeholder"></div>
          </div>
        </div>
      `
      )
      .join('');

    lazyLoad();
  }

  bindEvents() {
    this.$el.addEventListener('click', this.onClick);
    this.$el.addEventListener('mouseover', this.onMouseOver);
    this.$el.addEventListener('mouseout', this.onMouseOut);
  }
}
