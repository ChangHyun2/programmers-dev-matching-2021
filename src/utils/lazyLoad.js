export default function lazyLoad(options = {}) {
  const { root = document, rootMargin = '500px', threshold = 0 } = options;

  var lazyImageWrappers = [].slice.call(
    root.querySelectorAll('.img-wrapper.lazy')
  );

  if ('IntersectionObserver' in window) {
    let lazyImageObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const lazyImage = entry.target.querySelector('img');

            const placeholder = entry.target.querySelector('.img-placeholder');

            lazyImage.src = lazyImage.dataset.src;
            lazyImage.classList.remove('lazy');
            lazyImage.onload = () => {
              placeholder.classList.add('fade-out');
              placeholder.ontransitionend = () => placeholder.remove();
            };
            lazyImageObserver.unobserve(entry.target);
          }
        }),
      {
        root,
        rootMargin,
        threshold,
      }
    );

    lazyImageWrappers.forEach(function (lazyImageWrapper) {
      lazyImageObserver.observe(lazyImageWrapper);
    });
  } else {
    // Possibly fall back to event handlers here
  }
}
