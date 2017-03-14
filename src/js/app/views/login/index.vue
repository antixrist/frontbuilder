<template src="./tpl.pug" lang="pug"></template>

<script type="text/ecmascript-6">
  import { mapActions, mapState } from 'vuex';
  
  export default {
    name: 'login',
    data () {
      return {
        username: 'test',
        password: 'B4mGld'
      };
    },
    computed: {
      ...mapState('account', {
        code: state => state.meta.login.code,
        loading: state => state.meta.login.loading,
        failed: state => !state.meta.login.success,
        errors: state => state.meta.login.errors,
        message: state => state.meta.login.message,
      }),
      hasErrors () {
        return Object.keys(this.errors).length;
      },
      showErrors () {
        return this.failed && this.code && !this.loading;
      },
      showMessage () {
        return this.failed && this.message && !this.hasErrors;
      },
    },
    methods: {
      ...mapActions({
        loginAction: 'account/login'
      }),
      allowShowErrorFor (field) {
        return !!this.errors[field];
      },
      async login () {
        try {
          const { username, password } = this;
          await this.loginAction({ username, password });
          this.$router.replace({ name: 'home' });
        } catch (err) { throw err; }
      }
    }
  };
</script>
