import _ from 'lodash';
import config from './config';
import del from 'del';
import gulp from 'gulp';
import gulpPlugins from 'gulp-load-plugins';
import watcher from 'glob-watcher';
import runner from 'run-sequence';
import through2 from 'through2';
const $ = gulpPlugins();

export function builder () {
  gulp.task('js:build', (cb) => {
    
  });
}
export function cleaner ({folder = false}) {
  gulp.task('js:clean', (cb) => {
    let glob;
    
    if (!config.isProduction) {
      glob = folder ? 'build/js/' : 'build/js/*.js';
    } else {
      glob = folder ? 'dev/js/' : 'dev/js/*.js';
    }
    
    return del(glob);
  });
}
