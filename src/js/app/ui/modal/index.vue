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
      overlay: {
        type: Boolean,
        default: true
      },
      closeOnOverlayClick: {
        type: Boolean,
        default: true
      },
      closeOnEsc: {
        type: Boolean,
        default: true
      },

      overlayCSS: {
        type: Object,
        default () {
          return {};
        }
      },
      bodyCSS: {
        type: Object,
        default () {
          return {};
        }
      },
      transition: {
        type: String,
        default: 'modal'
      }
    },
    data () {
      return {  };
    },
    methods: {
      open () {
        document.documentElement.classList.add('modal-opened');
        this.closeOnEsc && document.addEventListener('keyup', this.onEscListener.bind(this));
        this.$emit('open');
      },

      close () {
        document.documentElement.classList.remove('modal-opened');
        this.closeOnEsc && document.removeEventListener('keyup', this.onEscListener);
        this.$emit('close');
      },
      
      closeOnOverlay () {
        this.overlay && this.closeOnOverlayClick && this.close();
      },
      
      onEscListener (e) {
        e.keyCode === 27 && this.close();
      }
    },
    created () {
      // здесь можно записывать инстансы, а в onEscListener() эти инстансы поочерёдно закрывать
    },
    mounted () {
      this.$watch('opened', opened => opened ? this.open() : this.close());
    },
  };
</script>

<style lang="sass" src="./styles.scss"></style>
<template>
  <div class="modal"
       v-show="opened"
  >
    <div class="modal__overlay"
         v-if="overlay"
         :style="overlayCSS"
         @click="closeOnOverlay()"
    ></div>
    <div class="modal__outer">
      <div class="modal__outer-scrollable">
          <div class="modal__y-outer"
               @click.self="closeOnOverlay()"
          >
            <div class="modal__y"
                 :style="{'vertical-align': position == 'center' ? 'middle' : position}"
                 @click.self="closeOnOverlay()"
            >
              <div class="modal__x"
                   @click.self="closeOnOverlay()"
              >
                <div class="modal__body"
                     :style="bodyCSS"
                     @click.self="closeOnOverlay()"
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
