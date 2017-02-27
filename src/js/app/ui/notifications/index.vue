<style lang="sass" rel="stylesheet/scss">
  .notifications {
    pointer-events: none;
  }
</style>

<template>
  <div class="notifications">
    <slot name="queue" scope="">
      <span>сообщение от родителя</span>
      <span>{{ props.text }}</span>
    </slot>
  </div>
</template>

<script>
  import Notification from './notification.vue';
  
  const defaults = {};
  
  export default {
    components: { Notification },
    
    props: {
      queue: {
        type: Array,
        default: []
      },
      duration: {
        type: Number,
        default: 0
      },
      type: {
        type: String,
        default: ''
      },
      registerGlobal: {
        type: [ Boolean, String ],
        default: true
      }
    },
    data () {
      return {};
    },
    watch: {  },
    
    computed: {
      length () { return this.queue.length; }
    },
    
    methods: {
      unshift (item) { this.queue.unshift(item); },
      
      push (item) { this.queue.push(item); },
      
      success (item) {
        item.type = 'success';
        this.push(item);
      },

      warning (item) {
        item.type = 'warning';
        this.push(item);
      },

      danger (item) {
        item.type = 'danger';
        this.push(item);
      },
    },
    
    mounted () {

    }
  };
</script>
