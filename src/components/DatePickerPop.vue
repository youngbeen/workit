<template>
  <section class="pop-date-picker" v-show="isShow">
    <div class="bg" @click="hide()">&nbsp;</div>
    <div class="box" :class="[animated && 'actived']" :style="{ 'left': left + 'px', 'top': top + 'px' }">
      <div class="box-arrow">
        <div class="fake-arrow">&nbsp;</div>
      </div>
      <div class="box-cont">
        <!-- <div>{{ [year, month, day, hour, minute, second].join(' ') }}</div> -->
        <div class="box-actions">
          <div class="box-year">
            <div class="icon-btn" @click="previewYear && previewYear--">
              <font-awesome-icon :icon="['fas', 'chevron-left']" />
            </div>
            {{ previewYear }}
            <div class="icon-btn" @click="previewYear++">
              <font-awesome-icon :icon="['fas', 'chevron-right']" />
            </div>
          </div>
          <div class="box-month">
            <div class="icon-btn" @click="previewMonth === 1 ? previewMonth = 12 : previewMonth--">
              <font-awesome-icon :icon="['fas', 'chevron-left']" />
            </div>
            {{ previewMonthText }}
            <div class="icon-btn" @click="previewMonth === 12 ? previewMonth = 1 : previewMonth++">
              <font-awesome-icon :icon="['fas', 'chevron-right']" />
            </div>
          </div>
        </div>
        <div class="box-head">
          <div class="cell" v-for="item in weekLegends" :key="item">{{ item }}</div>
        </div>
        <div class="box-month-data">
          <div class="cell"
            :class="{
              'faded': d.year !== previewYear || d.month !== previewMonth,
              'active': d.year === year && d.month === month && d.day === day,
              'today': d.year === today.year && d.month === today.month && d.day === today.day,
              'holiday': d.dayType === 'holiday'
            }"
            v-for="(d, index) in previewDays"
            :key="index"
            @click="handleSelect(d)">{{ d.day }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ipcRenderer } from 'electron'
import { sleep } from '@youngbeen/sleep'
import { getDayType } from '@youngbeen/workday'
import eventBus from '@/eventBus'

export default {
  data () {
    return {
      isShow: false,
      animated: false,
      left: 0,
      top: 0,
      callback: '',
      previewYear: null,
      previewMonth: null,
      year: null,
      month: null,
      day: null,
      hour: null,
      minute: null,
      second: null,
      today: {
        year: null,
        month: null,
        day: null
      },
      // time: null, // 当前选择的时间
      weekLegends: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
    }
  },
  computed: {
    previewMonthText () {
      if (this.previewMonth) {
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][this.previewMonth - 1]
      } else {
        return ''
      }
    },
    startDayOfPreviewMonth () {
      if (this.previewYear && this.previewMonth) {
        return new Date(this.previewYear, this.previewMonth - 1, 1)
      } else {
        return null
      }
    },
    endDayOfPreviewMonth () {
      if (this.previewYear && this.previewMonth) {
        return new Date(this.previewYear, this.previewMonth, 0)
      } else {
        return null
      }
    },
    previewDays () {
      const days = [
        // {
        //   year: 2020,
        //   month: 0,
        //   day: 1,
        // }
      ]
      if (this.previewYear && this.previewMonth) {
        const startWeekday = this.startDayOfPreviewMonth.getDay()
        const endWeekday = this.endDayOfPreviewMonth.getDay()
        let startExtras = 0
        let endExtras = 0
        startWeekday === 0 ? startExtras = 6 : startExtras = startWeekday - 1 // 周日，前面需要补上个月的6天，其他前面补 n - 1天
        endWeekday === 0 ? endExtras = 0 : endExtras = 7 - endWeekday // 周日，后面需要补下个月的0天，其他后面补 7 - n天
        // 补充上个月的数据
        for (let i = 0; i < startExtras; i++) {
          const day = new Date(this.previewYear, this.previewMonth - 1, 1 - (startExtras - i))
          days.push({
            year: day.getFullYear(),
            month: day.getMonth() + 1,
            day: day.getDate(),
            dayType: getDayType(day)
          })
        }
        // 正常放置数据
        for (let i = 1; i <= this.endDayOfPreviewMonth.getDate(); i++) {
          days.push({
            year: this.previewYear,
            month: this.previewMonth,
            day: i,
            dayType: getDayType(`${this.previewYear}-${this.previewMonth}-${i.toString().padStart(2, '0')}`)
          })
        }
        // 补充下个月的数据
        for (let i = 0; i < endExtras; i++) {
          const day = new Date(this.previewYear, this.previewMonth, 1 + i)
          days.push({
            year: day.getFullYear(),
            month: day.getMonth() + 1,
            day: day.getDate(),
            dayType: getDayType(day)
          })
        }
      }
      // console.log(days)
      return days
    }
  },

  mounted () {
    // {
    //   defaultTime: <Date>,
    //   position: {
    //     left: 0,
    //     top: 0
    //   }
    // }
    eventBus.$on('notifyDatePicker', params => {
      if (params && params.position && params.callback) {
        this.callback = params.callback
        let time = new Date()
        this.year = time.getFullYear()
        this.month = time.getMonth() + 1
        this.day = time.getDate()
        this.hour = 18
        this.minute = 0
        this.second = 0
        this.today = {
          year: this.year,
          month: this.month,
          day: this.day
        }
        if (params.defaultTime) {
          // console.log(params.defaultTime)
          time = new Date(params.defaultTime)
          this.year = time.getFullYear()
          this.month = time.getMonth() + 1
          this.day = time.getDate()
          this.hour = time.getHours()
          this.minute = time.getMinutes()
          this.second = time.getSeconds()
        }
        this.previewYear = this.year
        this.previewMonth = this.month
        this.show(params)
      }
    })

    ipcRenderer.on('sys_cancel', () => {
      if (this.isShow) {
        this.hide()
      }
    })
  },

  beforeDestroy () {
    eventBus.$off('notifyDatePicker')
  },

  methods: {
    show (params) {
      this.left = params.position.left || 0
      this.top = params.position.top || 0
      this.isShow = true
      sleep(10).then(() => {
        this.animated = true
      })
    },
    hide () {
      this.animated = false
      sleep(100).then(() => {
        this.isShow = false
      })
    },
    handleSelect (item) {
      eventBus.$emit(this.callback, {
        data: { ...item, hour: this.hour, minute: this.minute, second: this.second }
      })
      this.hide()
    }
  }
}
</script>

