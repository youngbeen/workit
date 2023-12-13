<template>
  <section class="bed-add-panel" v-show="isShow">
    <div class="modal-bg" :class="[animated && 'animated']" @click="close()"></div>
    <div class="container" :class="[animated && 'animated', isMoreShow && 'extend']">
      <div class="box-row" style="height: 40px;">
        <div class="box-select" v-show="!parentId">
          <select class="common-select" v-model="category" :disabled="category === 'history'" style="width: 200px;">
            <option v-for="c in catOptions"
              :key="c.value"
              :value="c.value">{{ c.label }}</option>
          </select>
        </div>
        <div class="box-info" v-show="parentId">
          Sub task under <span class="sub-title">{{ category }}</span> / <span class="title" :title="parentName">{{ parentName }}</span>
        </div>
        <div class="box-btns">
          <div class="icon-btn" @click="save()">
            <font-awesome-icon :icon="['fas', 'check']" />
          </div>
          <div class="icon-btn" v-if="mode === 'add'" @click="save(true)">
            <font-awesome-icon :icon="['fas', 'caret-square-up']" />
          </div>
          <div class="icon-btn lg" @click="toggleMore()">
            <font-awesome-icon :icon="['fas', 'chevron-down']" v-show="!isMoreShow" />
            <font-awesome-icon :icon="['fas', 'chevron-up']" v-show="isMoreShow" />
          </div>
        </div>
      </div>
      <div class="box-row">
        <textarea id="task-input" class="common-textarea"
          autofocus
          :placeholder="parentId ? 'sub todo task content goes here...' : 'todo task content goes here...'"
          v-model="content"
          @keydown="handleContentChange()"
          @keypress.tab.prevent="isMoreShow = true"
          @keypress.enter="save()"></textarea>
      </div>
      <!-- 更多录入 -->
      <div class="more">
        <div class="row" style="padding-bottom: 0;" v-if="usedTags.length">
          <div class="icon-image">
            <font-awesome-icon :icon="['fas', 'tag']" />
          </div>
          <div class="tag-options">
            <span class="common-tag tag-btn" :class="[tags.includes(label) && 'active']" v-for="(label, index) in usedTags" :key="index" @click="toggleTag(label)">{{ label }}</span>
          </div>
        </div>
        <div class="row" style="padding-top: 6px;" v-if="usedTags.length">
          <div class="box-input" style="margin-left: 38px;">
            <input class="common-input" type="text" placeholder="tags, seperate with comma" v-model="inputTags" @keypress.enter="save()" @keyup="tags = inputTags.split(',')">
            <div class="box-btns">
              <div class="icon-btn" title="Clear" v-show="inputTags" @click="clearTags()">
                <font-awesome-icon :icon="['fas', 'times-circle']" />
              </div>
            </div>
          </div>
        </div>
        <div class="row" v-else>
          <div class="icon-image">
            <font-awesome-icon :icon="['fas', 'tag']" />
          </div>
          <div class="box-input">
            <input class="common-input" type="text" placeholder="tags, seperate with comma" v-model="inputTags" @keypress.enter="save()" @keyup="tags = inputTags.split(',')">
            <div class="box-btns">
              <div class="icon-btn" title="Clear" v-show="inputTags" @click="clearTags()">
                <font-awesome-icon :icon="['fas', 'times-circle']" />
              </div>
            </div>
          </div>
        </div>
        <div class="row" style="padding-bottom: 0;">
          <div class="icon-image">
            <font-awesome-icon :icon="['fas', 'stopwatch']" />
          </div>
          <div class="box-shortcuts">
            <div class="shortcuts-btn" @click="setDueDate('today')">Today</div>
            <div class="shortcuts-btn" @click="setDueDate('tomorrow')">Tomorrow</div>
            <div class="shortcuts-btn" style="margin-right: 12px;" @click="setDueDate('friday')">Friday</div>
            <div class="date-shortcuts">
              <div class="cell"
                :class="[halfDays >= c && 'active']"
                v-for="(c, index) in 12"
                :key="index"
                @mouseover="handleMouseOver(c)"
                @mouseout="handleMouseOut(c)"
                @click="handleSetDueDate(c)">{{ c % 2 ? '&nbsp;' : c / 2 }}</div>
            </div>
            <div class="date-preview">{{ previewDateText }}</div>
          </div>
        </div>
        <div class="row">
          <div class="box-input" style="margin-left: 38px;">
            <input class="common-input" id="due-date-input" type="text" placeholder="due date" v-model="dueTime" @keypress.enter="save()">
            <div class="box-btns">
              <div class="weekday-tip">{{ currentWeekday }}</div>
              <div class="icon-btn" title="Clear" v-show="dueTime" @click="dueTime = ''">
                <font-awesome-icon :icon="['fas', 'times-circle']" />
              </div>
              <div class="icon-btn" title="Pick Date" @click="handlePickDate()">
                <font-awesome-icon :icon="['fas', 'chevron-circle-down']" />
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="icon-image">
            <font-awesome-icon :icon="['fas', 'sync']" />
          </div>
          <div class="">
            <select class="common-select"
              v-model="repeatType"
              style="width: 526px;">
              <option v-for="r in repeatTypeOptions"
                :key="r.value"
                :value="r.value">{{ r.label }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ipcRenderer } from 'electron'
