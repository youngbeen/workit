<template>
  <section class="comp-calendar">
    <div class="box-actions">
      <div class="box-year">
        <div class="common-radio-group">
          <div class="radio"
            :class="[previewYear === y && 'active']"
            v-for="y in yearOptions"
            :key="y"
            @click="previewYear = y">{{ y }}</div>
        </div>
      </div>
      <div class="box-month">
        <div class="common-radio-group">
          <div class="radio"
            :class="[previewMonth === index + 1 && 'active']"
            v-for="(m, index) in monthOptions"
            :key="m"
            @click="previewMonth = index + 1">{{ m }}</div>
        </div>
      </div>
    </div>
    <div class="box-head">
      <div class="cell" v-for="item in weekLegends" :key="item">{{ item }}</div>
    </div>
    <div class="box-month-data">
      <div class="row"
        v-for="(week, index) in previewDays"
        :key="index">
        <div class="cell"
          :class="{
            'faded': d.year !== previewYear || d.month !== previewMonth,
            'active': d.year === year && d.month === month && d.day === day,
            'holiday': d.dayType === 'holiday'
          }"
          v-for="(d, i) in week"
          :key="i">
          <div class="day">{{ d.day }}</div>
          <div class="box-info">
            <div class="due-tip" v-if="d.dueCount">{{ d.dueCount > 1 ? `${d.dueCount} tasks` : `${d.dueCount} task` }} due</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { dateUtil } from '@youngbeen/angle-util'
import { getDayType } from '@youngbeen/workday'

export default {
  props: {
    today: {
      type: String,
      required: false,
      default: () => dateUtil.formatDateTime('YYYY-MM-DD', new Date())
    },
    dueCounts: {
      type: Object,
      required: false,
      default: () => {}
    }
  },
  data () {
    return {
      previewYear: null,
      yearOptions: [],
      previewMonth: null,
      monthOptions: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      year: null,
      month: null,
      day: null,
      weekLegends: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
    }
  },
  computed: {
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
        // [ // week row
        //   {
        //     year: 2020,
        //     month: 1,
        //     day: 1,
        //     dayType: 'holiday|workday',
        //     dueCount: 0,
        //   }
        // ]
      ]
      if (this.previewYear && this.previewMonth) {
        const startWeekday = this.startDayOfPreviewMonth.getDay()
        const endWeekday = this.endDayOfPreviewMonth.getDay()
        let startExtras = 0
        let endExtras = 0
        startWeekday === 0 ? startExtras = 6 : startExtras = startWeekday - 1 // 周日，前面需要补上个月的6天，其他前面补 n - 1天
        endWeekday === 0 ? endExtras = 0 : endExtras = 7 - endWeekday // 周日，后面需要补下个月的0天，其他后面补 7 - n天
        let week = []
        // 补充上个月的数据
        for (let i = 0; i < startExtras; i++) {
          const day = new Date(this.previewYear, this.previewMonth - 1, 1 - (startExtras - i))
          const dueCount = this.dueCounts[dateUtil.formatDateTime('YYYY-MM-DD', day)]
          week.push({
            year: day.getFullYear(),
            month: day.getMonth() + 1,
            day: day.getDate(),
            dayType: getDayType(day),
            dueCount: dueCount || 0
          })
          if (week.length >= 7) {
            days.push(week)
            week = []
          }
        }
        // 正常放置数据
        for (let i = 1; i <= this.endDayOfPreviewMonth.getDate(); i++) {
          const dueCount = this.dueCounts[`${this.previewYear}-${this.previewMonth.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`]
          week.push({
            year: this.previewYear,
            month: this.previewMonth,
            day: i,
            dayType: getDayType(`${this.previewYear}-${this.previewMonth.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`),
            dueCount: dueCount || 0
          })
          if (week.length >= 7) {
            days.push(week)
            week = []
          }
        }
        // 补充下个月的数据
        for (let i = 0; i < endExtras; i++) {
          const day = new Date(this.previewYear, this.previewMonth, 1 + i)
          const dueCount = this.dueCounts[dateUtil.formatDateTime('YYYY-MM-DD', day)]
          week.push({
            year: day.getFullYear(),
            month: day.getMonth() + 1,
            day: day.getDate(),
            dayType: getDayType(day),
            dueCount: dueCount || 0
          })
          if (week.length >= 7) {
            days.push(week)
            week = []
          }
        }
        // 虽然错误，但为了可用，将剩余的week数据推入
        if (week.length) {
          console.warn('week data invalid')
          days.push(week)
        }
      }
      // console.log(days)
      return days
    }
  },
  watch: {
    today: {
      handler: function (newVal, oldVal) {
        if (newVal) {
          const [year, month, day] = this.today.split('-')
          this.year = parseInt(year, 10)
          this.month = parseInt(month, 10)
          this.day = parseInt(day, 10)
          this.previewYear = this.year
          this.yearOptions = [this.year - 1, this.year, this.year + 1]
          this.previewMonth = this.month
        }
      },
      immediate: true
    }
  }
}
</script>

<style scoped lang="scss">
@import "../assets/css/var.scss";

.comp-calendar {
  padding: 6px;
  overflow-x: hidden;
  .box-actions {
    display: flex;
    justify-content: space-between;
    padding: 6px 12px;
    border-bottom: 1px solid $border-color;
  }
  .box-head {
    display: flex;
    justify-content: space-between;
    .cell {
      box-sizing: border-box;
      width: 14%;
      padding: 6px;
      color: $sub-font-color;
      font-size: 16px;
      // background: red;
    }
  }
  .box-month-data {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    height: 570px;
    .row {
      display: flex;
      justify-content: space-between;
      .cell {
        box-sizing: border-box;
        width: 14%;
        height: 90px;
        padding: 6px;
        border-radius: $border-radius;
        // background: red;
        .day {
          font-size: 20px;
        }
        .box-info {
          .due-tip {
            position: relative;
            padding-left: 8px;
            color: $secondary-font-color;
            font-size: 11px;
            &:before {
              content: " ";
              position: absolute;
              left: 0;
              top: 6px;
              z-index: 1;
              width: 4px;
              height: 4px;
              border-radius: 100%;
              background: $color-active;
            }
          }
        }
        &.holiday {
          background: rgba(#eee, .4);
        }
        &.active {
          box-shadow: $itoolbar-item-boxshadow-active;
          .day {
            color: $color-active;
            font-weight: bold;
          }
        }
        &.faded {
          color: #c2c2c2;
        }
      }
    }
  }
}

@media (prefers-color-scheme: dark) {
  .comp-calendar {
    .box-actions {
      border-color: 1px solid $border-color-dark;
    }
    .box-head {
      .cell {
        color: $sub-font-color-dark;
      }
    }
    .box-month-data {
      .row {
        .cell {
          .box-info {
            .due-tip {
              color: $secondary-font-color-dark;
              &:before {
                background: $color-active-dark;
              }
            }
          }
          &.holiday {
            background: rgba($dark-3, .3);
          }
          &.active {
            background: $itoolbar-item-bgcolor-active-dark;
            border: 1px solid $itoolbar-item-border-color-active-dark;
            box-shadow: none;
            .day {
              color: $color-active-dark;
            }
          }
          &.faded {
            color: $sub-font-color-dark;
          }
        }
      }
    }
  }
}
</style>
