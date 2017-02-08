<style lang="scss" rel="stylesheet/scss">
/*  @import '../../styles/utils/mixins';
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
  }*/

</style>

<template>
  <div class="layout">
    <div class="layout-header">
      <check-box v-model="leftOpened" style="display: block;">
        Тугл!
      </check-box>
    </div>
  
    <div class="layout-main">
      <div class="layout-sidebars"
           :class="{'-closed-left': !leftOpened}"
      >
        <div class="layout-content-outer">
          <main class="layout-content" role="main">
            Центр
          </main>
        </div>
  
        <aside class="layout-left">Лево</aside>
      </div>
    </div>
  
    <div class="layout-footer">
      Низ
    </div>
  </div>


  <!--
    <div id="app">
      <div class="app-map"></div>
      <div class="app-layout" layout="row stretch-spread">
        <aside class="app-layout__left app-layout__on-top"
               v-show="layout.leftSideOpened"
        >
          <div class="layout-left" layout="column spread-stretch">
            <div class="layout-left__header"
                 layout="row stretch-left"
            >
              <check-box class="layout-link router-link"
                        v-model="layout.leftSideOpened"
                        :indeterminate="layout.indeterminate"
              >
                <i class="layout-link__icon icon-angle-double-left"></i>
              </check-box>
    
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
              <check-box class="layout-link router-link"
                        self="left"
                        v-model="layout.leftSideOpened"
                        v-show="!layout.leftSideOpened"
                        :indeterminate="layout.indeterminate"
              >
                <i class="layout-link__icon fa fa-bars"></i>
              </check-box>
              <a href="#" class="layout-link" self="right">
                Выход
                <i class="layout-link__icon fa fa-sign-out"></i>
              </a>
            </div>
            <div class="app-layout__content">
              <section class="panel app-layout__on-top" style="background: #ccc; padding: 2em 4em;">
                <p>Какой-то контент панельки</p>
                <p>
                  <label>
                    <input type="checkbox" v-model="layout.leftSideOpened">
                    {{ layout.leftSideOpened }}
                  </label>
                </p>
              </section>
            </div>
  
            <div class="app-layout__footer app-layout__on-top">
              <section class="panel app-layout__on-top" style="background: #ccc; padding: 2em 4em;">
                А вот это уже фууутер
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  -->
</template>

<script>
  export default {
    components: {
      
    },

    data () {
      return {
        leftOpened: true,
        layout: {
          indeterminate: false,
          leftSideOpened: true
        }
      };
    }
  };
</script>
