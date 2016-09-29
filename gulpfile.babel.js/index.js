import _ from 'lodash';
import config from '../config';
import del from 'del';
import gulp from 'gulp';
import gutil from 'gulp-util';
import gulpPlugins from 'gulp-load-plugins';
import webpack from 'webpack';
import watcher from 'glob-watcher';
import runner from 'run-sequence';
import through2 from 'through2';
import browserSync from 'browser-sync';

import {insertHMREtriesToAppEntries, entriesFinder} from './helpers/webpack';

const $ = gulpPlugins();

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
import {notifier} from './helpers';

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
