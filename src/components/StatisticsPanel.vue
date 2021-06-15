<template>
  <section class="bed-statis-panel" v-show="isShow">
    <div class="container">
      <div class="box-row">
        <div class="icon-btn lg" @click="close()">
          <font-awesome-icon :icon="['fas', 'chevron-left']" />
        </div>
        <div class="title">
          Statistics
        </div>
      </div>

      <div class="box-content">
        <div class="box-head">
          <div class="common-radio-group">
            <div class="radio"
              :class="[tab === 'week' && 'active']"
              @click="handleChangeTab('week')">7 days</div>
            <div class="radio"
              :class="[tab === 'month' && 'active']"
              @click="handleChangeTab('month')">30 days</div>
          </div>
        </div>

        <div id="chart" class="box-chart"></div>

        <div class="box-detail">
          <div class="info">
            Total <span class="highlight">{{ totalCount.created }}</span> created, <span class="highlight">{{ avarageCount.created }}</span> created per day
          </div>
          <div class="info">
            Total <span class="highlight">{{ totalCount.finished }}</span> finished, <span class="highlight">{{ avarageCount.finished }}</span> finished per day
          </div>
          <div class="box-efficiency">
            <div class="label">Efficiency:</div>
            <div class="text">
              <efficiency-bar :base="totalCount.created" :bar="totalCount.finished"></efficiency-bar>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import * as echarts from 'echarts'
import { sleep } from '@youngbeen/sleep'
import { dateUtil, numberUtil } from '@youngbeen/angle-util'
import eventBus from '@/eventBus'
import system from '@/models/system'
import EfficiencyBar from '@/components/EfficiencyBar'

