import fetchData from './fetchData.js';

const API_ENDPOINT =
  'https://oivhcpn8r9.execute-api.ap-northeast-2.amazonaws.com/dev';

const api = {
  getCats: (keyword) =>
    fetchData(`${API_ENDPOINT}/api/cats/search?q=${keyword}`, 'getCats'),
  getCatById: (id) => fetchData(`${API_ENDPOINT}/api/cats/${id}`, 'getCatById'),
  getRandomCats: () =>
    fetchData(`${API_ENDPOINT}/api/cats/random50`, 'getRandomCats'),
};

export default api;
