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
  
  export default {
    components: { Notification },
    
    props: {
      duration: {
        type: Number,
        default: 0
      },
      type: {
        type: String,
        default: ''
      },
    },
    data () {
      return {
        queue: [],
        showed: false,
        active: false
      };
    },
    watch: {  },
    
    computed: {
      length () { return this.queue.length; }
    },
    
    methods: {
      push () {
        
      },

      unshift () {
        
      },
    },
    
    mounted () {

    }
  };
</script>
