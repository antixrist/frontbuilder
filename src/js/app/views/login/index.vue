<template src="./tpl.pug" lang="pug"></template>

<script type="text/ecmascript-6">
  import { isDevelopment } from '../../../config';
  import { mapActions, mapState } from 'vuex';
  
  let wasAttempts = false;
  
  export default {
    name: 'login',
    data () {
      return isDevelopment ? {
        username: 'test',
        password: 'B4mGld',
      } : {};
    },
    computed: {
      ...mapState('account', {
        loadingFromState: state => state.meta.login.loading,
        code: state => state.meta.login.code,
        failed: state => !state.meta.login.success,
        errors: state => state.meta.login.errors,
        message: state => state.meta.login.message,
      }),
      loading () {
        return this.loadingFromState && wasAttempts;
      },
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
          wasAttempts = true;
          const { username, password } = this;
          await this.loginAction({ username, password });
          this.$router.replace({ name: 'home' });
        } catch (err) { throw err; }
      }
    }
  };
</script>
