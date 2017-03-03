/** ie8 */
// https://v4-alpha.getbootstrap.com/getting-started/browsers-devices/#supporting-internet-explorer-8
// import 'rem';
// import 'Respond.js';

const nua = navigator.userAgent;

/** todo: flexbox */

/** ie9 */
// Copyright 2014-2015 The Bootstrap Authors
// Copyright 2014-2015 Twitter, Inc.
// Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
// https://v4-alpha.getbootstrap.com/getting-started/browsers-devices/#internet-explorer-10-in-windows-phone-8
if (nua.match(/IEMobile\/10\.0/)) {
  let msViewportStyle = document.createElement('style');
  msViewportStyle.appendChild(document.createTextNode('@-ms-viewport{width:auto!important}'));
  document.head.appendChild(msViewportStyle);
}

// https://v4-alpha.getbootstrap.com/getting-started/browsers-devices/#android-stock-browser
const isAndroid = (nua.indexOf('Mozilla/5.0') > -1 && nua.indexOf('Android ') > -1 && nua.indexOf('AppleWebKit') > -1 && nua.indexOf('Chrome') === -1);
if (isAndroid) {
  /** todo: переписать без jquery */
  // $('select.form-control').removeClass('form-control').css('width', '100%');
}

