const API_ENDPOINT =
  'https://oivhcpn8r9.execute-api.ap-northeast-2.amazonaws.com/dev';

const statusErrorFromResponse = (res) => {
  if (res.status < 300) return false;

  if (res.status < 400) {
    return `Redirects Error with status code ${res.status}`;
  }
  if (res.status < 500) {
    return `Client Error with status code ${res.status}`;
  }
  if (res.status < 600) {
    return `Server Error with status code ${res.status}`;
  }
};

const api = {
  fetchCats: async (keyword) => {
    const res = await fetch(`${API_ENDPOINT}/api/cats/search?q=${keyword}`);

    const statusErrorMessage = statusErrorFromResponse(res);
    if (statusErrorMessage) throw new Error(statusErrorMessage);

    return res.json();
  },
  fetchCatById: async (id) => {
    const res = await fetch(`${API_ENDPOINT}/api/cats/${id}`);

    const statusErrorMessage = statusErrorFromResponse(res);
    if (statusErrorMessage) throw new Error(statusErrorMessage);

    return res.json();
  },
  fetchRandomCats: async () => {
    const res = await fetch(`${API_ENDPOINT}/api/cats/random50`);

    const statusErrorMessage = statusErrorFromResponse(res);
    if (statusErrorMessage) throw new Error(statusErrorMessage);

    return res.json();
  },
};

export default api;
