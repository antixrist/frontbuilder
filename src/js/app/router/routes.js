const routes = [
  {
    path:      '/',
    component: require('../views/Home.vue')
  },
  {
    path: '/test',
    component: require('../views/Test.vue')
  },
  {
    path: '/ui',
    component: require('../views/ui/index.vue')
  // },
  // {
  //   path: '/login',
  //   component: require('../views/Home.vue'),
  //   meta: { scrollToTop: true }
  }
];

export default routes;
