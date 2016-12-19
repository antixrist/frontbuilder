import _ from 'lodash';
import path from 'path';
import glob from 'glob';
import HtmlPlugin from 'html-webpack-plugin';
import HtmlHarddiskPlugin from 'html-webpack-harddisk-plugin';
import { extractFromConfigSafely } from '../utils';
import * as config from '../../config';
const { pathes, minifyHtml } = config;

export default function (webpackConfig) {
  const { rules, plugins } = extractFromConfigSafely(webpackConfig);
  
  /** todo: проверить - подхватываются ли настройки для html после pug */

  rules.push(
    // { test: /\.txt$/, loader: 'raw-loader' },
    {
      /** обычные `.txt` тоже можно грузить html-loader'лм, чтобы иметь там `require` */
      test: /\.(html?|txt)$/,
      loader: 'html-loader',
      query: {
        /**
         * благодаря опции `interpolate: 'require'` можно делать так:
         * `<div>${require('./components/gallery.html')}</div>`
         */
        interpolate: 'require',
        ignoreCustomFragments: [/\{\{.*?}}/],
        attrs: ['img:src', 'img:data-src', 'link:href'],
        minimize: minifyHtml
      }
    },
    {
      test: /\.(pug|jade)$/,
      loader: [
        /**
         * здесь логика в том, что jade-шаблон сразу будет скомпилен в html,
         * а затем передан в html-лоадер, который зарезолвит подключенные ассеты.
         */
        'html-loader',
        'pug-html-loader?pretty=true'
  
        /** Но. Вместо лоадеров выше можно сделать вот так:
         * `'pug-loader?pretty'`
         * и тогда подключение jade-шаблона будет скопилированно в функцию,
         * которую можно переиспользовать с разными входными данными,
         * а в самих шаблонах, для резолвинга ассетов, можно писать вот так:
         * `div: img(src=require("./my/image.png"))`
         */
      ]
    },
  );


  /**
   * Теперь работаем со страницами
   */

  const PAGES_SOURCES = path.join(
    pathes.source,
    _.get(pathes, 'pages.source') || '.'
  );
  
  /** todo: `webpack-subresource-integrity` */
  
  /** Выдёргиваем файлы страниц и отсеиваем те, названия которых начинаются на `_` */
  const pages = glob.sync(`${PAGES_SOURCES}/!(_)*.@(htm|html|jade|pug|ejs)`);
  
  pages.forEach(function (pagePath) {
    /** https://github.com/jaketrent/html-webpack-template */
    // let template = path.relative(cwd, pagePath);
    let template = pagePath;
    const extname = path.extname(pagePath).slice(1);

    switch (extname) {
      case 'ejs':
      case 'htm':
      case 'html':
        template = `!!ejs-loader!${template}`;
        break;
      case 'pug':
      case 'jade':
        template = `!!pug-loader!${template}`;
        break;
    }

    plugins.push(
      new HtmlPlugin({
        config,
        template,
        filename: path.basename(pagePath, path.extname(pagePath)) + '.html',

        inject: false,
        minify: minifyHtml,

        alwaysWriteToDisk: true,
      })
    );
  });

  plugins.push(
    new HtmlHarddiskPlugin()
  );
};
