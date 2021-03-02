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
          <button class="Carousel-left-arrow btn"> < </button>
          <ul class="Carousel-slides">
          </ul>
          <button class="Carousel-right-arrow btn"> > </button>
      `,
    });

    this.$slidesWrapper = this.$.querySelector('.Carousel-slides');

    this.direction = 'next';
    this.interval = autoPlay;
    this.duration = duration;
    this.slidesTemplate = slidesTemplate;
    this.initialWindowSize = windowSlideSize;
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
      case 'Carousel-left-arrow btn':
        this.direction = 'prev';
        this.prevSlide();
        break;

      case 'Carousel-right-arrow btn':
        this.direction = 'next';
        this.nextSlide();
    }

    if (this.interval) {
      this.resetInterval = setTimeout(() => this.autoPlay(), this.duration);
    }
  };

  onTouchstart = (e) => {
    const { clientX, clientY } = e.touches[0];
    console.log(e);

    this.touchStart = e.timeStamp;
    this.touchPosition = { clientX, clientY };

    if (this.interval) {
      clearInterval(this.autoTimeout);
      clearInterval(this.resetInterval);
    }
  };

  onTouchEnd = (e) => {
    this.touchStartTimeout = console.log(e);
    const { clientX, clientY } = e.changedTouches[0];
    const timeStamp = e.timeStamp;

    const dx = clientX - this.touchPosition.clientX;
    const dy = clientY - this.touchPosition.clientY;
    const dt = timeStamp - this.touchStart;

    if (dx === 0) {
      if (this.interval) {
        this.autoPlay();
      }

      return;
    }

    const distance = Math.sqrt(dx ** 2 + dy ** 2);
    const velocity = distance / dt;
    const k = 10;

    const force = velocity ** 2 * k;

    let skips = Math.floor(Math.sqrt(force)) || 1;

    while (skips) {
      dx > 0 ? this.prevSlide() : this.nextSlide();

      skips--;
    }

    this.direction = dx > 0 ? 'prev' : 'next';

    if (this.interval) {
      this.autoPlay();
    }
  };

  adaptTo(type) {
    let buttonDisplay;
    let windowSlideSize;

    switch (type) {
      case 'mobile':
        buttonDisplay = 'none';
        windowSlideSize = 2;
        break;
      case 'overMobile':
        buttonDisplay = 'block';
        windowSlideSize = this.initialWindowSize;
        break;
      default:
        throw new Error(
          'you can adapt to device only with mobile and overMobile type'
        );
    }

    this.windowSlideSize = windowSlideSize;
    this.slideWidth = 100 / this.windowSlideSize.toFixed(4) + '%';

    this.$.querySelectorAll('button').forEach(
      ($btn) => ($btn.style.display = buttonDisplay)
    );

    this.$.querySelectorAll('.Carousel-slide').forEach(($slide) => {
      $slide.style.width = this.slideWidth;
      $slide.style.height = '200px';
    });
  }

  handleWindowResize = () => {
    if (window.matchMedia('(max-width:576px)').matches && !this.isMobile) {
      this.adaptTo('mobile');
      this.isMobile = true;
    }

    if (window.matchMedia('(min-width:577px)').matches && this.isMobile) {
      this.adaptTo('overMobile');
      this.isMobile = false;
    }

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

    this.$slides.forEach(($slide) => {
      console.log(this.slideWidth);
      $slide.style.width = this.slideWidth;
    });

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

    if (window.matchMedia('(max-width:576px)').matches) {
      this.adaptTo('mobile');
      this.isMobile = true;
    }

    lazyLoad({
      root: this.$,
      rootMargin: '100%',
      threshold: 0,
    });
  }
}

// reference : https://im-developer.tistory.com/97
