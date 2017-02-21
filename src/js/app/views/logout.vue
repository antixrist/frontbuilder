<template></template>

<script>
  import { mapActions } from 'vuex';
  
  export default {
    name: 'logout',
    data () {
      return {  };
    },
    methods: {
      ...mapActions('account', ['logout'])
    },
    async mounted () {
      await this.logout();

      this.$router.push({ name: 'home' });
    }
  };
</script>
