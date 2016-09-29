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
  component: Another2
// }, {
//   path: '*',
//   component: NotFound
}];

export default routes;
