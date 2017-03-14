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
        loading: state => { console.log('state.meta.status', state.meta.status); return state.meta.status == 'progress' },
        hasErrors: state => state.meta.status == 'error',
        message: state => state.meta.message,
        errors: state => state.meta.errors
      }),
//      showFieldsError () {
//        return !this.loading && this.hasErrors;
//      }
    },
    methods: {
      ...mapActions({
        loginAction: 'account/login'
      }),
      allowShowErrorFor (field) {
        return true;
        return this.showFieldsError && !!this.errors[field];
      },
      async login () {
        try {
          const { username, password } = this;
          await this.loginAction({ username, password });
          this.$router.replace({ name: 'home' });
        } catch (err) {
//          throw err;
        }
      }
    }
  };
</script>