import { sleep } from '@youngbeen/sleep'
import { getComingWorkday } from '@youngbeen/workday'
import eventBus from '@/eventBus'
import { cats } from '@/models/DictMap'
import system from '@/models/system'
import { analyse } from '@/utils/analyzer'
import dataCtrl from '@/ctrls/dataCtrl'
import { dateUtil } from '@youngbeen/angle-util'

export default {
  data () {
    return {
      mode: '', // add | edit
      isShow: false,
      animated: false, // 开启动画控制
      isMoreShow: false,
      parentId: null, // 有值则认为是子任务
      parentName: '', // 仅用于显示
      category: '',
      content: '',
      inputTags: '', // 标签值以此为准，tags只用于收录选择显示
      tags: [],
      // catOptions: cats.slice(0, cats.length - 1),
      usedTags: [],
      dueTime: '', // YYYY-MM-DD HH:mm:ss
      halfDays: 0,
      repeatType: '',
      repeatTypeOptions: [
        { label: 'One Time', value: '' },
        { label: 'Every Workday', value: 'everyWorkday' },
        { label: 'Every Monday', value: 'everyMonday' },
        { label: 'Every Tuesday', value: 'everyTuesday' },
        { label: 'Every Wednesday', value: 'everyWednesday' },
        { label: 'Every Thursday', value: 'everyThursday' },
        { label: 'Every Friday', value: 'everyFriday' },
        { label: 'Every Saturday', value: 'everySaturday' },
        { label: 'Every Sunday', value: 'everySunday' }
      ]
    }
  },
  computed: {
    previewDueDate () {
      if (this.halfDays) {
        const divDays = Math.ceil(this.halfDays / 2)
        const isHalfDayLeft = this.halfDays % 2
        const date = this.getDateByPostDays(divDays)
        return dateUtil.formatDateTime('YYYY-MM-DD', date) + (isHalfDayLeft ? ' 12:00:00' : ' 18:00:00')
      } else {
        return ''
      }
    },
    weekDay () {
      if (this.previewDueDate) {
        const date = new Date(this.previewDueDate)
        return date.getDay()
      } else {
        return ''
      }
    },
    weekDayText () {
      if (this.weekDay || this.weekDay === 0) {
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][this.weekDay]
      } else {
        return ''
      }
    },
    previewDateText () {
      if (this.previewDueDate) {
        return `${this.previewDueDate.substring(5).split(':')[0]}h (${this.weekDayText})`
      } else {
        return ''
      }
    },
    currentWeekday () {
      if (this.dueTime) {
        const weekday = (new Date(this.dueTime)).getDay()
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][weekday]
      } else {
        return ''
      }
    },
    catOptions () {
      if (this.category === 'history') {
        return cats
      } else {
        return cats.slice(0, cats.length - 1)
      }
    }
  },

  mounted () {
    eventBus.$on('showAddItem', (params) => {
      if (params?.parentId) {
        // 添加子任务
        this.show({
          parentId: params.parentId,
          params
        })
      } else {
        // 添加主任务
        this.show({
          mode: 'add'
        })
      }
    })
    eventBus.$on('whenSelectDateDone', data => {
      const { year, month, day, hour, minute, second } = data.data
      const time = new Date(year, month - 1, day, hour, minute, second)
      this.dueTime = dateUtil.formatDateTime('YYYY-MM-DD HH:mm:ss', time)
    })
    eventBus.$on('showEditItem', (params) => {
      this.show({
        mode: 'edit',
        parentId: params.parentId || null,
        params
      })
    })
    ipcRenderer.on('sys_additem', () => {
      if (system.isPanelActive) {
        return
      }
      if (this.mode !== 'edit') {
        this.show({
          mode: 'add'
        })
      }
    })
    ipcRenderer.on('sys_additem_full', () => {
      if (system.isPanelActive) {
        return
      }
      if (this.mode !== 'edit') {
        this.show({
          useLastTags: true
        })
      }
    })
    ipcRenderer.on('sys_cancel', () => {
      if (system.isPanelActive && this.isShow) {
        this.close()
      }
    })
  },

  beforeDestroy () {
    eventBus.$off('showAddItem')
    eventBus.$off('showEditItem')
  },

  methods: {
    handleContentChange () {
      const analysedContent = analyse(this.content)
      // console.log(analysedContent)
      this.content = analysedContent.trimContent
      if (analysedContent.labels.length) {
        analysedContent.labels.forEach(l => {
          this.toggleTag(l, 'new')
        })
        this.isMoreShow = true
      }
      if (analysedContent.dueDate) {
        this.dueTime = analysedContent.dueDate
        this.isMoreShow = true
      }
      if (analysedContent.repeatType || analysedContent.repeatType === '') {
        this.repeatType = analysedContent.repeatType
        this.isMoreShow = true
      }
    },
    handlePickDate () {
      // console.log(document.querySelector('#due-date-input'))
      const { top, left, height } = document.querySelector('#due-date-input').getBoundingClientRect()
      // console.log(top, left, bottom, right)
      eventBus.$emit('notifyDatePicker', {
        defaultTime: this.dueTime,
        position: {
          left,
          top: top + height
        },
        callback: 'whenSelectDateDone'
      })
    },
    handleMouseOver (halfDays) {
      this.halfDays = halfDays
    },
    handleMouseOut () {
      this.halfDays = 0
    },
    handleSetDueDate () {
      this.dueTime = this.previewDueDate
    },
    setDueDate (type) {
      const now = new Date()
      switch (type) {
        case 'today':
          this.dueTime = dateUtil.formatDateTime('YYYY-MM-DD', now) + ' 18:00:00'
          break
        case 'tomorrow': {
          const tomorrow = now.getTime() + 1000 * 60 * 60 * 24
          this.dueTime = dateUtil.formatDateTime('YYYY-MM-DD', tomorrow) + ' 18:00:00'
          break
        }
        case 'friday': {
          const nowWeekday = now.getDay()
          let leftDays = 5 - nowWeekday
          leftDays <= 0 && (leftDays += 7)
          const friday = now.getTime() + 1000 * 60 * 60 * 24 * leftDays
          this.dueTime = dateUtil.formatDateTime('YYYY-MM-DD', friday) + ' 18:00:00'
          break
        }
      }
    },
    getDateByPostDays (postDays = 0) {
      const now = new Date()
      let date = now
      if (postDays) {
        date = getComingWorkday(now, postDays)
      }
      return date
    },
    save (reverse = false) {
      if (this.content) {
        let dueTime = ''
        if (this.dueTime) {
          const [ymd, hms] = this.dueTime.split(' ')
          const [year, month, day] = ymd.split('-')
          const [hour, minute, second] = hms.split(':')
          dueTime = (new Date(year, month - 1, day, hour, minute, second)).getTime()
        }
        eventBus.$emit(`${this.mode}Item`, {
          parentId: this.parentId,
          category: this.category,
          content: this.content,
          tags: this.inputTags,
          dueTime,
          repeatType: this.repeatType,
          reverse
        })
        this.close()
      } else {
        window.alert('You must input something before saving')
      }
    },
    toggleMore () {
      this.isMoreShow = !this.isMoreShow
    },
    toggleTag (tag, mode = 'toggle') {
      const targetIndex = this.tags.indexOf(tag)
      if (targetIndex > -1) {
        // 已选中
        if (mode === 'toggle') {
          // 取消选中
          this.tags.splice(targetIndex, 1)
        }
      } else {
        // 未选中，则选中
        this.tags.push(tag)
      }
      this.inputTags = this.tags.join(',')
    },
    clearTags () {
      this.inputTags = ''
      this.tags = []
    },
    show ({ mode = 'add', parentId = null, params = {}, useLastTags = false }) {
      this.mode = mode
      this.parentId = parentId
      if (this.mode === 'edit') {
        // 编辑主，子任务
        this.isMoreShow = true
        this.parentName = params.parentName || ''
        this.category = params.category
        this.content = params.content
        this.inputTags = params.tags
        if (this.inputTags) {
          this.tags = this.inputTags.split(',')
        } else {
          this.tags = []
        }
        this.dueTime = params.dueTime ? dateUtil.formatDateTime('YYYY-MM-DD HH:mm:ss', params.dueTime) : ''
        this.repeatType = params.repeatType || ''
      } else if (this.parentId) {
        // 新增子任务
        this.isMoreShow = true
        this.parentName = params.parentName || ''
        this.category = params.category
        this.inputTags = params.tags
        if (this.inputTags) {
          this.tags = this.inputTags.split(',')
        } else {
          this.tags = []
        }
        if (!this.isShow) {
          // 重新打开的情况，清空之前的脏数据
          this.content = ''
        }
        this.dueTime = ''
        this.repeatType = ''
      } else {
        // 新增主任务
        this.isMoreShow = false
        // 不允许主动添加数据
        if (['history', 'focus', 'calendar'].includes(system.tab)) {
          this.category = 'inbox'
        } else {
          this.category = system.tab
        }
        if (!this.isShow) {
          // 重新打开的情况，清空之前的脏数据
          this.content = ''
        }
        this.inputTags = ''
        this.tags = []
        this.dueTime = ''
        this.repeatType = ''
      }
      this.usedTags = dataCtrl.readTags()
      if (useLastTags) {
        this.inputTags = dataCtrl.readLastUsedTag() || ''
        if (this.inputTags) {
          this.tags = this.inputTags.split(',')
        } else {
          this.tags = []
        }
        this.isMoreShow = true
      }
      this.isShow = true
      system.isPanelActive = true
      sleep(100).then(() => {
        this.animated = true
        document.querySelector('#task-input').focus()
      })
    },
    close () {
      this.animated = false
      sleep(200).then(() => {
        this.isShow = false
        this.mode = ''
        system.isPanelActive = false
      })
    }
  }
}
</script>

