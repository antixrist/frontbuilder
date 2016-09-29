import {forEach, keys} from 'lodash';
import path from 'path';
import compression from 'compression';
import history from 'connect-history-api-fallback';
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
    watchOptions: {
      aggregateTimeout: 200,
    },
    commonChunkName: 'common',
    frontendConstants: {
      'IS_PRODUCTION': isProduction,
      'CWD': JSON.stringify(process.cwd()),
      'process.env': keys(process.env).reduce((obj, key) => {
        obj[key] = JSON.stringify(process.env[key]);

        return obj;
      }, {})
    },

    noParse: [
      // /bluebird/,
      ///jsnetworkx/,
      // /d3\.js/,
      ///vue\.common\.js/,
      // /angular\/angular\.js/,
      // /lodash/,
      // /dist\/jquery\.js/
    ],
    externals: {
      //lodash: 'window._',
      //jquery: 'window.jQuery',
    },

    useHMR: true,
    hmrEntries: [
      'babel-regenerator-runtime',
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
    },
    middleware: [
      history({
        // logger: console.log.bind(console)
      }),
      compression({filter: function shouldCompress (req, res) {
        if (req.headers['x-no-compression']) {
          return false
        }

        return compression.filter(req, res)
      }})
    ]
  }
};
