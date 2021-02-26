import ApiError from '../utils/ApiError.js';

const STATUS_ERROR_MESSAGE =
  '서버가 원활하지 않습니다. 잠시 후 다시 시도해주세요';

const statusErrorMessages = [
  false,
  'Redirects Error',
  'Client Error',
  'Server Error',
];

const getStatusErrorMessage = (res, name) => {
  const errorTypes = [300, 400, 500, 600];

  for (let i = 0; i < errorTypes.length; i++) {
    const errorType = errorTypes[i];

    if (res.status < errorType) {
      if (errorType === 300) return false;

      return `API request error : ${statusErrorMessages[i]} with status code ${res.status} from ${name}`;
    }
  }
};

const fetchData = async (url, name) => {
  try {
    const res = await fetch(url);

    const statusErrorMessage = getStatusErrorMessage(res, name);
    if (statusErrorMessage)
      throw new ApiError(statusErrorMessage, 'status', res.status);

    return res.json();
  } catch (e) {
    // 요청 상태 에러 처리
    if (e.type === 'status') {
      console.warn(e); // 개발자 디버깅에 필요한 에러 로깅

      throw new ApiError(STATUS_ERROR_MESSAGE, 'api', e.status); // UI에서 사용할 에러 메세지와 함께 throw
    }

    // 코드 에러 처리
    throw new Error(e);
  }
};

export default fetchData;
