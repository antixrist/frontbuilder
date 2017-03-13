<template src="./tpl.pug" lang="pug"></template>

<script type="text/ecmascript-6">
  import { mapActions } from 'vuex';
  
  export default {
    name: 'login',
    data () {
      return {
        loading: false,
        username: 'test',
        password: 'B4mGld'
      };
    },
    methods: {
      ...mapActions({
        login: 'account/login'
      }),
      async loginTry () {
        this.loading = true;

        try {
          const { username, password } = this;
          await this.login({ username, password });
          this.$router.replace({ name: 'home' });
        } catch (err) {
          console.log('catch in methods', err);
          throw err;
        }

        this.loading = false;
      }
    }
  };
</script>
