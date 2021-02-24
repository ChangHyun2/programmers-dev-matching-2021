import store from './store.js';
import App from './App.js';
window.store = store;

console.log('hi');
new App(document.querySelector('#App')).render();
