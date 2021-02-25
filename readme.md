# 2021.02.25

## 컴포넌트 클래스 작성

인자 정보
1. target : 부모 element
  - `[$parent, 'afterend']` => 컴포넌트를 insertAdjacentElement할 경우 
  - `$parent` => 컴포넌트를 append할 경우
2. tag : HTML 태그
3. attributes : 돔 속성
  - setAttribute 방식이 아닌, 객체 속성으로 바로 할당하는 방식 적용 (성능 상 좋지 않다고 함)
  - style 속성은 styles로 한번에 전달
  
```js
// Component.js
export default class Component {
  constructor(target, tag, attributes) {
    let insertPosition;

    if (target instanceof Array) {
      [this.$parent, insertPosition] = target;
    } else {
      this.$parent = target;
    }

    const $el = document.createElement(tag);
    Object.entries(attributes).forEach(([fieldName, fieldValue]) => {
      // styles는 각 style value를 하나씩 할당
      if (fieldName === 'styles') {
        return Object.entries(fieldValue).forEach(([fieldName, fieldValue]) => {
          $el.style[fieldName] = fieldValue;
        });
      }

      $el[fieldName] = fieldValue;
    });
    this.$el = $el;

    insertPosition
      ? this.$parent.insertAdjacentElement(insertPosition, this.$el)
      : this.$parent.append(this.$el);
  }

  bindEvents() {
    // field를 돌면서 핸들러 네이밍일 경우 this를 바인딩하고 event listen.

    Object.entries(this).forEach(([fieldName, fieldValue]) => {
      if (fieldName.indexOf('on') === -1) return;

      const eventType = fieldName.slice(2).toLowerCase();

      this.$el.addEventListener(eventType, fieldValue); 
    });
  }
}

// Button.js

class Button extends Component{
  constructor($parent){
    super($parent, 'button', {
      className : "Button",
      styles : {
        backgroundColor: '#fff'
        border: '1px solid'
        outline: 'none',
        cursor: 'pointer',
      }
    })
    console.log(this) // { $el, $parent, bindEvents }

    this.bindEvents();
  }

  onClick = (e) => {
    e.target.disabled = true;
  }
  onDisabled = () => {
    console.log('button is disabled');
  }

  render(){
    // 구성자 함수 호출과 함께 바로 렌더링할 경우 super()에서 할당해도 무방
    this.$el.textContent = 'disable button'
  }
}

// create button component
const $button = new Button(document.body);

// render
$button.render();
```

## 에러 핸들링

**에러의 종류**

- [1] server로부터 전달는 상태 에러
- [2] 개발자의 잘못된 코드 작성 또는 의도치 않은 코드 실행에 의한 에러
- [3] 개발자가 유저에게 에러를 알리기 위해 의도적으로 throw한 에러

**개발자와 유저의 에러 확인 방법**

1. 개발자
   
   1.1 개발 중
   - console.error : 에러 [1]을 로깅할 때 사용
   - console.warn : 에러 [2],[3]을 로깅할 때 사용
   - ErrrorMessage UI 또는 페이지
  
   1.2 배포 후
   - 클아이언트의 에러 피드백
  
2. 클라이언트 유저
   - ErrorMessage UI 또는 페이지

## 에러 핸들링 구현 방식 요약

컴포넌트에서 데이터 요청 함수를 실행할 경우

1. api 함수 호출
2. data 유무 확인
3. 필요한 data 리턴

위 순으로 try문을 작성하고  
에러가 발생할 경우 catch문에서 에러의 종류에 따라 핸들링함 

## 커스텀 에러 사용하기

catch문에서 error를 catch할 경우, 어떤 에러인지 확인하는 게 불가능하므로  
커스텀 에러를 만들어 에러에 메세지와 함께 추가 정보 전달한다.  
https://javascript.info/custom-errors

**Type Error**

