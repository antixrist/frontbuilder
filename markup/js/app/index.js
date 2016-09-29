import Promise from 'bluebird';
import {qwe} from './tmp';

console.log('index');

qwe.say();

// const generate = function * () {
//   let res1 = yield Promise.delay(300).then(() => { return Promise.resolve('result from promise #1') });
//
//   console.log('res1', res1);
//
//   return 'result from async';
// };
//
// generate().next()
// generate().next()

async function asyncTest () {
  let res1 = await Promise.delay(300).then(() => { return Promise.resolve('result from promise #1') });

  console.log('res1', res1);

  return 'result from async';
}

asyncTest().then(s => console.log(s));
