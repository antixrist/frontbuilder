import _ from 'lodash';
import path from 'path';
/** не вотчить список путей пути в (внезапно) watch-режиме */
import DllPlugin from 'webpack/lib/DllPlugin';
import WatchIgnorePlugin from 'webpack/lib/DllPlugin';
import LoaderOptionsPlugin from 'webpack/lib/LoaderOptionsPlugin';
/**
 * Этот плагин полезен (вроде бы) в watch cli режиме.
 * Заставляет процесс не падать с ошибкой и продолжать работу.
 */
import NoErrorsPlugin from 'webpack/lib/NoErrorsPlugin';
/** вырезает модули из бандла */
import IgnorePlugin from 'webpack/lib/IgnorePlugin';
/** оптимизация компоновки чанков */
import CommonsChunkPlugin from 'webpack/lib/optimize/CommonsChunkPlugin';
import MinChunkSizePlugin from 'webpack/lib/optimize/MinChunkSizePlugin';
import LimitChunkCountPlugin from 'webpack/lib/optimize/LimitChunkCountPlugin';
import AggressiveMergingPlugin from 'webpack/lib/optimize/AggressiveMergingPlugin';
/** оптимизация именования чанков */
import NamedModulesPlugin from 'webpack/lib/NamedModulesPlugin';
import HashedModuleIdsPlugin from 'webpack/lib/HashedModuleIdsPlugin';
import WebpackMd5Hash from 'webpack-md5-hash';
/** генерация json-манифеста */
import ManifestPlugin from 'webpack-manifest-plugin';
import AssetsPlugin from 'assets-webpack-plugin';
import BannerPlugin from 'webpack/lib/BannerPlugin';
// import ManifestRevisionPlugin from 'manifest-revision-webpack-plugin';
/** этот плагин ставится из `https://github.com/brandondoran/chunk-manifest-webpack-plugin#f60e59a95fccdedbb617c6437cc9dd0a3773dd46` */
import ChunkManifestPlugin from 'chunk-manifest-webpack-plugin';
import { extractFromConfigSafely } from '../utils';
import { cwd, isDevelopment, pathes } from '../../config';

export default function (webpackConfig) {
  const { plugins, output } = extractFromConfigSafely(webpackConfig);
  const SCRIPTS_TARGET = path.join(cwd, pathes.target, _.get(pathes, 'scripts.target') || '.');
  
  if (isDevelopment) {
    /** вроде как ускоряет инкрементальные билды, а вроде как не работает с hmr */
    // plugins.unshift(
    //   new DllPlugin({
    //     path: path.join(SCRIPTS_TARGET, '[name]-manifest.json'),
    //     name: '[name]_[hash]'
    //   })
    // );

    /** в id модуля вместо циферок, подставляет путь до файла (м.б. удобно для разработки) */
    // plugins.push(new NamedModulesPlugin());
  } else {
    /**
     * в id модуля вместо циферок, подставляет сгенерированный хэш (м.б. удобно для продакшена).
     * позволяет избегать изменений идентификаторов модулей между сборками,
     * что снижает вероятность инвалидации чанков
     */
    plugins.push(new HashedModuleIdsPlugin({hashDigestLength: 7}));
  }
  
  if (!isDevelopment) {
    plugins.push(
      new LoaderOptionsPlugin({
        minimize: true
      }),
      
      new AggressiveMergingPlugin({moveToParents: true}),
  
      new CommonsChunkPlugin({
        name: 'common',
        /** https://github.com/webpack/docs/wiki/list-of-plugins#3-move-common-modules-into-the-parent-chunk */
        // children: true,
        // minChunks: 2
        minChunks (module, count) {
          return count >= 2 || module.resource &&
            /\.js$/.test(module.resource) &&
            module.resource.indexOf(path.join(cwd, 'node_modules')) === 0
          ;
        }
      }),
  
      /**
       * либо выносить весь манифест со всем рантаймом в отдельный файл,
       * либо использовать ChunkManifestPlugin (см. ниже)
       */
      new CommonsChunkPlugin({
        name: 'manifest',
        minChunks: Infinity,
      }),
  
      /**
       * Эта тулза выдёргивает мапу имён итоговых чанков из вебпаковского манифеста и записывает в файл `filename`.
       * Этот объект необходимо проинлайнить в шаблон и поместить в глобальную переменную из опции `manifestVariable`.
       *
       * @link https://webpack.js.org/guides/caching/#deterministic-hashes
       */
      // new ChunkManifestPlugin({
      //   filename: 'chunk-manifest.json',
      //   manifestVariable: 'webpackManifest'
      // }),
    );
  }

  plugins.push(
    /** генерирует `chunkhash` исходя из md5-хэша контента конкретного чанка, а не хэша текущей сборки */
    new WebpackMd5Hash(),

    // /** генерирует файл манифеста с мапой всех полученных чанков */
    // new ManifestPlugin({
    //   publicPath: output.publicPath
    // }),

    // new AssetsPlugin({
    //   // path: config.context || cwd,
    //   path: config.output.path || cwd,
    //   filename: 'assets.json',
    //   // fullPath: false,
    //   prettyPrint: true
    // }),
  );
};
