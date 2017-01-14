import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import pathExists from 'path-exists';
import JSON5 from 'json5';
import CircularDependencyPlugin from 'circular-dependency-plugin';
import ContextReplacementPlugin from 'webpack/lib/ContextReplacementPlugin';
/** втыкает в сборку все имеющиеся переменные среды */
import EnvironmentPlugin from 'webpack/lib/EnvironmentPlugin';
/** определяет какие-то глобальные переменные */
import DefinePlugin from 'webpack/lib/DefinePlugin';
/** подключает указанный модуль, если внутри него глобально используется указанная переменная */
import ProvidePlugin from 'webpack/lib/ProvidePlugin';
/** вырезает модули из бандла */
import IgnorePlugin from 'webpack/lib/IgnorePlugin';
import UglifyJsPlugin from 'webpack/lib/optimize/UglifyJsPlugin';
import LodashModuleReplacementPlugin from 'lodash-webpack-plugin';

import { cwd, isDevelopment } from '../../config';
import { extractFromConfigSafely } from '../utils';

const babelrc = path.join(cwd, '.babelrc');
const babelConfig = pathExists.sync(babelrc)
  ? JSON5.parse(fs.readFileSync(babelrc))
  : {}
;

export default function (webpackConfig) {
  const { resolve, module, rules, plugins, externals } = extractFromConfigSafely(webpackConfig);

  resolve.alias = resolve.alias || {};
  resolve.alias['vue$'] = 'vue/dist/vue.common.js';
  
  module.noParse = module.noParse || [];
  module.noParse.push(
    /jquery\/dist\/jquery/
  );
  
  rules.push(
    { test: /\.jsx?$/, loader: 'source-map-loader', enforce: 'pre' },
    { test: /\.json5?$/, loader: 'json5-loader' },
    {
      test: /\.jsx?$/,
      loader: 'babel-loader?'+ JSON.stringify({...babelConfig, babelrc: false, cacheDirectory: true}),
      exclude: /(node_modules|bower_components)/,
    }
  );
  
  plugins.push(
    // new LodashModuleReplacementPlugin(),
    new CircularDependencyPlugin({ failOnError: false }),
  
    /** https://www.youtube.com/watch?v=XY2NLKCrjJ4 */
    new ContextReplacementPlugin(/node_modules\/moment\/locale/, /(ru|en-gb)/),
    
    /** https://www.youtube.com/watch?v=vHRvO4jn6Oc */
    // new IgnorePlugin(/^\.\/locale$/, /moment$/),
  
    /**
     * Кастомные глобальные константы.
     * По возможности лучше не пользоваться, потому что явное лучше неявного.
     * Да и статического анализа этих переменных не будет.
     * Значение каждого ключа должно быть stringify'нуто
     */
    new DefinePlugin({
      // к примеру
      LANG: JSON.stringify('ru')
    }),
  
    /**
     * если в модуле есть глобальная переменная (ключ объекта), которая не про'require'на,
     * то этот плагин автоматически воткнёт import/require нужной
     * зависимости (соответствующее этому ключу значение)
     */
    new ProvidePlugin({
      _: 'lodash',
      $: 'jquery',
      jQuery: 'jquery',
      // Promise: 'bluebird'
    }),
  
    /** внедряем все имеющиеся переменные среды */
    new EnvironmentPlugin(Object.keys(process.env)),
  );
  
  /** настраиваем продакшн-сборку */
  if (!isDevelopment) {
    plugins.push(
      /** кукожим всё получившееся добро */
      new UglifyJsPlugin({
        sourceMap: true,
        compress: {
          drop_console: true,
          drop_debugger: true,
          warnings: false
        },
        comments: false,
        mangle: true,
        compressor: {
          warnings: false
        }
      })
    );
  }
};
