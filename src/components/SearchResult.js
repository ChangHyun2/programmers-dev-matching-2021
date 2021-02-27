import Component from './Component.js';
import ImageInfo from './ImageInfo.js';
import store from '../store.js';
import api from '../api/api.js';
import { lazyLoad, localStorage, TypeError } from '../utils/index.js';
import observeBottomOf from '../utils/observeBottomOf.js';

export default class SearchResult extends Component {
  constructor($parent) {
    super($parent, 'div', {
      className: 'SearchResult',
    });

    const initialData = this.get('search-result', 'web') || [];
    this.set(initialData).on('search-result', ['local', 'web']);
    this.subscribe('search-result');

    this.bindEvents();
  }

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
    const $catCard = e.target.closest('.item');
    if (!$catCard) {
      return;
    }

    const catInfo = await this.tryFetchData(api.getCatById, $catCard.id, {
      cb: ({ data }) => {
        if (!data) {
          throw TypeError('클릭하신 고양이 정보를 불러올 수 없습니다.', 'data');
        }

        return data;
      },
      errorTypes: ['api', 'data'],
    });

    catInfo && new ImageInfo(document.body, catInfo).render();
  };

  createCatCardHTML = (cat) => `
    <div class="item" id=${cat.id} data-name=${cat.name}>
      <div class="img-wrapper lazy">
        <img data-src=${cat.url} alt=${cat.name}  />
        <div class="img-placeholder"></div>
      </div>
    </div>
  `;

  async renderNextCats() {
    const cats = await this.tryFetchData(api.getRandomCats, {
      cb: ({ data }) => data,
      showErrorMessage: false,
      showLoading: false,
      errorTypes: ['api'],
    });

    if (!cats) {
      this.renderNextCats();
      return;
    }

    this.addHTML(cats.map(this.createCatCardHTML).join(''));
  }

  infiniteNextCats = () => {
    observeBottomOf(this.$, async (unobserve) => {
      if (this.loading) {
        return;
      }
      await this.renderNextCats();
      lazyLoad();
      unobserve();
      this.infiniteNextCats();
    });
  };

  render() {
    this.HTML(store.get('search-result').map(this.createCatCardHTML).join(''));

    lazyLoad();

    this.infiniteNextCats();
  }
}
