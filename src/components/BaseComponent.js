export default class BaseComponent {
  constructor(target, tag, attributes) {
    let insertPosition;

    if (target instanceof Array) {
      [this.$parent, insertPosition] = target;
    } else {
      this.$parent = target;
    }

    const $el = document.createElement(tag);
    Object.entries(attributes).forEach(([fieldName, fieldValue]) => {
      if (fieldName === 'styles') {
        return Object.entries(fieldValue).forEach(([fieldName, fieldValue]) => {
          $el.style[fieldName] = fieldValue;
        });
      }

      $el[fieldName] = fieldValue;
    });
    this.$el = $el;

    insertPosition
      ? this.$parent.insertAdjacentElement(insertPosition, this.$el)
      : this.$parent.append(this.$el);
  }

  bindEvents() {
    // field를 돌면서 핸들러 네이밍일 경우 this를 바인딩하고 event listen.

    Object.entries(this).forEach(([fieldName, fieldValue]) => {
      if (fieldName.indexOf('on') === -1) return;

      const eventType = fieldName.slice(2).toLowerCase();

      this.$el.addEventListener(eventType, fieldValue);
    });
  }
}
