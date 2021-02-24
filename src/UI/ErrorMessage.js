const DURATION = 1500;

export default class ErorrMessage {
  constructor($target = document.body, message) {
    const { bottom, left } = $target.getBoundingClientRect();

    const $el = document.createElement('div');
    $el.className = 'error-message';
    $el.textContent = message;
    $el.style.position = 'fixed';
    $el.style.left = left + 'px';
    $el.style.top = `${bottom + 50}px`;
    $el.style.zIndex = 1001;
    this.$el = $el;

    $target.insertAdjacentElement('afterend', this.$el);
    this.$el.classList.add('fade-in');

    setTimeout(() => {
      this.$el.classList.remove('fade-in');
      this.$el.classList.add('fade-out');
      this.$el.ontransitionend = () => this.$el.remove();
    }, DURATION);
  }
}
