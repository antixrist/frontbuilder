<style lang="sass">
  $bg: '../../../img/small.jpg';

  .counter {
    cursor: pointer;
    margin: 100px auto;
    border-radius: 3px;
    width: 200px;
    height: 200px;
    text-align: center;
    line-height: 200px;
    font-size: 5rem;
    box-shadow: inset 0 0 10px #ccc;
    user-select: none;
    background: url($bg) center center / cover #f0f0f0;

    .counter-inner {
      color: red;
    }
  }
</style>

<template lang="pug">
  .counter(@click="$store.dispatch('INCREMENT')")
    .counter-inner.
      {{ count }} sdf
</template>

<script>
  export default {
    computed: {
      count () {
        return this.$store.state.count;
      }
    }
  };
</script>
