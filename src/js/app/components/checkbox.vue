<style lang="sass" rel="stylesheet/scss">
  .v-checkbox {
    position: relative;
  }
  .v-checkbox__input {
    position: absolute;
    opacity: 0;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
</style>

<template>
  <label class="v-checkbox"
         :class="{'is-indeterminated': indeterminate, 'is-checked': checked}"
  ><slot></slot><input ref="checkbox" class="v-checkbox__input" type="checkbox" v-model="checked"></label>
</template>

<script>
  import slotsMixin from '../mixins/slots';

  export default {
    props: {
      value: {
        default: false
      },
      indeterminate: {
        type: Boolean,
        default: false
      }
    },
    mixins: {
      slotsMixin
    },
    data () {
      return { };
    },
    watch: {
      indeterminate () {
        this.$refs.checkbox.indeterminate = this.indeterminate;
      }
    },
    computed: {
      checked: {
        get () {
          return this.value;
        },
        set (newVal) {
          this.$emit('input', newVal);
        }
      },
    }
  };
</script>
