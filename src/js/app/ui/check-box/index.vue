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
           [checkedClassName]: local.value,
           [disabledClassName]: disabled,
           [focusClassName]: focus,
           [activeClassName]: active,
           [indeterminateClassName]: indeterminate
         }"
  >
    <slot></slot>
    <input type="checkbox"
           ref="checkbox"
           v-model="local.value"
           @change="$emit('input', $event.target.checked)"
           :disabled="disabled"
           :value="value"
           :tabindex="tabindex"
           :autofocus="autofocus"
    >
  </label>
</template>

<script>
  import { mapProps } from '../../utils';
  
  export default {
    mixins: [
      mapProps({
        value: {
          type: Boolean,
          default: false
        }
      })
    ],
    props: {
      indeterminate: {
        type: Boolean,
        default: false
      },
      disabled: {
        type: Boolean,
        default: false
      },
      tabindex: {
        type: Number
      },
      autofocus: {
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
      focusClassName: {
        type: String,
        default: 'is-focused'
      },
      activeClassName: {
        type: String,
        default: 'is-active'
      },
      disabledClassName: {
        type: String,
        default: 'is-disabled'
      }
    },
    data () {
      return {
        focus: false,
        active: false
      };
    },
    watch: {
      indeterminate () {
        this.$refs.checkbox.indeterminate = this.indeterminate;
      },
      disabled () {
        this.$refs.checkbox.disabled = this.disabled;
      }
    },
    mounted () {
      const self = this;

      this.$refs.checkbox.addEventListener('focus', e => this.focus = true);
      this.$refs.checkbox.addEventListener('blur',  e => this.focus = false);
      
      this.$el.addEventListener('mousedown', function () {
        self.active = true;
        document.addEventListener('mouseup', mouseupEventListener);
      });
      function mouseupEventListener () {
        self.active = false;
        document.removeEventListener('mouseup', mouseupEventListener);
      }
    }
  };
</script>
