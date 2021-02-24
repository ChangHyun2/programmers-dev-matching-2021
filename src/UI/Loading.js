import Component from '../components/Component.js';

export default class Loading extends Component {
  constructor() {
    super(document.body, 'div', {
      classname: 'loading',
      innerHTML: `
        <span class="loading">
          <span class="loading-dot"></span>
          <span class="loading-dot"></span>
          <span class="loading-dot"></span>
        </span>
      `,
    });
  }
}
