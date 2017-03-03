import _ from 'lodash';
import path from 'path';
import BannerPlugin from 'webpack/lib/BannerPlugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { cwd, isDevelopment, pathes } from '../../config';
import { extractFromConfigSafely } from '../utils';

export default function (webpackConfig) {
  const { plugins } = extractFromConfigSafely(webpackConfig);
  
  plugins.push(
    // new CopyWebpackPlugin([{
    //   context: cwd,
    //   from:    '**/*.!(js)',
    //   to:      ''
    // }]),
  );
  
  if (isDevelopment) {
    // plugins.push(
    //   new BannerPlugin({
    //     banner: `require('source-map-support').install();`,
    //     raw: true,
    //     entryOnly: true
    //   })
    // );
  } else {
    
  }
};
