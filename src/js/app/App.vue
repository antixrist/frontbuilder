<style lang="scss" rel="stylesheet/scss">
  @import '../../styles/utils/mixins';
  @import 'styles/index';

  $header-height: 45px;
  $header-bg-color: #e7e8ec;

  body {
    height: 100%;
    min-height: 100%;
  }

  #app {
    @include stretch;
    height: 100%;
    overflow: hidden;
  }
  .app-map {
    @include stretch;
    overflow: hidden;
    z-index: 2;
  }
  .app-layout {
    @include stretch;
    height: 100%;

    @include e (left) {
      background: #fff;
      overflow: auto;
      width: 350px;
      max-width: 100%;

      .layout-left {

        @include e (header) {
          background: $header-bg-color;
        }
      }
    }
    @include e (center) {
      background: #fff;
    }

    @include e (wrapper) {
      display: table;
      height: 100%;
      width: 100%;
      overflow: hidden;
    }

    @include e (header) {
      height: $header-height;
      background: $header-bg-color;

      box-shadow: 0 0 7px rgba(0, 0, 0, 0.7);
    }
    @include e (content) {

    }

    @include e (footer) {
      display: table-row;
      height: 1px;
    }

    @include e (on-top) {
      position: relative;
      z-index: 3
    }

    .layout-link {
      @include link(
        $color-normal: #343641,
        $color-hover: lighten(#343641, 20%)
      );
      white-space: nowrap;
      line-height: 1;
      border: none;
      background: #fff;
      font-weight: bold;
      padding: .9em 1em;

      &.router-link {
        background: none;

        &.router-link-active {
          background: #fff;
        }
      }

      @include e (icon) {
        color: #287ba5;
        vertical-align: middle;
        line-height: 1;

        &:last-child {
          margin-left: 5px;
        }
      }
    }
  }

</style>

<template>
  <div id="app">
    <app-map class="app-map"></app-map>
    <div class="app-layout" layout="row stretch-spread">
      <aside class="app-layout__left app-layout__on-top"
             v-show="layout.leftSideOpened"
      >
        <div class="layout-left" layout="column spread-stretch">
          <div class="layout-left__header"
               layout="row stretch-left"
          >
            <checkbox class="layout-link router-link"
                      v-model="layout.leftSideOpened"
                      :indeterminate="layout.indeterminate"
            >
              <i class="layout-link__icon icon-angle-double-left"></i>
            </checkbox>
  
            <router-link to="/ui" tag="a" exact class="layout-link router-link">
              Проекты
              <i class="layout-link__icon fa fa-folder"></i>
            </router-link>
            <router-link to="/phones" tag="a" class="layout-link router-link">
              Номера
              <i class="layout-link__icon fa fa-phone-square"></i>
            </router-link>
          </div>
          <div class="layout-left__content" self="size-x1">
            <router-view></router-view>
          </div>
        </div>
      </aside>
      <div class="app-layout__center" self="size-x1">
        <div class="app-layout__wrapper">
          <div class="app-layout__header app-layout__on-top"
               layout="row stretch-spread"
          >
            <checkbox class="layout-link router-link"
                      self="left"
                      v-model="layout.leftSideOpened"
                      v-show="!layout.leftSideOpened"
                      :indeterminate="layout.indeterminate"
            >
              <i class="layout-link__icon fa fa-bars"></i>
            </checkbox>
            <a href="#" class="layout-link" self="right">
              Выход
              <i class="layout-link__icon fa fa-sign-out"></i>
            </a>
          </div>
          <div class="app-layout__content">
            <panel class="app-layout__on-top" style="background: #ccc; padding: 2em 4em;">
              <p>Какой-то контент панельки</p>
              <p>
                <label>
                  <input type="checkbox" v-model="layout.leftSideOpened">
                  {{ layout.leftSideOpened }}
                </label>
              </p>
            </panel>
          </div>

          <div class="app-layout__footer app-layout__on-top">
            <panel class="app-layout__on-top" style="background: #ccc; padding: 2em 4em;">
              А вот это уже фууутер
            </panel>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import AppMap from './components/map/index.vue';
  import panel from './components/panel/index.vue';
  import checkbox from './components/checkbox.vue';

  export default {
    components: {
      panel, checkbox,
      'app-map': AppMap
    },

    data () {
      return {
        layout: {
          indeterminate: false,
          leftSideOpened: true
        }
      };
    }
  };
</script>
