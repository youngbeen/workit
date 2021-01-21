<template>
  <div id="app">
    <left-nav :counts="catCounts" :mainCounts="catMainTaskCounts"></left-nav>

    <note-panel :data="relatedNotes"></note-panel>

    <div class="box-main" :class="[relatedNotes.length && 'collapse']">
      <action-bar :filteredCount="currentList.length" :totalCount="catCounts[system.tab]"></action-bar>

      <!-- list -->
      <div class="box-list">
        <!-- <button @click="autoClearHistory()">Test</button> -->
        <div class="box-item" :class="[item.index === focusIndex && 'focused', 'animated']"
          :style="{ transitionDelay: index / 20 + 's' }"
          :draggable="system.tab !== 'focus'"
          v-for="(item, index) in currentList" :key="item.index"
          @dragstart="handleDragstart($event, item.cat, item.index)"
          @dragover.prevent="handleDragover"
          @drop.prevent="handleDrop($event, item.index)">
          <index-indicator :index="index"></index-indicator>
          <cat-indicator v-show="system.tab === 'focus'" :name="item.cat"></cat-indicator>
          <!-- <div class="group-indicator" v-show="system.tab !== 'history' && item.group" :style="{ 'background': groupColors.get(item.group) }">&nbsp;</div> -->
          <div class="box-radio"
            v-show="system.tab !== 'history' && system.tab !== 'note' && item.status === 0"
            @click="handleFinish(item.index)"></div>
          <div class="content"
            :class="[item.parentId && 'sub',
              item.status === 1 && 'done',
              system.tab === 'history' && 'done',
              system.tab === 'history' && isDoneInToday(item.doneTime) && 'highlight']">
            <font-awesome-icon class="sub-icon" v-if="item.parentId" :icon="['fas', 'atom']" /> {{ item.content }}
            <due-tag v-if="item.dueTime && system.tab !== 'history'" :time="item.dueTime" :now="nowTime"></due-tag>
          </div>
          <div class="labels"
            :class="[item.parentId && 'sub']"
            v-if="item.labels.length">
            <span class="common-tag sm label" v-for="(label, i) in item.labels" :key="i">{{ label }}</span>
          </div>
          <div class="box-btns">
            <!-- <div class="icon-btn btn" v-show="system.tab !== 'history' && !item.group && currentList.length > 1" @click="handleLink($event, system.tab, item, index)">
              <font-awesome-icon :icon="['fas', 'link']" title="Link" />
            </div>
            <div class="icon-btn btn" v-show="system.tab !== 'history' && item.group" @click="handleUnlink($event, system.tab, item, index)">
              <font-awesome-icon :icon="['fas', 'unlink']" title="Unlink" />
            </div> -->
            <div class="icon-btn btn"
              v-show="system.tab !== 'history' && !item.parentId"
              @click="handleAddSubTask(item)">
              <font-awesome-icon :icon="['fas', 'plus']" title="Add Sub Task" />
            </div>
            <div class="icon-btn btn"
              v-show="system.tab !== 'history' && item.parentId && item.status === 0"
              @click="handleTurnTask(item)">
              <font-awesome-icon :icon="['fas', 'eject']" title="Turn into task" />
            </div>
            <div class="icon-btn btn lg"
              v-show="system.tab === 'focus'"
              @click="handleGoto(item)">
              <font-awesome-icon :icon="['fas', 'chevron-right']" :title="'Go to ' + item.cat" />
            </div>
            <div class="icon-btn btn"
              v-show="!(item.parentId && item.status === 1)"
              @click="handleChangeCat($event, item)">
              <font-awesome-icon :icon="['fas', 'paper-plane']" title="Change Category" />
            </div>
            <div class="icon-btn btn"
              v-show="!(item.parentId && item.status === 1)"
              @click="handleShowEdit(item.cat, item.index)">
              <font-awesome-icon :icon="['fas', 'edit']" title="Edit" />
            </div>
            <div class="icon-btn btn" @click="handleShowMore($event, item, index)">
              <font-awesome-icon :icon="['fas', 'ellipsis-h']" title="More" />
            </div>
          </div>
        </div>

        <div class="common-tip" v-show="system.tab === 'history' && currentList.length >= historyLimit">
          <div class="tip btn-tip" @click="toggleHistoryViewMode()">click to {{ seePartHistory ? 'view all' : 'collapse' }}</div>
        </div>
      </div>

      <div class="no-data" v-show="!catCounts[system.tab]">
        <use-tip></use-tip>
      </div>
    </div>

    <!-- <pop-link :callback="link" :cancel="handlePopClose"></pop-link> -->
    <pop-changecat :callback="changeCat" :cancel="handlePopClose"></pop-changecat>
    <pop-actions :callback="confirmAction" :cancel="handlePopClose"></pop-actions>
    <add-panel></add-panel>
    <detail-panel></detail-panel>
    <filter-panel :labels="currentCatLabels"></filter-panel>
    <search-panel :list="list"></search-panel>
    <config-panel></config-panel>

    <date-picker></date-picker>
  </div>
</template>

<script>
import { ipcRenderer, clipboard } from 'electron'
import { sleep } from '@youngbeen/sleep'
import { dateUtil } from '@youngbeen/angle-util'
import eventBus from '@/eventBus'
import { cats, actions } from '@/models/DictMap'
import system from '@/models/system'
import config from '@/models/config'
// import colorUtil from '@/utils/ColorUtil'
import systemCtrl from '@/ctrls/systemCtrl'
import dataCtrl from '@/ctrls/dataCtrl'
import LeftNav from './components/LeftNav.vue'
import ActionBar from './components/ActionBar.vue'
import UseTip from './components/UseTip.vue'
import NotePanel from './components/NotePanel.vue'
// import PopLink from './components/PopLink.vue'
import PopChangecat from './components/PopChangecat.vue'
import PopActions from './components/PopActions.vue'
import AddPanel from './components/AddPanel.vue'
import DetailPanel from './components/DetailPanel.vue'
import FilterPanel from './components/FilterPanel.vue'
import SearchPanel from './components/SearchPanel.vue'
import ConfigPanel from './components/ConfigPanel.vue'
import DueTag from '@/components/DueTag.vue'
import IndexIndicator from '@/components/IndexIndicator.vue'
import CatIndicator from '@/components/CatIndicator.vue'
import DatePicker from '@/components/DatePickerPop.vue'

