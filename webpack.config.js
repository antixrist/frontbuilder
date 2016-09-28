// babel-plugin-syntax-async-functions
// //babel-plugin-transform-async-to-generator
// babel-plugin-transform-regenerator

import {keys, assign} from 'lodash';
import config from './config';
import webpack from 'webpack';

let constants = keys(config).reduce((obj, key) => {
  obj[key] = JSON.stringify(config[key]);
  
  return obj;
}, {});

constants['process.env'] = keys(process.env).reduce((obj, key) => {
  obj[key] = JSON.stringify(process.env[key]);

  return obj;
}, {});

let plugins = [
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.DefinePlugin(constants),
  new webpack.optimize.CommonsChunkPlugin({
    name: 'common',
    children: true,
    minChunks: 2
  })
];

if (!config.isProduction) {
  plugins.push(
    new webpack.HotModuleReplacementPlugin(),
  );
} else {
  plugins.push(
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    }),
  );
}

let webpackConfig = {
  output: {
    filename: '[name].js',
    library: '[name]',
    chunkFilename: '[id].js',
  },
  
  resolve: {
    modulesDirectories: ['node_modules'],
    extensions: ['', '.js', '.jsx', 'json']
  },
  
  plugins,
  verbose: false,
  // displayModules: false,
  devtool: config.isProduction ? '#source-map' : '#inline-source-map',
  
  module: {
    loaders: [{
      loader: 'babel',
      test: /\.jsx?$/,
      exclude: /(node_modules|bower_components)/,
      cacheDirectory: true
      // config should be in .babelrc
      // query: {
      //   presets: ['es2015', 'stage-1'],
      //   plugins: [
      //     ['transform-runtime', {
      //       "polyfill": false,
      //       "regenerator": true
      //     }],
      //     // 'transform-decorators-legacy'
      //   ]
      // }
    }, {
      test: /\.json/,
      loader: 'json'
    }, {
      test: /\.html$/,
      loader: 'vue-html'
    }, {
      test: /\.vue$/,
      loader: 'vue'
    // }, {
    //   test: /\.html$/,
    //   loader: 'html'
    }],
    vue: {
      html: {
        ignoreCustomFragments: [/\{\{.*?}}/]
      },
    },
    // htmlLoader: {
    //   ignoreCustomFragments: [/\{\{.*?}}/]
    // },
    noParse: [
      ///node_modules/,
      ///jsnetworkx/,
      // /d3\.js/,
      ///vue\.common\.js/,
      /angular\/angular\.js/,
      ///lodash/,
      /bluebird/,
      /dist\/jquery\.js/
    ]
  },
  externals: {
    //lodash: 'window._',
    //jquery: 'window.jQuery',
  },
  // for imports/exports/expose
  resolveLoader: {
    modulesDirectories: ['node_modules'],
    moduleTemplates: ['*-loader', '*'],
    extensions: ['', '.js']
  }
};


// https://github.com/Browsersync/recipes/tree/master/recipes/webpack.monkey-hot-loader
// https://github.com/BrowserSync/recipes/blob/master/recipes/webpack.react-hot-loader
// \tars\tasks\main\dev.js
// \tars\tasks\js\processing.js
// \tars\tasks\js\webpack-processing.js
// \webpack.config.js

module.exports = webpackConfig;
