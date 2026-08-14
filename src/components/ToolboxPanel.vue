<template>
  <section class="bed-toolbox-panel" v-if="isShow">
    <div class="container">
      <div class="box-row">
        <div class="icon-btn lg" @click="close()">
          <font-awesome-icon :icon="['fas', 'chevron-left']" />
        </div>
        <div class="title">
          Toolbox
        </div>
      </div>

      <div class="box-content">
        <div class="common-radio-group">
          <div class="radio"
            :class="[currentTab === t.value && 'active']"
            v-for="t in tabs"
            :key="t.value"
            @click="currentTab = t.value">{{ t.label }}</div>
        </div>
        <div class="title">
          {{ tabs.find(item => item.value === currentTab)?.label || '-' }}
        </div>

        <work-hour-calculator v-if="currentTab === 'work_hour_calculator'"></work-hour-calculator>
        <dev-hour-map v-if="currentTab === 'dev_hour_map'"></dev-hour-map>
        <batch-hour-calculator v-if="currentTab === 'batch_hour_calculator'"></batch-hour-calculator>
      </div>
    </div>
  </section>
</template>

<script>
// import { ipcRenderer } from 'electron'
import eventBus from '@/eventBus'
import system from '@/models/system'
import { toolboxUtils } from '@/models/DictMap'
import WorkHourCalculator from './WorkHourCalculator.vue'
import DevHourMap from './DevHourMap.vue'
import BatchHourCalculator from './BatchHourCalculator.vue'

export default {
  name: 'toolboxPanel',
  components: {
    WorkHourCalculator,
    DevHourMap,
    BatchHourCalculator
  },
  data () {
    return {
      isShow: false,
      currentTab: 'work_hour_calculator',
      tabs: toolboxUtils
    }
  },

  mounted () {
    eventBus.$on('showToolbox', () => {
      this.show()
    })
    // ipcRenderer.on('sys_showguide', () => {
    //   if (system.isPanelActive) {
    //     return
    //   }
    //   this.show()
    // })
  },

  beforeDestroy () {
    eventBus.$off('showToolbox')
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

.bed-toolbox-panel {
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
      .title {
        margin: 24px 0 16px;
        padding-bottom: 8px;
        border-bottom: 1px solid $border-color;
        color: $primary-font-color;
        font-size: 1.5em;
        font-weight: 600;
        line-height: 1.25;
      }
      .sub-title {
        margin: 24px 0 16px;
        color: $primary-font-color;
        font-size: 1.25em;
        font-weight: 600;
        line-height: 1.25;
      }
    }
  }
}
@media (prefers-color-scheme: dark) {
  .bed-toolbox-panel {
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
      .box-content {
        .title {
          border-bottom: 1px solid $border-color-dark;
          color: $primary-font-color-dark;
        }
        .sub-title {
          color: $primary-font-color-dark;
        }
      }
    }
  }
}
</style>
