import {flatten, forEach, compact} from 'lodash';
import config from '../config';
import del from 'del';
import path from 'path';
import gulp from 'gulp';
import gulpPlugins from 'gulp-load-plugins';
import watcher from 'glob-watcher';
import runner from 'run-sequence';
import Promise from 'bluebird';
import functionDone from 'function-done';
import through2 from 'through2';
import named from 'vinyl-named';
import glob from 'glob';
const $ = gulpPlugins();

// This glob includes all *.js but not *.spec.js:
// components/**/!(*.spec).js


export let tasks = {};

tasks['js:build'] = () => {
  return function (cb) {
    return new Promise((resolve, reject) => {
      getWebpackEntries()
        .then(entries => {
          console.log('entries', entries);
        })
        .then(resolve)
        .catch(reject)
    });
    // let entries = [];
    // return Promise.all([
    //   // ,
    //   gulp
    //     .src(['markup/js/*.js', '!markup/js/_*.js'], {read: false})
    //     .pipe(named())
    //     .pipe(through2.obj(function (file, enc, cb) {
    //       console.log('file', file);
    //       entries.push(file.named);
    //       cb(null, file);
    //     }))
    //     .on('end', function () {
    //       console.log('entries from task', entries);
    //     })
    //     .on('error', err => console.error(err))
    // ]);
  }
};

let tasksInited = {};

export function taskLoader (tasksFactories) {
  return function load (...tasksNames) {
    console.log('tasksNames', compact(flatten(tasksNames)));

    // if (!taskName) {
    //   _.forEach(tasks, (fn, name) => load);
    // } else
    // if (_.isFunction(tasks[taskName]) && _.isUndefined(gulp.tasks[taskName])) {
    //   gulp.task(taskName, tasks[taskName]);
    // }
  }
}

let loader = taskLoader(tasks);
loader();



export function builder () {
  !tasksInited['js:build'] && gulp.task('js:build', );

  tasksInited['js:build'] = true;
}

export function cleaner ({folder = false} = {}) {
  !tasksInited['js:clean'] && gulp.task('js:clean', () => {
    let glob = folder ? 'js/' : 'js/**/*.js';
    glob = path.join(config.destPath, glob);

    return del(glob);
  });

  tasksInited['js:clean'] = true;
}
