import Vue from 'vue';
import VueResource from 'vue-resource';

const API_BASE = 'http://jsonplaceholder.typicode.com';

Vue.use(VueResource);

Vue.http.options = {
  root: IS_PRODUCTION ? API_BASE : API_BASE,
  emulateJSON: true
};

Vue.http.interceptors.push((request, next) => {
  next((response) => {
    // Handle global API 404 =>
    if (response.status === 404) {
      // router.push('/404');
    }
  });
});

export default Vue.http;
