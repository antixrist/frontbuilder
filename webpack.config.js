

// new webpack.ProvidePlugin({
//   'Promise': 'bluebird'
// }),

// babel-plugin-syntax-async-functions
// //babel-plugin-transform-async-to-generator
// babel-plugin-transform-regenerator

// {
//   test: /\.jsx?$/,
//   exclude: /(node_modules|bower_components)/,
//   loader: 'babel',
//     query: {
//     cacheDirectory: true
//   }
// }

const {_keys}  = require('lodash');
const config   = require('./config');
const path     = require('path');
const webpack  = require('webpack');

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
  
  verbose: false,
  // displayModules: false,
  devtool: !config.isProduction ? '#module-cheap-inline-source-map' : '#source-map',
  plugins: [],
  
  module: {
    loaders: [{
      loader: 'babel',
      test: /\.js$/,
      exclude: /(node_modules)/,
      query: {
        presets: ['es2015', 'stage-1'],
        plugins: [
          ['transform-runtime', {
            "polyfill": false,
            "regenerator": true
          }],
          'transform-decorators-legacy'
        ]
      }
    }, {
      test: /\.html$/,
      loader: 'vue-html'
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
      ///faker\/lib\/locales/,
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



/*
 new webpack.optimize.OccurenceOrderPlugin(),
 // new webpack.HotModuleReplacementPlugin(),
 // new webpack.NoErrorsPlugin(),
 
 //new webpack.IgnorePlugin(/jsnetworkx/),
 //new webpack.NoErrorsPlugin(),
 // new webpack.EnvironmentPlugin(Object.keys(process.env)),
 new webpack.DefinePlugin(_keys(config).reduce((obj, key) => {
 obj[key] = JSON.stringify(config[key]);
 
 return obj;
 }, {})),
 new webpack.optimize.CommonsChunkPlugin({
 name: 'common',
 children: true,
 minChunks: 2
 }),
 new webpack.optimize.UglifyJsPlugin({
 compressor: {
 warnings: false
 }
 }),

*/

module.exports = webpackConfig;
