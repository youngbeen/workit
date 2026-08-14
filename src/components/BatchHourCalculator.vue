<template>
  <section class="comp-batch-hour-calculator">
    <div class="input-section">
      <div class="label-row">
        <span class="label">Paste JSON Data</span>
        <span class="hint">Paste the full attendance JSON and click Parse</span>
      </div>
      <textarea
        class="common-input json-input"
        v-model="rawJson"
        placeholder='Paste JSON data here, e.g. {"code":"Q1000000","data":{"useRecordList":[...]}}'
        rows="6"
        :disabled="parsing"
      ></textarea>
      <button
        class="action-btn"
        :disabled="!rawJson.trim() || parsing"
        @click="parseAndCalculate"
      >
        <font-awesome-icon v-if="parsing" :icon="['fas', 'spinner']" spin />
        <font-awesome-icon v-else :icon="['fas', 'play']" />
        {{ parsing ? 'Parsing...' : 'Parse' }}
      </button>
      <div v-if="errorMsg" class="error-msg">
        <font-awesome-icon :icon="['fas', 'exclamation-triangle']" />
        {{ errorMsg }}
      </div>
    </div>

    <template v-if="results.length > 0">
      <hr />
      <div class="result-header">
        <span class="title">Results ({{ validDayCount }} valid days)</span>
        <span class="subtitle">Account: {{ accountNo }}</span>
      </div>

      <div class="result-table">
        <div class="table-row table-head">
          <span class="col-date">Date</span>
          <span class="col-hours">Hours</span>
          <span class="col-note">Note</span>
        </div>
        <div
          class="table-row"
          v-for="(item, idx) in results"
          :key="idx"
          :class="{ 'is-holiday': item.dayType === 'HOLIDAY', 'is-leave': item.hasLeave, 'is-missing': !item.hasHours }"
        >
          <span class="col-date">{{ item.dateLabel }}</span>
          <span class="col-hours" :title="item.hoursDetail || ''">{{ item.hoursText }}</span>
          <span class="col-note">
            <template v-if="item.dayType === 'HOLIDAY'">Rest</template>
            <template v-else-if="item.hasLeave">📋 Leave</template>
            <template v-else-if="!item.hasHours && !item.gmtRealIn && !item.gmtRealOut">—</template>
            <template v-else-if="item.gmtRealIn && !item.gmtRealOut">No Check-out</template>
            <template v-else-if="!item.gmtRealIn && item.gmtRealOut">No Check-in</template>
          </span>
        </div>
      </div>

      <div class="summary">
        <span class="summary-item">
          <font-awesome-icon :icon="['fas', 'calendar-alt']" />
          <strong>{{ validDayCount }}</strong> days
        </span>
        <span class="summary-item">
          <font-awesome-icon :icon="['fas', 'clock']" />
          Total <strong>{{ totalHours }}</strong>
        </span>
        <span class="summary-item" v-if="validDayCount > 0">
          <font-awesome-icon :icon="['fas', 'chart-line']" />
          Avg <strong>{{ avgHours }}</strong>/day
        </span>
      </div>
    </template>

    <div v-if="results.length === 0 && hasParsed" class="empty-tip">
      No valid attendance records found.
    </div>
  </section>
</template>

<script>
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function calculateTimeDifference (startHour, startMinute, endHour, endMinute, fixedMinutes) {
  const startMinutes = startHour * 60 + startMinute
  const endMinutes = endHour * 60 + endMinute
  let diffMinutes = endMinutes - startMinutes
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60
  }
  if (fixedMinutes) {
    diffMinutes -= parseInt(fixedMinutes, 10)
  }
  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60
  return { hours, minutes }
}

function parseDatetimeToDate (str) {
  if (!str) return null
  const d = new Date(str.replace(/-/g, '/'))
  return isNaN(d.getTime()) ? null : d
}

function formatDateLabel (dateObj) {
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  const dow = DAY_NAMES[dateObj.getDay()]
  return `${month}-${day} ${dow}`
}

