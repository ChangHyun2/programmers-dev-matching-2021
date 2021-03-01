import BaseComponent from './BaseComponent.js';
import fetchCache from '../fetchCache.js';
import { Loading, ErrorMessage, CriticalErrorMessage } from '../UI/index.js';
import store from '../store.js';
import { localStorage } from '../utils/index.js';

const setData = (data, context, type) => {
  switch (type) {
    case 'local':
      store.set(context, data);
      break;
    case 'web':
      localStorage.set('dev-matching-' + context, data);
  }
};

const getData = (context, storeType) => {
  switch (storeType) {
    case 'local':
      return store.get(context);
    case 'web':
      return localStorage.get('dev-matching-' + context);
  }
};

export default class Component extends BaseComponent {
  isLoading;

  handleError() {}
  tryFetchData() {}
  get() {}
  set() {}
  subscribe() {}

  constructor(target, tag, attributes) {
    super(target, tag, attributes);
  }

  handleError({
    e,
    errorTypes: types,
    showErrorMessage,
    errorPosition: position,
  }) {
    if (
      types &&
      types.length &&
      types.some((type) => type === e.type) // ApiError는 api.js에서 로깅
    ) {
      // TypeError일 경우
      if (e.type !== 'api') {
        console.warn(e);
      }

      if (showErrorMessage) {
        new ErrorMessage(e.message, {
          status: e.status,
          position,
        });
      }
    } else {
      // 그 외의 코드 에러
      console.error(e);
      new CriticalErrorMessage(e.message);
    }
  }

  async tryFetchData(fetchData, query, options) {
    if (!options) {
      options = query;
    }

    const {
      cb,
      errorTypes,
      cache = true,
      errorPosition,
      showErrorMessage = true,
      showLoading = true,
    } = options || {};

    // Check fetchCache. if cached, return cached data
    let funcStr;

    if (cache) {
      funcStr = fetchData.toString();

      if (fetchCache.has(funcStr, query)) {
        return fetchCache.get(funcStr, query);
      }
    }

    // if not cached, fetch data if component is not loading some data
    if (this.isLoading) return;

    this.isLoading = true;
    const loading = showLoading && new Loading();

    try {
      let data = await fetchData(query);

      if (cb) {
        data = cb(data);
      }

      if (cache) {
        fetchCache.set(funcStr, query, data);
      }

      return data;
    } catch (e) {
      this.handleError({ e, errorTypes, showErrorMessage, errorPosition });
    } finally {
      loading && loading.$.remove();
      this.isLoading = false;
    }
  }

  get(context, storeType) {
    return getData(context, storeType);
  }

  set(data) {
    return {
      on: (context, storeTypes) => {
        if (typeof storeTypes === 'string') {
          setData(data, context, storeTypes);
          return;
        }

        if (Array.isArray(storeTypes)) {
          storeTypes.forEach((storeType) => setData(data, context, storeType));
        }
      },
    };
  }

  subscribe = (context) => {
    store.subscribe(context, this);
  };
}
