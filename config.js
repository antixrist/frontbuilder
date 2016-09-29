import {forEach} from 'lodash';
import path from 'path';
import * as __ from './gulpfile.babel.js/helpers';

const cwd = process.cwd();
const isProduction = process.env.NODE_ENV == 'production';
const useNotifierInDevMode = true;

let webpackUseHMR = true;
let webpackEntries = __.webpack.entriesFinder.sync('markup/js/!(_*).js');
const destPath = isProduction ? 'build' : 'dev';
const publicPath = '/js/'; // для hmr и require.ensure

let devServerEntryPoints = [
  // 'webpack/hot/dev-server', // при ошибках страница перезагрузится
  'webpack/hot/only-dev-server', // при ошибках страница перезагружаться не будет (state приложения сохранится)
  'webpack-hot-middleware/client?reload=true'
  // на 3е место добавится оригинальная точка входа
];

forEach(webpackEntries, (file, name) => {
  file = path.join(cwd, `markup/js`, file);
  webpackEntries[name] = !webpackUseHMR ? file : devServerEntryPoints.concat(file);
});

export default {
  cwd,
  isProduction,
  useNotifierInDevMode,
  destPath,

  webpack: {
    entry: webpackEntries,
    outputPath: path.join(cwd, `/${destPath}/js/`),
    outputPublicPath: publicPath,
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
      publicPath: publicPath,
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
