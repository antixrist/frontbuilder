<style lang="sass" rel="stylesheet/scss">
  .notifications {
    pointer-events: none;
  
    .notification {
      pointer-events: all;
      
      outline: 1px solid red;
      padding: .5em 1em;
      margin-top: 1em;
      
      &:first-child {
        margin-top: 0;
      }
    }
  }
</style>

<template>
  <div class="notifications">
    <div v-for="item in queue"
         :key="item"
         :class="[`-${item.type}`]"
         class="notification"
    >
      <button v-if="item.closer" @click="close(item)">&times;</button>
      <h3 v-if="item.title" v-html="item.title"></h3>
      <div v-if="item.content" v-html="item.content"></div>
    </div>
  </div>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex';
  
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
    },
    
    mounted () {

    }
  };
</script>
