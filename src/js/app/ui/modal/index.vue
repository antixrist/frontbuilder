<script>
  export default {
    props: {
      opened: {
        type: Boolean,
        required: true,
        default: false
      },
      position: {
        type: String,
        default: ''
      },
      padding: {
        type: String,
        default: ''
      },
      overlay: {
        type: Boolean,
        default: true
      },
      closeOnOverlay: {
        type: Boolean,
        default: true
      },
      closeOnEsc: {
        type: Boolean,
        default: true
      }
    },
    data () {
      return {
//        opened: false
      };
    },
    updated () {
      console.log('updated', this.opened);

      document.documentElement.classList[this.opened ? 'add' : 'remove']('modal-opened');
    },
    methods: {
      onEsc (e) {
        console.log('onEsc', this.opened, e);
        this.closeOnEsc && this.$emit('close');
      }
    }
  };
</script>

<style lang="sass" src="./styles.scss"></style>
<template>
  <div class="modal"
       @keyup="onEsc"
  >
    <div class="modal__overlay"
         v-if="overlay"
         @click="closeOnOverlay && $emit('close')"
    ></div>
    <div class="modal__outer">
      <div class="modal__outer-scrollable">
          <div class="modal__y-outer"
               @click.self="closeOnOverlay && $emit('close')"
          >
            <div class="modal__y"
                 :style="{'vertical-align': position == 'center' ? 'middle' : position}"
                 @click.self="closeOnOverlay && $emit('close')"
            >
              <div class="modal__x"
                   @click.self="closeOnOverlay && $emit('close')"
              >
                <div class="modal__body"
                     :style="{padding: padding}"
                     @click.self="closeOnOverlay && $emit('close')"
                >
                <div class="modal__content">
                  <slot></slot>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