export default {
  components: {
    LeftNav,
    ActionBar,
    UseTip,
    NotePanel,
    // PopLink,
    PopChangecat,
    PopActions,
    AddPanel,
    DetailPanel,
    FilterPanel,
    SearchPanel,
    ConfigPanel,
    DueTag,
    IndexIndicator,
    CatIndicator,
    DatePicker
  },

  data () {
    return {
      animated: false,
      editingCat: '', // 正在编辑的类别
      editingIndex: -1, // 正在编辑的索引
      focusIndex: -1, // 正聚焦的索引（代表当前触发激活了pop box）
      seePartHistory: true, // 是否只展示部分历史数据
      historyLimit: 30, // 默认展示的历史条目数上限
      // groupColors: new Map(), // 颜色匹配字典，key=group, value=<css color string>
      list: [
        // {
        //   index: 0, // 原始索引
        //   content: '测试内容',
        //   cat: 'inbox',
        //   status: 0, // 0 - init, 1 - done
        //   labels: ['分类', '测试'],
        //   group: 1563168778668, // 分组，以时间戳作为唯一key匹配
        //   createTime: 1563168778668, // 因为创建时间是唯一的，可充当id
        //   updateTime: 1563168778668,
        //   dueTime: 1563168778668,
        //   doneTime: null,
        //   parentId: null, // 使用createTime作为id
        // }
      ],
      // displayedList: [],
      catOptions: cats.slice(0, cats.length - 1),
      actionOptions: actions,
      nowTime: 0,
      nowDate: '', // 当前日期，YYYY-MM-DD格式。因为有些判断是根据当前日期进行变动的，但是不能根据当前秒数判断（过于频繁）
      tc: null,
      system
    }
  },
  computed: {
    currentCatLabels () {
      if (this.system.tab === 'focus') {
        const list = this.list.filter(item => item.cat !== 'history' && item.status === 0 && item.dueTime && this.nowDate === dateUtil.formatDateTime('YYYY-MM-DD', item.dueTime))
        const labels = list.reduce((soFar, item) => {
          soFar = [...soFar, ...item.labels]
          return soFar
        }, [])
        return [...new Set(labels)]
      } else if (this.system.tab) {
        const list = this.list.filter(item => item.cat === this.system.tab)
        const labels = list.reduce((soFar, item) => {
          soFar = [...soFar, ...item.labels]
          return soFar
        }, [])
        return [...new Set(labels)]
      } else {
        return []
      }
    },
    currentList () {
      if (this.system.tab) {
        // 根据筛选条件筛选
        let rawList = this.list.map((item, index) => {
          item.index = index
          return item
        })
        if (this.system.tab === 'focus') {
          // 聚焦tab
          rawList = JSON.parse(JSON.stringify(this.list.filter(item => item.cat !== 'history' && item.status === 0 && item.dueTime && this.nowDate === dateUtil.formatDateTime('YYYY-MM-DD', item.dueTime))))
        } else {
          // 常规tab
          rawList = JSON.parse(JSON.stringify(this.list.filter(item => item.cat === this.system.tab)))
        }
        // 根据起始时间筛选
        if (this.system.filter.fromTime) {
          if (this.system.tab === 'history') {
            // 以完成时间筛选
            rawList = rawList.filter(item => item.doneTime && item.doneTime >= this.system.filter.fromTime)
          } else {
            // 以创建时间筛选
            rawList = rawList.filter(item => item.createTime && item.createTime >= this.system.filter.fromTime)
          }
        }
        // 根据结束时间筛选
        if (this.system.filter.toTime) {
          if (this.system.tab === 'history') {
            // 以完成时间筛选
            rawList = rawList.filter(item => item.doneTime && item.doneTime <= this.system.filter.toTime)
          } else {
            // 以创建时间筛选
            rawList = rawList.filter(item => item.createTime && item.createTime <= this.system.filter.toTime)
          }
        }
        // 根据标签进行筛选
        if (this.system.filter.tags.length) {
          // NOTE 把item的标签跟筛选的标签合并去重，如果合并去重后的数量比2类标签之和数量小，则说明有相同项存在，即代表符合筛选要求
          rawList = rawList.filter(item => {
            const labelsTogether = [...item.labels, ...this.system.filter.tags]
            return [...new Set(labelsTogether)].length < labelsTogether.length
          })
        }
        if (this.system.tab === 'history') {
          // 历史特殊处理
          rawList.reverse()
          if (this.seePartHistory) {
            rawList = rawList.slice(0, this.historyLimit)
          }
        }
        if (rawList.some(item => item.parentId)) {
          // 需要进行子任务调整
          const tasks = []
          const subTasks = []
          rawList.forEach(item => {
            if (item.parentId) {
              subTasks.push(item)
            } else {
              tasks.push(item)
            }
          })
          rawList = []
          tasks.forEach(t => {
            rawList.push(t)
            const relatedSubTasks = subTasks.filter(st => st.parentId === t.createTime)
            rawList = [...rawList, ...relatedSubTasks]
          })
        }
        return rawList
      } else {
        return []
      }
    },
    catCounts () {
      return this.list.reduce((soFar, item) => {
        if (item.cat) {
          soFar[item.cat]++
        } else {
          soFar.inbox++
        }
        if (item.cat !== 'history' && item.status === 0 && item.dueTime && this.nowDate === dateUtil.formatDateTime('YYYY-MM-DD', item.dueTime)) {
          soFar.focus++
        }
        return soFar
      }, {
        focus: 0,
        inbox: 0,
        current: 0,
        coming: 0,
        anytime: 0,
        someday: 0,
        tracking: 0,
        note: 0,
        history: 0
      })
    },
    catMainTaskCounts () {
      return this.list.reduce((soFar, item) => {
        if (item.parentId) {
          // 子任务不统计
          return soFar
        }
        if (item.cat) {
          soFar[item.cat]++
        } else {
          soFar.inbox++
        }
        if (item.cat !== 'history' && item.status === 0 && item.dueTime && this.nowDate === dateUtil.formatDateTime('YYYY-MM-DD', item.dueTime)) {
          soFar.focus++
        }
        return soFar
      }, {
        focus: 0,
        inbox: 0,
        current: 0,
        coming: 0,
        anytime: 0,
        someday: 0,
        tracking: 0,
        note: 0,
        history: 0
      })
    },
    relatedNotes () {
      if (this.system.tab && !['note', 'history'].includes(this.system.tab)) {
        return this.list.filter(n => {
          return n.cat === 'note' && n.labels.some(l => this.currentCatLabels.includes(l))
        })
      } else {
        return []
      }
    }
  },
  watch: {
    // currentList: {
    //   handler: function (newVal, oldVal) {
    //     console.log(newVal)
    //     this.currentList.forEach((item) => {
    //       if (item.group && !this.groupColors.has(item.group)) {
    //         let color = ''
    //         if (this.groupColors.size < groupColorsPreset.length) {
    //           // 分组数量足够使用预设的颜色
    //           color = groupColorsPreset[this.groupColors.size]
    //         } else {
    //           // 预设颜色不足，生成随机颜色
    //           color = colorUtil.getRandomColor()
    //         }
    //         this.groupColors.set(item.group, color)
    //       }
    //     })
    //     // this.animated = false
    //     // this.displayedList = [...this.currentList]
    //     // sleep(10).then(() => {
    //     //   this.animated = true
    //     // })
    //   },
    //   deep: true,
    //   immediate: true
    // }
    nowDate: function (newVal, oldVal) {
      if (newVal && oldVal) {
        // 每日执行
        if (config.historyClearMode === 'auto') {
          this.autoClearHistory()
        }
      }
    }
  },

  created () {
    // 读取之前的配置
    const savedConfig = dataCtrl.readConfig()
    if (savedConfig) {
      savedConfig.leftnavNumbersMode && (config.leftnavNumbersMode = savedConfig.leftnavNumbersMode)
      config.addNewAfterSubTaskAdded = savedConfig.addNewAfterSubTaskAdded || false
      savedConfig.historyClearMode && (config.historyClearMode = savedConfig.historyClearMode)
      savedConfig.historyClearDaysFilter && (config.historyClearDaysFilter = savedConfig.historyClearDaysFilter)
      savedConfig.historyWarningCount && (config.historyWarningCount = savedConfig.historyWarningCount)
    }
    // 读取之前缓存的旧数据
    const saveData = dataCtrl.read()
    if (saveData) {
      this.list = saveData
      if (config.historyClearMode === 'auto') {
        this.autoClearHistory()
      }
    }
    // 初始化激活nav
    let initTab = 'inbox'
    if (this.catCounts.focus) {
      initTab = 'focus'
    } else if (this.catCounts.tracking) {
      initTab = 'tracking'
    } else if (this.catCounts.inbox) {
      initTab = 'inbox'
    } else if (this.catCounts.current) {
      initTab = 'current'
    } else if (this.catCounts.coming) {
      initTab = 'coming'
    } else if (this.catCounts.anytime) {
      initTab = 'anytime'
    } else if (this.catCounts.someday) {
      initTab = 'someday'
    } else if (this.catCounts.note) {
      initTab = 'note'
    }
    systemCtrl.changeTab(initTab)

    // 历史数据过多提示
    if (config.historyClearMode === 'manual' && this.list.filter(item => item.cat === 'history').length > config.historyWarningCount) {
      const historyNotify = new Notification('Too many history items', {
        body: 'Begin to clean...'
      })

      historyNotify.onclick = () => {
        systemCtrl.changeTab('history')
      }
    }
  },

  mounted () {
    // ticking
    this.tc = setInterval(() => {
      this.nowTime = (new Date()).getTime()
      this.nowDate = dateUtil.formatDateTime('YYYY-MM-DD', this.nowTime)
    }, 1000)

    // 重构传入的参数，对象化处理
    eventBus.$on('addItem', (params) => {
      this.addItem(params)
    })
    eventBus.$on('editItem', (params) => {
      this.editItem(params)
    })
    eventBus.$on('changeCat', (params) => {
      this.changeCat(params)
    })
    // eventBus.$on('proceedSort', (params) => {
    //   this.sort(params)
    // })
    eventBus.$on('clearHistory', () => {
      this.clearHistory()
    })
    ipcRenderer.on('sys_copycontent', () => {
      this.copyAllContent()
    })
    ipcRenderer.on('sys_copycontent_withtag', () => {
      this.copyAllContent(true)
    })
    // ipcRenderer.on('sys_unlink_all', () => {
    //   this.unlinkAll()
    // })
    ipcRenderer.on('sys_export_trigger', () => {
      ipcRenderer.send('asynchronous-message', {
        type: 'sys_export_file',
        content: window.localStorage.getItem('workitSaveData')
      })
    })
    ipcRenderer.on('sys_importdata', (e, content, type) => {
      // console.log(content, type)
      this.importData(content, type)
    })
    ipcRenderer.on('sys_resetdata', () => {
      this.resetData()
    })
    ipcRenderer.on('sys_openconfig', () => {
      eventBus.$emit('showConfig')
    })
  },

  beforeDestroy () {
    clearInterval(this.tc)
    eventBus.$off('addItem')
    eventBus.$off('editItem')
    eventBus.$off('proceedSort')
    eventBus.$off('clearHistory')
  },

  methods: {
    toggleHistoryViewMode () {
      this.seePartHistory = !this.seePartHistory
    },
    isDoneInToday (doneTime) {
      if (!doneTime) {
        return false
      }
      const today = dateUtil.formatDateTime('YYYY-MM-DD', new Date())
      const doneDay = dateUtil.formatDateTime('YYYY-MM-DD', doneTime)
      return today === doneDay
    },
    addItem ({ parentId = null, category, content, tags, dueTime = null, reverse = false }) {
      let labelArray = []
      if (tags) {
        labelArray = tags.split(',')
      }
      labelArray = labelArray.filter(item => item)
      const now = (new Date()).getTime()
      const task = {
        content,
        cat: category,
        status: 0, // 0 - init, 1 - done
        labels: labelArray,
        group: null,
        createTime: now,
        updateTime: now,
        dueTime,
        parentId
      }
      if (reverse) {
        // 插入到首行
        if (parentId) {
          // 添加子任务，需要放到主任务的紧邻下一个
          const targetIndex = this.list.find(t => t.createTime === parentId)?.index + 1
          this.list.splice(targetIndex, 0, task)
        } else {
          // 添加主任务，放置到队列头部
          this.list.unshift(task)
        }
      } else {
        // 插入到末尾
        if (parentId) {
          // 添加子任务，需要放到主任务的最后一个子任务紧邻下一个
          let targetIndex = this.list.reduce((maxIndex, t) => {
            if (t.parentId === parentId && t.index > maxIndex) {
              return t.index
            } else {
              return maxIndex
            }
          }, -1)
          if (targetIndex > -1) {
            this.list.splice(targetIndex + 1, 0, task)
          } else {
            // 未找到正确的附属末尾子任务，改为放置到主任务紧邻下一个
            targetIndex = this.list.find(t => t.createTime === parentId)?.index + 1
            this.list.splice(targetIndex, 0, task)
          }
        } else {
          // 添加主任务，放置到队列末尾
          this.list.push(task)
        }
      }
      // console.table(this.list)
      dataCtrl.save(this.list)
      dataCtrl.saveTag(labelArray)
      dataCtrl.saveLastUsedTag(labelArray)

      if (parentId && config.addNewAfterSubTaskAdded) {
        // 继续添加子任务
        console.log('should add another sub task')
        const parentTask = this.list.find(t => t.createTime === parentId)
        sleep(300).then(() => {
          this.handleAddSubTask(parentTask)
        })
      }
    },
    editItem ({ parentId = null, category, content, tags, dueTime = null }) {
      let labelArray = []
      if (tags) {
        labelArray = tags.split(',')
      }
      labelArray = labelArray.filter(item => item)
      const now = (new Date()).getTime()
      if (category !== this.editingCat) {
        // 用户更改了分类
        const item = this.list.splice(this.editingIndex, 1)[0]
        item.content = content
        item.cat = category
        item.labels = labelArray
        item.updateTime = now
        item.dueTime = dueTime
        item.doneTime = null
        this.list.push(item)
      } else {
        // 仅更改值
        this.list[this.editingIndex].content = content
        this.list[this.editingIndex].labels = labelArray
        this.list[this.editingIndex].updateTime = now
        this.list[this.editingIndex].dueTime = dueTime
      }
      dataCtrl.save(this.list)
      dataCtrl.saveTag(labelArray)
    },
    copyAllContent (withTags = false) {
      let contents = []
      if (withTags) {
        contents = this.currentList.map(item => {
          let tagStr = ''
          if (item.labels.length) {
            item.labels.forEach(l => {
              tagStr += `[${l}]`
            })
            tagStr += ' - '
          }
          return `${tagStr}${item.content}`
        })
      } else {
        contents = this.currentList.map(item => item.content)
      }
      clipboard.writeText(contents.join('\n'))
      const copyNotify = new Notification('Content Copied', {
        body: 'Content was copied into clipboard'
      })
      copyNotify.onclick = () => {
        // console.log('copied into clipboard')
      }
    },
    clearHistory () {
      if (!this.catCounts.history) {
        return
      }
      dataCtrl.backup('History', this.list.filter(item => item.cat === 'history'))
      this.list = this.list.filter(item => item.cat !== 'history')
      dataCtrl.save(this.list)
      const clearNotify = new Notification('All history data are cleared!', {
        body: 'Click to restore'
      })
      clearNotify.onclick = () => {
        this.restoreHistory()
      }
    },
    restoreHistory () {
      const data = dataCtrl.readBackup('History')
      if (data) {
        this.list = [...this.list, ...data]
        dataCtrl.save(this.list)
      }
    },
    handleFinish (index) {
      dataCtrl.saveSnapshot(this.list)
      const now = (new Date()).getTime()
      const task = this.list[index]
      if (task.parentId) {
        // 完成子任务
        const item = this.list.splice(index, 1)[0]
        item.status = 1
        item.doneTime = now
        this.list.splice(index, 0, item)
      } else {
        // 完成主任务
        const subTasks = this.list.filter(t => t.parentId === task.createTime && t.cat === task.cat)
        let finishedSubTasks = []
        if (subTasks.length) {
          // 自动完成所有当前未完成的子任务
          for (let i = subTasks.length - 1; i >= 0; i--) {
            const subTask = subTasks[i]
            if (subTask.status === 1) {
              // 子任务之前已完成
              subTask.cat = 'history'
            } else {
              // 子任务还未完成
              subTask.cat = 'history'
              subTask.status = 1
              subTask.doneTime = now
            }
            finishedSubTasks = [subTask, ...finishedSubTasks]
            this.list.splice(subTask.index, 1)
          }
        }
        const item = this.list.splice(index, 1)[0]
        item.cat = 'history'
        item.status = 1
        item.doneTime = now
        this.list.push(item)
        this.list = [...this.list, ...finishedSubTasks]
      }
      // console.table(this.list)
      dataCtrl.save(this.list)
      const finishNotify = new Notification('Congratulations!', {
        body: 'You just finished a task, click to cancel...'
      })
      finishNotify.onclick = () => {
        const snapshot = dataCtrl.readSnapshot()
        if (snapshot) {
          this.list = snapshot
          dataCtrl.save(this.list)
        }
      }
    },
    // handleLink (e, cat, task, showIndex) {
    //   this.focusIndex = task.index
    //   const options = []
    //   const existGroups = []
    //   this.currentList.forEach((item) => {
    //     if (item.index !== task.index) {
    //       if (!item.group) {
    //         // 没有分组的可以被link
    //         options.push({
    //           value: item.index,
    //           text: item.content,
    //           labels: item.labels,
    //           group: item.group
    //         })
    //       } else {
    //         // 有分组
    //         if (!existGroups.length || !existGroups.includes(item.group)) {
    //           // 新的分组
    //           existGroups.push(item.group)
    //           options.push({
    //             value: item.index,
    //             text: item.content,
    //             labels: item.labels,
    //             group: item.group
    //           })
    //         } else {
    //           // 已有的分组
    //         }
    //       }
    //     }
    //   })
    //   // console.log(options)
    //   eventBus.$emit('showPopLink', {
    //     options,
    //     position: {
    //       left: e.clientX,
    //       top: e.clientY
    //     },
    //     tag: {
    //       cat,
    //       index: task.index,
    //       showIndex
    //     }
    //   })
    // },
    // link (data) {
    //   // console.log(data)
    //   this.focusIndex = -1
    //   const source = this.list[data.tag.cat][data.tag.index]
    //   const target = this.list[data.tag.cat][data.value]
    //   console.log(source, target)
    //   if (!target.group) {
    //     // 目标也无分组，则创建一个新分组
    //     const newGroupKey = new Date().getTime()
    //     source.group = target.group = newGroupKey
    //   } else {
    //     // 目标有分组
    //     source.group = target.group
    //   }
    //   dataCtrl.save(this.list)
    // },
    // handleUnlink (e, cat, task, showIndex) {
    //   task.group = null
    //   this.list[cat].splice(task.index, 1, task)
    //   dataCtrl.save(this.list)
    // },
    // unlinkAll () {
    //   this.currentList.forEach((item, index) => {
    //     if (item.group) {
    //       const shiftingItem = this.list[system.tab].splice(index, 1)[0]
    //       shiftingItem.group = null
    //       this.list[system.tab].splice(index, 0, shiftingItem)
    //     }
    //   })
    //   dataCtrl.save(this.list)
    //   this.groupColors.clear()
    // },
    // sort () {
    //   // 按分组排序
    //   let index = 0
    //   for (; index < this.currentList.length; index++) {
    //     const item = this.currentList[index]
    //     if (item.group) {
    //       let nextIndex = index + 1
    //       const group = item.group
    //       for (let i = index + 1; i < this.currentList.length; i++) {
    //         const checkedItem = this.currentList[i]
    //         if (checkedItem.group === group && i !== nextIndex) {
    //           // 同分组，放置到一起
    //           const shiftingItem = this.list[system.tab].splice(i, 1)[0]
    //           this.list[system.tab].splice(nextIndex, 0, shiftingItem)
    //           index++
    //           nextIndex++
    //         }
    //       }
    //     }
    //   }
    //   dataCtrl.save(this.list)
    // },
    handleAddSubTask (task) {
      eventBus.$emit('showAddItem', {
        parentId: task.createTime,
        parentName: task.content,
        category: task.cat,
        tags: task.labels.join(',')
      })
    },
    handleTurnTask (task) {
      const item = this.list.splice(task.index, 1)[0]
      const targetIndex = this.list.findIndex(t => t.createTime === task.parentId)
      item.parentId = null
      this.list.splice(targetIndex, 0, item)
      dataCtrl.save(this.list)
    },
    handleGoto (task) {
      if (system.tab !== task.cat) {
        systemCtrl.changeTab(task.cat)
      }
    },
    handleChangeCat (e, task) {
      // console.log(e)
      this.focusIndex = task.index
      const options = this.catOptions.filter(item => item.value !== task.cat)
      eventBus.$emit('showPopChangecat', {
        options,
        position: {
          left: e.clientX,
          top: e.clientY
        },
        tag: {
          cat: task.cat,
          index: task.index
        }
      })
    },
    changeCat (data) {
      this.focusIndex = -1
      const task = this.list[data.tag.index]
      if (task.parentId && task.status === 1) {
        // 已完成的子任务正在修改分类
        console.warn('Cannot change a finished task\'s category')
        return
      }
      if (!task.parentId) {
        // 主任务修改分类
        const subTasks = this.list.filter(t => t.parentId === task.createTime && t.cat === task.cat)
        let changedSubTasks = []
        if (subTasks.length) {
          // 同步变更所有子任务的分类
          for (let i = subTasks.length - 1; i >= 0; i--) {
            const subTask = subTasks[i]
            if (subTask.cat === 'history') {
              // 从history中移出其他分类时，修改其状态
              subTask.status = 0
              subTask.doneTime = null
            }
            subTask.cat = data.value
            changedSubTasks = [subTask, ...changedSubTasks]
            this.list.splice(subTask.index, 1)
          }
        }
        // 变更主任务分类
        const item = this.list.splice(task.index, 1)[0]
        if (item.cat === 'history') {
          item.status = 0
          item.doneTime = null
        }
        item.cat = data.value
        this.list.push(item)
        this.list = [...this.list, ...changedSubTasks]
      } else {
        // 子任务修改分类，弹出为主任务
        const item = this.list.splice(task.index, 1)[0]
        if (item.cat === 'history') {
          item.status = 0
          item.doneTime = null
        }
        item.cat = data.value
        item.parentId = null
        this.list.push(item)
      }
      dataCtrl.save(this.list)
    },
    handleShowMore (e, task, showIndex) {
      // console.log(e)
      this.focusIndex = task.index
      let options = [...this.actionOptions]
      if (system.tab === 'focus') {
        options = options.slice(0, options.length - 2)
      }
      eventBus.$emit('showPopActions', {
        options,
        position: {
          left: e.clientX,
          top: e.clientY
        },
        tag: {
          cat: task.cat,
          index: task.index,
          showIndex
        }
      })
    },
    confirmAction (data) {
      this.focusIndex = -1
      switch (data.value) {
        case 'btt':
          this.handleBringToTop(data.tag.cat, data.tag.index)
          break
        case 'stb':
          this.handleSetToBottom(data.tag.cat, data.tag.index)
          break
        // case 'edit':
        //   this.handleShowEdit(data.tag.cat, data.tag.index)
        //   break
        case 'detail':
          this.handleShowDetail(data.tag.cat, data.tag.showIndex)
          break
        case 'delete':
          this.handleDelete(data.tag.cat, data.tag.index)
          break
      }
    },
    handleBringToTop (cat, index) {
      const item = this.list.splice(index, 1)[0]
      this.list = [item, ...this.list]
      dataCtrl.save(this.list)
    },
    handleSetToBottom (cat, index) {
      const item = this.list.splice(index, 1)[0]
      this.list = [...this.list, item]
      dataCtrl.save(this.list)
    },
    handleShowEdit (cat, index) {
      this.editingCat = cat
      this.editingIndex = index
      const task = this.list[index]
      eventBus.$emit('showEditItem', {
        category: cat,
        content: task.content,
        tags: task.labels.join(','),
        dueTime: task.dueTime,
        parentId: task.parentId,
        parentName: this.list.find(item => item.createTime === task.parentId)?.content || ''
      })
    },
    handleShowDetail (cat, index) {
      eventBus.$emit('showItemDetail', {
        list: JSON.parse(JSON.stringify(this.currentList)),
        category: cat,
        index
      })
    },
    handleDelete (cat, index) {
      dataCtrl.saveSnapshot(this.list)
      const task = this.list[index]
      if (task.parentId) {
        // 删除子任务
        this.list.splice(index, 1)
      } else {
        // 删除主任务
        const subTasks = this.list.filter(t => t.parentId === task.createTime && t.cat === task.cat)
        if (subTasks.length) {
          // 删除所有关联子任务
          for (let i = subTasks.length - 1; i >= 0; i--) {
            const subTask = subTasks[i]
            this.list.splice(subTask.index, 1)
          }
        }
        this.list.splice(index, 1)
      }
      dataCtrl.save(this.list)
      const deleteNotify = new Notification('Delete successfully', {
        body: 'Click to cancel'
      })
      deleteNotify.onclick = () => {
        const snapshot = dataCtrl.readSnapshot()
        if (snapshot) {
          this.list = snapshot
          dataCtrl.save(this.list)
        }
      }
    },
    handlePopClose () {
      this.focusIndex = -1
    },
    handleMouseover (cat, index) {
      // this.list[cat][index].isShowAction = true
    },
    handleMouseout (cat, index) {
      // this.list[cat][index].isShowAction = false
    },
    handleDragstart (e, cat, index) {
      // console.log('start', index)
      e.dataTransfer.dropEffect = 'move'
      e.dataTransfer.setData('sourceCat', cat)
      e.dataTransfer.setData('sourceIndex', index)
    },
    handleDragover (e) {
      // console.log('over', e)
      e.dataTransfer.dropEffect = 'move'
    },
    handleDrop (e, index) {
      // console.log('drop', index)
      e.dataTransfer.dropEffect = 'move'
      // 交换2个位置数据
      // const sourceCat = e.dataTransfer.getData('sourceCat')
      const sourceIndex = parseInt(e.dataTransfer.getData('sourceIndex'))
      if (sourceIndex === index) {
        console.log('dropping onto self, do nothing')
        return
      }
      const sourceTask = this.list[sourceIndex]
      const targetTask = this.list[index]
      if (!sourceTask.parentId && !targetTask.parentId) {
        // 主任务drop主任务，交换位置
        const item = this.list.splice(sourceIndex, 1)[0]
        this.list.splice(index, 0, item)
      } else if (targetTask.parentId) {
        // drop到子任务，则变更为该子任务兄弟任务，放于该子任务后
        const item = this.list.splice(sourceIndex, 1)[0]
        item.parentId = targetTask.parentId
        this.list.splice(targetTask.index + 1, 0, item)
      } else {
        // 子任务drop主任务，变更为该主任务的子任务
        const item = this.list.splice(sourceIndex, 1)[0]
        item.parentId = targetTask.createTime
        this.list.splice(targetTask.index + 1, 0, item)
      }
      dataCtrl.save(this.list)
    },
    importData (content, type) {
      const newData = JSON.parse(content)
      if (type === 'merge') {
        this.list = [...this.list, ...newData]
        dataCtrl.save(this.list)
      } else if (type === 'replace') {
        this.list = newData
        dataCtrl.save(this.list)
      }
      const notify = new Notification('Imported Successfully!', {
        body: ''
      })
      notify.onclick = () => {}
    },
    resetData () {
      this.list = []
      dataCtrl.save(this.list)
      dataCtrl.clearTags()
      systemCtrl.resetFilters()
    },
    autoClearHistory () {
      console.log('starting to clear history tasks automatically...')
      let edited = false
      for (let i = this.list.length - 1; i >= 0; i--) {
        const task = this.list[i]
        if (task.cat === 'history' && task.status === 1 && task.doneTime) {
          const now = (new Date()).getTime()
          if (now - task.doneTime > 1000 * 60 * 60 * 24 * config.historyClearDaysFilter) {
            console.log('removing a old done task', i, task)
            this.list.splice(i, 1)
            edited = true
          }
        }
      }
      edited && dataCtrl.save(this.list)
      console.log('clear process done')
    }
  }
}
</script>

