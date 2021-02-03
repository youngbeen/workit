<template>
  <section class="bed-filter-panel" v-show="isShow">
    <div class="modal-bg" :class="[animated && 'animated']" @click="close()"></div>
    <div class="container" :class="[animated && 'animated']">
      <div class="box-tags" v-if="labels.length">
        <div class="row">
          <div class="icon-image">
            <font-awesome-icon :icon="['fas', 'tag']" />
          </div>
          <div class="tag-options">
            <span class="common-tag tag-btn" :class="[tags.includes(label) && 'active']" v-for="(label, index) in labels" :key="index" @click="toggleTag(label)">{{ label }}</span>
          </div>
        </div>
      </div>
      <div class="box-row">
        <div class="icon-image">
          <font-awesome-icon :icon="['fas', 'clock']" />
        </div>
        <div class="common-radios">
          <div class="radio" :class="[timeType === 'all' ? 'active': '']" @click="changeTimeType('all')">All</div>
          <div class="radio" :class="[timeType === 'today' ? 'active': '']" @click="changeTimeType('today')">Today</div>
          <div class="radio" :class="[timeType === 'yesterday' ? 'active': '']" @click="changeTimeType('yesterday')">Yesterday</div>
          <div class="radio" :class="[timeType === 'lastFriday' ? 'active': '']" @click="changeTimeType('lastFriday')">Last Friday</div>
          <div class="radio" :class="[timeType === 'thisWeek' ? 'active': '']" @click="changeTimeType('thisWeek')">This Week</div>
          <div class="radio" :class="[timeType === 'lastWeek' ? 'active': '']" @click="changeTimeType('lastWeek')">Last Week</div>
          <!-- <div class="radio" :class="[timeType === 'thisMonth' ? 'active': '']" @click="changeTimeType('thisMonth')">This Month</div> -->
          <!-- <div class="radio" :class="[timeType === 'lastMonth' ? 'active': '']" @click="changeTimeType('lastMonth')">Last Month</div> -->
        </div>
        <div class="icon-btn lg" @click="saveFilter()">
          <font-awesome-icon :icon="['fas', 'check']" />
        </div>
        <div class="icon-btn lg" @click="resetFilter()">
          <font-awesome-icon :icon="['fas', 'eraser']" />
        </div>
        <div class="icon-btn lg" @click="toggleMore()">
          <font-awesome-icon :icon="['fas', 'chevron-down']" v-show="!isMoreShow" />
          <font-awesome-icon :icon="['fas', 'chevron-up']" v-show="isMoreShow" />
        </div>
      </div>
      <div class="box-row box-more" :class="[isMoreShow && 'extend']">
        <div class="box-input">
          <input class="common-input" id="from-date" type="text" placeholder="start date" v-model="fromTime">
          <div class="box-btns">
            <div class="icon-btn" title="Clear" v-show="fromTime" @click="fromTime = ''">
              <font-awesome-icon :icon="['fas', 'times-circle']" />
            </div>
            <div class="icon-btn" title="Pick Date" @click="handlePickDate('from')">
              <font-awesome-icon :icon="['fas', 'chevron-circle-down']" />
            </div>
          </div>
        </div>
        <span class="label"> to </span>
        <div class="box-input">
          <input class="common-input" id="to-date" type="text" placeholder="end date" v-model="toTime">
          <div class="box-btns">
            <div class="icon-btn" title="Clear" v-show="toTime" @click="toTime = ''">
              <font-awesome-icon :icon="['fas', 'times-circle']" />
            </div>
            <div class="icon-btn" title="Pick Date" @click="handlePickDate('to')">
              <font-awesome-icon :icon="['fas', 'chevron-circle-down']" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ipcRenderer } from 'electron'
import { sleep } from '@youngbeen/sleep'
import { dateUtil } from '@youngbeen/angle-util'
import eventBus from '@/eventBus'
import system from '@/models/system'
import systemCtrl from '@/ctrls/systemCtrl'
// import dataCtrl from '@/ctrls/dataCtrl'

