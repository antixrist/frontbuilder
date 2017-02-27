<style lang="sass" rel="stylesheet/scss">
  .notification {
    pointer-events: all;
  }
</style>

<template>
  <div v-if="showed" class="notification">
    <slot :title="title" :content="content" :closer="closer" :close="close">
      <slot name="closer">
        <button v-if="closer" type="button" @click="close">&times;</button>
      </slot>
      <slot name="title">
        <div v-if="title" v-html="title"></div>
      </slot>
      <slot name="content">
        <div v-if="content" v-html="content"></div>
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
        showed: true,
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
        this.showed = true;
        this.$emit('open', this);
      },
      
      close () {
        this.showed = false;
        this.timer && clearTimeout(this.timer);
        this.$emit('close', this);
      }
    }
  };
</script>
