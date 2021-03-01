# 프로그래머스 데브매칭 상반기 준비
## 개발 일지

- [02.24](./docs/2021.02.24.md) 
- [02.25](./docs/2021.02.25.md) 
- [02.26](./docs/2021.02.26.md) 
- [03.01](./docs/2021.03.01.md) 

## 모듈 의존성

![의존성](./images/programmers-dev-matching%20(1).jpg)


## BaseComponent.js
  1. arguments
    - target: [DOMElement, insertPosition] | DOMElement
    - tag: HTML tag name
    - attributes: HTML attributes, styles
  2. property
    - $parent: DOMElement
    - $: DOMElement
  3. methods
    - HTML: (template | $target, template) => void
    - addHTML: (template | $target, template) => void
    - bindEvents: 입력 x => 컴포넌트의 필드를 읽어 이벤트 리스너에 등록

## Component.js
  1. inherit BaseComponent

  2. property
    - isLoading: Boolean
  3. methods
    - handleError: (error, errorTypes, showErrorMessage, errorPosition) => void
    - tryFetchData: (apiCall, query, options) => data
      - ooptions
        - cb
        - errorTypes
        - cache
        - errorPosition
        - showErrorMessage
        - showLoading
    - get: (context,storeType) => data
    - set: (data) => { on: (context,storeTypes) }
    - subscribe: (context) => void
    
## stores.js
  1. property
    - store: {}
  2. methods     
    - has: (context) => !!store[context]
    - get: (context) => store[context].data
    - set: (context,data) => store[context]
    - subscribe: (context, element) => void
    - publish: (context) => void

## FetchCache.js
  1. property
     - cache : {}
  2. methods
     - has : (context,key) => cache[context]
     - get : (context) => cache[context][key]
     - set : (context, key) => cache[context]