<style lang="scss">
@import "./assets/css/var.scss";

@font-face {
  font-family: 'WorkSans Regular';
  src: url('./assets/fonts/WorkSans-Regular.otf');
}

html, body {
  margin: 0;
  width: 100%;
  height: 100%;
}
select, input {
  font-family: 'WorkSans Regular';
}
#app {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  background: $primary-bgcolor;
  color: $primary-color;
  font-size: $primary-font-size;
  font-family: 'WorkSans Regular', 'Monaco', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
// 公共样式
.icon-image {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 18px;
  height: 18px;
  color: $color-active;
  font-size: 14px;
  user-select: none;
}
.icon-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 18px;
  height: 18px;
  padding: 3px 6px;
  border-radius: $border-radius;
  color: $toolbar-icon-color;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
  transition: all $transition-time;
  &.lg {
    min-width: 20px;
    height: 20px;
    font-size: 16px;
  }
  &.active {
    background: $toolbar-bgcolor-active;
  }
  &:hover {
    background: $toolbar-bgcolor-hover;
    &.active {
      background: $toolbar-bgcolor-active-hover;
    }
  }
}
.modal-bg {
  position: absolute;
  left: 0;
  top: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  background: $modal-bgcolor;
  opacity: 0;
  transition: all $transition-time;
  &.animated {
    opacity: 1;
  }
}
.common-select {
  height: $input-height;
  padding: 0 8px;
  border: 1px solid #ccc;
  border-radius: $border-radius;
  background: $input-bgcolor;
  color: $primary-font-color;
  font-size: $primary-font-size;
  font-weight: 500;
  &:focus {
    background: $input-bgcolor-active;
  }
}
.common-input {
  height: $input-height;
  padding: 0 12px;
  border: 1px solid #ccc;
  border-radius: $border-radius;
  background: $input-bgcolor;
  color: $primary-font-color;
  font-size: $primary-font-size;
  font-weight: 500;
  &:focus {
    background: $input-bgcolor-active;
  }
}
.common-radio-group {
  display: inline-flex;
  align-items: center;
  border-radius: $border-radius;
  color: $toolbar-icon-color;
  transition: all $transition-time;
  .radio {
    height: $input-height;
    line-height: $input-height;
    padding: 0 8px;
    border-radius: $border-radius;
    font-weight: 600;
    transition: all $transition-time;
    &.active {
      background: $toolbar-bgcolor-active;
    }
  }
  &:hover {
    background: $toolbar-bgcolor-hover;
    .radio {
      &.active {
        background: $toolbar-bgcolor-active-hover;
      }
    }
  }
}
.common-textarea {
  width: 100%;
  height: 50px;
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: $border-radius;
  background: $input-bgcolor;
  color: $primary-font-color;
  font-family: 'WorkSans Regular', 'Monaco', Helvetica, Arial, sans-serif;
  font-size: $primary-font-size;
  font-weight: 500;
  resize: none;
  &:focus {
    background: $input-bgcolor-active;
  }
}
.common-radios {
  display: flex;
  align-items: center;
  border: 1px solid $itoolbar-border-color;
  border-radius: $border-radius;
  background: $itoolbar-bgcolor;
  .radio {
    height: $itoolbar-height;
    line-height: $itoolbar-height;
    padding: 0 8px;
    border: 1px solid $itoolbar-item-border-color;
    border-radius: $border-radius;
    color: $itoolbar-color;
    font-size: $primary-font-size;
    cursor: pointer;
    user-select: none;
    transition: all $transition-time;
    &:hover {
      background: $itoolbar-item-bgcolor-active;
    }
    &.active {
      background: $itoolbar-item-bgcolor-active;
      border: 1px solid $itoolbar-item-border-color-active;
      box-shadow: $itoolbar-item-boxshadow-active;
    }
  }
}
.common-tag {
  display: inline-block;
  // height: 30px;
  padding: 3px 6px;
  border-radius: $border-radius;
  color: $secondary-font-color;
  background: rgba(193, 219, 253, .3);
  font-size: $secondary-font-size;
  user-select: none;
  transition: all $transition-time;
  &.tag-btn {
    cursor: pointer;
    &:hover {
      background: rgba(193, 219, 253, .8);
    }
  }
  &.sm {
    font-size: $sub-font-size;
  }
  &.active {
    background: rgba(193, 219, 253, .8);
  }
}
.common-tip {
  padding: 6px 0;
  .tip {
    color: #777;
    text-align: center;
    &.btn-tip {
      cursor: pointer;
      user-select: none;
    }
  }
}
.keystroke {
  padding: 3px 6px;
  border-radius: 4px;
  background: #eee;
  font-weight: 500;
}

