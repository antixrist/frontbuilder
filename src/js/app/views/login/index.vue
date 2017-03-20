<template src="./tpl.pug" lang="pug"></template>

<script type="text/ecmascript-6">
  import _ from 'lodash';
  import { isDevelopment } from '../../../config';
  import { mapActions, mapState, mapMutations } from 'vuex';
  
  let wasAttempts = false;
  
  export default {
    name: 'login',
    data () {
      return {
        password: ''
      };
    },
    computed: {
      ...mapState('account', {
        code: state => state.meta.login.code,
        failed: state => !state.meta.login.success,
      }),
      username: {
        get () {
          return this.$store.state.account.loginForm.username;
        },
        set (username) {
          this.updateLoginForm({ username });
        },
      },
      loading () {
        const loading = this.$store.state.account.meta.login.loading;
        return loading && wasAttempts ? loading : false;
      },
      errors () {
        const errors = this.$store.state.account.meta.login.errors;
        return errors && wasAttempts ? errors : {};
      },
      message () {
        const message = this.$store.state.account.meta.login.message;
        return message && wasAttempts ? message : '';
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
      ...mapMutations({
        updateLoginForm: 'account/updateLoginForm',
        resetLoginStatus: 'account/resetLoginStatus'
      }),
      allowShowErrorFor (field) {
        return !!this.errors[field];
      },
      async login () {
        wasAttempts = true;
        const { username, password } = this;
        await this.loginAction({ username, password });
        this.$router.replace({ name: 'home' });
      }
    },
    beforeMount () {
      if (isDevelopment) {
        if (!this.username && !this.password) {
          this.username = 'test';
          this.password = 'B4mGld';
        }
      }
    },
    beforeDestroy () {
      wasAttempts = false;
      this.resetLoginStatus();
    }
  };
</script>
