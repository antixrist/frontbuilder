// babel-plugin-syntax-async-functions
// //babel-plugin-transform-async-to-generator
// babel-plugin-transform-regenerator

import {keys, assign, get, omit} from 'lodash';
import config from './config';
import webpack from 'webpack';

let constants = keys(config).reduce((obj, key) => {
  obj[key] = JSON.stringify(config[key]);
  
  return obj;
}, {});


constants = omit(constants, ['browserSync', 'webpack']);
constants['process.env'] = keys(process.env).reduce((obj, key) => {
  obj[key] = JSON.stringify(process.env[key]);

  return obj;
}, {});

let plugins = [
  new webpack.NoErrorsPlugin(),
  new webpack.DefinePlugin(constants),
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.optimize.CommonsChunkPlugin({
    name: config.webpack.commonChunkName,
    children: true,
    minChunks: 2
  })
];

if (config.isProduction) {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        drop_console: config.isProduction,
        drop_debugger: config.isProduction
      },
      mangle: false,
      compressor: {
        warnings: false
      }
    }),
  );
}

console.log('config.webpack.entry', config.webpack.entry);

let webpackConfig = {
  entry: config.webpack.entry,

  output: {
    filename: '[name].js',
    library: '[name]',
    chunkFilename: '[id].js',
    path: config.webpack.outputPath,
    publicPath: config.webpack.outputPublicPath
  },
  
  resolve: {
    modulesDirectories: ['node_modules'],
    extensions: ['', '.js', '.jsx', 'json']
  },
  
  plugins,
  verbose: false,
  // displayModules: false,
  debug: config.isProduction,
  devtool: config.isProduction ? '#source-map' : '#inline-source-map',

  module: {
    preLoaders: [{
      test: /\.js$/,
      loader: 'source-map-loader'
    }],
    loaders: [{
      loader: 'babel',
      test: /\.jsx?$/,
      exclude: [/node_modules/, /bower_components/],
      cacheDirectory: true
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
      /bluebird/,
      /\/core-js\//,
      ///node_modules/,
      ///jsnetworkx/,
      // /d3\.js/,
      ///vue\.common\.js/,
      // /angular\/angular\.js/,
      // /lodash/,
      // /dist\/jquery\.js/
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
