import _ from 'lodash';
import del from 'del';
import path from 'path';
import once from 'once';
// import glob from 'glob';
import gulp from 'gulp';
import csso from 'gulp-csso';
import changed from 'gulp-changed';
import imagemin from 'gulp-imagemin';
import webpack from 'webpack';
// import through2 from 'through2';
import BrowserSync from 'browser-sync';
// import functionDone from 'function-done';
import WebpackDevMiddleware from 'webpack-dev-middleware';
import WebpackHotMiddleware from 'webpack-hot-middleware';
import HotModuleReplacementPlugin from 'webpack/lib/HotModuleReplacementPlugin';
import { log } from 'gulp-util';

import webpackConfig from '../webpack';
import {
  pathes,
  cwd,
  DISABLE_HMR,
  browserSync as bsConfig
} from '../config';
import {
  extractFromConfigSafely,
  compilerCallback as webpackCompilerCallback,
  appendMissingHMRToEntries
} from '../webpack/utils';

const browserSync = BrowserSync.create();

let COMPILER = null;
const HMR_MODE = !DISABLE_HMR;

gulp.task('clean', done => del(path.join(cwd, pathes.target, '**'), { read: false }));

gulp.task('files', done => {
  const source = path.join(cwd, pathes.source, pathes.files.source);
  const target = path.join(cwd, pathes.target, pathes.files.target);

  return gulp
    .src(source +'/**/*.*', {cwd: source})
    .pipe(changed(target, { hasChanged: changed.compareSha1Digest }))
    .pipe(gulp.dest(target))
  ;
});

gulp.task('webpack', done => {
  /** todo: gulp перехватывает ошибки, а у ошибок вебпака своё форматирование и оно проёпывается */
  try {
    webpack(webpackConfig, webpackCompilerCallback({ done, breakOnError: true }));
  } catch (err) {
    console.error(err);
  }
});

gulp.task('watch:setup', done => {
  _.merge(webpackConfig, {
    /** хак-хак-хуяк. если не указать домен в publicPath'е, то в blob'нутых стилях не будут грузиться картинки */
    output: {
      publicPath: [
        'http://localhost:',
        bsConfig.port,
        webpackConfig.output.publicPath[0] != '/' ? '/' : '',
        webpackConfig.output.publicPath
      ].join('')
    }
  });

  if (HMR_MODE) {
    /** отключим вотчер, если нужен hmr (вместе они не работают, только по отдельности) */
    webpackConfig.watch = false;

    /** Добавим webpack'овскую hmr-магию в точки входа */
    /** todo: проверить не на объкте, а на массиве или обычной строке */
    webpackConfig.entry = appendMissingHMRToEntries(webpackConfig.entry);

    const { output, plugins, stats } = extractFromConfigSafely(webpackConfig);

    /** добавим hmr-плагин, если его нету в конфиге */
    if (!_.some(plugins, (plugin) => plugin instanceof HotModuleReplacementPlugin)) {
      plugins.push(new HotModuleReplacementPlugin());
    }

    /** мимикрируем под запуск таска 'webpack:watch' */
    // log('Starting', '\'' + chalk.cyan('webpack:watch') + '\'...');

    /** todo: `compilerCallbackDoneFn.called` - это такой грязный workaround для собственной же обёртки :-/ */
    const compilerCallbackDoneFn = () => {};
    compilerCallbackDoneFn.called = true;
    const compilerCallback = webpackCompilerCallback({
      done: compilerCallbackDoneFn,
      name: 'webpack:watch',
      breakOnError: false
    });

    COMPILER = webpack(webpackConfig);
    const webpackHotMiddleware = WebpackHotMiddleware(COMPILER);
    const webpackDevMiddleware = WebpackDevMiddleware(COMPILER, {
      stats,
      publicPath: output.publicPath,
      /** Кастомный defaultReporter из node_modules/webpack-dev-middleware/middleware.js */
      reporter (reporterOptions) {
        const { stats, state, options } = reporterOptions;

        stats && compilerCallback(null, stats);
      }
    });

    bsConfig.middleware = !!bsConfig.middleware ? bsConfig.middleware : [];
    bsConfig.middleware = _.isArray(bsConfig.middleware) ? bsConfig.middleware : [bsConfig.middleware];
    bsConfig.middleware.push(webpackHotMiddleware, webpackDevMiddleware);

    /** дождёмся, пока сбилдятся бандлы */
    webpackDevMiddleware.waitUntilValid(function () {
      done();
    });
  } else {
    webpackConfig.watch = true;
    done();
  }
});

gulp.task('webpack:watch', done => {
  if (COMPILER) { return done(); }

  done = once(done);

  try {
    webpack(webpackConfig, webpackCompilerCallback({
      breakOnError: false,
      done () {
        /** todo: чего я здесь хотел понаписать? */
        done.apply(null, arguments);
      }
    }));
  } catch (err) {
    console.error(err);
    done();
  }
});

gulp.task('minify:styles', done => {
  // todo: 'svgo'
  const source = path.join(cwd, pathes.target);

  return gulp
    .src(source +'/**/*.css')
    .pipe(csso({
      debug: false,
      sourceMap: true,
      restructure: true,
    }))
    .pipe(gulp.dest(source))
  ;
});
gulp.task('minify:images', done => {
  const source = path.join(cwd, pathes.target);

  return gulp
    .src(source +'/**/*.@(jpg|jpeg|png|gif|svg)')
    .pipe(imagemin())
    .pipe(gulp.dest(source))
  ;
});

gulp.task('server', done => {
  done = once(done);
  
  browserSync.init(bsConfig);
  done();
});

gulp.task('watch', done => {
  gulp
    .watch(path.join(cwd, pathes.source, pathes.files.source, '**/*.*'))
    .on('all', gulp.series('files'))
  ;
  gulp
    .watch(path.join(cwd, pathes.target, '**/*.*'))
    .on('change', browserSync.reload)
  ;
});

gulp.task('dev', gulp.series('clean', 'files', 'watch:setup', 'webpack:watch', 'server', 'watch'));
gulp.task('default', gulp.series('dev'));
gulp.task('build', gulp.series(
  'clean',
  gulp.parallel('files', 'webpack'),
  // todo: 'sprites'
  gulp.parallel('minify:styles', 'minify:images')
));
