import _ from 'lodash';
import LoaderOptionsPlugin from 'webpack/lib/LoaderOptionsPlugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import assetFunctions from 'node-sass-asset-functions';
import { isDevelopment, EXTRACT_STYLES, pathes, sass as sassConfig, vueLoaders } from '../../config';
import { extractFromConfigSafely } from '../utils';

const STYLES_TARGET = _.get(pathes, 'styles.target') || '.';

/** Стили будут кукожиться gulp'ом в `production`-сборке */

export default function (webpackConfig) {
  const { rules, plugins } = extractFromConfigSafely(webpackConfig);
  
  let cssLoader = {
    fallbackLoader: 'style-loader',
    loader: [
      { loader: 'css-loader', query: { sourceMap: true, minimize: false, importLoaders: 1 } },
      { loader: 'postcss-loader', query: { sourceMap: 'inline' } }
    ]
  };

  let sassLoader = {
    fallbackLoader: 'style-loader',
    loader: [
      { loader: 'css-loader', query: { sourceMap: true, minimize: false, importLoaders: 3 } },
      { loader: 'postcss-loader', query: { sourceMap: 'inline' } },
      /**
       * Sass не умеет резолвить и переписывать пути ассетов внутри подключаемых файлов.
       * `resolve-url-loader` это исправляет.
       */
      { loader: 'resolve-url-loader' },
      { loader: 'sass-loader', query: {
        ...sassConfig,
        sourceMap: true,
        sourceMapContents: true,
      } }
    ]
  };

  /** https://blog.shakacode.com/migration-to-webpack-2-c9803871b931 */
  plugins.push(
    new LoaderOptionsPlugin({
      options: {
        context: webpackConfig.context,
        output: webpackConfig.output,
        resolveUrlLoader: {
          sourceMap: true,
          keepQuery: true,
          ...(() => {
            let fnCall = null;

            return {
              beforeResolve (url, filePath) {
                let retVal = url;

                let matchedFnCall = url.match(/^\s*([a-z_-]+)\s*\((.+)\)\s*(;?)\s*$/);
                if (matchedFnCall) {
                  fnCall = {
                    name: matchedFnCall[1],
                    args: matchedFnCall[2].split(',').map(arg => arg.trim()),
                    semicolon: matchedFnCall[3]
                  };

                  // console.log('matchedFnCall', matchedFnCall);

                  switch (fnCall.name) {
                    case 'size':
                    case 'width':
                    case 'height':
                      retVal = fnCall.args[0];
                      break;
                  }

                  console.log('prepareSource url', url);
                  console.log('prepareSource retVal', retVal);
                }

                return retVal;
              },
              afterResolve (url, filePath) {
                let retVal = url;

                if (fnCall) {
                  switch (fnCall.name) {
                    case 'size':
                    case 'width':
                    case 'height':
                      fnCall.args[0] = url;
                      break;
                  }
                  retVal = `${ fnCall.name }(${ fnCall.args.join(', ') })${ fnCall.semicolon }`;

                  fnCall = null;

                  console.log('prepareResult url', url);
                  console.log('prepareResult retVal', retVal);
                }

                return retVal;
              }
            };
          })()
        }
      },
    })
  );

  plugins.push(
    new LoaderOptionsPlugin({
      // test: /\.(scss|sass)$/,
      options: {
        context: webpackConfig.context,
        output: webpackConfig.output,
        sassLoader: {
          ...sassConfig,
          sourceMap: true,
          sourceMapContents: true,
          functions: assetFunctions({
            images_path: webpackConfig.context,
            http_images_path: './'
          }),
          /** импортёр ваще косячный */
          // importer: sassImportOnce,
          // importer (uri, prev, done) {
          //   console.log('sassImportOnce', uri, prev);
          //   /** всё остальное отдаём на откуп sassImportOnce'у */
          //   return sassImportOnce.call(this, uri, prev, done);
          // },
          // importOnce: {
          //   css: true,
          //   index: true,
          //   bower: false
          // }
        },
        // /** это пиздец */
      },
    }),
  );
  
  /**
   * Здесь прикол в том, что ExtractTextPlugin в режиме разработки нам не нужен.
   * Поэтому подменяем вызов плагина, если находимся в режиме разработки на свою заглушку.
   */
  let loadersWrapper;
  if (isDevelopment && !EXTRACT_STYLES) {
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
