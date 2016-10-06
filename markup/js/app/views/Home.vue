<!--
<template>
  <div class="page">
    <h1>Home</h1>
    <p>
      <a href="#"
         @click.prevent="enabled = !enabled"
      >Toggle</a>
    </p>
    <div v-show="enabled">
      <counter></counter>
    </div>
  </div>
</template>
-->

<style lang="sass">
  /*@import '../../../../bower_components/font-awesome/css/font-awesome.css';*/
  .page {
    outline: 1px solid red;

    .asd {

    }
  }
</style>

<template lang="pug">
  .page
    p: img(src='../../../images/felix.png')
    p: a(href="#", @click.prevent="enabled = !enabled") Toggle #[i.fa.fa-user]
    div(v-show="enabled"): counter
</template>

<script>
  import Counter from '../components/Counter';

  export default {
    components: {
      Counter
    },
    data () {
      return {
        enabled: false
      };
    }
  }
</script>
