import Component from './Component.js';
import ImageInfo from './ImageInfo.js';
import store from '../store.js';
import api from '../api.js';
import { Loading, ErrorMessage } from '../UI/index.js';
import localStorage from '../utils/localStorage.js';
import lazyLoad from '../utils/lazyLoad.js';

const errorMessage = '선택하신 고양이 상세 정보를 불러올 수 없습니다.';

export default class SearchResult extends Component {
  constructor($parent) {
    super($parent, 'div', {
      className: 'SearchResult',
    });
    this.isLoading;

    store.set('search-result', localStorage.get('cats-search-result') || []);
    store.subscribe('search-result', this);

    this.bindEvents();
  }

  getCatInfo = async ($catCard) => {
    if ($catCard.dataset.catInfo) {
      return JSON.parse($catCard.dataset.catInfo);
    }

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
    }
  };

  onMouseOver = (e) => {
    const item = e.target.closest('.item');
    if (!item) return;

    if (item.querySelector('.item-name')) return;

    const name = item.dataset.name;

    const $itemName = document.createElement('span');
    $itemName.textContent = name;
    $itemName.className = 'item-name';

    item.querySelector('.img-wrapper').append($itemName);
  };

  onMouseOut = (e) => {
    const item = e.target.closest('.item');
    if (!item) return;

    item.querySelector('.item-name').remove();
  };

  onClick = async (e) => {
    if (this.isLoading) return;

    const $catCard = e.target.closest('.item');
    if (!$catCard) {
      return;
    }

    const loading = new Loading();
    this.isLoading = true;
    try {
      const catInfo = await this.getCatInfo($catCard);

      new ImageInfo(document.body, catInfo).render();
    } catch (e) {
      new ErrorMessage($catCard, e.message);
    } finally {
      loading.$el.remove();
      this.isLoading = false;
    }
  };

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
}
