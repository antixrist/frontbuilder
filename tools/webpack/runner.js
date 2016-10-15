import * as _ from 'lodash';
import config from '../config';
import webpack from 'webpack';
import webpackConfig from '../webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import {notifier} from '../gulp/utils';
import {toArray} from '../utils';
import {insertHMREntriesToAppEntries, entriesFinder} from '../webpack/utils';


export function run (wconfig = webpackConfig, {
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
