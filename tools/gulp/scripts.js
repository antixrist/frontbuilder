import * as _ from 'lodash';
import del from 'del';
import path from 'path';
import gulp from 'gulp';
import gulpUtils from 'gulp-util';
import gulpPlugins from 'gulp-load-plugins';
import runner from 'run-sequence';
import Promise from 'bluebird';
import functionDone from 'function-done';
import through2 from 'through2';
import named from 'vinyl-named';
import glob from 'glob';
const $ = gulpPlugins();

import config from '../config';
import webpackConfig from '../webpack';
import {run as runWebpack} from '../webpack/runner';
import {notifier} from './utils';



// This glob includes all *.js but not *.spec.js:
// components/**/!(*.spec).js


export function builder (cb) {
  runWebpack(webpackConfig, {watch: false}, function ({instance, error, stats, webpackConfig}) {
    if (error) {
      notifier.error('JavaScript has not been processed', error);
      cb(new gulpUtils.PluginError(
        'webpack-processing',
        new Error('An error occured during webpack build process')
      ));
    } else {
      stats && console.log(stats.toString({
        colors: true
      }));
      
      notifier.success('JavaScript has been processed', {notStream: true});
      cb({instance, error, stats, webpackConfig});
    }
  });
}

export function watcher ({hmr = false}, cb) {
  runWebpack(webpackConfig, {watch: true, hmr: hmr}, function ({
    instance, error, stats, webpackConfig, middleware
  }) {
    if (error) {
      notifier.error('JavaScript has not been processed', error);
    } else {
      stats && console.log(stats.toString({
        colors: true
      }));
      notifier.success('JavaScript has been processed', {notStream: true});
    }
    cb({instance, error, stats, webpackConfig, middleware});
  });
}

export function cleaner ({folder = false} = {}) {
  gulp.task('js:clean', () => {
    let glob = folder ? 'js/' : 'js/**/*.js';
    glob = path.join(config.destPath, glob);

    return del(glob);
  });
}
