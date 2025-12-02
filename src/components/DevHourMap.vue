<template>
  <section class="comp-dev-hour-map">
    <div class="tip-block">
      This tool is designed to show and calculate the min dev hours by planned dev hours.
    </div>
    <div>
      <table>
        <thead>
          <tr>
            <th>Planned Dev Hours</th>
            <th>Min Dev Hours</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in preservedHours" :key="item.hour"
            :class="item.isStandard && 'highlight'">
            <td>{{ item.hour }}h</td>
            <td style="display: flex; align-items: center; gap: 6px;">
              <span>{{ item.minHour.hours }}h{{ item.minHour.minutes }}m</span>
              <span style="display: inline-flex; align-items: center;">
                <div class="icon-btn lg"
                  title="Copy"
                  @click="copy(`${item.minHour.hours}h${item.minHour.minutes}m`)">
                  <font-awesome-icon :icon="['fas', 'copy']" />
                </div>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="row">
      <div class="label">Planned Dev Hours</div>
      <div class="content">
        <input type="number" class="common-input" v-model="devHours" min="0" placeholder="hours" style="width: 80px;" @wheel="handleWheel($event, 'devHours')" />
      </div>
    </div>
    <hr />
    <div class="box-result">
      <span>Min Dev hours is <strong>{{ minHoursText }}</strong></span>
      <span style="display: inline-flex; align-items: center;">
        <div class="icon-btn lg"
          v-show="minHoursText !== '-' && minHoursText !== 'invalid'"
          title="Copy"
          @click="copy(minHoursText)">
          <font-awesome-icon :icon="['fas', 'copy']" />
        </div>
      </span>
    </div>
  </section>
</template>

<script>
import { clipboard } from 'electron'

export default {
  data () {
    return {
      devHours: '8',
      preservedHours: [
        { hour: 8, minHour: this.calculate(8), isStandard: true },
        { hour: 12, minHour: this.calculate(12), isStandard: false },
        { hour: 16, minHour: this.calculate(16), isStandard: true },
        { hour: 20, minHour: this.calculate(20), isStandard: false },
        { hour: 24, minHour: this.calculate(24), isStandard: true },
        { hour: 28, minHour: this.calculate(28), isStandard: false },
        { hour: 30, minHour: this.calculate(30), isStandard: false },
        { hour: 32, minHour: this.calculate(32), isStandard: true },
        { hour: 36, minHour: this.calculate(36), isStandard: false },
        { hour: 40, minHour: this.calculate(40), isStandard: true }
      ]
    }
  },
  computed: {
    minHoursText () {
      if (!this.devHours) {
        return '-'
      }
      const devHours = parseInt(this.devHours, 10)
      // console.log(devHours)
      if (!devHours && devHours !== 0) {
        return '-'
      }
      if (devHours < 0) {
        return 'invalid'
      }
      const result = this.calculate(devHours)
      return `${result.hours}h${result.minutes}m`
    }
  },

  methods: {
    calculate (hours) {
      const minHours = hours * 0.91
      // 提取整数部分作为小时数
      const hour = Math.floor(minHours)
      // 计算小数部分转换为分钟
      const minuteTotal = (minHours - hour) * 60
      const minute = Math.ceil(minuteTotal)
      return {
        hours: hour,
        minutes: minute
      }
    },
    handleWheel (e, target) {
      // console.log(e, target)
      if (e && e.deltaY) {
        if (e.deltaY < 0) {
          // 上滑，减少目标值
          let newVal = parseInt(this[target], 10) - 1
          newVal < 0 && (newVal = 0)
          this[target] = newVal.toString()
        } else {
          // 下滑，增加目标值
          const newVal = parseInt(this[target], 10) + 1
          this[target] = newVal.toString()
        }
      }
    },
    copy (content) {
      if (!content) {
        return
      }
      clipboard.writeText(content)
      const copyNotify = new Notification('✅ Content Copied', {
        body: 'Content was copied into clipboard'
      })
      copyNotify.onclick = () => {
        // console.log('copied into clipboard')
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "../assets/css/var.scss";

table {
  width: 300px;
  border-collapse: collapse;
  thead {
    border-bottom: 1px solid #999;
    text-align: left;
  }
  tr {
    padding: 3px;
    &.highlight {
      background-color: rgba($color-active, 0.1);
    }
  }
  th, td {
    padding: 6px;
  }
  td {
    vertical-align: middle;
    // display: inline-flex;
    // align-items: center;
  }
}

.row {
  margin: 12px 0;
  display: flex;
  align-items: center;
  gap: 6px;
  // padding: 6px 0;
  color: $color-active;
  .label {
    width: 180px;
    text-align: right;
    font-weight: 600;
  }
}

.box-result {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 190px;
}

.tip-block {
  padding: 16px;
  border-radius: 6px;
  background-color: $border-color;
  font-size: 90%;
  line-height: 1.45;
  // overflow: auto;
}

@media (prefers-color-scheme: dark) {
  .tip-block {
    background-color: $border-color-dark;
  }
}
</style>
