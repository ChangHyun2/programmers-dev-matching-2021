class FetchCache {
  constructor() {
    this.cache = {};
  }

  has(context, key) {
    return !!this.cache[context] && this.cache[context].hasOwnProperty(key);
  }

  set(context, key, value) {
    if (this.cache[context]) {
      this.cache[context][key] = value;

      return this.cache[context];
    }

    this.cache[context] = {
      [key]: value,
    };

    return this.cache[context];
  }

  get(context, key) {
    if (!this.cache[context].hasOwnProperty(key))
      throw new Error('set context and key in fetchCache before get value');

    return this.cache[context][key];
  }
}

const fetchCache = new FetchCache();

export default fetchCache;
