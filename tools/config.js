// import 'clarify';
import os from 'os';
import history from 'connect-history-api-fallback';
import compression from 'compression';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const cwd           = process.cwd();
const NODE_ENV      = process.env.NODE_ENV;
const isProduction  = process.env.NODE_ENV == 'production';
const isDevelopment = process.env.NODE_ENV == 'development';
const DISABLE_HMR   = process.env.DISABLE_HMR && (process.env.DISABLE_HMR === '1' || process.env.DISABLE_HMR === 'true');

const pathes = {
  /** здесь указываем относительно cwd */
  source: 'src',
  target: isDevelopment ? 'dev' : 'build',
  public: '/',

  /** во всех последующих относительно `pathes.source` или `pathes.target` соответственно */
  scripts: {
    source: 'js',
    target: 'js',
  },
  pages: {
    source: 'pages',
    /** `pathes.pages.target` не нужен, потому что они всегда будут создаваться в `pathes.public` */
  },
  styles: {
    /** `pathes.styles.source` не нужен, потому что стили надо инклюдить напрямую в js точки входа */
    target: 'css',
  },
  assets: {
    /** `pathes.assets.source` не нужен, потому что стили надо инклюдить напрямую в js точки входа */
    target: 'assets',
  },
  /** папка, из которой всё сожержимое будет просто скопировано "как есть". само собой - сохраняя иерархию */
  files: {
    source: 'root',
    target: '',
  },
};

const prependEachEntriesWith = [];
// prependEachEntriesWith.push('babel-polyfill');

// todo: const minifyImages = {};

const minifyHtml = isDevelopment
  ? false
  : {
    removeAttributeQuotes:       false,
    collapseInlineTagWhitespace: true,
    collapseWhitespace:          true,
    conservativeCollapse:        false,
    keepClosingSlash:            true,
  }
;

/** для `autoprefixer`а (не забывать переносить настройки для браузеров в `.babelrc`) */
const browsers = isDevelopment
  ? ['last 2 versions']
  : ['last 5 versions', 'ie 8-9', '> 2%']
;

const sass = {
  outputStyle: 'expanded',
  data: `$NODE_ENV: ${process.env.NODE_ENV};`,
};

const browserSync = {
  logLevel:        'info',
  logConnections:  true,
  reloadOnRestart: true,
  ui:              false,
  open:            !isDevelopment,
  reloadDelay:     0,
  reloadDebounce:  100,
  ghostMode:       false,

  startPath: '/',
  port:      (isDevelopment) ? 13666 : 1313,
  server:    {
    index:     'index.html',
    directory: false,
    baseDir:   pathes.target
  },
  middleware: [
    history({
      logger: () => {}
    }),
    compression({filter: function shouldCompress (req, res) {
      if (req.headers['x-no-compression']) {
        return false
      }

      return compression.filter(req, res)
    }})
  ]
};

export {
  cwd,
  isProduction,
  isDevelopment,
  pathes,
  sass,
  browsers,
  minifyHtml,
  prependEachEntriesWith,
  NODE_ENV,
  DISABLE_HMR,
  browserSync
};

/** для невиндовых систем, чтобы система не залипала при вотчинге большого количества файлов */
const ulimit = 4096;
os.platform() !== 'win32' && (function () {
  let posix;
  
  try {
    posix = require('posix');
  } catch (ex) {
    return false;
  }
  
  if (posix) {
    try {
      posix.setrlimit('nofile', { soft: ulimit || 4096 });
      return true;
    } catch (e) {
      console.warn('Error while ulimit setting');
      return false;
    }
  }
  return false;
})();

/** ну вот так. сюда будут попадать настройки для vue из разных секций -
 * из настройки стилей, из настройки шаблонизаторов. Чтобы по 2 раза не писать.
 * А потом в конфигураторе vue просто подцепим этот уже настроенный конфиг
 */
export let vueLoaders = {};
