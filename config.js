import {forEach} from 'lodash';
import path from 'path';
import {entriesFinder} from './gulpfile.babel.js/helpers/webpack';

const cwd = process.cwd();
const isProduction = process.env.NODE_ENV == 'production';
const useNotifierInDevMode = true;

const destPath = isProduction ? 'build' : 'dev';
const webpackPublicPath = '/js/'; // для hmr и require.ensure

export default {
  cwd,
  isProduction,
  useNotifierInDevMode,
  destPath,

  webpack: {
    entry: entriesFinder.sync('markup/js/!(_*).js'),
    outputPath: path.join(cwd, `/${destPath}/js/`),
    outputPublicPath: webpackPublicPath,
    commonChunkName: 'common',

    useHMR: true,
    hmrEntries: [
      // при ошибках страница перезагрузится
      // 'webpack/hot/dev-server',
      // при ошибках страница перезагружаться не будет (state приложения сохранится)
      'webpack/hot/only-dev-server',
      // https://github.com/glenjamin/webpack-hot-middleware#documentation
      'webpack-hot-middleware/client?reload=true'
    ],
    hmr: {
      publicPath: webpackPublicPath,
      // quiet: false, // display no info to console (only warnings and errors)
      // noInfo: false, // display nothing to the console
      watchOptions: {
        aggregateTimeout: 200,
        poll: true
      },
      stats: {
        colors: true
      }
    },
  },

  browserSync: {
    ui:        false,
    open:      false,
    //reloadDelay: 1000,
    //reloadDebounce: 1000,
    ghostMode: false,

    startPath: '/',
    port:      (isProduction) ? 1313 : 13666,
    server:    {
      index:     'index.html',
      directory: false,
      baseDir:   (isProduction) ? './build/' : './dev'
    }
  }
};
