import * as _ from 'lodash';
// import path from 'path';
import * as __ from './gulpfile.babel.js/helpers';

const isProduction = _.trim(process.env.NODE_ENV) == 'production';
const destPath = isProduction ? 'build' : 'dev';
const useNotifierInDevMode = true;

let devServerEntryPoints = [
  'webpack/hot/dev-server',
  'webpack-hot-middleware/client?reload=true'
];

let webpackUseHMR = !isProduction;
let webpackEntries = __.webpack.entriesFinder.sync('markup/js/!(_*).js');
webpackEntries = !webpackUseHMR ? webpackEntries : webpackEntries.map(entry => devServerEntryPoints.concat(entry));

export default {
  isProduction,
  useNotifierInDevMode,
  destPath,

  webpack: {
    entry: webpackEntries,
    outputPublicPath: `./${destPath}/js/`,
    commonChunkName: 'common',
    useHMR: webpackUseHMR,
  }
};