export default {
  name: 'filterPanel',
  props: {
    labels: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      isShow: false,
      isMoreShow: false,
      animated: false,
      timeType: '', // 时间筛选类型， 'all' - 全部, 'yesterday' - 昨天, 'today', 'lastFriday', 'thisWeek', 'lastWeek', 'thisMonth', 'lastMonth'
      fromTime: '', // YYYY-MM-DD
      toTime: '', // YYYY-MM-DD
      tags: []
    }
  },

  mounted () {
    eventBus.$on('showFilters', () => {
      this.show()
    })
    eventBus.$on('whenSelectFromDateDone', data => {
      const { year, month, day } = data.data
      this.fromTime = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    })
    eventBus.$on('whenSelectToDateDone', data => {
      const { year, month, day } = data.data
      this.toTime = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    })

    ipcRenderer.on('sys_cancel', () => {
      if (system.isPanelActive && this.isShow) {
        this.close()
      }
    })
  },

  beforeDestroy () {
    eventBus.$off('showFilters')
    eventBus.$off('whenSelectFromDateDone')
    eventBus.$off('whenSelectToDateDone')
  },

  methods: {
    handlePickDate (source) {
      if (source === 'from') {
        const { top, left, height } = document.querySelector('#from-date').getBoundingClientRect()
        // console.log(top, left, bottom, right)
        eventBus.$emit('notifyDatePicker', {
          defaultTime: this.fromTime,
          position: {
            left,
            top: top + height
          },
          callback: 'whenSelectFromDateDone'
        })
      } else if (source === 'to') {
        const { top, left, height } = document.querySelector('#to-date').getBoundingClientRect()
        // console.log(top, left, bottom, right)
        eventBus.$emit('notifyDatePicker', {
          defaultTime: this.toTime,
          position: {
            left,
            top: top + height
          },
          callback: 'whenSelectToDateDone'
        })
      }
    },
    saveFilter () {
      if (this.fromTime) {
        const dates = this.fromTime.split('-')
        system.filter.fromTime = (new Date(parseInt(dates[0]), parseInt(dates[1]) - 1, parseInt(dates[2]), 0, 0, 0)).getTime()
      } else {
        system.filter.fromTime = ''
      }
      if (this.toTime) {
        const dates = this.toTime.split('-')
        system.filter.toTime = (new Date(parseInt(dates[0]), parseInt(dates[1]) - 1, parseInt(dates[2]), 23, 59, 59)).getTime()
      } else {
        system.filter.toTime = ''
      }
      system.filter.timeType = this.timeType
      system.filter.tags = JSON.parse(JSON.stringify(this.tags))
      this.close()
    },
    resetFilter () {
      this.timeType = 'all'
      this.fromTime = this.toTime = ''
      this.tags = []
      systemCtrl.resetFilters()
      this.close()
    },
    toggleMore () {
      this.isMoreShow = !this.isMoreShow
    },
    toggleTag (tag) {
      const targetIndex = this.tags.indexOf(tag)
      if (targetIndex > -1) {
        // 已选中，则取消选中
        this.tags.splice(targetIndex, 1)
      } else {
        // 未选中，则选中
        this.tags.push(tag)
      }
    },
    changeTimeType (type) {
      this.timeType = type
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth()
      const day = now.getDate()
      const weekDay = now.getDay()
      const today = dateUtil.formatDateTime('YYYY-MM-DD', now)
      const yesterday = dateUtil.formatDateTime('YYYY-MM-DD', new Date(year, month, day - 1, 0, 0, 0))
      const beginDayOfThisWeek = dateUtil.formatDateTime('YYYY-MM-DD', new Date(year, month, day - weekDay + 1, 0, 0, 0))
      const lastFriday = dateUtil.formatDateTime('YYYY-MM-DD', new Date(year, month, day - weekDay + 1 - 3, 0, 0, 0))
      const beginDayOfLastWeek = dateUtil.formatDateTime('YYYY-MM-DD', new Date(year, month, day - weekDay + 1 - 7, 0, 0, 0))
      const endDayOfLastWeek = dateUtil.formatDateTime('YYYY-MM-DD', new Date(year, month, day - weekDay, 0, 0, 0))
      const beginDayOfThisMonth = dateUtil.formatDateTime('YYYY-MM-DD', new Date(year, month, 1, 0, 0, 0))
      const beginDayOfLastMonth = dateUtil.formatDateTime('YYYY-MM-DD', new Date(year, month - 1, 1, 0, 0, 0))
      const endDayOfLastMonth = dateUtil.formatDateTime('YYYY-MM-DD', new Date(year, month, 0, 0, 0, 0))
      switch (this.timeType) {
        case 'all':
          this.fromTime = ''
          this.toTime = ''
          break
        case 'today':
          this.fromTime = today
          this.toTime = ''
          break
        case 'yesterday':
          this.fromTime = this.toTime = yesterday
          break
        case 'lastFriday':
          this.fromTime = this.toTime = lastFriday
          break
        case 'thisWeek':
          this.fromTime = beginDayOfThisWeek
          this.toTime = ''
          break
        case 'lastWeek':
          this.fromTime = beginDayOfLastWeek
          this.toTime = endDayOfLastWeek
          break
        case 'thisMonth':
          this.fromTime = beginDayOfThisMonth
          this.toTime = ''
          break
        case 'lastMonth':
          this.fromTime = beginDayOfLastMonth
          this.toTime = endDayOfLastMonth
          break
        default:
      }
    },
    show () {
      if (system.filter.timeType) {
        this.timeType = system.filter.timeType
      }
      if (system.filter.fromTime) {
        this.fromTime = dateUtil.formatDateTime('YYYY-MM-DD', system.filter.fromTime)
      } else {
        this.fromTime = ''
      }
      if (system.filter.toTime) {
        this.toTime = dateUtil.formatDateTime('YYYY-MM-DD', system.filter.toTime)
      } else {
        this.toTime = ''
      }
      if (system.filter.tags && system.filter.tags.length) {
        this.tags = JSON.parse(JSON.stringify(system.filter.tags))
      } else {
        this.tags = []
      }
      this.isMoreShow = false
      this.isShow = true
      system.isPanelActive = true
      sleep(100).then(() => {
        this.animated = true
      })
    },
    close () {
      this.animated = false
      sleep(200).then(() => {
        this.isShow = false
        system.isPanelActive = false
      })
    }
  }
}
</script>