```js
// TypeError.js : 에러의 타입을 나타냄
export default class TypeError extends Error {
  constructor(message, type) {
    super(message);
    this.type = type;
  }
}


// 사용 예시

// api 호출 함수
const getCard = () => throw new TypeError('500 status error', 'api')

// MyComponent.js 
try{
  const card = await getCard()
  if(!card) throw new TypeError('card does not exist', 'data')
  erturn card 
}catch(e){
  if(e.type==='api'){} // api 요청 에러 처리
  else if(e.type==='data'){} // data 유효성 에러 처리
  else{} // 코드 작성 에러 처리
}
```

**ApiError**

유저에게 상태 정보에 따라 서로 다른 페이지를 보여줄 경우,  
catch하는 에러 메세지에서 status코드를 포함할 경우 쉽게 핸들링할 수 있다.

```js

// ApiError.js 구현
import TypeError from './TypeError.js';

export default class ApiError extends TypeError {
  constructor(message, type, status) {
    super(message, type);
    this.status = status;
  }
}

// 사용 예시

const getCard = () => throw new ApiError('Internal Server error from getCard with status 500', 'api', 500)

// MyComponent.js
try{
  const card = await getCard()
  return card;
}catch(e){
  if(e.type==='api'){  
    alertError(e.message, e.status)
  } 
  //.. ..//
}

```

## console.error와 console.warn 분리하기

console.warn : 코드에 문제가 없는 loose한 에러
- api 상태 에러
- data 유효성 에러 => ex) 유저가 검색한 고양이가 없는 경우
- 이외 추가적인 TypeError에 의해 throw되는 의도적인 에러
 
console.error : 반드시 수정해야될 에러
- 코드 실행에 의해 발생하는 에러

```js
catch (e) {
  let message;

  if (e.type === 'api' || e.type === 'data') {
    console.warn(e); // api, data validation에 의한 에러로, 사용자에게 보여줄 loose한 에러
    message = e.message;
  } else {
    console.error(e); // 개발 시 처리해야될 치명적인 에러
    message = `알 수 없는 에러가 발생했습니다. ${e.message}`;

    // .. // 배포에서 의도치 않게 에러가 발생할 경우 개밡 팀으로 에러 피드백
  }

  // 에러 메세지 UI 띄우기

  // 개발 시 에러 메세지는 페이지로 띄우고
  // 유저 에러 메세지는 팝업형식이나 상태 코드별 페이지를 띄우면 좋을 듯
  new ErrorMessage($catCard, message, e.status); 
}
```

## API 호출 함수 에러 핸들링

```js
import ApiError from './utils/ApiError.js';

const API_ENDPOINT =
  'https://oivhcpn8r9.execute-api.ap-northeast-2.amazonaws.com/dev'; 
const STATUS_ERROR_MESSAGE = // 클라이언트에 띄울 메세지
  '서버가 원활하지 않습니다. 잠시 후 다시 시도해주세요';

const statusErrorMessages = [ 
  false,
  'Redirects Error',
  'Client Error',
  'Server Error',
];

// 개발 디버깅 시 사용할 에러 메세지 생성
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
    if (statusErrorMessage) // 상태 에러일 경우 status code 포함해서 에러 throw하기
      throw new ApiError(statusErrorMessage, 'status', res.status);

    return res.json();
  } catch (e) {
    // 요청 상태 에러 처리
    if (e.type === 'status') {
      console.warn(e); // 개발 디버깅에 필요한 에러 로깅 => 컴포넌트 내에서는 UI에 집중하기 위해 api 호출 함수에서 warn 로그 처리

      throw new ApiError(STATUS_ERROR_MESSAGE, 'api', e.status); // UI에서 사용할 에러 메세지, 상태 코드와 함께 throw
    }

    // 코드 에러 처리
    throw new Error(e);
  }
};

const api = {
  getCats: (keyword) =>
    fetchData(`${API_ENDPOINT}/api/cats/search?q=${keyword}`, 'get cats'),
  getCatById: (id) =>
    fetchData(`${API_ENDPOINT}/api/cats/${id}`, 'get catById'),
  getRandomCats: () =>
    fetchData(`${API_ENDPOINT}/api/cats/random50`, 'get randomCats'),
};

export default api;

```

## 컴포넌트 데이터 요청 함수 에러 핸들링

**api 호출 함수로부터 전달 받는 에러 형식**
1. ApiError => (상태 코드에 의한 throw된 에러)
- type
- message
- status
2. Error  (코드 작성 또는 코드 실행 오류에 의한 에러)
- message

