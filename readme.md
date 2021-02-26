
# 2021 02.26

## api 요청 캐싱 및 에러 처리 쉽게 하기

### fetchCache

같은 주소의 데이터를 요청할 경우 반복해서 서버로 데이터를 요청할 필요가 없다.
react-query를 사용해보진 못했지만 유사하게 구현해봄  

데이터 요청 시, 요청함수/요첨함수인자/결과값을 캐싱하고 이미 요청한 주소일 경우 캐싱해둔 값을 리턴
```js
  /*
    context : apiFunc.toString()
    key : query ( 요청함수 인자 :  ex) apiFunc(query) )
    value : res.json()
  */

  // 아래 형식으로 캐싱된다.
  const fetchCache = {
    apiFunc:{ 
      query: data 
    }
  }
```

현재 문제점 : data가 null일 경우 대응하지 못 함

### tryFetchData

api요청/캐싱/에러핸들링 코드가 반복돼 이를 줄이기 위해 컴포넌트 메소드로 작성  

**예시 1**

1. 버튼 클릭 시 
2. api.getRandomCats 요청
3. 요청 결과 데이터를 가공한 후
4. 가공된 데이터를 store에 'search-result'로 저장
5. store가 업데이트되어 SearchResult.js 컴포넌트 리렌더링 발생

랜덤으로 고양이 데이터를 불러오므로 **예시 1**은 데이터를 캐싱하지 않는다.

**tryFetchData 적용 전**

```js

// RandomSearchButton.js
  updateSearchResult = async () => {
    this.loading = true;
    const loading = new Loading();

    try {
      const { data } = await api.getRandomCats();

      store.set('search-result', data);
      localStorage.set('cats-search-result', data);
    } catch (e) {
      let message;

      if (e.type === 'api') {
        message = e.message;
      } else {
        message = `알 수 없는 에러가 발생했습니다 : ${e.message}`;
        console.error(e);
      }

      new ErrorMessage(this.$el, message, e.status);
    } finally {
      loading.$el.remove();
      this.$el.disabled = false;
    }
  };

  onClick = async () => {
    this.$el.disabled = true;
    this.updateSearchResult();
    this.$el.disabled = false;
  };

```

**tryFetchData 적용 후**

```js
// RandomSearchButton.js
  updateSearchResult = async () => {
    const data = await this.tryFetchData(api.getRandomCats, { // api요청 함수 전달
      cache : false, // 캐싱하지 않음
      cb: ({ data }) => data, // data 가공 callback
      errorTypes: ['api'], // api요청 시 발생하는 TypeError
    });

    if (data) { // data 반드시 확인
      store.set('search-result', data);
      localStorage.set('cats-search-result', data);
    }
  };

  onClick = async () => {
    this.$el.disabled = true;
    this.updateSearchResult();
    this.$el.disabled = false;
  };
```

**예시 2**

1. 엔터 키 입력 시 
2. api.getCats(keyword) 요청 (fetchCache에 캐싱된 데이터라면 바로 결과값 리턴)
3. 데이터 가공 및 에러 처리를 마치고
4. 가공된 데이터를 fetchCache에 캐싱
5. store에 'search-result'로 저장
6. store가 업데이트되어 SearchResult.js 컴포넌트 리렌더링 발생
  
```js
  // SearchInput.js
  updateSearchResult = async (keyword) => {
    const cats = await this.tryFetchData(api.getCats, keyword, {
      cb: ({ data }) => {
        if (!data.length) { // 사용자가 검색한 고양이 데이터가 서버에 없을 경우
          throw new TypeError(
            '검색하신 고양이 이미지가 존재하지 않습니다. 다른 고양이를 검색해주세요',
            'data'
          );
        }

        return data;
      },
      errorTypes: ['api', 'data'],
    });

    if (cats) {
      store.set('search-result', cats);
      localStorage.set('cats-search-result', cats);
    }
  };
  

  onKeyUp = (e) => {
    const keyword = e.target.value;

    if (e.keyCode === 13) {
      // this.updateSearchHistory(keyword);
      this.updateSearchResult(keyword);
    }
  };
```

## 코드 리펙토링

