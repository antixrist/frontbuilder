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

console.time('runner');

async function asyncTest () {
  let [res1, res2] = await Promise.all([
    Promise.delay(300).then(() => Promise.resolve('result from promise #1')),
    Promise.delay(500).then(() => Promise.resolve('result from promise #1')),
  ]);

  return {res1, res2};
}


asyncTest()
  .then(s => console.log(s))
  .finally(() => console.timeEnd('runner'))
;
