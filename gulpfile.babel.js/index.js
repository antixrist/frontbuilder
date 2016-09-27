import _ from 'lodash';
import * as config from './config';
import del from 'del';
import gulp from 'gulp';
import gulpPlugins from 'gulp-load-plugins';
import watcher from 'glob-watcher';
import runner from 'run-sequence';
import through2 from 'through2';
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


import * as jsTasks from './scripts';

console.log('jsTasks', jsTasks);

gulp.task('default', (cb) => {
  
  
  console.log('config', config);
  console.log('tasks', Object.keys(gulp.tasks));
  cb();
});

gulp.task('default2', (cb) => {
  console.log('config', config);
  console.log('tasks', gulp.tasks);
  cb();
});
