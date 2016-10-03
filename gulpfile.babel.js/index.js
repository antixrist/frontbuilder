import _ from 'lodash';
import config from '../config';
import del from 'del';
import gulp from 'gulp';
import gutil from 'gulp-util';
import webpack from 'webpack';
import watcher from 'glob-watcher';
import runner from 'run-sequence';
import through2 from 'through2';
import functionDone from 'function-done';
import browserSync from 'browser-sync';

import {notifier} from './helpers';
import {insertHMREtriesToAppEntries, entriesFinder} from './helpers/webpack';

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

gulp.task('server', function (cb) {
  let browserSyncConfig = config.browserSync;

  browserSyncConfig = Object.assign(browserSyncConfig, {
    middleware: browserSyncConfig.middleware || [],
    logConnections: browserSyncConfig.logConnections || true,
    logLevel: browserSyncConfig.logLevel || 'info',
    reloadOnRestart: browserSyncConfig.reloadOnRestart || true
  });

  if (!config.webpack.useHMR) {
    browserSync.init(browserSyncConfig);
  } else {
    // настроим webpack для "Hot Module Replacement"
    const webpackConfig = require('../webpack.config.babel');

    webpackConfig.plugins = webpackConfig.plugins || [];
    let hmrPluginExists = _.some(webpackConfig.plugins, (plugin) => plugin instanceof webpack.HotModuleReplacementPlugin);
    !hmrPluginExists && webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

    webpackConfig.entry = insertHMREtriesToAppEntries(
      webpackConfig.entry,
      config.webpack.hmrEntries
    );

    const webpackInstance = webpack(webpackConfig);
    const webpackDevMiddlewareInstance = require('webpack-dev-middleware')(webpackInstance, config.webpack.hmr || {
      publicPath: webpackConfig.output.publicPath,
    });
    const browserSyncMiddleware = [
      webpackDevMiddlewareInstance,
      require('webpack-hot-middleware')(webpackInstance)
    ];

    browserSyncConfig.middleware = browserSyncConfig.middleware.concat(browserSyncMiddleware);
    console.log('Wait for a moment, please. Webpack is preparing bundle for you...');

    webpackDevMiddlewareInstance.waitUntilValid(() => {
      browserSync.init(browserSyncConfig);
      // devTaskFinallyActions();
    });
  }
});


import sass from 'gulp-sass';
import plumber from 'gulp-plumber';
import sassImportOnce from 'node-sass-import-once';

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
          .pipe(through2.obj(function(file, enc, cb) {
            let contents = file.contents.toString();

            let re = /[:,\s]url\s*\((.*?)\)/ig;
            contents =
            contents.replace(re, function (str, matched) {
              let url = trimUrlValue(matched);

              if (isUrlShouldBeIgnored(url)) {
                return str;
              }

              console.log('url', url);

              return wrapUrlDecl(url);
            });

            file.contents = Buffer.from(contents, enc);
            cb(null, file);
          }))
          .pipe(sass({
            precision: 10,
            quiet: true,
            importer (uri, prev, done) {
              console.log('uri, prev', uri, prev);
              sassImportOnce.call(this, uri, prev, function (data) {
                let contents = data.contents || null;
                if (!contents) {
                  return done(data);
                }

                // work
                

                data.contents = contents;
                done(data);
              });
            },
            importOnce: {
              index: true,
              css: true,
              bower: false
            }
          }))
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
    .pipe(gulp.dest(destPath))
    .pipe(notifier.success(`(S)CSS files have been compiled`))
  ;
});


gulp.task('default', (done) => {
  let webpackConfig = require('../webpack.config.babel');

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
