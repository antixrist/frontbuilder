/**
 * `postcss-loader` автоматом подсосёт этот конфиг.
 * а для `vue-loader`а - придётся подключать его вручную.
 */

const { isDevelopment, browsers } = require('./tools/config');

module.exports = function (ctx) {
  const plugins = [];
  const fallbacks = [
    require('postcss-color-rgba-fallback')({
      properties:      [
        'background-color',
        'background',
        'color',
        'border',
        'border-color',
        'outline',
        'outline-color'
      ],
      oldie:           true,
      backgroundColor: [255, 255, 255]
    }),
    require('postcss-gradient-transparency-fix'),
    require('postcss-single-charset')(),
    require('postcss-will-change'),
    require('pixrem')({
      // `pixrem` tries to get the root font-size from CSS (html or :root) and overrides this option
      rootValue:     '16px',
      replace:       false,
      atrules:       true,
      browsers:      browsers,
      unitPrecision: 10
    }),
    require('postcss-pseudoelements')({
      selectors: ['before', 'after', 'first-letter', 'first-line']
    }),
    require('postcss-vmin'),
    require('postcss-opacity'),
    require('postcss-filter-gradient'),
    require('postcss-input-style'),
    require('postcss-unroot')({
      method: 'copy'
    }),
  ];

  plugins.push(
    require('postcss-pseudo-content-insert'),
    // require('postcss-focus'),
    require('postcss-single-charset')(),
    require('postcss-easings')({
      easings: require('postcss-easings').easings
    }),
    require('postcss-unprefix')(),
    require('postcss-flexboxfixer')(),
    require('postcss-gradientfixer')(),
    require('postcss-flexbugs-fixes')()
  );

  if (isDevelopment) {

  } else {
    /** todo: `oldie` - с этим плагином надо генерировать отдельный файл для старых ишаков */
    plugins.push(
      ...fallbacks,
      /** `unprefix`, `flexboxfixer` и `gradientfixer` надо подключать до `autoprefixer` */
      require('autoprefixer')({
        browsers,
        cascade: false,
        remove:  true
      })
    );
  }

  return { plugins };
};
