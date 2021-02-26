export default function observeBottomOf(
  element = document.body,
  onBottom,
  options = {}
) {
  const { root = document, rootMargin = '600px' } = options;

  const $observer = document.createElement('div');
  element.append($observer);

  const unobserve = () => {
    observer.unobserve($observer);
    $observer.remove();
  };

  const cb = (entries) => {
    const element = entries[0];

    if (element.isIntersecting) {
      onBottom(unobserve);
    }
  };

  // if ('IntersectionObserver' in window) {
  let observer = new IntersectionObserver(cb, {
    root,
    rootMargin,
  });

  observer.observe($observer);
  // } else {
  // Possibly fall back to event handlers here
  // }
}
