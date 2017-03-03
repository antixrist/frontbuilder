import _ from 'lodash';
import { vueLoaders } from '../../config';
import { extractFromConfigSafely } from '../utils';
import postcssConfig from '../../../postcss.config.js';

export default function (webpackConfig) {
  const { rules, plugins, resolve, extensions } = extractFromConfigSafely(webpackConfig);
  
  !extensions.includes('.vue') && extensions.push('.vue');
  
  // resolve.alias = resolve.alias || {};
  // resolve.alias['vue$'] = 'vue/dist/vue.common.js';
    
  let postcss = (_.isFunction(postcssConfig))
    ? postcssConfig({env: process.env.NODE_ENV})
    : postcssConfig
  ;
  
  rules.push({
    test: /\.vue$/,
    loader: 'vue-loader',
    options: {
      postcss: postcss,
      loaders: {
        ...vueLoaders,
      },
      preserveWhitespace: false,
      transformToRequire: {
        img: ['src', 'data-src'],
        link: ['href']
      },
    }
  });
};