**api 호출 함수에 의한 에러 대응 방법**
1. ApiError를 전달 받을 경우, API 호출 함수에서 console.warn 처리를 했으니, UI만 띄우기
2. Error를 전달 받을 경우, 개발에서 수정해야하므로 console.error 처리해주고, 확인에 용이한 UI Message 띄우기

**이외의 추가적인 TypeError**
컴포넌트 데이터 요청 함수 내에서 새로운 타입의 에러를 생성해야할 경우,
TypeError를 throw하기

```js
  /*  SearchResult.js
        SearchResult 컴포넌트의 getCatInfo 함수 요약
        고양이 카드 element를 전달받고 고양이 정보를 요청한 후
        정보가 있을 경우 CatInfo를 리턴하는 함수
  */
  getCatInfo = async ($catCard) => {
    try {
      // api 요청 실패 시 ApiError 또는 Error를 catch하게 됨
      const { data } = await api.getCatById($catCard.dataset.id); 

      // api 요청에 성공했으나 컴포넌트 렌더링에 사용할 데이터가 invalid할 경우
      if (!Object.keys(data).length) { 
        throw new TypeError(
          '선택하신 고양이 상세 정보를 불러올 수 없습니다.',
          'data' // data type의 에러 throw
        );
      }

      const { id, url, name, temperament, origin } = data;
      return { id, url, name, temperament, origin };
    } catch (e) {
      let message;

      // api 또는 data 타입의 에러일 경우 
      if (e.type === 'api' || e.type === 'data') {
        console.warn(e); // UI 메세지 console.warn
        message = e.message;
      } else {
        console.error(e); // 이외의 에러는 개발 시 처리해야될 에러
        message = `알 수 없는 에러가 발생했습니다. ${e.message}`;
        // .. // 배포에서 발생할 경우 개발 팀으로 피드백하기
      }

      // UI 메세지 띄우기
      // type을 포함하는 loose한 에러는 토스트를 띄우고
      // type을 포함하지 않는 strict한 에러는 전체화면을 띄워 개발에서 놓치지 않게끔 수정하기
      new ErrorMessage($catCard, message, e.status);
    }
  };
```

# 2021.02.24

### HTML, CSS 관련

- 현재 HTML 코드가 전체적으로 `<div>` 로만 이루어져 있습니다. 이 마크업을 시맨틱한 방법으로 변경해야 합니다.
- 유저가 사용하는 디바이스의 가로 길이에 따라 검색결과의 row 당 column 갯수를 적절히 변경해주어야 합니다.
  - 992px 이하: 3개
  - 768px 이하: 2개
  - 576px 이하: 1개
- 다크 모드(Dark mode)를 지원하도록 CSS를 수정해야 합니다.
  - CSS 파일 내의 다크 모드 관련 주석을 제거한 뒤 구현합니다.
  - 모든 글자 색상은 #FFFFFF , 배경 색상은 #000000 로 한정합니다.
  - 기본적으로는 OS의 다크모드의 활성화 여부를 기반으로 동작하게 하되, 유저가 테마를 토글링 할 수 있도록 좌측 상단에 해당 기능을 토글하는 체크박스를 만듭니다.

### 이미지 상세 보기 모달 관련

- 디바이스 가로 길이가 768px 이하인 경우, 모달의 가로 길이를 디바이스 가로 길이만큼 늘려야 합니다.
- `필수` 이미지를 검색한 후 결과로 주어진 이미지를 클릭하면 모달이 뜨는데, 모달 영역 밖을 누르거나 / 키보드의 ESC 키를 누르거나 / 모달 우측의 닫기(x) 버튼을 누르면 닫히도록 수정해야 합니다.
- 모달에서 고양이의 성격, 태생 정보를 렌더링합니다. 해당 정보는 /cats/:id 를 통해 불러와야 합니다.
- 추가 모달 열고 닫기에 fade in/out을 적용해 주세요.

### 검색 페이지 관련

