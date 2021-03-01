import Component from '../components/Component.js';
import { lazyLoad } from '../utils/index.js';
import { loadImage } from '../utils/lazyLoad.js';

export default class Carousel extends Component {
  constructor(
    $parent,
    { slidesTemplate, windowSlideSize = 5, autoPlay = 2000, duration = 300 }
  ) {
    super($parent, 'div', {
      className: 'Carousel',
      styles: {
        position: 'relative',
      },
      innerHTML: `
          <button class="Carousel-left-arrow"> < </button>
          <ul class="Carousel-slides">
          </ul>
          <button class="Carousel-right-arrow"> > </button>
      `,
    });

    this.$slidesWrapper = this.$.querySelector('.Carousel-slides');

    this.direction = 'next';
    this.interval = autoPlay;
    this.duration = duration;
    this.slidesTemplate = slidesTemplate;
    this.windowSlideSize = windowSlideSize;
    this.slideWidth = 100 / this.windowSlideSize.toFixed(4) + '%';

    this.index = 0;
    this.slideTo(this.index);

    window.addEventListener('resize', this.handleWindowResize);

    autoPlay && this.autoPlay();

    this.bindEvents();
  }

  transitionOn() {
    this.$slidesWrapper.style.transition = `transform ${this.duration}ms ease-in-out`;
  }
  transitionOff() {
    this.$slidesWrapper.style.transition = '';
  }
  forceTransitionEnd() {
    this.$slidesWrapper.transition = '0ms';
  }

  slideTo(index) {
    const { width } = this.$slidesWrapper.getBoundingClientRect();

    this.$slidesWrapper.style.transform = `translate3d(${
      -(width / this.windowSlideSize) * (index + this.windowSlideSize)
    }px, 0, 0)`;
  }

  prevSlide() {
    if (this.index === -this.windowSlideSize) {
      this.forceTransitionEnd();
      return;
    }

    this.transitionOn();

    this.index--;
    this.slideTo(this.index);

    if (this.index === -this.windowSlideSize) {
      this.$slidesWrapper.ontransitionend = () => {
        this.transitionOff();

        this.index = this.$slides.length - this.windowSlideSize;
        this.slideTo(this.index);
        this.$slidesWrapper.ontransitionend = null;
      };
    }
  }

  nextSlide() {
    if (this.index === this.$slides.length) {
      this.forceTransitionEnd();
      return;
    }

    this.transitionOn();

    this.index++;
    this.slideTo(this.index);

    if (this.index === this.$slides.length) {
      this.$slidesWrapper.ontransitionend = () => {
        this.transitionOff();

        this.index = 0;
        this.slideTo(this.index);
        this.$slidesWrapper.ontransitionend = null;
      };
    }
  }

  onClick = (e) => {
    if (e.target.type !== 'submit') return;

    if (this.interval) {
      clearInterval(this.autoTimeout);

      this.resetInterval && clearInterval(this.resetInterval);
    }

    switch (e.target.className) {
      case 'Carousel-left-arrow':
        this.direction = 'prev';
        this.prevSlide();
        break;

      case 'Carousel-right-arrow':
        this.direction = 'next';
        this.nextSlide();
    }

    if (this.interval) {
      this.resetInterval = setTimeout(() => this.autoPlay(), this.duration);
    }
  };

  handleWindowResize = () => {
    this.transitionOff();
    this.slideTo(this.index);
    this.transitionOn();
  };

  autoPlay() {
    this.autoTimeout = setInterval(() => {
      this[this.direction + 'Slide']();
    }, this.interval);
  }

  async render() {
    this.$slidesWrapper.innerHTML = this.slidesTemplate;
    this.$slides = Array.from(this.$slidesWrapper.children);

    const front = this.$slides.slice(0, this.windowSlideSize);
    const back = this.$slides.slice(this.$slides.length - this.windowSlideSize);

    // add front
    front.forEach((node) => {
      const $slide = node.cloneNode(true);

      this.$slidesWrapper.append($slide);
    });

    // add back
    back.reverse().forEach((node) => {
      loadImage(node);
      const $slide = node.cloneNode(true);

      this.$slidesWrapper.insertAdjacentElement('afterbegin', $slide);
    });

    lazyLoad({
      root: this.$,
      rootMargin: '100%',
      threshold: 1,
    });
  }
}

// reference : https://im-developer.tistory.com/97
