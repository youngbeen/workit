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
          @click="copy(workHoursText)">
          <font-awesome-icon :icon="['fas', 'copy']" />
        </div>
      </span>
      <span style="display: inline-flex; align-items: center;">
        <div class="icon-btn lg"
          v-show="workHoursText !== '-' && workHoursText !== 'invalid'"
          title="Copy Down"
          @click="copyDown(workHoursText)">
          <font-awesome-icon :icon="['fas', 'chevron-circle-down']" />
        </div>
      </span>
    </div>

    <div class="tip-block" style="margin-top: 12px;">
      This tool is designed to calculate 2 work hours div.
    </div>
    <div class="row">
      <div class="label"> </div>
      <div class="content" data-tip="eg. 8h26m">
        <input type="text" class="common-input" v-model="hour1" @change="formatTime('hour1')" placeholder="hour" style="width: 80px;" />
      </div>
    </div>
    <div class="row">
      <div class="label">-</div>
      <div class="content" data-tip="eg. 8h26m">
        <input type="text" class="common-input" v-model="hour2" @change="formatTime('hour2')" placeholder="hour" style="width: 80px;" />
      </div>
    </div>
    <hr />
    <div class="row">
      <div class="label">=</div>
      <div class="content" style="display: flex; align-items: center; gap: 6px;">
        <strong>{{ workHoursDiv }}</strong>
        <span style="display: inline-flex; align-items: center;">
          <div class="icon-btn lg"
            v-show="workHoursDiv !== '?' && workHoursDiv !== 'invalid'"
            title="Copy"
            @click="copy(workHoursDiv)">
            <font-awesome-icon :icon="['fas', 'copy']" />
          </div>
        </span>
      </div>
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
      fixedMinutes: '30',
      hour1: '',
      hour2: ''
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
    },
    workHoursDiv () {
      if (!this.hour1 || !this.hour2) {
        return '?'
      }
      if (!/^(\d+h)?(\d+m)?$/.test(this.hour1) || !/^(\d+h)?(\d+m)?$/.test(this.hour2)) {
        return 'invalid'
      }
      const minutes1 = this.getMinutesByTime(this.hour1)
      const minutes2 = this.getMinutesByTime(this.hour2)
      const isNegative = minutes1 < minutes2
      const divTime = this.getTimeByMinutes(Math.abs(minutes1 - minutes2))
      return `${isNegative ? '-' : ''}${divTime.timeString}`
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
    formatTime (param) {
      // NOTE 1. 支持3h4m, 3小时4分钟之类的输入。同时支持夹杂空格以及min、分之类的其他写法
      // 2. 支持输入小数自动换算单位
      // 3. 支持缺省单位（默认为小时）
      let logTime = this[param]
      logTime = logTime.replace(/\s|\n|\r/g, '')
      logTime = logTime.replace(/[^hm小时分钟分\d.]/g, '')
      if (!logTime) {
        this[param] = ''
        return
      }
      if (/^\d+(\.\d+)*$/.test(logTime)) {
        // 纯数字，缺省默认为小时
        const allMinute = Math.round(Number(logTime) * 60)
        const finalHour = Math.floor(allMinute / 60)
        const finalMinute = allMinute % 60
        // 组装最后规范的结果
        let finalString = ''
        if (finalHour) {
          finalString += finalHour + 'h'
        }
        if (finalMinute) {
          finalString += finalMinute + 'm'
        }
        this[param] = finalString
      } else {
        // 根据“干货”内容整理规范工时
        let hour = logTime.match(/^\d+(\.\d+)*(?=[h(小时)]+)/)
        if (hour && hour.length) {
          hour = hour[0] // 此时处理完的内容是小时数字字符串，可能是含小数的，例如3.5
        }
        let minute = logTime.match(/(?<=[h(小时)]*)\d+(\.\d+)*(?=[m分钟])/)
        if (minute && minute.length) {
          minute = minute[0] // 此时处理完的内容是分钟数字字符串，可能是含小数的，例如3.5
        }
        // 小时字符串转换为分钟，分钟字符串直接保留取整，最后相加归集换算
        let allMinute = 0
        if (hour) {
          allMinute += Math.round(Number(hour) * 60)
        }
        if (minute) {
          allMinute += Math.floor(Number(minute))
        }
        const finalHour = Math.floor(allMinute / 60)
        const finalMinute = allMinute % 60
        // 组装最后规范的结果
        let finalString = ''
        if (finalHour) {
          finalString += finalHour + 'h'
        }
        if (finalMinute) {
          finalString += finalMinute + 'm'
        }
        this[param] = finalString
      }
    },
    getMinutesByTime (time) {
      let hour = time.match(/^\d+(\.\d+)*(?=[h(小时)]+)/)
      if (hour && hour.length) {
        hour = hour[0] // 此时处理完的内容是小时数字字符串，可能是含小数的，例如3.5
      }
      let minute = time.match(/(?<=[h(小时)]*)\d+(\.\d+)*(?=[m分钟])/)
      if (minute && minute.length) {
        minute = minute[0] // 此时处理完的内容是分钟数字字符串，可能是含小数的，例如3.5
      }
      // 小时字符串转换为分钟，分钟字符串直接保留取整，最后相加归集换算
      let allMinute = 0
      if (hour) {
        allMinute += Math.round(Number(hour) * 60)
      }
      if (minute) {
        allMinute += Math.floor(Number(minute))
      }
      return allMinute
    },
    getTimeByMinutes (minutes) {
      const finalHour = Math.floor(minutes / 60)
      const finalMinute = minutes % 60
      let hourString = ''
      if (finalHour) {
        hourString = `${finalHour}h`
      }
      let minuteString = ''
      if (finalMinute) {
        minuteString = `${finalMinute}m`
      } else if (!hourString) {
        minuteString = '0m'
      }
      return {
        hours: finalHour,
        minutes: finalMinute,
        timeString: `${hourString}${minuteString}`
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
    },
    copyDown (content) {
      if (!content) {
        return
      }
      if (!this.hour1) {
        this.hour1 = content
      } else if (!this.hour2) {
        this.hour2 = content
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
  .label {
    width: 120px;
    color: $color-active;
    text-align: right;
    font-weight: 600;
  }
  .content {
    position: relative;
    &:after {
      content: attr(data-tip);
      position: absolute;
      z-index: 1;
      left: calc(100% + 6px);
      top: 0;
      min-width: 300px;
      height: 30px;
      line-height: 30px;
      color: #999;
      // background: red;
    }
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
