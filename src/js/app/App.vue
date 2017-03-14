<template>
  <div>
    <div v-if="!userLogged || loading">
      <modal>
        <login class="is-loading-block" :class="{ '-loading': loading }"></login>
      </modal>
    </div>
    <div v-else>
      <transition>
        <router-view></router-view>
      </transition>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import Vue from 'vue';
  import { mapState, mapGetters, mapActions } from 'vuex';
  import { HttpError } from '../factory/http/errors';
  
  /** Общие для всего приложения UI-компоненты */
  Vue.component('modal',        require('./ui/modal/index.vue'));
  Vue.component('check-box',    require('./ui/check-box/index.vue'));
  Vue.component('notification', require('./ui/notifications/notification.vue'));
  Vue.directive('focus', {
    inserted (el) { el.focus(); }
  });
  
  export default {
    components: {
      login: require('./views/login/index.vue')
    },
    computed: {
      ...mapState('account', {
        loading: state => state.meta.fetch.loading,
        failed: state => !state.meta.fetch.success,
        errors: state => state.meta.fetch.errors,
        message: state => state.meta.login.message,
      }),
      ...mapGetters({
        userLogged: 'account/isLogged'
      }),
    },
    methods: {
      ...mapActions({
        fetchUser: 'account/fetch',
        logout: 'account/logout',
      })
    },
    created () {
      // todo: показывать нотификации
      this.$bus.on('uncaughtException', err => {
        /**
         * а теперь можно систематизировать и захардкодить ошибки,
         * которые можно будет обрабатывать внутри приложения
         */
        if (err instanceof HttpError) {
          switch (err.code) {
            case 401:
              // 'Авторизуйтесь'
//              this.$store.
              this.logout();
              break;
            case 403:
              // 'Доступ запрещён'
              break;
            case 404:
              // 'Запрашиваемый адрес не существует'
              break;
            case 500:
              // 'Ошибка на сервере'
              break;
            case 800: // объект уже существует
              break;
            case 422: // ошибка валидации
              break;
          }
        }
      });
    },
    async mounted () {
      if (!this.userLogged) {
        try {
          await this.fetchUser();
        } catch (err) {
          if (err.code != 401) { throw err; }
        }
      }
    },

  };
</script>
