import $ from 'jquery';

$(function () {
  $(document).on('click', function () {
    require(['./component', './component/component2'], function (cmp1, cmp2) {
      console.log(cmp1, cmp2);
    });
    console.log('asas');
  });
});
