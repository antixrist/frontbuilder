<template src="./tpl.pug" lang="pug"></template>
<style lang="scss" rel="stylesheet/scss"></style>

<script>
  import Vue from 'vue';
  Vue.component('tree',            require('../../components/tree/index.vue'));
  Vue.component('contact-list',    require('../../components/contact-list/index.vue'));
  Vue.component('search-block',    require('../../components/search-block/index.vue'));
  Vue.component('layers-checkers', require('../../components/layers-checkers/index.vue'));
  Vue.component('task-details',    require('../../components/task-details/index.vue'));
  Vue.component('create-task',     require('../../components/create-task/index.vue'));
  Vue.component('create-project',  require('../../components/create-project/index.vue'));
  Vue.component('create-contact',  require('../../components/create-contact/index.vue'));

  export default {
    name: 'home',
    data () {
      return {
        layout: {
          leftSideOpened: true,
          activeSidebar: 'tree'
        }
      };
    }
  };
</script>
