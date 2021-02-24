export default class Loading {
  constructor() {
    this.$el = document.createElement('div');
    this.$el.className = 'loading';
    this.$el.innerHTML = `
      <span class="loading">
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
      </span>
    `;

    document.body.append(this.$el);
  }
}
