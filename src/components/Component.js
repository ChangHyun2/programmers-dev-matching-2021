import BaseComponent from './BaseComponent.js';
import fetchCache from '../fetchCache.js';
import { Loading, ErrorMessage, CriticalErrorMessage } from '../UI/index.js';

export default class Component extends BaseComponent {
  constructor(parent, tag, attributes) {
    super(parent, tag, attributes);

    this.bindEvents();
  }

  handleError(e, types, position) {
    if (
      types &&
      types.length &&
      types.some((type) => type === e.type) // ApiError는 api.js에서 로깅
    ) {
      console.log('hi');
      // TypeError일 경우
      if (e.type !== 'api') {
        console.warn(e);
      }

      new ErrorMessage(e.message, {
        status: e.status,
        position: position,
      });
    } else {
      // 그 외의 코드 에러
      console.error(e);
      new CriticalErrorMessage(e.message);
    }
  }

  async tryFetchData(fetchData, { cb, errorTypes, cache, errorPosition }) {
    // Check fetchCache. if cached, return cached data
    let funcStr;

    if (cache) {
      funcStr = fetchData.toString();
      console.log(cache, funcStr);
      console.log(fetchCache);

      if (fetchCache.has(cache, funcStr)) {
        return fetchCache.get(cache, funcStr);
      }
    }

    // if not cached, fetch data if component is not loading some data
    if (this.isLoading) return;

    this.isLoading = true;
    const loading = new Loading();

    try {
      let data = await fetchData();
      console.log(data);
      if (cb) {
        data = cb(data);
      }
      console.log(data);

      if (cache) {
        fetchCache.set(cache, funcStr, data);
      }

      return data;
    } catch (e) {
      this.handleError(e, errorTypes, errorPosition);
    } finally {
      loading.$el.remove();
      this.isLoading = false;
    }
  }
}
