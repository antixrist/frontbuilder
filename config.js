import * as _ from 'lodash';
import path from 'path';
import * as __ from './gulpfile.babel.js/helpers';

const cwd = process.cwd();
const isProduction = _.trim(process.env.NODE_ENV) == 'production';
const destPath = isProduction ? 'build' : 'dev';
const useNotifierInDevMode = true;

let devServerEntryPoints = [
  'webpack/hot/dev-server',
  'webpack-hot-middleware/client?reload=true'
];

let webpackUseHMR = !isProduction;
let webpackEntries = __.webpack.entriesFinder
  .sync('markup/js/!(_*).js')
  .map(entry => path.join(cwd, `markup/js`, entry))
;
webpackEntries = !webpackUseHMR ? webpackEntries : webpackEntries.map(entry => devServerEntryPoints.concat(entry));

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


