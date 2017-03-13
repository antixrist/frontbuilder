<template>
  <div v-if="userLogged">
    <transition>
      <router-view></router-view>
    </transition>
  </div>
  <div v-else>
    <login></login>
  </div>
</template>

<script type="text/ecmascript-6">
  import Vue from 'vue';
  import { mapGetters } from 'vuex';
  import { HttpError } from '../factory/http/errors';
  
  /** Общие для всего приложения UI-компоненты */
  Vue.component('modal',        require('./ui/modal/index.vue'));
  Vue.component('check-box',    require('./ui/check-box/index.vue'));
  Vue.component('notification', require('./ui/notifications/notification.vue'));
  
  export default {
    components: {
      login: require('./views/login/index.vue')
    },
    computed: {
      ...mapGetters({
        userLogged: 'account/isLogged'
      })
    },
    created () {
      this.$bus.on('uncaughtException', err => {
        if (err instanceof HttpError) {
          switch (err.code) {
            case 401:
              // 'Авторизуйтесь'
              this.$store.dispatch('account/logout');
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
    }
    
    // todo: показывать нотификации
  };
</script>
