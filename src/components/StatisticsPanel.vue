<template>
  <section class="bed-statis-panel" v-show="isShow">
    <div class="container">
      <div class="box-row">
        <div class="icon-btn lg" @click="close()">
          <font-awesome-icon :icon="['fas', 'chevron-left']" />
        </div>
        <div class="title">
          Statistics
        </div>
      </div>

      <div class="box-content">
        TODO
      </div>
    </div>
  </section>
</template>

<script>
import eventBus from '@/eventBus'
import system from '@/models/system'
// import config from '@/models/config'
// import systemCtrl from '@/ctrls/systemCtrl'
// import dataCtrl from '@/ctrls/dataCtrl'

export default {
  data () {
    return {
      isShow: false
    }
  },

  mounted () {
    eventBus.$on('showStatistics', () => {
      this.show()
    })
  },

  beforeDestroy () {
    eventBus.$off('showStatistics')
  },

  methods: {
    show () {
      this.isShow = true
      system.isPanelActive = true
    },
    close () {
      this.isShow = false
      system.isPanelActive = false
    }
  }
}
</script>

<style scoped lang="scss">
@import "../assets/css/var.scss";

.bed-statis-panel {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 99;
  width: 100%;
  height: 100%;
  .container {
    height: 100%;
    background: $primary-bgcolor;
    // box-shadow: 1px 1px 28px 2px rgba(12, 12, 12, .4);
    transition: all $transition-time;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 4px;
      background: $scrollbar-thumb-color;
    }
    .box-row {
      display: flex;
      // justify-content: space-between;
      align-items: center;
      position: fixed;
      left: 0;
      top: 0;
      right: 0;
      z-index: 100;
      height: 50px;
      padding: 0 18px 0 80px;
      // border-bottom-right-radius: $border-radius;
      // border-bottom-left-radius: $border-radius;
      background: $sheet-bgcolor;
      box-shadow: $sheet-boxshadow;
      .title {
        color: $secondary-font-color;
        font-weight: bold;
      }
    }
    .box-content {
      padding: 62px 18px 12px;
    }
  }
}
@media (prefers-color-scheme: dark) {
  .bed-statis-panel {
    .container {
      background: $primary-bgcolor-dark;
      &::-webkit-scrollbar-thumb {
        background: $scrollbar-thumb-color-dark;
      }
      .box-row {
        background: $sheet-bgcolor-dark;
        box-shadow: none;
        .title {
          color: $secondary-font-color-dark;
        }
      }
      .box-content {}
    }
  }
}
</style>
