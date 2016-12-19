import _ from 'lodash';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import { isDevelopment, pathes, sass as sassConfig, vueLoaders } from '../../config';
import { extractFromConfigSafely } from '../utils';

const STYLES_TARGET = _.get(pathes, 'styles.target') || '.';

/** Стили будут кукожиться gulp'ом в `production`-сборке */

export default function (webpackConfig) {
  const { rules, plugins } = extractFromConfigSafely(webpackConfig);
  
  let cssLoader = {
    fallbackLoader: 'style-loader',
    loader: [
      { loader: 'css-loader', query: { sourceMap: true, minimize: false, importLoaders: true } },
      { loader: 'postcss-loader', query: { sourceMap: 'inline' } }
    ]
  };
  
  let sassLoader = {
    fallbackLoader: 'style-loader',
    loader: [
      { loader: 'css-loader', query: { sourceMap: true, minimize: false, importLoaders: true } },
      { loader: 'postcss-loader', query: { sourceMap: 'inline' } },
      /**
       * Sass не умеет резолвить и переписывать пути ассетов у подключаемых файлов.
       * `resolve-url-loader` это исправляет.
       */
      { loader: 'resolve-url-loader', query: { sourceMap: true, keepQuery: true } },
      { loader: 'sass-loader',
        /** опции для node-sass'а. `sourceMap` обязательны! иначе резолвинг ассетов работать не будет */
        query: _.merge({}, sassConfig, {
          sourceMap: true,
          sourceMapContents: true,
          /** импортёр игнорируется, если используется ExtractTextPlugin :( */
          // importer: function (uri, prev, done) {
          //   /** js/json файлы require'им напрямую, а обработкой результата займётся sassImporterBuilder */
          //   if (/\.js(x?|on5?)?$/.test(uri)) {
          //     /**
          //      * сюда надо как-то воткнуть webpack'овский `require`,
          //      * потому что сейчас используется системный и лоадеры не работают
          //      */
          //     return sassImporterBuilder(/./, filepath => require(filepath)).call(this, uri, prev, done);
          //   }
          //
          //   /** всё остальное отдаём на откуп sassImportOnce'у */
          //   if (/\.(sass|scss|css)$/.test(uri)) {
          //     return sassImportOnce.call(this, uri, prev, done);
          //   }
          // },
          // importOnce: {
          //   css: true,
          //   index: true,
          //   bower: false
          // }
        })
      }
    ]
  };
  
  /**
   * Здесь прикол в том, что ExtractTextPlugin в режиме разработки нам не нужен.
   * Поэтому подменяем вызов плагина, если находимся в режиме разработки.
   */
  let loadersWrapper;
  if (isDevelopment) {
    loadersWrapper = fakeExtractTextPluginExtract;
  } else {
    loadersWrapper = ExtractTextPlugin.extract;
    plugins.push(
      new ExtractTextPlugin({
        allChunks: true,
        filename: isDevelopment
          ? `${STYLES_TARGET}/[name].css`
          : `${STYLES_TARGET}/[name].[contenthash:5].css`
        ,
      })
    );
  }
  
  vueLoaders.css  = loadersWrapper({...cssLoader,  fallbackLoader: 'vue-style-loader'});
  vueLoaders.scss = loadersWrapper({...sassLoader, fallbackLoader: 'vue-style-loader'});
  vueLoaders.sass = loadersWrapper({...sassLoader, fallbackLoader: 'vue-style-loader'});
  
  rules.push(
    {
      test: /\.css$/,
      loader: loadersWrapper(cssLoader)
    },
    {
      test: /\.(scss|sass)$/,
      loader: loadersWrapper(sassLoader)
    }
  );
};

/** это почти полная копипаста кода разбора опций самого `ExtractTextPlugin.extract` */
function fakeExtractTextPluginExtract (options) {
  if (Array.isArray(options) || _.isString(options) || typeof options.query === 'object') {
    options = { loader: options };
  }
  let loader = options.loader;
  let before = options.fallbackLoader || [];
  if (_.isString(loader)) {
    loader = loader.split('!');
  }
  if (_.isString(before)) {
    before = before.split('!');
  } else
  if (!Array.isArray(before)) {
    before = [before];
  }

  return before.concat(loader)
    .map(function getLoaderWithQuery (loader) {
      if (_.isString(loader)) { return loader; }
      if (!loader.query) { return loader.loader; }
      const query = _.isString(loader.query) ? loader.query : JSON.stringify(loader.query);
      
      return loader.loader + '?' + query;
    })
    .join('!')
  ;
}
