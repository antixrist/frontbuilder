import * as _ from 'lodash';
// import path from 'path';

const isProduction = _.trim(process.env.NODE_ENV) == 'production';
const destPath = isProduction ? 'build' : 'dev';
const useNotifierInDevMode = true;

export default {
  isProduction,
  useNotifierInDevMode,
  destPath,

  webpack: {
    useHMR: !isProduction,
    // `entry` is only for webpack-cli.
    // it will replaced in gulp process
    entry: {
      js: 'js.js',
    },
    outputPublicPath: `./${destPath}/js/`,
    commonChunkName: 'common'
  }
};
