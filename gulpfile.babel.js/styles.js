/**
 CSS assets:
 https://github.com/postcss/postcss
 https://github.com/shutterstock/postcss-copy-assets
 https://github.com/geut/postcss-copy
 https://github.com/devex-web-frontend/postcss-assets-rebase
 https://github.com/ben-eb/postcss-normalize-url
 https://github.com/geut/postcss-copy
 https://github.com/unlight/postcss-import-url
 https://www.npmjs.com/package/gulp-importify
 */

import _ from 'lodash';
import config from './config';
import del from 'del';
import path from 'path';
import gulp from 'gulp';
import gulpPlugins from 'gulp-load-plugins';
import watcher from 'glob-watcher';
import runner from 'run-sequence';
import through2 from 'through2';
const $ = gulpPlugins();

export function builder () {
  gulp.task('css:build', (cb) => {
    
  });
}

export function cleaner ({folder = false} = {}) {
  gulp.task('css:clean', () => {
    let glob = folder ? 'css/' : 'css/**/*.css';
    glob = path.join(config.destPath, glob);
    
    return del(glob);
  });
}
