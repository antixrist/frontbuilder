import * as _ from 'lodash';
import path from 'path';
import webpack from 'webpack';
// import ExtractTextPlugin from 'extract-text-webpack-plugin';
import {entriesFinder} from './utils';

const cwd = process.cwd();
const isProduction = process.env.NODE_ENV == 'production';
const isTesting    = process.env.NODE_ENV == 'testing';

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
  
  // split vendor js into its own file
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    minChunks: function (module, count) {
      // any required modules inside node_modules are extracted to vendor
      return (module.resource &&
              /\.js$/.test(module.resource) &&
              module.resource.indexOf(path.join(cwd, 'node_modules')) === 0
             ) || count >= 2
      ;
    }
  }),

  new webpack.optimize.AggressiveMergingPlugin({
    minSizeReduce: 1.5,
    moveToParents: true
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
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.MinChunkSizePlugin({minChunkSize: 10 * 1024}),
    new webpack.optimize.LimitChunkCountPlugin({maxChunks: 15}),
  );
} else {
  
}

/**
 * @param {string} dirname
 * @returns {string}
 */
function cleanupDirname (dirname) {
  return dirname.replace(/^\.?\//, '').replace(/\/$/, '');
}

// экспортить эти переменные из конфига
let sourcePath = '/markup/';
let destPath = isProduction ? '/build/' : '/dev/';

sourcePath = cleanupDirname(sourcePath);
destPath = cleanupDirname(destPath);

/**
 * todo
 * - завести ассеты в css и style-loader: вставка тега с css-контентом, вставка тега с урлом, конкатенация всех css'ок в одну и всё такая же вставка тега с урлом или контентом;
 * - завести sass/scss, resolve-url-loader и jade/pug->html и минификация html;
 * - postcss с autoprefixer'ом;
 * - настроить сборку для прода;
 * - настроить всё это для vue
 * - сделать нормальный bower/npm/git пакет для antixrist/md-shadows-scss
 *
 * Склонировать `https://github.com/webpack/webpack` и прогнать локально примеры:
 * https://github.com/webpack/webpack/tree/master/examples/common-chunk-and-vendor-chunk
 * https://github.com/webpack/webpack/tree/master/examples/css-bundle
 * https://github.com/webpack/webpack/tree/master/examples/http2-aggressive-splitting
 *
 */

let webpackConfig = {
  entry: entriesFinder.sync(`${sourcePath}/js/!(_*).js`),
  
  output: {
    filename: '[name].js',
    library: '[name]',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    chunkFilename: '[name].[chunkhash:6].js',
    pathinfo: !isProduction,
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
        test:   /\.js$/i,
        loader: 'source-map-loader'
      }
    ],
    loaders:    [
      {
        loader:  'babel?cacheDirectory',
        test:    /\.jsx?$/i,
        exclude: [/node_modules/, /bower_components/]
      }, {
        test:   /\.json$/i,
        loader: 'json'
      }, {
        test:   /\.html$/i,
        loader: 'html'
      }, {
        test:    /\.(jade|pug)$/i,
        loaders: ['html', 'jade-html']
      }, {
        test:    /\.(jpe?g|png|gif|svg)($|\?)/i,
        loaders: [
          `url?limit=${10 * 1024}&name=[path][name].[hash:6].[ext]&context=./${sourcePath}/`,
          'img?config=imagemin'
        ]
      }, {
        test: /\.(eot|woff2?|ttf|otf)($|\?)/i,
        loader: `url?limit=${30 * 1024}&name=[path][name].[hash:6].[ext]&context=./${sourcePath}/`,
      }, {
        // todo: style-loader парит мозги с ассетами. заставить
        test: /\.css($|\?)/i,
        // loader: 'style!css?importLoaders=1&sourceMap'
        loader: 'style!css?importLoaders=1'
      }, {
        // https://github.com/bholloway/resolve-url-loader/
        test: /\.(sass|scss)$/i,
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
