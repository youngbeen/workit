<template>
  <span class="comp-due-tag" :class="[dueWarning && 'warning', dueDanger && 'danger']" :title="detailLeftTime">
    <!-- {{ showTime }} -->
    <span class="label" v-if="dueNormal">{{ dueWeekday }}</span>
    <span class="time" :class="[dueDanger && 'danger']" v-if="dueWarning || dueDanger">{{ showTime.days ? showTime.days + 'd' : '' }}{{ showTime.hours }}h</span>
    <span class="day" v-if="dueNormal">
      <span class="day-block"
        :class="[todayType === 'weekend' && 'weekend']"
        v-if="withHalfDay"
        :style="{'width': asisPercent * 10 + 'px'}">&nbsp;</span>
      <span class="day-block"
        :class="[dayTypes[index] === 'weekend' && 'weekend']"
        v-for="(d, index) in dayCount" :key="d">&nbsp;</span>
    </span>
  </span>
</template>

<script>
import { dateUtil } from '@youngbeen/angle-util'

export default {
  props: {
    time: {
      type: Number,
      required: true
    },
    now: {
      type: Number,
      required: true
    },
    nowDate: {
      type: String,
      required: true
    }
  },

  computed: {
    dueWeekday () {
      const weekDay = (new Date(this.time)).getDay()
      const map = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      return map[weekDay]
    },
    detailLeftTime () {
      if (this.showTime.days) {
        return `due in ${this.showTime.days || 0} day${this.showTime.days > 1 ? 's' : ''} ${this.showTime.hours || 0} hour${this.showTime.hours > 1 ? 's' : ''}`
      } else {
        return `due in ${this.showTime.hours || 0} hour${this.showTime.hours > 1 ? 's' : ''} ${this.showTime.minutes || 0} minute${this.showTime.minutes > 1 ? 's' : ''}`
      }
    },
    dueNormal () {
      return this.showTime && (this.dayCount > 1 || (this.dayCount === 1 && this.withHalfDay))
    },
    dueWarning () {
      return this.showTime && this.dayCount === 1 && !this.withHalfDay
    },
    dueDanger () {
      return this.showTime && this.dayCount <= 0
    },
    showTime () {
      if (this.time && this.now) {
        return dateUtil.getReadableTimeBySeconds(parseInt((this.time - this.now) / 1000), {
          seconds: 'no'
        })
      } else {
        return {}
      }
    },
    dayCount () {
      if (this.showTime) {
        let count = this.showTime.days
        if (Math.abs(this.showTime.hours) > 4) {
          return (this.showTime.hours < 0 ? --count : ++count)
        } else {
          return count
        }
      } else {
        return 0
      }
    },
    withHalfDay () {
      return this.showTime.hours && Math.abs(this.showTime.hours) <= 4
    },
    asisPercent () {
      const leftHour = this.showTime.hours > 8 ? 8 : this.showTime.hours
      return leftHour / 8
    },
    todayType () {
      const todayWeekday = (new Date(this.nowDate)).getDay()
      return todayWeekday === 0 || todayWeekday === 6 ? 'weekend' : 'weekday'
    },
    dayTypes () {
      const hour = (new Date(this.now)).getHours()
      let startDay = this.now
      if (hour >= 12) {
        // 今日下午，首日是以明天开始算起
        startDay += 1000 * 60 * 60 * 24
      } else {
        // 今日上午，首日是以今天开始算起
      }
      let weekday = (new Date(startDay)).getDay()
      const result = []
      for (let i = 0; i < this.dayCount; i++) {
        result.push(weekday === 0 || weekday === 6 ? 'weekend' : 'weekday')
        if (weekday >= 6) {
          weekday = 0
        } else {
          weekday++
        }
      }
      return result
    }
  }
}
</script>

<style scoped lang="scss">
@import "../assets/css/var.scss";

.comp-due-tag {
  display: inline-flex;
  align-items: center;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid $color-active;
  background: transparent;
  overflow: hidden;
  &.warning {
    border: 1px solid $color-warning;
    background: $color-warning;
  }
  &.danger {
    border: 1px solid $color-danger;
    background: $color-danger;
  }
  .label {
    padding: 0 4px;
    &.warning {
      background: $color-warning;
    }
    &.danger {
      background: $color-danger;
      color: #fff;
    }
  }
  .time {
    padding: 0 4px;
    // border-radius: 2px;
    // background: $color-warning;
    // color: #fff;
    &.danger {
      // background: $color-danger;
      color: #fff;
    }
  }
  .day {
    display: inline-flex;
    align-items: center;
    background: $color-active;
    color: #fff;
    // &.warning {
    //   background: $color-warning;
    // }
    .day-block {
      // display: inline-block;
      // vertical-align: middle;
      width: 10px;
      height: 16px;
      &:not(:last-of-type) {
        border-right: 1px solid #fff;
      }
      &.weekend {
        background: #ded1d2;
      }
      &.half {
        width: 5px;
      }
    }
  }
}
@media (prefers-color-scheme: dark) {
  .comp-due-tag {
    .time {
      color: $primary-font-color;
    }
    .day {
      .day-block {
        &:not(:last-of-type) {
          border-right: 1px solid #ccc;
        }
        &.weekend {
          background: $dark-3;
        }
      }
    }
  }
}
</style>
