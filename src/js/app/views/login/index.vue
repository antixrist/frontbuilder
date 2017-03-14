<template src="./tpl.pug" lang="pug"></template>

<script type="text/ecmascript-6">
  import { mapActions, mapState } from 'vuex';
  
  export default {
    name: 'login',
    data () {
      return {
        username: 'test',
        password: 'B4mGlds'
      };
    },
    computed: {
      ...mapState('account', {
        loading: state => state.meta.status == 'progress',
        failed: state => state.meta.status == 'error',
        hasErrors: state => !!state.meta.errors,
        message: state => state.meta.message,
        errors: state => state.meta.errors
      }),
      showFieldsError () {
        return this.failed && this.hasErrors;
      }
    },
    methods: {
      ...mapActions({
        loginAction: 'account/login'
      }),
      allowShowErrorFor (field) {
        return this.showFieldsError && !!this.errors[field];
      },
      async login () {
        try {
          const { username, password } = this;
          await this.loginAction({ username, password });
          this.$router.replace({ name: 'home' });
        } catch (err) {
          console.log('catch in method');
          throw err;
        }
      }
    }
  };
</script>