<style scoped lang="scss">
@import "../assets/css/var.scss";

.pop-date-picker {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  .bg {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    // background: red;
  }
  .box {
    display: inline-block;
    position: relative;
    z-index: 2;
    // padding-top: 12px;
    // background: blue;
    opacity: 0.6;
    transform: scale(0.8);
    transition: all $transition-time;
    &.actived {
      opacity: 1;
      transform: scale(1);
    }
    .box-arrow {
      // background: blue;
      position: relative;
      z-index: 2;
      height: 12px;
      overflow: hidden;
      .fake-arrow {
        position: relative;
        top: 6px;
        left: 80px;
        width: 20px;
        height: 20px;
        background: $primary-bgcolor;
        box-shadow: $sheet-boxshadow;
        transform: rotate(45deg);
      }
    }
    .box-cont {
      position: relative;
      z-index: 1;
      padding: 6px;
      border-radius: $border-radius;
      background: $primary-bgcolor;
      box-shadow: $sheet-boxshadow;
      .box-actions {
        display: flex;
        max-width: 168px;
        .box-year {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 50%;
        }
        .box-month {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 50%;
        }
      }
      .box-head {
        display: flex;
        font-weight: 500;
        // border-bottom: 1px solid $border-color;
        .cell {
          width: 24px;
          height: 24px;
          line-height: 24px;
          // background: red;
          text-align: center;
        }
      }
      .box-month-data {
        // display: flex;
        width: 168px;
        border-radius: $border-radius;
        // background: $itoolbar-bgcolor;
        color: $itoolbar-color;
        .cell {
          display: inline-block;
          box-sizing: border-box;
          width: 24px;
          height: 24px;
          line-height: 22px;
          border-radius: $border-radius;
          border: 1px solid $itoolbar-item-border-color;
          background: $itoolbar-item-bgcolor;
          text-align: center;
          cursor: pointer;
          user-select: none;
          &:hover {
            color: $color-active;
          }
          &.holiday {
            background: rgba(#ddd, .4);
          }
          &.today {
            color: $color-active;
            font-weight: bold;
          }
          &.active {
            background: $itoolbar-item-bgcolor-active;
            color: $color-active;
            border-color: $itoolbar-item-border-color-active;
            box-shadow: $itoolbar-item-boxshadow-active;
          }
          &.faded {
            color: #c2c2c2;
          }
        }
      }
    }
  }
}
@media (prefers-color-scheme: dark) {
  .pop-date-picker {
    .box {
      .box-arrow {
        .fake-arrow {
          background: $dark-2;
          box-shadow: none;
        }
      }
      .box-cont {
        background: $dark-2;
        box-shadow: none;
        .box-actions {
          color: $secondary-font-color-dark;
        }
        .box-head {
          color: $secondary-font-color-dark;
        }
        .box-month-data {
          // background: $itoolbar-bgcolor-dark;
          // background: $dark-3;
          color: $secondary-font-color-dark;
          .cell {
            &.holiday {
              background: rgba($dark-3, .6);
            }
            &.today {
              color: $color-active-dark;
            }
            &.active {
              background: $itoolbar-item-bgcolor-active-dark;
              color: $primary-font-color-dark;
              border-color: $itoolbar-item-border-color-active-dark;
              box-shadow: none;
            }
            &.faded {
              color: $sub-font-color-dark;
            }
            &:hover {
              background: $itoolbar-item-bgcolor-active-dark;
              color: $primary-font-color-dark;
            }
          }
        }
      }
    }
  }
}
</style>
