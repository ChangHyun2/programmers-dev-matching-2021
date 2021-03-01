import Component from './Component.js';
import Carousel from '../UI/Carousel.js';
import api from '../api/api.js';

export default class Banner extends Component {
  constructor($parent) {
    super($parent, 'div', {
      className: 'Banner',
    });
  }

  async render() {
    let cats = await this.tryFetchData(api.getRandomCats, {
      cb: ({ data }) => data,
      cache: false,
      errorTypes: ['api'],
      showErrorMessage: false,
    });

    if (!cats) {
      return this.render();
    }

    const slidesTemplate = cats
      .map(
        ({ url, name, id }) => `
        <li class="Carousel-slide" id-${id}>
          <div class="img-wrapper lazy">
            <img data-src=${url} alt=${name}/>
            <div class="img-placeholder"/>
          </div>
        </li>`
      )
      .join('');

    new Carousel(this.$, {
      slidesTemplate,
      windowSlideSize: 5,
      autoPlay: 2000,
      duration: 300,
    }).render();
  }
}
