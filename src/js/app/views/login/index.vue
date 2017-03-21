<template src="./tpl.pug" lang="pug"></template>

<script type="text/ecmascript-6">
  import _ from 'lodash';
  import { isDevelopment } from '../../../config';
  import { formErrors, mapStateToData } from '../../mixins';
  import { mapActions, mapState, mapMutations } from 'vuex';
  
  export default {
    name: 'login',
    mixins: [
      mapStateToData({ form: 'account.loginForm' }),
      formErrors('formErrors')
    ],
    data () {
      return {
        loading: false,
      };
    },
    watch: {
      form: {
        deep: true,
        handler (form) {
          this.setLoginFormData(form);
        }
      },
    },
    methods: {
      ...mapActions({
        loginAction: 'account/login',
        fetchUser: 'account/fetch',
      }),
      ...mapMutations({
        resetLoginForm: 'account/RESET_LOGIN_FORM',
        setLoginFormData: 'account/SET_LOGIN_FORM_DATA',
      }),
      async submit () {
        let res;

        try {
          this.resetFormErrors();
          this.loading = true;
          
          res = await this.loginAction(this.form);
          
          this.loading = false;
        } catch (err) {
          this.loading = false;
          throw err;
        }
        
        if (res.success) {
          this.resetLoginForm();
          
          this.$router.replace({ name: 'home' });
        } else {
          this.setFormErrors(res);
        }
      }
    },
    beforeMount () {
      if (isDevelopment) {
        if (!this.form.login && !this.form.password) {
          this.form.login = 'test';
          this.form.password = 'B4mGld';
        }
      }
    }
  };
</script>
