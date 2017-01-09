<style lang="sass" src="./styles.scss"></style>
<template lang="pug" src="./tpl.pug"></template>
<script>
  import api from '../../api';

  export default {
    components: { },
    data () {
      return {

      };
    },
    methods: {
      testApi: async function () {
        console.log('this', this);

        try {
          const name = 'antixrist';
          const response = await this.$api.get(`https://api.github.com/users/${name}`, {}, {
            asdasd: 'zxczxc'
          });
//          console.log('response', response);
        } catch (err) {
//          console.log('err', err);
        }
      }
    }
  };
</script>
