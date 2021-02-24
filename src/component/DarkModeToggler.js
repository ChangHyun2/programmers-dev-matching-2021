export default class DarkModeToggler {
  constructor($target) {
    this.$target = $target;

    this.$element = document.createElement('button');
    this.$element.textContent = 'toggle darkmode';
    this.$element.onclick = () => {
      let originTheme = document.body.dataset.theme;

      if (!originTheme) {
        originTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      }

      let toggledTheme = originTheme === 'dark' ? 'light' : 'dark';

      document.body.setAttribute('data-theme', toggledTheme);
    };

    this.$target.append(this.$element);
  }
}
