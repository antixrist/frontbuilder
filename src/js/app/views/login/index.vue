<template src="./tpl.pug" lang="pug"></template>

<script>
  import { mapActions } from 'vuex';
  
  export default {
    name: 'login',
    data () {
      return {
        loading: false,
        login: 'test',
        password: 'B4mGld'
      };
    },
    methods: {
      ...mapActions({
        loginAction: 'account/login'
      }),
      async loginTry () {
        this.loading = true;

        try {
          const { login, password } = this;
          const res = await this.loginAction({ login, password });
          if (res.success) {
            this.$router.replace({ name: 'home' });
          }
        } catch (err) {
          console.error(err);
        }

        this.loading = false;
      }
    }
  };
</script>
