import * as _ from 'lodash';
import del from 'del';
import path from 'path';
import gulp from 'gulp';
import gulpUtils from 'gulp-util';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import {notifier} from './utils';
import config from '../config';
import webpackConfig from '../webpack';
import {toArray} from '../utils';
import {insertHMREntriesToAppEntries, entriesFinder} from '../webpack/utils';

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

export function watcher (cb) {
  const hmr = !!config.webpack.useHMR;
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

export function runWebpack (wconfig = webpackConfig, {
  watch = false,
  hmr = false
}, cb = _.noop) {
  // fallback, если забыли указать точки входа
  if (!wconfig.entry) {
    wconfig.entry = entriesFinder.sync('markup/js/!(_*).js');
  }
  
  if (hmr) {
    // отключим вотчер, если нужен hmr
    // (вместе они не работают, только по отдельности)
    wconfig.watch = false;
    
    config.webpack.hmrEntries = toArray(config.webpack.hmrEntries);
    if (!config.webpack.hmrEntries.length) {
      // fallback, если не указаны точки входа для hmr
      config.webpack.hmrEntries = [
        // при ошибках страница перезагрузится
        // 'webpack/hot/dev-server',
        // при ошибках страница перезагружаться не будет (state приложения сохранится)
        'webpack/hot/only-dev-server',
        // https://github.com/glenjamin/webpack-hot-middleware#documentation
        'webpack-hot-middleware/client?reload=true'
      ];
    }
    
    wconfig.plugins = toArray(wconfig.plugins);
    
    // добавим hmr-плагин, если его нету в конфиге
    if (!_.some(wconfig.plugins, (plugin) => plugin instanceof webpack.HotModuleReplacementPlugin)) {
      wconfig.plugins.push(new webpack.HotModuleReplacementPlugin());
    }
    
    // добавим webpack'овскую hmr-магию в точки входа
    wconfig.entry = insertHMREntriesToAppEntries(
      wconfig.entry,
      config.webpack.hmrEntries
    );
    
    // создадим инстанс вебпака
    const instance = webpack(wconfig);
    const middleware = {
      // hot-мидлваря
      hot: webpackHotMiddleware(instance),
      // dev-мидлваря (с fallback'ом для publicPath'а, на всякий случай)
      dev: webpackDevMiddleware(instance, _.assign({
        publicPath: wconfig.output.publicPath,
      }, config.webpack.hmr))
    };
    
    // дождёмся, пока сбилдятся бандлы
    middleware.dev.waitUntilValid(() => {
      cb({middleware, instance, webpackConfig: wconfig});
    });
  } else {
    wconfig.watch = !!watch;
    
    const instance = webpack(wconfig, (error, stats) => {
      error = !!error ? error : stats.toJson().errors[0];
      cb({instance, error, stats, webpackConfig: wconfig});
    });
  }
}
