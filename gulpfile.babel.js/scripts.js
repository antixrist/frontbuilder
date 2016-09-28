import _ from 'lodash';
import config from '../config';
import del from 'del';
import path from 'path';
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

let cleanerInited = false;
export function cleaner ({folder = false} = {}) {
  const taskName = 'js:clean';
  cleanerInited = true;
  
  !cleanerInited && gulp.task(taskName, () => {
    let glob = folder ? 'js/' : 'js/**/*.js';
    glob = path.join(config.destPath, glob);
    
    return del(glob);
  });
  
  return taskName;
}
