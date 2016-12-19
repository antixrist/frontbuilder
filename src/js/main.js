import 'babel-polyfill';

import '../styles/common.scss';
import '../styles/main.scss';
import { app as vueApp, router, store } from './app';

vueApp.$mount('#app');

const prom = () => new Promise(resolve => setTimeout(() => resolve('asdasd'), 200));

const fn = async function () {
  
  const qweqwe = await prom().then((str) => {
    // console.log('str', str);
    
    return Promise.resolve('asdasdasd');
  });
  
};

fn();