<style scoped lang="scss">
@import "../assets/css/var.scss";

.bed-add-panel {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 99;
  width: 100%;
  height: 100%;
  .container {
    margin: -300px auto;
    width: 600px;
    height: 116px;
    padding-top: 6px;
    border-bottom-right-radius: $border-radius;
    border-bottom-left-radius: $border-radius;
    background: $sheet-bgcolor;
    box-shadow: $sheet-boxshadow;
    opacity: 0;
    overflow: hidden;
    transition: all $transition-time;
    .box-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 18px;
      .box-info {
        color: $sub-font-color;
        .sub-title {
          display: inline-block;
          color: $secondary-font-color;
          font-weight: bold;
          text-transform: capitalize;
        }
        .title {
          display: inline-block;
          vertical-align: top;
          max-width: 260px;
          color: $primary-font-color;
          font-weight: bold;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      .box-select {
        position: relative;
        height: $input-height;
      }
      .box-btns {
        display: flex;
        align-items: center;
      }
    }
    .more {
      margin-top: 12px;
      border-top: 1px solid $border-color;
      .row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 18px;
        .tag-options {
          width: 526px;
          // height: 28px;
          padding: 4px 0 0;
          // border: 1px solid #ccc;
          // border-radius: $border-radius;
          white-space: nowrap;
          overflow: hidden;
          .common-tag {
            margin-right: 6px;
            margin-bottom: 4px;
          }
        }
        .box-input {
          position: relative;
          .common-input {
            width: 500px;
          }
          .box-btns {
            display: flex;
            align-items: center;
            position: absolute;
            right: 2px;
            top: 0;
            bottom: 0;
            .weekday-tip {
              margin-right: 6px;
              // width: 38px;
              padding: 0 6px;
              // border: 1px solid $color-active;
              border-radius: 3px;
              background: rgba($color-active, .5);
              color: #fff;
              font-weight: bold;
            }
          }
        }
      }
      .box-shortcuts {
        display: flex;
        width: 526px;
        .shortcuts-btn {
          margin-right: 6px;
          height: 18px;
          line-height: 18px;
          padding: 0 3px;
          border: 1px solid $color-active;
          border-radius: 3px;
          text-align: center;
          font-size: 12px;
          transition: all $transition-time;
          cursor: pointer;
          user-select: none;
          &:hover {
            background: $color-active;
            color: #fff;
          }
        }
        .date-shortcuts {
          margin-right: 12px;
          // width: 220px;
          .cell {
            display: inline-block;
            vertical-align: top;
            margin-right: 1px;
            width: 12px;
            height: 18px;
            border: 1px solid $color-active;
            // border-radius: 3px;
            text-align: center;
            transition: all $transition-time;
            cursor: pointer;
            user-select: none;
            &:first-of-type {
              border-top-left-radius: 3px;
              border-bottom-left-radius: 3px;
            }
            &:last-of-type {
              border-top-right-radius: 3px;
              border-bottom-right-radius: 3px;
            }
            &.active {
              background: $color-active;
              color: #fff;
            }
          }
        }
        .date-preview {
          width: 120px;
          // font-size: 11px;
        }
      }
    }
    &.extend {
      height: 350px;
    }
    &.animated {
      margin-top: -1px;
      opacity: 1;
    }
  }
}
@media (prefers-color-scheme: dark) {
  .bed-add-panel {
    .container {
      border: 1px solid $border-color-dark;
      background: $sheet-bgcolor-dark;
      box-shadow: none;
      .box-row {
        .box-info {
          color: $sub-font-color-dark;
          .sub-title {
            color: $secondary-font-color-dark;
          }
          .title {
            color: $primary-font-color-dark;
          }
        }
      }
      .more {
        border-top: 1px solid $border-color-dark;
        .row {
          .box-input {
            .box-btns {
              .weekday-tip {
                background: rgba($color-active-dark, .5);
                color: $primary-font-color-dark;
              }
            }
          }
        }
        .box-shortcuts {
          .shortcuts-btn {
            color: $secondary-font-color-dark;
            border: 1px solid $color-active-dark;
            &:hover {
              background: $color-active-dark;
              color: $primary-font-color-dark;
            }
          }
          .date-shortcuts {
            .cell {
              color: $secondary-font-color-dark;
              border: 1px solid $color-active-dark;
              &.active {
                background: $color-active-dark;
                color: $primary-font-color-dark;
              }
            }
          }
          .date-preview {
            color: $secondary-font-color-dark;
          }
        }
      }
    }
  }
}
</style>
