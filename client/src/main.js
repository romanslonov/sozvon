import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
import { state } from './state';
import './main.css';

Vue.config.productionTip = false;

Vue.mixin({
  data() {
    return { state };
  },
});

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