1. fetchData.js / api.js 분리
   - fetchData : api요청 함수를 정의하기 위한 비동기함수로, 데이터를 요청하고 에러가 발생할 경우 ApiError를 throw한다.
   - api : fetchData를 이용해 api 요청 함수를 작성한다.  

2. BaseComponent.js / Component.js 분리  
   Component에서 api 요청 함수를 실행하고 에러를 핸들링해주는 tryFetchData 함수를 작성하고보니.. ErrorMessage에서 Component를 상속해서 BaseComponent와 Component로 분리   
   - BaseComponent : DOM element를 생성하고 이벤트 핸들러를 등록한다.
   - Component
     - `async tryFetchData` : api.js에서 작성한 api 요청 함수를 실행하고 에러를 처리한다.
     - `handleError` : `tryFetchData`에서 사용되는 helper로 에러 발생 시 에러의 타입에 따라 에러 메세지를 띄운다. 

3. util , UI는 index.js에서 export하도록 수정

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
  return darc (참조 에러) 
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

```css
/* 
device-width is deprecated
https://developer.mozilla.org/en-US/docs/Web/CSS/@media/device-width 
*/

@media only screen and (max-width: 992px) {
  .SearchResult {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media only screen and (max-width: 768px) {
  .SearchResult {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media only screen and (max-width: 576px) {
  .SearchResult {
    display: block;
  }
}
```
- 다크 모드(Dark mode)를 지원하도록 CSS를 수정해야 합니다.
  - CSS 파일 내의 다크 모드 관련 주석을 제거한 뒤 구현합니다.
  - 모든 글자 색상은 #FFFFFF , 배경 색상은 #000000 로 한정합니다.
  - 기본적으로는 OS의 다크모드의 활성화 여부를 기반으로 동작하게 하되, 유저가 테마를 토글링 할 수 있도록 좌측 상단에 해당 기능을 토글하는 체크박스를 만듭니다.
 
```css
/* css OS dark mode */

@media (prefers-color-scheme: dark) {
  body {
    --bg: #000;
    --font: #fff;

    background-color: var(--bg);
    color: var(--font);
  }
}
 ```
 
 ```js
 /*
  js OS dark mode 
  
  버튼 토글 전 => css에서 prefers-color-scheme로 스타일링
  버튼 토글 시 => body의 data-theme 속성 토글링 => css에서 body[data-theme='dark']{} 셀렉터로 스타일링
 */
 
  // DarkModeToggler.js
  
  $darkModeToggler.onclick = () => {
    let originTheme = document.body.dataset.theme;

    if (!originTheme) {
      originTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }

    let toggledTheme = originTheme === 'dark' ? 'light' : 'dark';

    document.body.setAttribute('data-theme', toggledTheme);
  };
 ```

### 이미지 상세 보기 모달 관련