export default {
  data () {
    return {
      rawJson: '',
      results: [],
      parsing: false,
      hasParsed: false,
      errorMsg: '',
      accountNo: ''
    }
  },
  computed: {
    validDayCount () {
      return this.results.filter(r => r.hasHours).length
    },
    totalHours () {
      const totalMinutes = this.results
        .filter(r => r.hasHours)
        .reduce((sum, r) => sum + r.minutes, 0)
      const h = Math.floor(totalMinutes / 60)
      const m = totalMinutes % 60
      return `${h}h${m}m`
    },
    avgHours () {
      if (this.validDayCount === 0) return '-'
      const avgMin = Math.round(
        this.results
          .filter(r => r.hasHours)
          .reduce((sum, r) => sum + r.minutes, 0) / this.validDayCount
      )
      const h = Math.floor(avgMin / 60)
      const m = avgMin % 60
      return `${h}h${m}m`
    }
  },
  methods: {
    parseAndCalculate () {
      this.errorMsg = ''
      this.hasParsed = false
      this.results = []
      this.accountNo = ''

      let parsed
      try {
        parsed = JSON.parse(this.rawJson.trim())
      } catch (e) {
        this.errorMsg = 'Invalid JSON format. Please check your input.'
        return
      }

      const list = this.extractRecordList(parsed)
      if (!list || !Array.isArray(list) || list.length === 0) {
        this.errorMsg = 'No useRecordList found in the JSON data.'
        return
      }

      // Filter for the first person only
      const firstAccount = list.find(item => item.empAccountNo)
      if (!firstAccount) {
        this.errorMsg = 'Cannot determine employee account from data.'
        return
      }
      this.accountNo = firstAccount.empAccountNo

      const userRecords = list.filter(item => item.empAccountNo === this.accountNo)
      if (userRecords.length === 0) {
        this.errorMsg = `No records found for account "${this.accountNo}".`
        return
      }

      // Calculate each day
      this.parsing = true
      const calculated = []
      for (const record of userRecords) {
        const item = this.processRecord(record)
        if (item) {
          calculated.push(item)
        }
      }
      this.results = calculated
      this.hasParsed = true
      this.parsing = false
    },

    extractRecordList (parsed) {
      // Full format: { code, data: { useRecordList, ... } }
      if (parsed && parsed.data && Array.isArray(parsed.data.useRecordList)) {
        return parsed.data.useRecordList
      }
      // Array format (raw useRecordList)
      if (Array.isArray(parsed)) {
        return parsed
      }
      return null
    },

    processRecord (record) {
      const dateObj = parseDatetimeToDate(record.gmtShiftStart)
      const dateLabel = dateObj ? formatDateLabel(dateObj) : (record.gmtShiftStart || '-')

      const hasLeave = record.leaveStatus === 1 ||
        (Array.isArray(record.recordList) && record.recordList.length > 0)

      const dayType = record.dayType || 'WORK'
      const gmtRealIn = record.gmtRealIn || ''
      const gmtRealOut = record.gmtRealOut || ''

      // Rest day
      if (dayType === 'HOLIDAY') {
        return {
          dateLabel,
          dayType: 'HOLIDAY',
          hasLeave: false,
          hasHours: false,
          hoursText: '—',
          hoursDetail: '',
          minutes: 0,
          gmtRealIn,
          gmtRealOut
        }
      }

      // Missing punch data
      if (!gmtRealIn && !gmtRealOut) {
        return {
          dateLabel,
          dayType,
          hasLeave,
          hasHours: false,
          hoursText: '—',
          hoursDetail: '',
          minutes: 0,
          gmtRealIn,
          gmtRealOut
        }
      }

      // Has check-in but no check-out (or vice versa)
      if (!gmtRealIn || !gmtRealOut) {
        return {
          dateLabel,
          dayType,
          hasLeave,
          hasHours: false,
          hoursText: '—',
          hoursDetail: gmtRealIn ? 'No Check-out' : 'No Check-in',
          minutes: 0,
          gmtRealIn,
          gmtRealOut
        }
      }

      // Both check-in and check-out present: calculate work hours
      const inTime = gmtRealIn.split(' ')[1] || gmtRealIn
      const outTime = gmtRealOut.split(' ')[1] || gmtRealOut

      const inParts = inTime.split(':')
      const outParts = outTime.split(':')

      if (inParts.length < 2 || outParts.length < 2) {
        return {
          dateLabel,
          dayType,
          hasLeave,
          hasHours: false,
          hoursText: '—',
          hoursDetail: 'Invalid time format',
          minutes: 0,
          gmtRealIn,
          gmtRealOut
        }
      }

      const startHour = parseInt(inParts[0], 10)
      const startMinute = parseInt(inParts[1], 10)
      const endHour = parseInt(outParts[0], 10)
      const endMinute = parseInt(outParts[1], 10)

      // 有请假（半天休假）时不扣除固定午休时间
      const fixedMinutes = hasLeave ? 0 : 30
      const result = calculateTimeDifference(startHour, startMinute, endHour, endMinute, fixedMinutes)
      const hoursText = `${result.hours}h${result.minutes}m`

      return {
        dateLabel,
        dayType,
        hasLeave,
        hasHours: true,
        hoursText,
        hoursDetail: `${gmtRealIn.split(' ')[1] || gmtRealIn} → ${gmtRealOut.split(' ')[1] || gmtRealOut}`,
        minutes: result.hours * 60 + result.minutes,
        gmtRealIn,
        gmtRealOut
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "../assets/css/var.scss";

.comp-batch-hour-calculator {
  .input-section {
    margin-bottom: 12px;
    .label-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      .label {
        color: $color-active;
        font-weight: 600;
      }
      .hint {
        color: $sub-font-color;
        font-size: $sub-font-size;
      }
    }
    .json-input {
      width: 100%;
      height: auto;
      min-height: 108px;
      resize: vertical;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: $sub-font-size;
      line-height: 1.45;
      padding: 8px 10px;
      box-sizing: border-box;
    }
    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      margin-top: 8px;
      height: 28px;
      padding: 0 14px;
      border: none;
      border-radius: $border-radius;
      background: $color-active;
      color: #fff;
      font-size: $primary-font-size;
      font-weight: 600;
      cursor: pointer;
      user-select: none;
      transition: all $transition-time;
      &:hover {
        opacity: .85;
      }
      &:active {
        opacity: .7;
      }
      &:disabled {
        opacity: .35;
        cursor: default;
      }
    }
    .error-msg {
      margin-top: 8px;
      padding: 8px 12px;
      border-radius: $border-radius;
      background: rgba($color-danger, 0.1);
      color: $color-danger;
      font-size: $sub-font-size;
    }
  }

  .result-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 16px 0 8px;
    .title {
      color: $primary-font-color;
      font-weight: 600;
      font-size: 1.1em;
    }
    .subtitle {
      color: $sub-font-color;
      font-size: $sub-font-size;
    }
  }

  .result-table {
    border: 1px solid $border-color;
    border-radius: $border-radius;
    overflow: hidden;
    .table-row {
      display: flex;
      align-items: center;
      padding: 6px 12px;
      font-size: $primary-font-size;
      border-bottom: 1px solid $border-color;
      transition: background $transition-time;
      &:last-child {
        border-bottom: none;
      }
      &:hover {
        background: rgba($color-active, 0.04);
      }
      &.table-head {
        background: rgba($color-active, 0.06);
        font-weight: 600;
        color: $color-active;
        font-size: $sub-font-size;
        &:hover {
          background: rgba($color-active, 0.06);
        }
      }
      &.is-holiday {
        color: $sub-font-color;
      }
      &.is-leave {
        .col-note {
          color: $color-warning;
        }
      }
      &.is-missing {
        color: $sub-font-color;
      }
      .col-date {
        width: 0;
        flex: 3;
        min-width: 0;
      }
      .col-hours {
        width: 0;
        flex: 2;
        min-width: 0;
        font-weight: 600;
        cursor: default;
      }
      .col-note {
        width: 0;
        flex: 2;
        min-width: 0;
        color: $sub-font-color;
        font-size: $sub-font-size;
      }
    }
  }

  .summary {
    display: flex;
    gap: 20px;
    margin-top: 14px;
    padding: 10px 14px;
    border-radius: $border-radius;
    background: rgba($color-active, 0.06);
    font-size: $primary-font-size;
    .summary-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }
  }

  .empty-tip {
    margin-top: 16px;
    padding: 24px;
    text-align: center;
    color: $sub-font-color;
    font-size: $sub-font-size;
    border: 1px dashed $border-color;
    border-radius: $border-radius;
  }
}

@media (prefers-color-scheme: dark) {
  .comp-batch-hour-calculator {
    .result-table {
      border-color: $border-color-dark;
      .table-row {
        border-bottom-color: $border-color-dark;
        &.table-head {
          background: rgba($color-active-dark, 0.1);
        }
        &:hover {
          background: rgba($color-active-dark, 0.08);
        }
      }
    }
    .summary {
      background: rgba($color-active-dark, 0.08);
    }
    .empty-tip {
      border-color: $border-color-dark;
    }
  }
}
</style>
