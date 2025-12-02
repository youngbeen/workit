<template>
  <section class="comp-work-hour-calculator">
    <div class="tip-block">
      This tool is designed to calculate your real work hours based on check in/out times.
    </div>
    <p>
      Start Time: <input type="number" class="common-input" v-model="startHour" min="0" max="23" placeholder="hour" style="width: 80px;" /> : <input type="number" class="common-input" v-model="startMinute" min="0" max="59" placeholder="minute" style="width: 80px;" />
    </p>
    <p>
      End Time: <input type="number" class="common-input" v-model="endHour" min="0" max="23" placeholder="hour" style="width: 80px;" /> : <input type="number" class="common-input" v-model="endMinute" min="0" max="59" placeholder="minute" style="width: 80px;" />
    </p>
    <p>
      Fixed Minutes: <input type="number" class="common-input" v-model="fixedMinutes" min="0" placeholder="This value will be removed from work hours" style="width: 80px;" />
    </p>
    <hr />
    <p style="display: flex; align-items: center;">
      <span>Work hours is <strong>{{ workHoursText }}</strong></span>
      <span style="display: inline-flex; align-items: center;">
        <div class="icon-btn lg"
          v-show="workHoursText !== '-' && workHoursText !== 'invalid'"
          title="Copy"
          @click="copy()">
          <font-awesome-icon :icon="['fas', 'copy']" />
        </div>
      </span>
    </p>
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
