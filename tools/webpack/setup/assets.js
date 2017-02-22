import _ from 'lodash';
import { isDevelopment, pathes } from '../../config';
import { extractFromConfigSafely } from '../utils';

/** todo: image-webpack-loader */
export default function (webpackConfig) {
  const { rules, plugins } = extractFromConfigSafely(webpackConfig);

  const data = [
    {
      test: /\.woff$/,
      query: { limit: 2048, mimetype: 'application/font-woff' }
    },
    {
      test: /\.woff2$/,
      query: { limit: 2048, mimetype: 'application/font-woff2' }
    },
    {
      test: /\.[ot]tf$/,
      query: { limit: 2048, mimetype: 'application/octet-stream' }
    },
    {
      test: /\.eot$/,
      query: { limit: 2048, mimetype: 'application/vnd.ms-fontobject' }
    },
    {
      test: /\.svg$/,
      query: { limit: 2048, mimetype: 'image/svg+xml' }
    },
    {
      test: /\.png$/,
      query: { limit: 2048, mimetype: 'image/png' }
    },
    {
      test: /\.jpe?g$/,
      query: { limit: 2048, mimetype: 'image/jpeg' }
    },
    {
      test: /\.gif$/,
      query: { limit: 2048, mimetype: 'image/gif' }
    },
    {
      test: /\.webp$/,
      query: { limit: 2048/*, todo: mimetype: 'image/wepb' ??? */ }
    }
  ];
  
  const ASSETS_TARGET = _.get(pathes, 'assets.target') || '.';
  const assetsRules = _.flatMap(data, item => ([
    /**
     * url-loader слегка коверкает пути для файлов из node_modules (мне не нравится).
     * поэтому их обработаем отдельно, все остальные - отдельно
     */
    _.merge({}, {
      loader: 'url-loader',
      // exclude: /node_modules/,
      query: {
        name: isDevelopment
          ? `${ASSETS_TARGET}/[path][name].[ext]`
          : `${ASSETS_TARGET}/[path][name].[md5:hash:base64:7].[ext]`
      }
    }, item),
    // _.merge({}, {
    //   loader: 'url-loader',
    //   include: /node_modules/,
    //   query: {
    //     name: isDevelopment
    //       ? `${ASSETS_TARGET}/[1].[ext]`
    //       : `${ASSETS_TARGET}/[1].[md5:hash:base64:7].[ext]`
    //     ,
    //     regExp: 'node_modules[\\\\\/](.*)'
    //   }
    // }, item),
  ]));

  rules.push(
    ...assetsRules,
    {
      test:   /\.ico$/,
      loader: 'file-loader',
      query:  {
        name: `${ASSETS_TARGET}/[path][name].ico`
      }
    }
  );
};
