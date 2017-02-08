<style lang="sass" rel="stylesheet/scss">
  .check-box {
    position: relative;

    > input {
      position: absolute;
      opacity: 0;
      top: auto;
      right: 100%;
      bottom: 100%;
      left: auto;
    }
  }
</style>

<template>
  <label class="check-box"
         :class="{
          [checkedClassName]: checked,
          [disabledClassName]: disabled,
          [indeterminateClassName]: indeterminate
         }"
  >
    <span class="inner"><slot></slot></span>
    <input type="checkbox"
           ref="checkbox"
           v-model="checked"
           :disabled="disabled"
           :checked="checked"
           :value="value"
    >
  </label>
</template>

<script>
  export default {
    props: {
      value: {
        default: false
      },
      indeterminate: {
        type: Boolean,
        default: false
      },
      disabled: {
        type: Boolean,
        default: false
      },
      checkedClassName: {
        type: String,
        default: 'is-checked'
      },
      indeterminateClassName: {
        type: String,
        default: 'is-indeterminated'
      },
      disabledClassName: {
        type: String,
        default: 'is-disabled'
      }
    },
    data () {
      return { };
    },
    watch: {
      indeterminate () {
        this.$refs.checkbox.indeterminate = this.indeterminate;
      },
      disabled () {
        this.$refs.checkbox.disabled = this.disabled;
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
      }
    }
  };
</script>
