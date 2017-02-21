<template>
  <p>Логаутим...</p>
</template>

<script>
  export default {
    data () {
      return {};
    },
    mounted () {
      this.$router.replace('login');
    }
  };
</script>
