<style lang="scss" src="./styles.scss"></style>
<template lang="pug" src="./tpl.pug"></template>

<script>
  export default {
    computed: {
      count () {
        return this.$store.state.count;
      }
    }
  };
</script>
