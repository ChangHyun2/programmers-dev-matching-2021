import Component from './Component.js';
import { lazyLoad } from '../utils/index.js';
import api from '../api/api.js';

export default class Carousel extends Component {
  constructor($parent) {
    super($parent, 'div', {
      className: 'Carousel',
      styles: {
        position: 'relative',
      },
      innerHTML: `
          <button class="Carousel-left-arrow"> < </button>
          <div class="Carousel-slides">
          </div>
          <button class="Carousel-right-arrow"> > </button>
          `,
    });

    this.$slides = this.$.querySelector('.Carousel-slides');

    this.slideSize = 5;

    this.index = 0;
    this.slideTo(this.index);

    window.addEventListener('resize', this.handleWindowResize);

    this.bindEvents();
  }

  slideTo(index) {
    const { width } = this.$slides.getBoundingClientRect();

    this.$slides.style.transform = `translate3d(${
      -(width / 5) * (index + this.slideSize)
    }px, 0, 0)`;
  }

  prevImage() {
    if (this.index === -this.slideSize) {
      this.$slides.transition = '0ms';
      return;
    }

    this.$slides.style.transition = `transform 330ms ease-in-out`;

    this.index--;
    this.slideTo(this.index);

    if (this.index === -this.slideSize) {
      this.$slides.ontransitionend = () => {
        this.$slides.style.transition = '';

        this.index = this.$slides.children.length - 3 * this.slideSize;
        this.slideTo(this.index);
        this.$slides.ontransitionend = null;
      };
    }
  }

  nextImage() {
    if (this.index === this.$slides.children.length - 2 * this.slideSize) {
      this.$slides.transition = '0ms';
      return;
    }

    this.$slides.style.transition = `transform 330ms ease-in-out`;

    this.index++;
    this.slideTo(this.index);

    if (this.index === this.$slides.children.length - 2 * this.slideSize) {
      this.$slides.ontransitionend = () => {
        this.$slides.style.transition = '';

        this.index = 0;
        this.slideTo(this.index);
        this.$slides.ontransitionend = null;
      };
    }
  }

  onClick = (e) => {
    switch (e.target.className) {
      case 'Carousel-left-arrow':
        this.prevImage();
        break;
      case 'Carousel-right-arrow':
        this.nextImage();
    }
  };

  handleWindowResize = () => {
    this.$slides.style.transition = '';
    this.slideTo(this.index);
    this.$slides.style.transition = 'transform 330ms ease-in-out';
  };

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

    const first = cats.slice(0, this.slideSize);
    const last = cats.slice(cats.length - this.slideSize);

    cats = [...last, ...cats, ...first];

    this.HTML(
      this.$slides,
      cats
        .map(
          ({ url, name, id }, i) => `
            <li class="Carousel-slide" id-${id}>
              <div class="img-wrapper lazy">
                <img data-src=${url} alt=${name}/>
                <div class="img-placeholder"/>
              </div>
            </li>`
        )
        .join('')
    );

    lazyLoad({
      root: this.$,
      rootMargin: '100%',
      threshold: 1,
    });
  }
}
