<template src="./tpl.pug" lang="pug"></template>
<style lang="scss" rel="stylesheet/scss"></style>

<script>
  import Vue from 'vue';
  import { mapMutations, mapState } from 'vuex';
  
  Vue.component('tree',            require('../../components/tree/index.vue'));
  Vue.component('projects-tab',    require('../../components/projects-tab/index.vue'));
  Vue.component('contact-list',    require('../../components/contact-list/index.vue'));
  Vue.component('search-block',    require('../../components/search-block/index.vue'));
  Vue.component('layers-checkers', require('../../components/layers-checkers/index.vue'));
  Vue.component('task-details',    require('../../components/task-details/index.vue'));
  Vue.component('create-task',     require('../../components/create-task/index.vue'));
  Vue.component('create-project',  require('../../components/create-project/index.vue'));
  Vue.component('create-contact',  require('../../components/create-contact/index.vue'));

  export default {
    name: 'home',
    computed: {
      ...mapState({
        storeLayout: state => state.layout
      }),
      activeTab: {
        get () {
          return this.storeLayout.activeTab;
        },
        set (activeTab) {
          this.updateLayout({ activeTab });
        },
      },
      sidebarOpened: {
        get () {
          console.log('this.storeLayout.sidebarOpened', this.storeLayout.sidebarOpened);
          return this.storeLayout.sidebarOpened;
        },
        set (sidebarOpened) {
          console.log('sidebarOpened', sidebarOpened);
          this.updateLayout({ sidebarOpened });
        },
      }
    },
    methods: {
      ...mapMutations({
        updateLayout: 'UPDATE_LAYOUT'
      })
    }
  };
</script>
