<template lang="pug" src="./tpl.pug"></template>
<script>
  import slotMixin from '../../mixins/slots';

  export default {
    mixins: [
      slotMixin,
    ],
    props: {
      type: {
        type: String,
        required: false,
      },
    },
    computed: {
      classNames() {
        return [
          this.type ? `panel--${this.type}` : 'panel--default'
        ];
      },
    },
  };
</script>
