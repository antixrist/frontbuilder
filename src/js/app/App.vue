<template>
  <div>
    <notifications :reverse="false"></notifications>
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
  Vue.component('notifications', require('./ui/notifications/index.vue'));
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
        showError: 'messages/error',
      })
    },
    created () {
      this.$bus.on('uncaughtException', err => {
        /**
         * а теперь можно систематизировать и захардкодить ошибки,
         * которые можно будет обрабатывать внутри приложения
         */
        
        if (!!err.HTTP_ERROR) {
          let message;

          switch (err.code) {
            case 401:
              message = 'Авторизуйтесь';
              break;
            case 403:
              message = 'Доступ запрещён';
              break;
            case 404:
              message = 'Запрашиваемый адрес не существует';
              break;
            case 500:
              message = 'Ошибка на сервере';
              break;
            case 800:
              message = 'Объект уже существует';
              break;
            case 422:
              message = 'Ошибка валидации';
              break;
          }

          this.showError({
            title: err.message || message
          });
        } else {
          this.showError({
            title: err.message,
            content: err.stack
          });
        }

        console.error(err);
      });
    },
    async mounted () {
      /**
       * Здесь, по сути, точка входа в рендер приложения.
       *
       * Т.к. доступ не залогиненным пользователям _полностью_ запрещён, то надо
       * показывать форму входа для любого не залогиненного (логично, да).
       *
       * Ситуация в том, что стор может сохранять своё состояние персистентно (в localStorage, например),
       * а может и не сохранять. Это на его усмотрение (например, плагином каким-нибудь).
       * Поэтому, сперва проверяем - залогинен ли юзер. Если да, то всё ок, рендерится `router-view`.
       * А вот если нет (стор пустой) - в localStorage может лежать api_token
       * (мало ли, может юзер просто страницу обновил). А может и не лежать.
       * Поэтому дальше запросим с сервера информацию о юзере.
       * Если api_token есть в localStorage, токен подставится в запрос интерцептером.
       * Если запрос отработает без ошибок и инфа о юзере придёт, то токен валидный, всё ок - рендерится `router-view`.
       * Если ответ пришёл с ошибкой 401 (пользователь не авторизован), значит либо токена нет, либо он не валидный.
       * Все ошибки, кроме 401 выбрасываем наружу, чтобы не показывать глобальный нотис на ошибку авторизации.
       * В итоге отрендерится только форма входа без сообщения об ошибке авторизации
       * (но для остальных ошибок сообщения отобразятся).
       */
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