- 페이지 진입 시 포커스가 `input` 에 가도록 처리하고, 키워드를 입력한 상태에서 `input` 을 클릭할 시에는 기존에 입력되어 있던 키워드가 삭제되도록 만들어야 합니다.
- `필수` 데이터를 불러오는 중일 때, 현재 데이터를 불러오는 중임을 유저에게 알리는 UI를 추가해야 합니다.
- `필수` 검색 결과가 없는 경우, 유저가 불편함을 느끼지 않도록 UI적인 적절한 처리가 필요합니다.
- 최근 검색한 키워드를 `SearchInput` 아래에 표시되도록 만들고, 해당 영역에 표시된 특정 키워드를 누르면 그 키워드로 검색이 일어나도록 만듭니다. 단, 가장 최근에 검색한 5개의 키워드만 노출되도록 합니다.
- 페이지를 새로고침해도 마지막 검색 결과 화면이 유지되도록 처리합니다.
- `필수` `SearchInput` 옆에 버튼을 하나 배치하고, 이 버튼을 클릭할 시 /api/cats/random50 을 호출하여 화면에 뿌리는 기능을 추가합니다. 버튼의 이름은 마음대로 정합니다.
- lazy load 개념을 이용하여, 이미지가 화면에 보여야 할 시점에 load 되도록 처리해야 합니다.
- `추가` 검색 결과 각 아이템에 마우스 오버시 고양이 이름을 노출합니다.

### 스크롤 페이징 구현

- 검색 결과 화면에서 유저가 브라우저 스크롤 바를 끝까지 이동시켰을 경우, 그 다음 페이지를 로딩하도록 만들어야 합니다.

### 랜덤 고양이 배너 섹션 추가

- 현재 검색 결과 목록 위에 배너 형태의 랜덤 고양이 섹션을 추가합니다.
- 앱이 구동될 때 `/api/cats/random50` api를 요청하여 받는 결과를 별도의 섹션에 노출합니다.
- 검색 결과가 많더라도 화면에 5개만 노출하며 각 이미지는 좌, 우 슬라이드 이동 버튼을 갖습니다.
- 좌, 우 버튼을 클릭하면, 현재 노출된 이미지는 사라지고 이전 또는 다음 이미지를 보여줍니다.(트렌지션은 선택)

### 코드 구조 관련

- ES6 module 형태로 코드를 변경합니다.

  - webpack , parcel 과 같은 번들러를 사용하지 말아주세요.

- 해당 코드 실행을 위해서는 http-server 모듈을(로컬 서버를 띄우는 다른 모듈도 사용 가능) 통해 index.html 을 띄워야 합니다.
- API fetch 코드를 async , await 문을 이용하여 수정해주세요. 해당 코드들은 에러가 났을 경우를 대비해서 적절히 처리가 되어있어야 합니다.
- `필수` API 의 status code 에 따라 에러 메시지를 분리하여 작성해야 합니다. 아래는 예시입니다.

```javascript
const request = async (url: string) => {
  try {
    const result = await fetch(url);
    return result.json();
  } catch (e) {
    console.warn(e);
  }
};
const api = {
  fetchGif: (keyword) => {
    return request(`${API_ENDPOINT}/api/gif/search?q=${keyword}`);
  },
  fetchGifAll: () => {
    return request(`${API_ENDPOINT}/api/gif/all`);
  },
};
```

- SearchResult 에 각 아이템을 클릭하는 이벤트를 Event Delegation 기법을 이용해 수정해주세요.
- 컴포넌트 내부의 함수들이나 Util 함수들을 작게 잘 나누어주세요.

---

# API

## 1. GET /cats/random50

![](/Images/2020-12-09-18-15-09.png)

```http
HTTP/1.1 200 OK{
"data": [{
id: string
url: string
name: string
}]}
```

## 2. GET /cats/search

![](/Images/2020-12-09-18-14-23.png)

```http
HTTP/1.1 200 OK{
"data": [{
id: string
url: string
name: string
}]}
```

## 3. GET /cats/:id

![](/Images/2020-12-09-18-14-51.png)

```HTTP
HTTP/1.1 200 OK{
"data": {
name: string
id: string
url: string
width: number
height: number
temperament: string
origin: string
}
}
```
