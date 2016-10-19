import * as _ from 'lodash';
import path from 'path';
import compression from 'compression';
import history from 'connect-history-api-fallback';
import {entriesFinder} from './webpack/utils';

const cwd = process.cwd();
const isProduction = process.env.NODE_ENV == 'production';
const useNotifierInDevMode = true;

const destPath = isProduction ? 'build' : 'dev';

export default {
  cwd,
  isProduction,
  useNotifierInDevMode,
  destPath,
  
  // для невиндовых систем,
  // чтобы можно было работать с большим количеством файлов (сперва руками установить `posix`)
  ulimit: 4096,
  
  webpack: {
    entry: entriesFinder.sync('markup/js/!(_*).js'),
    outputPath: path.join(cwd, `/${destPath}/js/`),
    // outputPublicPath нужен для require.ensure и file-loader'а.
    // если нужен относительный путь,
    // то обязательно переопределить config.webpack.hmr.publicPath,
    // чтобы он был абсолютным. иначе hmr работать не будет.
    outputPublicPath: './js/',
    watchOptions: {
      aggregateTimeout: 200,
    },
    commonChunkName: 'common',
    frontendConstants: {
      'IS_PRODUCTION': isProduction,
      'CWD': JSON.stringify(process.cwd()),
      'process.env': _.keys(process.env).reduce((obj, key) => {
        obj[key] = JSON.stringify(process.env[key]);

        return obj;
      }, {})
    },

    noParse: [
      // /moment/,
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
      // при ошибках страница перезагрузится
      // 'webpack/hot/dev-server',
      // при ошибках страница перезагружаться не будет (state приложения сохранится)
      'webpack/hot/only-dev-server',
      // https://github.com/glenjamin/webpack-hot-middleware#documentation
      'webpack-hot-middleware/client?reload=true'
    ],
    hmr: {
      // если не определить publicPath,
      // то он автоматически установится в config.webpack.outputPublicPath.
      // должен быть абсолютным!
      publicPath: '/js/',
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
    
    // это не список лоадеров, а конфиг к конкретным
    setupLoaders: {
      url: {
        // без ведущего '?'
        qs: `limit=${10 * 1024}&name=[path][name]-[hash].[ext]&context=./markup/`
      },
      html: {
        ignoreCustomFragments: [/\{\{.*?}}/],

        minimize: isProduction,
        // minimize options:
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        removeAttributeQuotes: false,
        removeComments: true,
        removeEmptyAttributes: false,
        removeRedundantAttributes: false,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true
      },
      sass: {
        precision:    10,
        quiet:        true,
        includePaths: ['node_modules'],
        importer:     require('node-sass-import-once'),
        importOnce:   {
          index: true,
          css:   true,
          bower: true
        }
      },
      imagemin: {
        minimize: isProduction,
        gifsicle: { interlaced: true },
        jpegtran: {
          progressive: true,
          arithmetic: false
        },
        optipng: { optimizationLevel: 5 },
        pngquant: {
          floyd: 0.5,
          speed: 2
        },
        svgo: {
          plugins: [
            { removeTitle: true },
            { convertPathData: false }
          ]
        }
      },
    }
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
      baseDir:   (isProduction) ? './build/' : './dev/'
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
