import _ from 'lodash';
import prettyTime from 'pretty-hrtime';
import config from './';
import formatError from 'gulp-cli/lib/versioned/^4.0.0/formatError';
import { log, colors, PluginError } from 'gulp-util';

const { cyan, magenta, red } = colors;

/**
 * todo: написать это дерьмо нормально
 *
 * @param webpackConfig
 * @returns {{output: {}, module: {}, resolve: {}, stats: {}, extensions: Array, rules: Array, plugins: Array,
 *   externals: {}}}
 */
export function extractFromConfigSafely (webpackConfig) {
  const resolve = _.get(webpackConfig, 'resolve') || {};
  _.set(webpackConfig, 'resolve', resolve);
  
  const extensions = _.get(resolve, 'extensions') || [];
  _.set(resolve, 'extensions', extensions);
  
  const output = _.get(webpackConfig, 'output') || {};
  _.set(webpackConfig, 'output', output);

  const module = _.get(webpackConfig, 'module') || {};
  _.set(webpackConfig, 'module', module);

  const rules = _.get(webpackConfig, 'module.rules') || [];
  _.set(webpackConfig, 'module.rules', rules);

  const plugins = _.get(webpackConfig, 'plugins') || [];
  _.set(webpackConfig, 'plugins', plugins);

  const externals = _.get(webpackConfig, 'externals') || {};
  _.set(webpackConfig, 'externals', externals);

  const stats = _.get(webpackConfig, 'stats') || {};
  _.set(webpackConfig, 'stats', stats);

  return { output, extensions, module, resolve, rules, plugins, stats, externals };
}

export function compilerCallback ({ done = () => {}, breakOnError = false, name = 'webpack' }) {
  return (err, stats) => {
    const statsJson = stats.toJson();
    const hrBuildTime = [0, statsJson.time * 1000000];
    const hrBuildTimePretty = prettyTime(hrBuildTime);

    err = err || statsJson.errors[0] || null;

    if (err && breakOnError) {
      return done(new PluginError(name, err));
    } else
    if (err && !breakOnError) {
      /**
       * мимикрируем под gulp'овое сообщение об ошибке,
       * делая его точно таким же, как при `done(new PluginError('webpack', err))`
       */
      log('\'' + cyan(name) + '\'', red('errored after'), magenta(hrBuildTimePretty));
      // console.error(err);
      log(formatError({ name, error: new PluginError(name, err) }));
    } else {
      /** если ошибок нет, то покажем webpack'овскую статистику */
      log(`${cyan(name)}:`);
      console.log(stats.toString(config.stats || 'verbose'));
    }

    /**
     * Если `done.called` === true, значит в эта функция вызывается компилером не в первый раз.
     * А значит можно показать сообщение о времени выполнения текущей сборки.
     * Просто webpack пишет время вверху статистики, а статистика у него большааая..
     * Поэтому время сборки лучше написать ещё и после статистики, чтобы наглядней было.
     */
    done.called && log('Finished \''+ cyan(name) +'\' after '+ magenta(hrBuildTimePretty));
    done.called = true;
    done();
  };
}

/**
 * На входе список точек входа в любом формате.
 * На выходе - тот же самый список,
 * только каждая точка входа будет превращена вот в такую:
 * ['webpack/hot/only-dev-server', 'webpack-hot-middleware/client?reload=true', 'myEntryFile.js']
 *
 * @param {string|string[]} chunk
 * @returns {[]}
 */
function appendMissingHMRToChunk (chunk) {
  let wbpkHotIdx, wbpkHotMdlwrIdx;

  chunk           = _.isArray(chunk) ? chunk : [chunk];
  wbpkHotIdx      = _.findIndex(chunk, f => /^webpack\/hot\//.test(f));
  wbpkHotMdlwrIdx = _.findIndex(chunk, f => /^webpack-hot-middleware/.test(f));

  /**
   * - 'webpack/hot/dev-server': при ошибках страница перезагрузится
   * - 'webpack/hot/only-dev-server': при ошибках страница перезагружаться не будет (state приложения сохранится)
   * - 'webpack-hot-middleware/client?reload=true': https://github.com/glenjamin/webpack-hot-middleware
   *
   * 'webpack/hot/dev-server' || 'webpack/hot/only-dev-server' - любой на выбор, обязательно;
   * 'webpack-hot-middleware/client' - обязателен.
   */

  wbpkHotIdx < 0      && chunk.push('webpack/hot/only-dev-server');
  wbpkHotMdlwrIdx < 0 && chunk.push('webpack-hot-middleware/client?reload=true');

  /** отсортируем в правильном порядке */
  chunk = _(chunk)
    .uniq()
    .sortBy(item => {
      if (/^webpack\/hot\//.test(item)) { return 0; }
      if (/^webpack-hot-middleware/.test(item)) { return 1; }

      return 99;
    })
    .value()
  ;

  return chunk;
}

/**
 * @param {string|string[]|{}} entry
 * @returns {string[]|{}}
 */
export function appendMissingHMRToEntries (entry) {
  entry = _.isArray(entry) || _.isPlainObject(entry) ? entry : [entry];

  if (_.isArray(entry)) {
    entry = appendMissingHMRToChunk(entry)
  } else
  if (_.isPlainObject(entry)) {
    _.forEach(entry, (file, name) => entry[name] = appendMissingHMRToChunk(file));
  }

  return entry;
}