<style scoped lang="scss">
@import "../assets/css/var.scss";

.bed-filter-panel {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 99;
  width: 100%;
  height: 100%;
  .container {
    margin: -300px auto;
    width: 600px;
    border-bottom-right-radius: $border-radius;
    border-bottom-left-radius: $border-radius;
    background: $sheet-bgcolor;
    box-shadow: $sheet-boxshadow;
    opacity: 0;
    overflow: hidden;
    transition: all $transition-time;
    .box-tags {
      padding-top: 12px;
      border-bottom: 1px solid $border-color;
      // font-family: 'Monaco';
      .row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 18px 12px;
        .tag-options {
          width: 520px;
          height: 28px;
          padding: 4px 8px 0;
          border: 1px solid #ccc;
          border-radius: $border-radius;
          // white-space: nowrap;
          // overflow: hidden;
          .common-tag {
            margin-right: 6px;
            margin-bottom: 4px;
          }
        }
      }
    }
    .box-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 50px;
      padding: 0 18px;
      .label {
        color: $color-active;
        font-weight: bold;
      }
      .box-input {
        position: relative;
        .common-input {
          width: 230px;
        }
        .box-btns {
          display: flex;
          align-items: center;
          position: absolute;
          right: 2px;
          top: 0;
          bottom: 0;
          .icon-btn {
            // background: red;
          }
        }
      }
      .icon-btn {
        margin-left: 2px;
      }
    }
    .box-more {
      height: 0;
      overflow: hidden;
      transition: all $transition-time;
      &.extend {
        height: 50px;
      }
    }
    &.animated {
      margin-top: -1px;
      opacity: 1;
    }
  }
}
@media (prefers-color-scheme: dark) {
  .bed-filter-panel {
    .container {
      background: $sheet-bgcolor-dark;
      box-shadow: none;
      .box-tags {
        border-bottom: 1px solid $border-color-dark;
        .row {
          .tag-options {
            border: 1px solid $border-color-dark;
          }
        }
      }
      .box-row {
        .label {
          color: $color-active-dark;
        }
      }
    }
  }
}
</style>
