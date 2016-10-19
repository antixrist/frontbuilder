import * as _ from 'lodash';
import path from 'path';
import webpack from 'webpack';
// import ExtractTextPlugin from 'extract-text-webpack-plugin';
import {entriesFinder} from './utils';

const cwd = process.cwd();
const isProduction = process.env.NODE_ENV == 'production';

let plugins = [
  // new ExtractTextPlugin('[name].css', {allChunks: true}),
  new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/), // fix for moment
  new webpack.NoErrorsPlugin(),
  new webpack.DefinePlugin({
    'IS_PRODUCTION': isProduction,
    'CWD': JSON.stringify(cwd),
    'process.env': _.keys(process.env).reduce((obj, key) => {
      obj[key] = JSON.stringify(process.env[key]);
    
      return obj;
    }, {})
  }),
  new webpack.optimize.CommonsChunkPlugin({
    name: 'common',
    children: true,
    minChunks: 2
  })
];

if (isProduction) {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        drop_console: true,
        drop_debugger: true
      },
      mangle: false,
      compressor: {
        warnings: false
      }
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
  );
} else {
  
}

const destPath = isProduction ? 'build' : 'dev';

let webpackConfig = {
  entry: entriesFinder.sync('markup/js/!(_*).js'),
  
  output: {
    filename: '[name].js',
    library: '[name]',
    chunkFilename: '[name].js?[chunkhash]',
    // hotUpdateChunkFilename: '[name].hot-update.js?[hash]',
    path: path.join(cwd, `/${destPath}/js/`),
    publicPath: './js/',
    hotPublicPath: '/js/'
  },
  
  resolve: {
    modulesDirectories: ['node_modules'],
    extensions: ['', '.js', '.jsx', '.json', '.vue', '.scss', '.sass', '.css', '.less', '.jade', '.pug', '.html'],
    alias: {vue: 'vue/dist/vue.js'}
  },
  
  plugins,
  verbose: false,
  // displayModules: false,
  debug: !isProduction,
  devtool: isProduction ? '#source-map' : '#inline-source-map',
  
  module: {
    preLoaders: [
      {
        test:   /\.js$/,
        loader: 'source-map-loader'
      }
    ],
    loaders:    [
      {
        loader:  'babel?cacheDirectory',
        test:    /\.jsx?$/,
        exclude: [/node_modules/, /bower_components/]
      }, {
        test:   /\.json$/,
        loader: 'json'
      }, {
        test:   /\.html$/,
        loader: 'html'
      }, {
        test:    /\.(jade|pug)$/,
        loaders: ['html', 'jade-html']
      }, {
        test:    /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          `url?limit=${10 * 1024}&name=i/[name]-[hash].[ext]&context=./markup/`, // &context=./markup/
          'img?config=imagemin'
        ]
      }, {
        test: /\.(eot|woff2?|ttf|otf)(\?.*)?$/,
        loader: 'url',
        query: {
          limit: 30 * 1024, // 30 Kb
          name: 'fonts/[name]-[hash].[ext]',
        }
      }, {
        // todo: style-loader парит мозги с ассетами. заставить
        test: /\.css$/,
        loader: 'style!css?importLoaders=1&sourceMap'
      }, {
        // https://github.com/bholloway/resolve-url-loader/
        test: /\.(sass|scss)$/,
        loader: 'style!css?sourceMap!sass'
      }
    ],
    noParse:    [
      // /moment/,
      // /bluebird/,
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
  
  htmlLoader: {
    ignoreCustomFragments: [/\{\{.*?}}/],
  
    minimize: isProduction,
    // minimize options:
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    removeAttributeQuotes: false,
    removeComments: true,
    removeEmptyAttributes: false,
    removeRedundantAttributes: false,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true
  },
  
  sassLoader: {
    sourceMap:         true,
    sourceMapContents: true,
    sourceMapEmbed:    !isProduction,
    precision:         10,
    quiet:             true,
    includePaths:      ['node_modules'],
    importer:          require('node-sass-import-once'),
    importOnce:        {
      index: true,
      css:   true,
      bower: true
    }
  },
  
  imagemin: {
    minimize: isProduction,
    gifsicle: { interlaced: true },
    jpegtran: {
      progressive: true,
      arithmetic: false
    },
    optipng: { optimizationLevel: 5 },
    pngquant: {
      floyd: 0.5,
      speed: 2
    },
    svgo: {
      plugins: [
        { removeTitle: true },
        { convertPathData: false }
      ]
    }
  },
  
  // for imports/exports/expose
  resolveLoader: {
    modulesDirectories: ['node_modules'],
    moduleTemplates: ['*-loader', '*'],
    extensions: ['', '.js']
  }
};

export default webpackConfig;
