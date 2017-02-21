<template src="./tpl.pug" lang="pug"></template>

<script>
  export default {
    data () {
      return {
        loading: false
      };
    },
    methods: {
      loginTry () {
        this.loading = true;
        
      }
    }
  };
</script>
