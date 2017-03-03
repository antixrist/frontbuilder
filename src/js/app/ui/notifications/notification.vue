<style lang="sass" rel="stylesheet/scss">
  .notification {
    pointer-events: all;
  }
</style>

<template>
  <div class="alert">
    <slot :content="content" :close="close">
      <slot name="closer">
        <button type="button" @click="close">&times;</button>
      </slot>
      <slot name="content">
        <h3 v-if="content.title" v-html="content.title"></h3>
        <div v-if="content.text" v-html="content.text"></div>
      </slot>
    </slot>
  </div>
</template>

<script>
  export default {
    props: {
      title: {
        type: String,
        default: ''
      },
      content: {
        type: String,
        default: ''
      },
      duration: {
        type: Number,
        default: 0
      },
      type: {
        type: String,
        default: ''
      },
      closer: {
        type: Boolean,
        default: true
      },
    },
    data () {
      return {
        timer: 0
      };
    },
    mounted () {
      if (this.duration) {
        this.timer = setTimeout(() => this.close(), this.duration);
      }
    },
    methods: {
      open () {
        this.$emit('open', this);
      },
      
      close () {
        this.timer && clearTimeout(this.timer);
        this.$emit('close', this);
      }
    }
  };
</script>