- 디바이스 가로 길이가 768px 이하인 경우, 모달의 가로 길이를 디바이스 가로 길이만큼 늘려야 합니다.
- `필수` 이미지를 검색한 후 결과로 주어진 이미지를 클릭하면 모달이 뜨는데, 모달 영역 밖을 누르거나 / 키보드의 ESC 키를 누르거나 / 모달 우측의 닫기(x) 버튼을 누르면 닫히도록 수정해야 합니다.
```js
// Imageinfo.js (모달 UI로 변경 예정)

// tabindex 속성 
$el.setAttribute('tabindex', 0);

onClick(e) {
  const clickedClassName = e.target.className;
  if (
    clickedClassName === 'close' || // 닫기 버튼
    clickedClassName.indexOf('ImageInfo') !== -1 // 백드랍 클릭
  ) {
    this.removeWithFadeOut();
  }
}
onKeyDown(e) {
  e.key === 'Escape' && this.removeWithFadeOut(); // ESC 키보드 입력 시
}

// 렌더링 시 focus하기
render(){
  /.../
  this.$el.focus();
}

this.$el.addEventListener('click', this.onClick);
this.$el.addEventListener('keydown', this.onKeyDown);
```
- 모달에서 고양이의 성격, 태생 정보를 렌더링합니다. 해당 정보는 /cats/:id 를 통해 불러와야 합니다.
```js
// SearchResult.js

SearchResult 클릭 시 => target이 고양이카드일 경우 => dataset-id를 이용해 api fetch => fetched data는 dataset을 이용해 캐싱 => data를 이용해 Imageinfo 렌더링 

constructor(){
  this.onClick = this.onClick.bind(this);
}

async getCatInfo($catCard) {
  if ($catCard.dataset.catInfo) { // 캐싱된 데이터가 있을 경우
    return JSON.parse($catCard.dataset.catInfo);
  }

  try {
    const { data } = await api.fetchCatById($catCard.dataset.id);

    if (!Object.keys(data).length) { // api 요청 성공, but 데이터가 없을 때
      throw new Error(errorMessage);
    }

    $catCard.dataset.catInfo = JSON.stringify(data); // 캐싱

    const { id, url, name, temperament, origin } = data;

    return { id, url, name, temperament, origin };
  } catch (e) {
    console.error(e);

    throw new Error(
      e.message === errorMessage // api 요청은 성공했으나 data가 없을 경우
        ? e.message
        : '서버가 원활하지 않습니다. 잠시 후 다시 시도해주세요.' //api 요청에 실패할 경우
    );
  }
}
  
async onClick(e) {
    if (this.isLoading) return; // 로딩 중일 경우 클릭 이벤트 방지 

    const $catCard = e.target.closest('.item');
    if (!$catCard) {
      return;
    }
    
   const loading = new Loading();
   this.isLoading = true;
    try {
      const catInfo = await this.getCatInfo($catCard);

      new ImageInfo(document.body, catInfo).render();
    } catch (e) {
      new ErrorMessage($catCard, e.message);
    } finally {
      loading.$el.remove();
      this.isLoading = false;
    }
}
  
this.$el.addEventListener('click', this.onClick);

```

- 추가 모달 열고 닫기에 fade in/out을 적용해 주세요.

```js
// 렌더링 시
this.$el.add('fade-in');

// 언마운팅 시
this.$el.remove('fade-in');
this.$el.add('fade-out');
```

### 검색 페이지 관련

- 페이지 진입 시 포커스가 `input` 에 가도록 처리하고, 키워드를 입력한 상태에서 `input` 을 클릭할 시에는 기존에 입력되어 있던 키워드가 삭제되도록 만들어야 합니다.
```js
// App.js
앱 렌더링 후, dom traverse해서 input을 찾은 후 focus하기
render() {
  this.children.forEach((child) => child.render && child.render());
  this.$target.querySelector('.SearchInput').focus();
}

// SearchInput.js

onClick = (e) => {
  this.$el.value = '';
};
```
- `필수` 데이터를 불러오는 중일 때, 현재 데이터를 불러오는 중임을 유저에게 알리는 UI를 추가해야 합니다.
```js
// Loading.js

export default class Loading {
  constructor() {
    this.$el = document.createElement('div');
    this.$el.className = 'loading';
    this.$el.innerHTML = `
      <span class="loading">
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
      </span>
    `;

    document.body.append(this.$el);
  }
}

// usage

// 렌더링
const loading = new Loading()

// 언마운팅
loading.$el.remove()
```

