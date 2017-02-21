<template>
  <transition>
    <router-view></router-view>
  </transition>
</template>

<script>
  import Vue from 'vue';
  /** Общие для всего приложения UI-компоненты */
  Vue.component('modal',     require('./ui/modal/index.vue'));
  Vue.component('check-box', require('./ui/check-box/index.vue'));

  export default {  };
</script>