export default {
  components: {
    EfficiencyBar
  },

  props: {
    list: {
      type: Array,
      required: true
    },
    today: {
      type: String,
      required: false,
      default: () => dateUtil.formatDateTime('YYYY-MM-DD', new Date())
    }
  },
  data () {
    return {
      isShow: false,
      tab: 'week', // week | month
      createCalendar: [
        // {
        //   date: 'YYYY-MM-DD',
        //   count: 0
        // }
      ],
      finishCalendar: [],
      chart: null
    }
  },
  computed: {
    displayedCreateCalendar () {
      if (this.tab === 'week') {
        return this.createCalendar.slice(29 - 6)
      } else {
        return this.createCalendar
      }
    },
    displayedFinishCalendar () {
      if (this.tab === 'week') {
        return this.finishCalendar.slice(29 - 6)
      } else {
        return this.finishCalendar
      }
    },
    totalCount () {
      return {
        created: this.displayedCreateCalendar.reduce((total, item) => total + item.count, 0),
        finished: this.displayedFinishCalendar.reduce((total, item) => total + item.count, 0)
      }
    },
    avarageCount () {
      const days = this.tab === 'week' ? 7 : 30
      return {
        created: numberUtil.round(this.totalCount.created / days, 2),
        finished: numberUtil.round(this.totalCount.finished / days, 2)
      }
    }
  },

  mounted () {
    eventBus.$on('showStatistics', () => {
      this.show()
    })
  },

  beforeDestroy () {
    eventBus.$off('showStatistics')
  },

  methods: {
    preserveData () {
      let [year, month, day] = this.today.split('-')
      year = parseInt(year, 10)
      month = parseInt(month, 10)
      day = parseInt(day, 10)
      // 因为计算上今日，需回退29天
      const thirtyDaysAgo = new Date(year, month - 1, day - 29, 0, 0, 0).getTime()
      const list = JSON.parse(JSON.stringify(this.list))
      const newCreatedList = list.filter(t => t.createTime && t.createTime >= thirtyDaysAgo)
      const newFinishedList = list.filter(t => t.doneTime && t.doneTime >= thirtyDaysAgo)
      // console.log(newCreatedList, newFinishedList)
      this.proceedData(newCreatedList, newFinishedList, thirtyDaysAgo)
    },
    proceedData (createList = [], finishList = [], startDate) {
      const createCalendar = createList.reduce((soFar, item) => {
        const date = dateUtil.formatDateTime('YYYY-MM-DD', item.createTime)
        if (soFar[date]) {
          soFar[date]++
        } else {
          soFar[date] = 1
        }
        return soFar
      }, {})
      const finishCalendar = finishList.reduce((soFar, item) => {
        const date = dateUtil.formatDateTime('YYYY-MM-DD', item.doneTime)
        if (soFar[date]) {
          soFar[date]++
        } else {
          soFar[date] = 1
        }
        return soFar
      }, {})
      // console.log(createCalendar, finishCalendar)
      const fixedCreateCalendar = []
      const fixedFinishCalendar = []
      let from = startDate
      const now = new Date().getTime()
      while (from < now) {
        const date = dateUtil.formatDateTime('YYYY-MM-DD', from)
        const createCount = createCalendar[date] || 0
        const finishCount = finishCalendar[date] || 0
        fixedCreateCalendar.push({
          date,
          count: createCount
        })
        fixedFinishCalendar.push({
          date,
          count: finishCount
        })
        from += 1000 * 60 * 60 * 24
      }
      // console.log(fixedCreateCalendar, fixedFinishCalendar)
      this.createCalendar = fixedCreateCalendar
      this.finishCalendar = fixedFinishCalendar
      sleep(100).then(() => {
        this.paintChart()
      })
    },
    paintChart () {
      if (!this.chart) {
        const chartDom = document.querySelector('#chart')
        this.chart = echarts.init(chartDom)
      }
      const option = {
        tooltip: {
          trigger: 'axis'
          // axisPointer: {
          //   type: 'cross',
          //   label: {
          //     backgroundColor: '#6a7985'
          //   }
          // }
        },
        legend: {
          textStyle: {
            color: '#aaa'
          },
          data: ['Created', 'Finished']
        },
        // grid: {
        //   left: '3%',
        //   right: '4%',
        //   bottom: '3%',
        //   containLabel: true
        // },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: this.displayedCreateCalendar.map(item => item.date.substring(5))
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            name: 'Created',
            type: 'bar',
            // smooth: true,
            areaStyle: {},
            emphasis: {
              focus: 'series'
            },
            data: this.displayedCreateCalendar.map(item => item.count)
          },
          {
            name: 'Finished',
            type: 'bar',
            // smooth: true,
            areaStyle: {},
            emphasis: {
              focus: 'series'
            },
            data: this.displayedFinishCalendar.map(item => item.count)
          }
        ]
      }
      this.chart.setOption(option)
    },
    handleChangeTab (tab) {
      if (this.tab !== tab) {
        this.tab = tab
        this.paintChart()
      }
    },
    show () {
      this.isShow = true
      system.isPanelActive = true
      this.preserveData()
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

.bed-statis-panel {
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
      .box-chart {
        height: 360px;
      }
      .box-detail {
        margin: 12px 24px;
        .info {
          padding: 3px 0;
          color: $secondary-font-color;
          font-size: 14px;
          .highlight {
            color: $color-active;
            font-size: 16px;
            font-weight: 500;
          }
        }
        .box-efficiency {
          display: flex;
          // justify-content: space-between;
          align-items: center;
          margin-top: 12px;
          font-size: 14px;
          .label {
            margin-right: 12px;
            color: $secondary-font-color;
          }
          .text {
            width: 640px;
          }
        }
      }
    }
  }
}
@media (prefers-color-scheme: dark) {
  .bed-statis-panel {
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
        .box-detail {
          .info {
            color: $secondary-font-color-dark;
            .highlight {
              color: $color-active-dark;
            }
          }
          .box-efficiency {
            .label {
              color: $secondary-font-color-dark;
            }
          }
        }
      }
    }
  }
}
</style>
