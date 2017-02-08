<template src="./tpl.pug" lang="pug"></template>
<style lang="scss" rel="stylesheet/scss"></style>

<script>
  import projectsList from './components/projects-list/index.vue';
  import contactList from './components/contact-list/index.vue';
  import searchBlock from './components/search-block/index.vue';
  import layersCheckers from './components/layers-checkers/index.vue';
  import taskDetails from './components/task-details/index.vue';
  import createTask from './components/create-task/index.vue';
  import createContact from './components/create-contact/index.vue';
  
  export default {
    components: {
      'projects-list': projectsList,
      'contact-list': contactList,
      'search-block': searchBlock,
      'layers-checkers': layersCheckers,
      'task-details': taskDetails,
      'create-task': createTask,
      'create-contact': createContact
    },
    data () {
      return {
        layout: {
          leftSideOpened: true,
          activeSidebar: 'projects'
        }
      };
    }
  };
</script>
