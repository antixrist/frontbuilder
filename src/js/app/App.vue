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

<script>
  import Vue from 'vue';
  import { mapGetters } from 'vuex';
  
  /** Общие для всего приложения UI-компоненты */
  Vue.component('modal',     require('./ui/modal/index.vue'));
  Vue.component('check-box', require('./ui/check-box/index.vue'));
  
  export default {
    components: {
      login: require('./views/login/index.vue')
    },
    computed: {
      ...mapGetters('account', {
        userLogged: 'isLogged'
      })
    }
  };
</script>