```css
// https://codepen.io/changhyun2/pen/GRjEYzO

.loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-dot {
  display: inline-block;
  background: linear-gradient(-90deg, #666, #999, #bbb, #fff);
  background-size: 600% 600%;
  animation: gradient 1s infinite, flick 1s infinite;
  line-height: 1;
  vertical-align: middle;
  width: 15px;
  height: 15px;
  border-radius: 100%;
  background-color: #000;
}
.loading-dot:nth-child(2) {
  animation-delay: 0.2s;
}
.loading-dot:last-child {
  animation-delay: 0.4s;
}

.loading-dot:not(:last-child) {
  margin-right: 3px;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  10% {
    background-position: 0% 50%;
  }
}

@keyframes flick {
  0%,
  80%,
  100% {
    opacity: 0;
  }
  30%,
  50% {
    opacity: 1;
  }
}
```
- `필수` 검색 결과가 없는 경우, 유저가 불편함을 느끼지 않도록 UI적인 적절한 처리가 필요합니다.
```js
불러올 수 있는 cat keyword 리스트를 렌더링하면 좋을 듯
일단 에러메세지로 대체

// SearchInput.js
  try {
    const res = await api.fetchCats(searchedKeyword);
  } catch (e) {
    new ErrorMessage({
      $target: this.$el.closest('.Search'),
      message:
        e.message === errorMessage
          ? e.message
          : '서버가 원활하지 않습니다. 잠시 후 다시 시도해주세요.',
    });
  }
  
// ErrorMessage.js

const DURATION = 1500;

export default class ErorrMessage {
  constructor($target = document.body, message) {
    const { bottom, left } = $target.getBoundingClientRect();

    const $el = document.createElement('div');
    $el.className = 'error-message';
    $el.textContent = message;
    $el.style.position = 'fixed';
    $el.style.left = left + 'px';
    $el.style.top = `${bottom + 50}px`;
    $el.style.zIndex = 1001;
    this.$el = $el;

    $target.insertAdjacentElement('afterend', this.$el);
    this.$el.classList.add('fade-in');

    setTimeout(() => {
      this.$el.classList.remove('fade-in');
      this.$el.classList.add('fade-out');
      this.$el.ontransitionend = () => this.$el.remove();
    }, DURATION);
  }
}

```
- 최근 검색한 키워드를 `SearchInput` 아래에 표시되도록 만들고, 해당 영역에 표시된 특정 키워드를 누르면 그 키워드로 검색이 일어나도록 만듭니다. 단, 가장 최근에 검색한 5개의 키워드만 노출되도록 합니다.
```js
/* 
  store.js 임시 구현
  
  context를 create하는 컴포넌트 => constructor에서 store.set('context', initialData)하기
  context의 update에 따라 리렌더링되는 컴포넌트 => constructor에서 store.subscribe('context', this)하기
  
  context를 set하는 코드 라인 => data를 업데이트하는 곳에서 store.set('context', data)하기
  context를 get하는 코드 라인 => data를 사용하는 곳에서 store.get('context')하기
*/

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

// SearchHistory.js

import store from '../../store.js';

export default class SearchHistory {
  constructor($target) {
    this.$target = $target;

    this.$el = document.createElement('ul');
    this.$el.className = 'SearchHistory';

    this.$target.append(this.$el);

    store.set('search-history', []); // create 'search-history' context, initialData is []
    store.subscribe('search-history', this); // subscribe 'search-history' context
  }

  render() { // 'search-history'가 다른 곳에서 업데이트될 경우 render()가 실행됨
    this.$el.innerHTML = store
      .get('search-history') // get 'search-history' context
      .map((searched) => `<li>${searched}</li>`)
      .join('');
  }
}
```
- 페이지를 새로고침해도 마지막 검색 결과 화면이 유지되도록 처리합니다.
```js
// localStorage.js

const localStorage = {
  get: (key) => JSON.parse(window.localStorage.getItem(key)),
  set: (key, value) => window.localStorage.setItem(key, JSON.stringify(value)),
};

// SearchInput.js

async updateSearchResult(searchedKeyword) {
  /../
  store.set('search-result', res.data); // store set과 함께
  localStorage.set('cats-search-result', res.data); // localStorage에 최근 'search-result' data 저장해두기
  /../
}

// SearchResult.js
  constructor($parent) {
  /../
    // localStorage에서 initialData 가져오기
    store.set('search-result', localStorage.get('cats-search-result') || []);    
    store.subscribe('search-result', this);
  /../
  }
```
- `필수` `SearchInput` 옆에 버튼을 하나 배치하고, 이 버튼을 클릭할 시 /api/cats/random50 을 호출하여 화면에 뿌리는 기능을 추가합니다. 버튼의 이름은 마음대로 정합니다.
```js
// RandomSearchButton.js

// SearchInput에서의 데이터 처리 과정과 유사
  async updateSearchResult() {
    const loading = new Loading();

    try {
      const { data } = await api.fetchRandomCats();

      store.set('search-result', data);
      localStorage.set('cats-search-result', data);
    } catch (e) {
      console.warn(e);

      new ErrorMessage({
        $target: this.$el,
        message: '서버가 원활하지 않습니다. 잠시 후 다시 시도해주세요.',
      });
    } finally {
      loading.$el.remove();
      this.$el.disabled = false;
    }
  }

  async onClick() {
    this.$el.disabled = true;
    this.updateSearchResult();
  }

  this.$el.addEventListener('click', this.onClick);
```
- lazy load 개념을 이용하여, 이미지가 화면에 보여야 할 시점에 load 되도록 처리해야 합니다.
```js
/* 
  lazyload.js
 
  구현 방법이 다양함
  1. html loading 속성
  2. intersectionObserver
  3. scroll event
  
  img width 100%를 지원하는 intersectionObserver 선택
  
  root : lazyload를 적용할 뷰포트 지정 => document로 지정할 경우 => 웹 브라우저 화면
  rootMargin : 뷰포트 아래로의 마진값 => 이 위치까지 observer callback 실행
  threshold : 뷰포트에서 entry가 보여지는 비율(threshold)에 따라 observer callback이 실행됨 => 1.0일 경우 뷰포트에서 entry 돔이 모두 보여져야 callback이 실행됨
*/

export default function lazyLoad(options = {}) {
  const { root = document, rootMargin = '500px', threshold = 0 } = options;

  var lazyImageWrappers = [].slice.call(
    root.querySelectorAll('.img-wrapper.lazy')
  );

  if ('IntersectionObserver' in window) {
    const observerCallback = (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
          // entry가 뷰포트(root)에 보여질 때(isIntersecting),
          // 이미지 src를 data-src에서 가져오고
          // 이미지가 load될 때 placeholder 제거
            const lazyImage = entry.target.querySelector('img');
            const placeholder = entry.target.querySelector('.img-placeholder');

            lazyImage.src = lazyImage.dataset.src;
            lazyImage.classList.remove('lazy'); // lazy 클래스 제거
            lazyImage.onload = () => {
              placeholder.classList.add('fade-out');
              placeholder.ontransitionend = () => placeholder.remove();
            };
            lazyImageObserver.unobserve(entry.target); // lazy load를 마친 후 entry unobserve하기
          }
        })
        
    let lazyImageObserver = new IntersectionObserver(
      observerCallback,
      {
        root,
        rootMargin,
        threshold,
      }
    );

    lazyImageWrappers.forEach(function (lazyImageWrapper) {
      lazyImageObserver.observe(lazyImageWrapper);
    });
  } else {
    // 미지원일 경우 scrollEvent로 레이지로드 적용
    // Possibly fall back to event handlers here
  }
}

```
- `추가` 검색 결과 각 아이템에 마우스 오버시 고양이 이름을 노출합니다.
```js
// SearchResult.js
/*
https://javascript.info/mousemove-mouseover-mouseout-mouseenter-mouseleave#:~:text=The%20mouseover%20event%20occurs%20when,and%20the%20other%20one%20%E2%80%93%20relatedTarget%20.

mouseover/out => event bubbling 발생
mouseleave/enter => event bubbling 발생 x
*/
  onMouseOver(e) {
    const item = e.target.closest('.item'); // 고양이 카드 
    if (!item) return;

    // 페이지 로드 시, 카드 위치에 마우스가 올라가있을 경우 중복되어 item-name이 렌더링되는 현상 방지
    if (item.querySelector('.item-name')) return; 

    const name = item.dataset.name;

    const $itemName = document.createElement('span');
    $itemName.textContent = name;
    $itemName.className = 'item-name';

    item.querySelector('.img-wrapper').append($itemName);
  }

  onMouseOut(e) {
    const item = e.target.closest('.item');
    if (!item) return;

    item.querySelector('.item-name').remove();
  }
```

### 코드 구조 관련

- `필수` API 의 status code 에 따라 에러 메시지를 분리하여 작성해야 합니다.
```js
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
```

## 추가할 내용

### 스크롤 페이징 구현

- 검색 결과 화면에서 유저가 브라우저 스크롤 바를 끝까지 이동시켰을 경우, 그 다음 페이지를 로딩하도록 만들어야 합니다.

### 랜덤 고양이 배너 섹션 추가

- 현재 검색 결과 목록 위에 배너 형태의 랜덤 고양이 섹션을 추가합니다.
- 앱이 구동될 때 `/api/cats/random50` api를 요청하여 받는 결과를 별도의 섹션에 노출합니다.
- 검색 결과가 많더라도 화면에 5개만 노출하며 각 이미지는 좌, 우 슬라이드 이동 버튼을 갖습니다.
- 좌, 우 버튼을 클릭하면, 현재 노출된 이미지는 사라지고 이전 또는 다음 이미지를 보
