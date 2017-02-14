import _ from 'lodash';
import path from 'path';
import glob from 'glob';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import { cwd, isDevelopment, pathes, prependEachEntriesWith } from '../config';
import * as setup from './setup';

const SCRIPTS_SOURCES = _.get(pathes, 'scripts.source') || '.';
const SCRIPTS_TARGET = _.get(pathes, 'scripts.target') || '.';

/**
 * todo раскурить ссылки:
 * http://robertknight.github.io/posts/webpack-dll-plugins/
 */

/** контекст для резолвинга */
const context = path.join(cwd, pathes.source);
/**
 * Основной webpack-конфиг.
 * Настраивать можно любые опции - никаких побочных эффектов
 * на остальных этапах настройки сборки быть не должно
 */
const config = {
  context,
  /**
   * Ищем в директории-контексте вот такие файлы: `/\/[^_]{1}[^\\\\\/]*\.jsx?/`
   * (т.е. js/jsx и имена у которых не начинаются с нижнего подчёркивания)
   * и из полученного массива собираем формат для вебпака:
   * { 'entry1': './entry1.js', 'entry2': './entry2.jsx' }
   */
  entry: glob.sync(`${SCRIPTS_SOURCES}/!(_)*.js?(x)`, {cwd: context}).reduce((entries, file) => {
    const entryName    = path.basename(file, path.extname(file));
    entries[entryName] = './'+ file;
    entries[entryName] = prependEachEntriesWith.concat(entries[entryName]);

    return entries;
  }, {}),
  output: {
    filename: isDevelopment
      ? `${SCRIPTS_TARGET}/[name].js`
      : `${SCRIPTS_TARGET}/[name].[chunkhash:5].js`
    ,
    chunkFilename: isDevelopment
      ? `${SCRIPTS_TARGET}/[name].js`
      : `${SCRIPTS_TARGET}/[name].[chunkhash:5].js`
    ,
    hotUpdateChunkFilename: isDevelopment
      ? `${SCRIPTS_TARGET}/[id].hot-update.js`
      : `${SCRIPTS_TARGET}/[id].[hash:5].hot-update.js`
    ,
    /** папка назначения */
    path: path.join(cwd, pathes.target),
    /** `publicPath` будет подставляться во все урлы */
    publicPath: pathes.public,

    library:                '[name]',
    libraryTarget:          'umd',
    umdNamedDefine:         true,

    // опция будет вставлять комментарии с путями для каждого модуля
    pathinfo: isDevelopment,
    // значение по умолчанию
    devtoolModuleFilenameTemplate: 'webpack:///[resource-path]?[loaders]'
  },
  devtool: isDevelopment ? 'inline-source-map' : 'cheap-module-source-map',
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.json5'],
    modules: ['node_modules'],
    alias: {}
  },
  resolveLoader: {
    moduleExtensions: ['-loader']
  },
  module: {},
  watchOptions: {
    aggregateTimeout: 200,
  },
  plugins: [
    // new ProgressBarPlugin()
  ],
  stats: !isDevelopment ? {
    colors: true,
    chunks: false,
    modules: false,
    origins: false,
    entrypoints: true,
  } : 'minimal'
};

setup.scripts(config);
setup.styles(config);
setup.assets(config);
setup.texts(config);
setup.optimize(config);
setup.common(config);
setup.vue(config);

export default config;
