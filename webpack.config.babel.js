// babel-plugin-syntax-async-functions
// //babel-plugin-transform-async-to-generator
// babel-plugin-transform-regenerator

import {keys, assign, get} from 'lodash';
import config from './config';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

let plugins = [
  new webpack.NoErrorsPlugin(),
  new webpack.DefinePlugin(config.webpack.frontendConstants || {}),
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
} else {

}

let webpackConfig = {
  entry: config.webpack.entry,

  output: {
    filename: '[name].js',
    library: '[name]',
    chunkFilename: '[hash].js',
    path: config.webpack.outputPath,
    publicPath: config.webpack.outputPublicPath
  },
  
  resolve: {
    modulesDirectories: ['node_modules'],
    extensions: ['', '.js', '.jsx', '.json', '.vue', '.scss', '.sass', '.less', '.jade', '.pug', '.html'],
    alias: {vue: 'vue/dist/vue.js'}
  },
  
  plugins,
  verbose: false,
  // displayModules: false,
  debug: config.isProduction,
  devtool: config.isProduction ? '#source-map' : '#inline-source-map',
  watch: false, // will set automated
  watchOptions: config.webpack.watchOptions || {},

  module: {
    preLoaders: [{
      test: /\.js$/,
      loader: 'source-map-loader'
    }],
    loaders: [{
      loader: 'babel?cacheDirectory',
      test: /\.jsx?$/,
      exclude: [/node_modules/, /bower_components/]
    }, {
      test: /\.json/,
      loader: 'json'
    }, {
      test: /\.html$/,
      loader: 'vue-html',
      attrs: false
    }, {
      test: /\.vue$/,
      loader: 'vue'
    // }, {
    //   test: /\.html$/,
    //   loader: 'html'
    }],
    vue: {
      loaders: {
        css:  ExtractTextPlugin.extract('css'),
        less: ExtractTextPlugin.extract('css!less'),
        sass: ExtractTextPlugin.extract('css!sass'),
      },
      sassLoader: {
        precision:    10,
        quiet:        true,
        includePaths: ['node_modules'],
        importer:     require('node-sass-import-once'),
        importOnce:   {
          index: true,
          css:   true,
          bower: true
        }
      },
      postcss: {
        plugins: [
          // require('postcss-cssnext')()
        ],
        options: {}
      },
      html: {
        // https://github.com/vuejs/vue-loader/blob/master/lib/template-compiler.js#L10
        attrs: false,
        ignoreCustomFragments: [/\{\{.*?}}/],
      },
      htmlLoader: {
        attrs: false,
        ignoreCustomFragments: [/\{\{.*?}}/],
      }
    },
    htmlLoader: {
      attrs: false,
      ignoreCustomFragments: [/\{\{.*?}}/],

      minimize: true,
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      removeAttributeQuotes: false,
      removeComments: true,
      removeEmptyAttributes: false,
      removeRedundantAttributes: false,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    },
    // htmlLoader: {
    //   ignoreCustomFragments: [/\{\{.*?}}/]
    // },
    noParse: config.webpack.noParse || []
  },
  externals: config.webpack.noParse || {},
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
