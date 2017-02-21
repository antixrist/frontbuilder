const routes = [
  {
    path: '/',
    name: 'home',
    // component: require.ensure([], () => require('../views/logged/index.vue'))
    component: require('../views/home/index.vue')
  },
  {
    path: '/logout',
    name: 'logout',
    component: require('../views/logout.vue')
  },
  {
    path: '/*',
    name: 'not_found',
    component: require('../views/404.vue')
  },
];

export default routes;
