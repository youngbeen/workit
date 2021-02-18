<template>
  <section class="bed-config-panel" v-show="isShow">
    <div class="container">
      <div class="box-row">
        <div class="icon-btn lg" @click="close()">
          <font-awesome-icon :icon="['fas', 'chevron-left']" />
        </div>
        <div class="title">
          Config
        </div>
      </div>

      <!-- result list -->
      <div class="box-content">
        <div class="box-config-item">
          <div class="title">Numbers display in left navigation</div>
          <input type="radio" id="leftnav-numbers-all" value="all" v-model="config.leftnavNumbers">
          <label for="leftnav-numbers-all">All tasks</label>
          <input type="radio" id="leftnav-numbers-main" value="main" v-model="config.leftnavNumbers">
          <label for="leftnav-numbers-main">Only main tasks</label>
        </div>
        <div class="box-config-item">
          <div class="title">Add another new sub task after last one added</div>
          <input type="radio" id="addnew-subtask-no" :value="false" v-model="config.addNewAfterSubTaskAdded">
          <label for="addnew-subtask-no">No</label>
          <input type="radio" id="addnew-subtask-yes" :value="true" v-model="config.addNewAfterSubTaskAdded">
          <label for="addnew-subtask-yes">Yes</label>
        </div>
        <div class="box-config-item">
          <div class="title">History tasks clear</div>
          <input type="radio" id="history-clear-manual" value="manual-60" v-model="config.historyClear">
          <label for="history-clear-manual">Manual</label>
          <input type="radio" id="history-clear-60d" value="auto-60" v-model="config.historyClear">
          <label for="history-clear-60d">Auto(over 60 days)</label>
          <input type="radio" id="history-clear-180d" value="auto-180" v-model="config.historyClear">
          <label for="history-clear-180d">Auto(over 180 days)</label>
        </div>
        <div class="box-config-item" v-show="config.historyClear === 'manual-60'">
          <div class="title">History tasks clear reminder</div>
          Remind me when history tasks count is over <input type="number" class="common-input" v-model="config.historyReminderCount">
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import eventBus from '@/eventBus'
import system from '@/models/system'
import config from '@/models/config'
// import systemCtrl from '@/ctrls/systemCtrl'
import dataCtrl from '@/ctrls/dataCtrl'

export default {
  name: 'configPanel',
  data () {
    return {
      isShow: false,
      config: {
        leftnavNumbers: 'all', // all | main
        addNewAfterSubTaskAdded: false,
        historyClear: 'manual-60', // {mode}-{days}
        historyReminderCount: 500
      }
    }
  },
  watch: {
    config: {
      handler: function (newVal) {
        // 当配置更改时，保存配置
        // console.log(newVal)
        config.leftnavNumbersMode = newVal.leftnavNumbers
        config.addNewAfterSubTaskAdded = newVal.addNewAfterSubTaskAdded
        let [clearMode, days] = newVal.historyClear.split('-')
        days = parseInt(days)
        config.historyClearMode = clearMode
        config.historyClearDaysFilter = days
        if (newVal.historyReminderCount) {
          config.historyWarningCount = parseInt(newVal.historyReminderCount)
        }
        dataCtrl.saveConfig(config)
      },
      deep: true
    }
  },

  mounted () {
    eventBus.$on('showConfig', () => {
      this.show()
    })
  },

  beforeDestroy () {
    eventBus.$off('showConfig')
  },

  methods: {
    show () {
      this.config.leftnavNumbers = config.leftnavNumbersMode
      this.config.addNewAfterSubTaskAdded = config.addNewAfterSubTaskAdded
      this.config.historyClear = `${config.historyClearMode}-${config.historyClearDaysFilter}`
      this.config.historyReminderCount = config.historyWarningCount
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

.bed-config-panel {
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
      .box-config-item {
        position: relative;
        margin: 12px 0 24px;
        padding: 12px;
        border: 1px solid $border-color;
        border-radius: $border-radius;
        .title {
          position: absolute;
          display: inline-block;
          vertical-align: top;
          left: 12px;
          top: -10px;
          padding: 0 6px;
          background: $primary-bgcolor;
          color: $secondary-font-color;
          font-size: 12px;
          font-weight: 500;
        }
        label {
          display: inline-block;
          vertical-align: top;
          margin-left: 3px;
          margin-right: 30px;
          min-width: 30px;
          color: $primary-font-color;
          font-weight: 500;
          user-select: none;
        }
      }
    }
  }
}
@media (prefers-color-scheme: dark) {
  .bed-config-panel {
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
        .box-config-item {
          border: 1px solid $border-color-dark;
          .title {
            background: $primary-bgcolor-dark;
            color: $secondary-font-color-dark;
          }
          label {
            color: $primary-font-color-dark;
          }
        }
      }
    }
  }
}
</style>
