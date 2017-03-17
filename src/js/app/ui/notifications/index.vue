<style lang="scss" rel="stylesheet/scss">
  .notification {
    $tr: .3s ease-out;
    
    &-enter-active,
    &-leave-active {
      transition: opacity $tr, transform $tr;
    }
    &-enter,
    &-leave-to {
      opacity: 0;
      transform: translateX(100%);
    }
  }
</style>

<template>
  <transition-group name="notification" tag="div" class="notifications">
    <div v-for="item in queue"
         :key="item"
         :class="[`-${item.type}`]"
         class="notification"
    >
      <div class="closer"
           v-if="item.closer"
           @click="close(item)"
      ><i class="i -notification-times"></i></div>
      
      <div class="content">
        <h3 v-if="item.title" v-html="item.title"></h3>
        <div v-if="item.content" v-html="item.content"></div>
      </div>
    </div>
  </transition-group>
</template>

<script>
  import { mapActions, mapGetters, mapMutations } from 'vuex';
  
  export default {
    
    props: {
      reverse: {
        type: [Number, Boolean],
        default: false,
      }
    },
    
    computed: {
      order () {
        return !this.reverse ? 'asc' : 'desc';
      },
      queue () {
        return this.$store.getters[`messages/${this.order}`];
      },
      length () { return this.queue.length; }
    },
    
    methods: {
      ...mapActions('messages', ['close']),
      ...mapMutations({
        reset: 'messages/reset_list'
      }),
    },
    
    beforeMount () {
      this.reset();
    }
  };
</script>
