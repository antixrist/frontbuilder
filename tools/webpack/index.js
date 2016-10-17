import {keys, assign, get} from 'lodash';
import config from '../config';
import webpack from 'webpack';

// import ExtractTextPlugin from 'extract-text-webpack-plugin';
// const cwd = process.cwd();

let plugins = [
  // new ExtractTextPlugin('[name].css', {allChunks: true}),
  new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/), // fix for moment
  new webpack.NoErrorsPlugin(),
  new webpack.DefinePlugin(config.webpack.frontendConstants || {}),
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
    new webpack.optimize.OccurenceOrderPlugin(),
  );
} else {

}

// todo: изучить, взять необходимое
// https://github.com/Litor/ubase-vue/blob/master/src/apptools/webpack/index.js

// // https://www.npmjs.com/package/style-loader
// https://www.npmjs.com/package/css-loader
// https://www.npmjs.com/package/html-loader
// https://www.npmjs.com/package/img-loader


let webpackConfig = {
  entry: config.webpack.entry,

  output: {
    filename: '[name].js',
    library: '[name]',
    chunkFilename: '[name].js?[chunkhash]',
    // hotUpdateChunkFilename: '[name].hot-update.js?[hash]',
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
  // watch: false, // will set automated
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
      loader: 'vue-html'
    }, {
      // todo: разобраться с подгрузкой jade->html и урлов в тегах (без vue)
      test: /\.jade$/,
      loader: 'jade-html!vue-html'
    }, {
      test: /\.(jpe?g|png|gif|svg)$/i,
      loaders: [
        `url?${config.webpack.setupLoaders.url.qs}`,
        'img?config=imagemin'
      ]
    }, {
      test: /\.vue$/,
      loader: 'vue'
      // }, {
      //   test: /\.html$/,
      //   loader: 'html'
      // }, {
      // https://github.com/bholloway/resolve-url-loader/
      //   test: /\.sass/,
      //   loaders: '['style', 'css', 'sass']
      // }, {
      //   test: /\.(eot|woff|ttf|svg|png|jpg)$/,
      //   loader: 'url-loader?limit=30000&name=[name]-[hash].[ext]'
      // }
    }],
    vue: {
      loaders: {
        // css:  ExtractTextPlugin.extract('css'),
        // less: ExtractTextPlugin.extract('style!css!less'),
        // sass: ExtractTextPlugin.extract('style!css!sass'),
      },
      sassLoader: config.webpack.setupLoaders.sass,
      postcss: {
        plugins: [
          // require('postcss-cssnext')()
        ],
        options: {}
      },
      // todo: разобраться с подгрузкой урлов в тегах.
      // https://github.com/vuejs/vue-loader/blob/master/lib/template-compiler.js#L10
      // https://github.com/vuejs/laravel-elixir-vue-2/blob/master/index.js
      // https://github.com/Litor/ubase-vue/blob/5d41eb6231d9c78bd8b1d26104314cfe532d1712/src/apptools/webpack/webpack.loaders.js#L91-L117
      html: Object.assign({
        minimize: config.isProduction
      }, config.webpack.setupLoaders.html),
    },
    noParse: config.webpack.noParse || []
  },
  externals: config.webpack.externals || {},
  
  sassLoader: config.webpack.setupLoaders.sass, // todo: настроить НЕ через vue
  
  imagemin: config.webpack.setupLoaders.imagemin,
  htmlLoader: Object.assign({
    minimize: config.isProduction
  }, config.webpack.setupLoaders.html),

  // for imports/exports/expose
  resolveLoader: {
    modulesDirectories: ['node_modules'],
    moduleTemplates: ['*-loader', '*'],
    extensions: ['', '.js']
  }
};


// \tars\tasks\main\dev.js
// \tars\tasks\js\processing.js
// \tars\tasks\js\webpack-processing.js
// \webpack.config.js

export default webpackConfig;
