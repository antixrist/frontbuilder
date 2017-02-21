const routes = [
  {
    path: '/',
    name: 'home',
    meta: {
      authRequired: true
    },
    component: require('../views/logged/index.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: require('../views/login/index.vue')
  },
  {
    path: '/logout',
    name: 'logout',
    component: require('../views/logout/index.vue')
  },
  {
    path: '/*',
    name: 'not_found',
    component: require('../views/404.vue')
  },
];

export default routes;
