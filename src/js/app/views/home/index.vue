<template src="./tpl.pug" lang="pug"></template>
<style lang="scss" rel="stylesheet/scss"></style>

<script>
  import Vue from 'vue';
  import { mapStateToData } from '../../mixins';
  import { mapMutations, mapState, mapActions } from 'vuex';
  
  Vue.component('tree',            require('../../components/tree/index.vue'));
  Vue.component('projects-tab',    require('../../components/projects-tab/index.vue'));
  Vue.component('contact-list',    require('../../components/contact-list/index.vue'));
  Vue.component('search-block',    require('../../components/search-block/index.vue'));
  Vue.component('layers-checkers', require('../../components/layers-checkers/index.vue'));
  Vue.component('task-details',    require('../../components/task-details/index.vue'));
  Vue.component('project-form-create', require('../../components/project-form/create.vue'));
  Vue.component('project-form-edit', require('../../components/project-form/edit.vue'));
  
  Vue.component('create-task',     require('../../components/create-task/index.vue'));
  Vue.component('edit-task',       require('../../components/edit-task/index.vue'));
  Vue.component('create-contact',  require('../../components/create-contact/index.vue'));

  export default {
    name: 'home',
    computed: {
      ...mapState({
        layout: state => state.layout
      }),
      activeTab: {
        get () {
          return this.layout.activeTab;
        },
        set (activeTab) {
          this.activateTab(activeTab);
        },
      },
      sidebarOpened: {
        get () {
          return this.layout.sidebarOpened;
        },
        set (opened) {
          this.toggleSidebar(opened);
        },
      }
    },
    methods: {
      ...mapActions([ 'activateTab', 'toggleSidebar', 'toggleModal' ]),
      ...mapMutations({
        updateLayout: 'UPDATE_LAYOUT'
      }),
      modalOpened (name) {
        return !!this.layout.modals[name];
      }
    }
  };
</script>