// 主区域私有样式
.box-main {
  width: 720px;
  height: 100%;
  background: $primary-bgcolor;
  box-shadow: 0px 0px 4px 0 rgba(122, 122, 122, .2);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  transition: all $transition-time-normal;
  &.collapse {
    width: 520px;
  }
  .box-list {
    max-height: 524px;
    padding: 0 0 18px 18px;
    font-size: 14px;
    // font-family: 'Monaco';
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 4px;
      background: $scrollbar-thumb-color;
    }
    .box-item {
      position: relative;
      border-bottom: 1px solid #eee;
      background: $primary-bgcolor;
      opacity: 0;
      cursor: default;
      overflow: hidden;
      transition: all $transition-time;
      &.animated {
        opacity: 1;
      }
      &.focused {
        background: linear-gradient(-90deg, #fff 3%, #eee 60%, #eee 100%);
      }
      .group-indicator {
        position: absolute;
        left: 0px;
        top: 0;
        bottom: 0;
        width: 3px;
        // background: $color-active;
      }
      .box-radio {
        position: absolute;
        left: 5px;
        top: 8px;
        width: 16px;
        height: 16px;
        border: 1px solid #ccc;
        border-radius: 50%;
        opacity: 0;
        transition: all $transition-time;
        cursor: pointer;
        &:hover {
          background: #ccc;
        }
        &:hover:after {
          content: '';
          position: absolute;
          left: 2px;
          top: 2px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: $color-active;
          // animation: heartbeat 2s linear infinite;
        }
        &.always-show {
          opacity: 1;
        }
      }
      .content {
        margin-left: 26px;
        padding: 6px 6px 6px 0;
        &.sub {
          margin-left: 36px;
          font-size: 13px;
        }
        &.done {
          color: $sub-font-color;
          text-decoration: line-through;
        }
        &.highlight {
          color: $primary-font-color;
          // font-weight: bold;
        }
        .sub-icon {
          color: $sub-font-color;
          font-size: 12px;
        }
      }
      .labels {
        position: relative;
        margin-left: 26px;
        padding-bottom: 4px;
        white-space: nowrap;
        &.sub {
          margin-left: 36px;
        }
        .label {
          margin-right: 3px;
        }
      }
      .box-btns {
        position: absolute;
        right: 6px;
        bottom: 4px;
        z-index: 3;
        .btn {
          display: inline-flex;
          opacity: 0;
        }
      }
      &:hover {
        .box-radio {
          opacity: 1;
        }
        .box-btns {
          .btn {
            opacity: 1;
          }
        }
      }
    }
  }
}
@keyframes heartbeat {
  0% {
    width: 12px;
    height: 12px;
    left: 2px;
    top: 2px;
  }
  50% {
    width: 10px;
    height: 10px;
    left: 3px;
    top: 3px;
  }
  100% {
    width: 12px;
    height: 12px;
    left: 2px;
    top: 2px;
  }
  // 10% {
  //   width: 10px;
  //   height: 10px;
  //   left: 3px;
  //   top: 3px;
  // }
  // 20% {
  //   width: 12px;
  //   height: 12px;
  //   left: 2px;
  //   top: 2px;
  // }
  // 100% {
  //   width: 12px;
  //   height: 12px;
  //   left: 2px;
  //   top: 2px;
  // }
}

