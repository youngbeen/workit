<template>
  <section class="comp-work-hour-calculator">
    <div class="tip-block">
      This tool is designed to calculate your real work hours by start time & end time.
    </div>
    <div class="row">
      <div class="label">Start Time</div>
      <div class="content">
        <input type="number" class="common-input" v-model="startHour" min="0" max="23" placeholder="hour" style="width: 80px;" @wheel="handleWheel($event, 'startHour')" /> : <input type="number" class="common-input" v-model="startMinute" min="0" max="59" placeholder="minute" style="width: 80px;" @wheel="handleWheel($event, 'startMinute')" />
      </div>
    </div>
    <div class="row">
      <div class="label">End Time</div>
      <div class="content">
        <input type="number" class="common-input" v-model="endHour" min="0" max="23" placeholder="hour" style="width: 80px;" @wheel="handleWheel($event, 'endHour')" /> : <input type="number" class="common-input" v-model="endMinute" min="0" max="59" placeholder="minute" style="width: 80px;" @wheel="handleWheel($event, 'endMinute')" />
      </div>
    </div>
    <div class="row">
      <div class="label">Fixed Minutes</div>
      <div class="content">
        <input type="number" class="common-input" v-model="fixedMinutes" min="0" placeholder="This value will be removed from work hours" style="width: 80px;" @wheel="handleWheel($event, 'fixedMinutes')" />
      </div>
    </div>
    <hr />
    <div class="box-result">
      <span>Work hours is <strong>{{ workHoursText }}</strong></span>
      <span style="display: inline-flex; align-items: center;">
        <div class="icon-btn lg"
          v-show="workHoursText !== '-' && workHoursText !== 'invalid'"
          title="Copy"
          @click="copy()">
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
      startHour: '8',
      startMinute: '30',
      endHour: '18',
      endMinute: '30',
      fixedMinutes: '30'
    }
  },
  computed: {
    workHoursText () {
      if (!this.startHour || !this.startMinute || !this.endHour || !this.endMinute) {
        return '-'
      }
      const startHour = parseInt(this.startHour, 10)
      const startMinute = parseInt(this.startMinute, 10)
      const endHour = parseInt(this.endHour, 10)
      const endMinute = parseInt(this.endMinute, 10)
      // console.log(startHour, startMinute, endHour, endMinute)
      if ((!startHour && startHour !== 0) || (!startMinute && startMinute !== 0) || (!endHour && endHour !== 0) || (!endMinute && endMinute !== 0)) {
        return '-'
      }
      if (startHour < 0 || startHour > 23 || startMinute < 0 || startMinute > 59 || endHour < 0 || endHour > 23 || endMinute < 0 || endMinute > 59) {
        return 'invalid'
      }
      const result = this.calculateTimeDifference(startHour, startMinute, endHour, endMinute, this.fixedMinutes)
      return `${result.hours}h${result.minutes}m`
    }
  },

  methods: {
    calculateTimeDifference (startHour, startMinute, endHour, endMinute, fixedMinutes) {
      const startMinutes = startHour * 60 + startMinute
      const endMinutes = endHour * 60 + endMinute
      // 计算总分钟差
      let diffMinutes = endMinutes - startMinutes
      // 如果结束时间早于开始时间，则视为跨天（+24小时）
      if (diffMinutes < 0) {
        diffMinutes += 24 * 60
      }
      // 根据传入的可选修正分钟进行处理
      if (fixedMinutes) {
        diffMinutes -= parseInt(fixedMinutes, 10)
      }
      // 转换为小时和分钟
      const hours = Math.floor(diffMinutes / 60)
      const minutes = diffMinutes % 60
      return {
        hours: hours,
        minutes: minutes
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
          let newVal = parseInt(this[target], 10) + 1
          if ((target === 'startHour' || target === 'endHour') && newVal > 23) {
            newVal = 23
          } else if ((target === 'startMinute' || target === 'endMinute') && newVal > 59) {
            newVal = 59
          }
          this[target] = newVal.toString()
        }
      }
    },
    copy () {
      clipboard.writeText(this.workHoursText)
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

.row {
  margin: 12px 0;
  display: flex;
  align-items: center;
  gap: 6px;
  // padding: 6px 0;
  color: $color-active;
  .label {
    width: 120px;
    text-align: right;
    font-weight: 600;
  }
}

.box-result {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 130px;
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
