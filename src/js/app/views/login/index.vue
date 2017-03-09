<template src="./tpl.pug" lang="pug"></template>

<script>
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
          const res = await this.login({ username, password });
//          if (res.success) {
//            this.$router.replace({ name: 'home' });
//          }
        } catch (err) {
          console.log('catch in methods');
//          console.error(err);
        }

        this.loading = false;
      }
    }
  };
</script>
