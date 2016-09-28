import {forEach} from 'lodash';
import path from 'path';
import * as __ from './gulpfile.babel.js/helpers';

const cwd = process.cwd();
const isProduction = process.env.NODE_ENV == 'production';
const destPath = isProduction ? 'build' : 'dev';
const useNotifierInDevMode = true;

let devServerEntryPoints = [
  // 'webpack/hot/dev-server', // при ошибках страница перезагрузится
  'webpack/hot/only-dev-server', // при ошибках страница перезагружаться не будет
  'webpack-hot-middleware/client?reload=true'
  // на 3е место добавится оригинальная точка входа
];

let webpackUseHMR = !isProduction;
let webpackEntries = __.webpack.entriesFinder.sync('markup/js/!(_*).js');
forEach(webpackEntries, (file, name) => {
  file = path.join(cwd, `markup/js`, file);
  webpackEntries[name] = !webpackUseHMR ? webpackEntries : devServerEntryPoints.concat(file);
});

console.log('webpackEntries', webpackEntries);

export default {
  cwd,
  isProduction,
  useNotifierInDevMode,
  destPath,

  webpack: {
    entry: webpackEntries,
    outputPath: path.join(cwd, `/${destPath}/js/`),
    outputPublicPath: `./${destPath}/js/`,
    commonChunkName: 'common',
    useHMR: webpackUseHMR,
  }
};
