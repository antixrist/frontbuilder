<script>
  import modal from './modal/index.vue';
  import longLongText from './test/long-long-text.vue';

  export default {
    components: { longLongText, modal },
    data () {
      return {
        opened: false
      };
    }
  };
</script>

<style lang="sass">
  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }
  .fade-enter, .fade-leave-active {
    opacity: 0;
  }

  @import '../../../styles/shared/utils';

  .custom-modal {
    .modal__overlay {
      background: rgba(#000, .6);
    }
    .modal__content {
      box-shadow: 0 0 10px rgba(#000, .6);
      background: #fff;
      @include box(1em);
    }
    .long-text {
      @include unboxing(1em);
    }
  }
</style>

<template>
  <div class="test-page">

    <p>
      <button @click="opened = !opened;">Toggle modal</button> {{ opened }}
    </p>

    <transition name="fade">
      <modal :opened="opened"
             @close="opened = false;"
             v-show="opened"
             class="custom-modal"
      >
        <long-long-text style="
                          max-width: 500px;
                          max-height: 300px;
                          overflow: auto;
                        "
        ></long-long-text>
      </modal>
    </transition>

    <long-long-text></long-long-text>
  </div>
</template>
