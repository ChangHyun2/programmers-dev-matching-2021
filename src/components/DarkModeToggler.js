import Component from './Component.js';

export default class DarkModeToggler extends Component {
  constructor($parent) {
    super($parent, 'button', {
      textContent: 'toggle theme',
    });
    this.bindEvents();
  }

  onclick = () => {
    let originTheme = document.body.dataset.theme;

    if (!originTheme) {
      originTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }

    let toggledTheme = originTheme === 'dark' ? 'light' : 'dark';

    document.body.setAttribute('data-theme', toggledTheme);
  };
}