@media (prefers-color-scheme: dark) {
  #app {
    background: $primary-bgcolor-dark;
    color: $primary-font-color-dark;
  }
  .icon-btn {
    color: $toolbar-icon-color-dark;
    &.active {
      background: $toolbar-bgcolor-active-dark;
    }
    &:hover {
      background: $toolbar-bgcolor-hover-dark;
      &.active {
        background: $toolbar-bgcolor-active-hover-dark;
      }
    }
  }
  .modal-bg {
    background: $modal-bgcolor-dark;
  }
  .common-select {
    border: 1px solid $border-color-dark;
    color: $primary-font-color-dark;
    &:focus {
      background: $input-bgcolor-active-dark;
    }
  }
  .common-input {
    border: 1px solid $border-color-dark;
    color: $primary-font-color-dark;
    &:focus {
      background: $input-bgcolor-active-dark;
    }
  }
  .common-radio-group {
    color: $toolbar-icon-color-dark;
    .radio {
      &.active {
        background: $toolbar-bgcolor-active-dark;
      }
    }
    &:hover {
      background: $toolbar-bgcolor-hover-dark;
      .radio {
        &.active {
          background: $toolbar-bgcolor-active-hover-dark;
        }
      }
    }
  }
  .common-textarea {
    border: 1px solid $border-color-dark;
    color: $primary-font-color-dark;
    &:focus {
      background: $input-bgcolor-active-dark;
    }
  }
  .common-radios {
    border: 1px solid $border-color-dark;
    background: $itoolbar-bgcolor-dark;
    .radio {
      color: $secondary-font-color-dark;
      &:hover {
        background: $itoolbar-item-bgcolor-active-dark;
      }
      &.active {
        background: $itoolbar-item-bgcolor-active-dark;
        color: $primary-font-color-dark;
        border: 1px solid $itoolbar-item-border-color-active-dark;
        box-shadow: none;
      }
    }
  }
  .common-tag {
    color: $secondary-font-color-dark;
    background: $dark-2;
    &.tag-btn {
      &:hover {
        background: $dark-3;
      }
    }
    &.active {
      background: $dark-3;
    }
  }
  .keystroke {
    background: $dark-2;
  }
  .box-main {
    background: $primary-bgcolor-dark;
    .box-list {
      &::-webkit-scrollbar-thumb {
        background: $scrollbar-thumb-color-dark;
      }
      .box-item {
        border-bottom: 1px solid $border-color-dark;
        background: $primary-bgcolor-dark;
        &.focused {
          background: rgba($dark-1, .9)
        }
        .box-radio {
          border: 1px solid $secondary-font-color-dark;
          &:hover {
            border-color: $border-color-dark;
            background: $border-color-dark;
          }
          &:hover:after {
            background: $color-active-dark;
          }
        }
        .content {
          &.done {
            color: $sub-font-color-dark;
          }
          &.highlight {
            color: $primary-font-color-dark;
          }
          .sub-icon {
            color: $sub-font-color-dark;
          }
        }
      }
    }
  }
}
</style>
