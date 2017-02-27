<template lang="pug" src="./tpl.pug"></template>

<script type="text/babel">
  import { mapActions } from 'vuex';
  
  export default {
    name: 'logout',
    data () {
      return {  };
    },
    methods: {
      ...mapActions({ logout: 'account/logout' })
    },
    async mounted () {
      await this.logout();
      this.$router.push({ name: 'home' });
    }
  };
</script>
