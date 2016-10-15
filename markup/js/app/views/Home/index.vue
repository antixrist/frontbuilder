<template>
  <div class="page">
    <h1>Home</h1>
    <!--<p><img src="../../../../images/felix.png"></p>-->
    <p>
      <a href="#"
         @click.prevent="enabled = !enabled"
      >Toggle, ёпта</a>
    </p>
    <div v-show="enabled">
      <counter></counter>
    </div>
  </div>
</template>
<!--<template lang="pug" src="./tpl.pug"></template>-->

<style lang="sass" src="./styles.scss"></style>
<script src="./scripts.js"></script>
