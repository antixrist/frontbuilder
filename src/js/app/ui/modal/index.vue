<script>
  import _ from 'lodash';
  import { domIsVisible } from '../../mixins/domIsVisibile';
  
  let modalsOnEscListenerAdded = false;
  function modalsOnEscListener (e) {
    if (e.keyCode !== 27) { return; }

    const openedModals = this.$root.openedModals;
    const lastInstance = _.last(openedModals);

    if (!lastInstance) { return; }

    /*lastInstance.opened && */lastInstance.closeOnEsc && lastInstance.close();
  }
  
//  let instance = 0;
  
  export default {
    props: {
      opened: {
        type: Boolean,
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
      return { instance: 0 };
    },
    methods: {
      open () {
        document.documentElement.classList.add('modal-opened');
        this.$root.openedModals.push(this);
        this.$emit('open');
      },

      close () {
        document.documentElement.classList.remove('modal-opened');
        _.pull(this.$root.openedModals, this);
        this.$emit('close');
        
        if (!this.$root.openedModals.length) {
          document.removeEventListener('keyup', modalsOnEscListener);
        }
      },
      
      closeOnOverlay () {
        this.overlay && this.closeOnOverlayClick && this.close();
      },
      
      defineOpened () {
        return domIsVisible(this.$el);
      }
    },
    created () {
      this.$root.openedModals = this.$root.openedModals || [];
//      this.instance = ++instance;
    },
//    beforeUpdate () {
////      this.defineOpened();
//    },
    updated () {
      this.defineOpened() ? this.open() : this.close();
//      this.defineOpened();
//      console.log('updated', this.defineOpened());
//      _.delay(() => console.log('delay', this.defineOpened()));
//
    },
    mounted () {
//      this.$watch('opened', opened => opened ? this.open() : this.close());
      this.defineOpened() ? this.open() : this.close();

//      this.$el.addEventListener('transitionend', e => e.target === this.$el && console.log('transitionend', this.defineOpened()));
      
      if (!modalsOnEscListenerAdded) {
        modalsOnEscListenerAdded = true;
        document.addEventListener('keyup', modalsOnEscListener.bind(this));
      }
    },
    beforeDestroy () {
      this.close();
    }
  };
</script>

<style lang="sass" src="./styles.scss"></style>
<template>
  <div class="modal">
    <!--v-show="opened"-->
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
