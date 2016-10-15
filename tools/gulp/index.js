import _ from 'lodash';
import config from '../config';
import del from 'del';
import path from 'path';
import gulp from 'gulp';
import gutil from 'gulp-util';
import webpack from 'webpack';
import watcher from 'glob-watcher';
import runner from 'run-sequence';
import through2 from 'through2';
import sourcemaps from 'gulp-sourcemaps';
import functionDone from 'function-done';
import browserSync from 'browser-sync';

import webpackConfig from '../webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import {notifier} from './utils';
import {insertHMREntriesToAppEntries, entriesFinder} from './utils/webpack';

// import gulpPlugins from 'gulp-load-plugins';
// const $ = gulpPlugins();

// $.if
// $.rename
// $.cached
// $.changed
// $.newer
// $.remember
// $.notify
// $.plumber
// $.pug
// $.sass
// $.rename
// $.sourcemaps
// $.util
// $.data
// $.named

global.builder = {};
Object.assign(global.builder, config);
global.builder.runtime = {};




// import * as jsTasks from './scripts';

// http://nipstr.com/#path
// https://www.npmjs.com/package/path-rewriter

gulp.task('server', function (done) {
  let browserSyncConfig = config.browserSync;

  browserSyncConfig = Object.assign(browserSyncConfig, {
    middleware: browserSyncConfig.middleware || [],
    logConnections: browserSyncConfig.logConnections || true,
    logLevel: browserSyncConfig.logLevel || 'info',
    reloadOnRestart: browserSyncConfig.reloadOnRestart || true
  });
  
  // если горячая перезагрузка модулей не нужна?
  if (!config.webpack.useHMR) {
    webpackConfig.watch = true;
    webpack(webpackConfig, (error, stats) => {
    
      if (!error) {
        error = stats.toJson().errors[0];
      }
    
      if (error) {
        notifier.error('JavaScript has not been processed', error);
      } else {
        console.log(stats.toString({
          colors: true
        }));
      
        notifier.success('JavaScript has been processed', {notStream: true});
      
        // if (config.webpack.hmr.enabled) {
        //   browserSync.reload();
        // }
      }
    
      // Task never errs in watch mode, it waits and recompiles
      // if (!tars.options.watch.isActive && error) {
      if (!webpackConfig.watch && error) {
        done(
          new gutil.PluginError(
            'webpack-processing',
            new Error('An error occured during webpack build process')
          )
        );
      } else {
        if (!done.called) {
          done.called = true;
          done();
        }
      }
    });
  
    // то просто запустим dev-сервер
    browserSync.init(browserSyncConfig);
  }
  // иначе настроим webpack для "Hot Module Replacement".
  else {
    webpackConfig.plugins = webpackConfig.plugins || [];
    // добавим hmr-плагин, если его нету в конфиге
    let hmrPluginExists = _.some(webpackConfig.plugins, (plugin) => plugin instanceof webpack.HotModuleReplacementPlugin);
    !hmrPluginExists && webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
    
    // добавим webpack'овскую hmr-магию в точки входа
    webpackConfig.entry = insertHMREntriesToAppEntries(
      webpackConfig.entry,
      config.webpack.hmrEntries
    );

    // console.log('webpackConfig', webpackConfig);
    // console.log('cwd', process.cwd());

    // создадим инстанс вебпака
    const webpackInstance = webpack(webpackConfig);
    // создадим инстанс dev-мидлвари (с fallback'ом для publicPath'а, на всякий случай)
    const webpackDevMiddlewareInstance = webpackDevMiddleware(webpackInstance, _.assign({
      publicPath: webpackConfig.output.publicPath,
    }, config.webpack.hmr));
    const browserSyncMiddleware = [
      webpackDevMiddlewareInstance,
      // создадим инстанс hot-мидлвари
      webpackHotMiddleware(webpackInstance)
    ];
    
    // добавим их к настройкам сервера
    browserSyncConfig.middleware = browserSyncConfig.middleware.concat(browserSyncMiddleware);
    console.log('Wait for a moment, please. Webpack is preparing bundle for you...');
    
    // дождёмся пока сбилдятся бандлы
    webpackDevMiddlewareInstance.waitUntilValid(() => {
      // и запустим сервер
      browserSync.init(browserSyncConfig);
      // devTaskFinallyActions();
    });
  }
});


import sass from 'gulp-sass';
import plumber from 'gulp-plumber';
import sassImportOnce from 'node-sass-import-once';

const postcssPLugins = (function () {
  let plugins = [];

  plugins.push({
    'postcss-input-range': {
      method: 'clone'
    },
    'postcss-gradientfixer': {},
    'postcss-flexboxfixer': {},
    'postcss-flexbugs-fixes': {}
  });

  if (config.isProduction) {
    plugins.push({
      'autoprefixer': {
        browsers: ['> 1%', 'last 5 versions', 'ie >= 9']
      },
    });
  } else {
    plugins.push({
      'autoprefixer': {
        browsers: ['last 2 versions']
      },
    });
  }

})();

/**
 * @param {string} url
 * @returns {boolean}
 */
