export default class Loading {
  constructor() {
    this.$el = document.createElement('div');
    this.$el.className = 'loading';
    this.$el.innerHTML = `
      <div class="lds-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    `;

    document.body.append(this.$el);
  }
}
