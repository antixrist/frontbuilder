import Vue from 'vue';
import VueRouter from 'vue-router';
Vue.use(VueRouter);

import Home from '../views/Home';
// import Another from '../views/Another';
import Another2 from '../views/Another2';

const routes = [{
  path: '/',
  component: Home
}, {
  path: '/another',
  // component: Another
  // async component:
  component: resolve => require(['../views/Another'], resolve)
}, {
  path: '/another-2',
  component: Another2,
  meta: { scrollToTop: true }
// }, {
//   path: '*',
//   component: NotFound
}];

const router = new VueRouter({
  routes,
  mode: 'history',
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      // savedPosition is only available for popstate navigations.
      return savedPosition;
    } else {
      const position = {};
      // new navigation.
      // scroll to anchor by returning the selector
      if (to.hash) {
        position.selector = to.hash;
      }
      // check if any matched route config has meta that requires scrolling to top
      if (to.matched.some(m => m.meta.scrollToTop)) {
        // cords will be used if no selector is provided,
        // or if the selector didn't match any element.
        position.x = 0;
        position.y = 0;
      }
      // if the returned position is falsy or an empty object,
      // will retain current scroll position.
      return position;
    }
  }
});

export default router;