function isUrlShouldBeIgnored (url) {
  return url.indexOf('/') === 0 ||
    url.indexOf('#') === 0 ||
    url.indexOf("data:") === 0 ||
    // isUrl(url) ||
    /^[a-z]+:\/\//.test(url)
  ;
}

/**
 * Trims whitespace and quotes from css 'url()' values
 *
 * @param {string} value - string to trim
 * @returns {string} - the trimmed string
 */
function trimUrlValue (value) {
  var beginSlice, endSlice;
  value = value.trim();
  beginSlice = value.charAt(0) === '\'' || value.charAt(0) === '"' ? 1 : 0;
  endSlice = value.charAt(value.length - 1) === '\'' ||
             value.charAt(value.length - 1) === '"' ?
             -1 : undefined;
  return value.slice(beginSlice, endSlice).trim();
}

/**
 * @param {string} url
 * @returns {string}
 */
function wrapUrlDecl (url) {
  return `url(${url})`;
}

/**
 * @param {string} from
 * @param {string} to
 * @param {string} contents
 * @returns {string}
 */
function resolveUrlsToEntryPoint (from, to, contents) {
  let re = /[:,\s]url\s*\((.*?)\)/ig;
  return contents.replace(re, function (str, matched) {
    let url = trimUrlValue(matched);

    if (isUrlShouldBeIgnored(url)) {
      return str;
    }

    let resolvedUrl = path.resolve(from, url);
    let relativeUrl = path.relative(to, resolvedUrl);

    return wrapUrlDecl(relativeUrl);
  });
}

gulp.task('styles', function () {
  const destPath = `./dev/css`;

  return gulp
    .src('./markup/styles/*.scss', {read: false})
    .pipe(plumber({
      errorHandler (error) {
        notifier.error('An error occurred while compiling css', error);
        this.emit('end');
      }
    }))
    .pipe(through2.obj(function (file, enc, callback) {
      let vinylEntryPoint = file;
      let vinylResultFile = vinylEntryPoint;

      functionDone(function () {
        return gulp
          .src(file.path)
          .pipe(sourcemaps.init({identityMap: false}))
          .pipe(through2.obj(function(file, enc, cb) {
            let contents = file.contents.toString();
            contents = resolveUrlsToEntryPoint(
              path.dirname(vinylEntryPoint.path),
              path.dirname(vinylEntryPoint.path),
              contents
            );
            file.contents = Buffer.from(contents, enc);
            cb(null, file);
          }))
          .pipe(sass({
            precision: 10,
            quiet: true,
            includePaths: ['node_modules'],
            importer (uri, prev, done) {
              sassImportOnce.call(this, uri, prev, function ({file, contents}) {
                if (!contents || !file) {
                  return done.apply(this, arguments);
                }

                contents = resolveUrlsToEntryPoint(
                  path.dirname(file),
                  path.dirname(vinylEntryPoint.path),
                  contents
                );
                done({file, contents});
              });
            },
            importOnce: {
              index: true,
              css: true,
              bower: false
            }
          }))
          .pipe(sourcemaps.write(''))
          .pipe(through2.obj(function(file, enc, cb) {
            vinylResultFile = file;

            cb(null, file);
          }))
        ;
      }, function (err, result) {
        if (err) { return callback(err); }

        callback(null, vinylResultFile);
      });
    }))
    .pipe(sourcemaps.init({loadMaps: true}))
    // .pipe(require('gulp-replace-task')({
    //   patterns: [
    //     {
    //       match: /%=staticPrefixForCss=%|%=static=%|__static__/gim,
    //       replacement: tars.config.staticPrefixForCss
    //     }
    //   ],
    //   usePrefix: false
    // }))
    // .pipe(postcss(postProcessors))
    // .pipe(rename({ suffix: tars.options.build.hash }))
    // .pipe(sourcemaps.write(inlineSourcemaps ? '' : '.'))
    .pipe(sourcemaps.write('.', {
      sourceRoot: './markup/styles/'
    }))
    .pipe(gulp.dest(destPath))
    // .pipe(browserSync.reload({ stream: true }))
    .pipe(notifier.success(`(S)CSS files have been compiled`))
  ;
});


gulp.task('default', (done) => {
  if (config.webpack.hmr.enabled) {
    // webpackConfig.watch = true;
  }

  webpack(webpackConfig, (error, stats) => {

    if (!error) {
      error = stats.toJson().errors[0];
    }

    if (error) {
      notifier.error('JavaScript has not been processed', error);
    } else {
      console.log(stats.toString({
        colors: true
      }));

      notifier.success('JavaScript has been processed', {notStream: true});

      // if (config.webpack.hmr.enabled) {
      //   browserSync.reload();
      // }
    }

    // Task never errs in watch mode, it waits and recompiles
    // if (!tars.options.watch.isActive && error) {
    if (!webpackConfig.watch && error) {
      done(
        new gutil.PluginError(
          'webpack-processing',
          new Error('An error occured during webpack build process')
        )
      );
    } else {
      if (!done.called) {
        done.called = true;
        done();
      }
    }
  });


  // jsTasks.builder();
  // runner('js:build', cb);
});

gulp.task('default2', (cb) => {
  console.log('config', config);
  console.log('tasks', gulp.tasks);
  cb();
});
