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
  import _ from 'lodash';
  import Vue from 'vue';
  import { mapState, mapGetters, mapActions } from 'vuex';
  import { isDevelopment } from '../config';
  import { reportError } from '../service/api';

  /** Общие для всего приложения UI-компоненты */
  Vue.component('modal',         require('./ui/modal/index.vue'));
  Vue.component('check-box',     require('./ui/check-box/index.vue'));
  Vue.component('notifications', require('./ui/notifications/index.vue'));

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
        fetchAccountInfo: 'account/fetch',
        logout:           'account/logout',
        showError:        'messages/error',
      }),
      showErrorDebounced: _.debounce(function (msg) {
        this.showError(msg);
      }, 200)
    },
    created () {
      this.$bus.on('uncaughtException', async err => {
        let debounced = false;
        let needReport = true;
        
        let bubble = {
          title: '',
          content: ''
        };

        /** ошибка ajax-запроса */
        if (err.HttpError) {
          bubble.title = 'Ошибка запроса';
          
          /** исходящая ошибка */
          if (err.RequestError) {
            const {
              isTimeout,
              isXhrError,
              isCanceled,
              isBadConnection,
              isBadTransformData,
              isUnknown
            } = err.RequestError;

            if (isTimeout) {
              needReport = false;
              bubble.content = `Истекло время ожидания ответа.
                                Сервер не отвечает или отсутствует соединение с сетью.`;
            }

            if (isXhrError || isBadConnection || isUnknown) {
              needReport = false;
              bubble.content = 'Пожалуйста, проверьте соединение с сетью';
            }

            if (isBadTransformData) {
              bubble.content = `Неправильное преобразование данных запроса.
                                Специалисты уже извещены о проблеме.`;
            }

            if (isCanceled) {
              // запрос отменён пользователем
              bubble = false;
              needReport = false;
            }
          } else
          /** входящая ошибка */
          if (err.ResponseError) {
            const {
              isStatusRejected,
              isMaxContentLengthOverflow
            } = err.ResponseError;

            if (isStatusRejected) {
              needReport = false;
              
              switch (err.code) {
                case 401:
                  bubble.content = 'Пожалуйста, авторизуйтесь';
                  this.logout();
                  break;
                case 403:
                  bubble.content = 'Доступ запрещён';
                  break;
                case 404:
                  bubble.content = 'Запрашиваемый адрес не существует';
                  break;
                default:
                  // если это ошибка сервера
                  if (err.response.is5xx) {
                    if (err.response.canBeRetried) {
                      bubble.content = `Ошибка на стороне сервера.
                                        Пожалуйста, повторите позже`;
                    } else {
                      bubble.content = `Ошибка на стороне сервера.
                                        Специалисты уже извещены о проблеме.`;
                    }
                  }
              }
            }

            if (isMaxContentLengthOverflow) {
              bubble.content = 'Слишком большой ответ от сервера';
            }
          } else
          /** сервер вернул невалидный json */
          if (err.isInvalidApiResponseBody) {
            bubble.content = `Сервер вернул неверные данные.
                              Специалисты уже извещены о проблеме.`;
          }
          /** что-то непонятное с запросом */
          else {
            debounced = true;
            bubble.content = `Возможно отсутствует соединение с сетью.
                              Специалисты уже извещены о проблеме.`;
          }
        }
        // это не ajax-ошибка, а что-то внутреннее
        else {
          
          bubble.title = 'Ошибка приложения';
          
          // это кастомные ошибки через assert, с нормальными сообщениями
          if (err.isAssertFailed) {
            bubble.content = err.message;
          }
          /** что-то поломалось внутри */
          else {
            debounced = true;
            bubble.content = `Специалисты уже извещены о проблеме`;
          }
        }

        bubble && this[debounced ? 'showErrorDebounced' : 'showError'](bubble);

        console.error(err);

        // если у нас продакшн и это не ошибка сети
        if (!isDevelopment && needReport) {
          // то отправим её на сервер
          await reportError({ err });
        }
      });
    },
    beforeMount () {
      this.fetchAccountInfo().catch(err => {
        /**
         * если юзер не был авторизован, то ничего страшного,
         * просто скроется лоадер и останется форма входа
         */
        if (err.code != 401) { throw err; }
      });
    },
  };
</script>
