const store = {
  subscribe: (context, ref) => {
    store[context].refs.push(ref);
  },
  get: (context) => {
    return store[context].data;
  },
  set: (context, data) => {
    const initialSet = !store[context];

    if (initialSet) {
      store[context] = {
        data: data,
        refs: [],
      };
      return;
    }

    console.log('new data', data);
    store[context].data = data;
    store[context].refs.forEach((ref) => ref.render());
  },
};

export default store;
