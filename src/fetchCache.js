class FetchCache {
  constructor() {
    this.cache = {};
  }

  has(context, funcStr) {
    return !!this.cache[context] && this.cache[context].hasOwnProperty(funcStr);
  }

  set(context, funcStr, data) {
    if (this.cache[context]) {
      this.cache[context][funcStr] = data;

      return this.cache[context];
    }

    this.cache[context] = {
      [funcStr]: data,
    };

    return this.cache[context];
  }

  get(context, funcStr) {
    if (!this.cache[context].hasOwnProperty(funcStr))
      throw new Error('set context and function in fetchCache before get data');

    return this.cache[context][funcStr];
  }
}

const fetchCache = new FetchCache();

export default fetchCache;
