<template>
  <div class="page">
    <h1>HomeAnother</h1>
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
