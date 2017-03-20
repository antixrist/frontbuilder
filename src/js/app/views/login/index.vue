<template src="./tpl.pug" lang="pug"></template>

<script type="text/ecmascript-6">
  import _ from 'lodash';
  import { isDevelopment } from '../../../config';
  import { formErrors } from '../../mixins';
  import { mapActions, mapState, mapMutations } from 'vuex';
  
  export default {
    name: 'login',
    mixins: [ formErrors('formErrors') ],
    data () {
      return {
        loading: false,
        password: ''
      };
    },
    computed: {
      username: {
        get () {
          return this.$store.state.account.loginForm.username;
        },
        set (username) {
          this.updateLoginForm({ username });
        },
      },
    },
    methods: {
      ...mapActions({
        login: 'account/login'
      }),
      ...mapMutations({
        updateLoginForm: 'account/updateLoginForm'
      }),
      async submit () {
        let res;

        try {
          this.resetFormErrors();
          this.loading = true;

          res = await this.login({
            username: this.username,
            password: this.password
          });

          this.loading = false;
        } catch (err) {
          this.loading = false;
          throw err;
        }

        if (res.success) {
          this.close();
          this.resetInStore();
          this.$router.replace({ name: 'home' });
        } else {
          this.setFormErrors(res);
        }
      }
    },
    beforeMount () {
      if (isDevelopment) {
        if (!this.username && !this.password) {
          this.username = 'test';
          this.password = 'B4mGld';
        }
      }
    }
  };
</script>
