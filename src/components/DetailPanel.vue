<template>
  <section class="bed-detail-panel" v-if="isShow">
    <div class="modal-bg" :class="[animated && 'animated']" @click="close()"></div>
    <div class="container" :class="[animated && 'animated']">
      <div class="box-previous" v-show="prev.content" @click="toggle(-1)">
        <div class="box-content">
          {{ prev.content }}
        </div>
        <div class="box-tags" v-if="prev.labels.length">
          <span class="common-tag sm" v-for="(item, index) in prev.labels" :key="index">{{ item }}</span>
        </div>
      </div>
      <div class="icon-btn lg box-up-icon" v-show="prev.content">
        <font-awesome-icon :icon="['fas', 'chevron-up']" />
      </div>
      <div class="box-next" v-show="next.content" @click="toggle(1)">
        <div class="box-content">
          {{ next.content }}
        </div>
        <div class="box-tags" v-if="next.labels.length">
          <span class="common-tag sm" v-for="(item, index) in next.labels" :key="index">{{ item }}</span>
        </div>
      </div>
      <div class="icon-btn lg box-down-icon" v-show="next.content">
        <font-awesome-icon :icon="['fas', 'chevron-down']" />
      </div>
      <div class="box-current">
        <corner-icon :icon="'check-double'"
          style="transition: all 0.3s;"
          :style="{ opacity: task.status }"></corner-icon>

        <div class="box-parent-info" v-show="task.parentId">
          Sub task under <span class="sub-title">{{ task.cat }}</span> / <span class="title">{{ currentParentName }}</span>
        </div>
        <div class="box-content">
          {{ task.content }}
        </div>
        <div class="box-tags" v-if="task.labels.length">
          <span class="common-tag" v-for="(item, index) in task.labels" :key="index">{{ item }}</span>
        </div>
        <div class="comment">
          <div v-show="task.doneTimeText">Finished: {{ task.doneTimeText }}</div>
          <div v-show="!task.doneTimeText && task.dueTimeText">Due: {{ task.dueTimeText }}</div>
          <div>Updated: {{ task.updateTimeText }}</div>
          <div>Created: {{ task.createTimeText }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ipcRenderer } from 'electron'
import { sleep } from '@youngbeen/sleep'
import { dateUtil } from '@youngbeen/angle-util'
import eventBus from '@/eventBus'
import system from '@/models/system'
import CornerIcon from '@/components/CornerIcon'

export default {
  name: 'detailPanel',
  components: {
    CornerIcon
  },

  data () {
    return {
      isShow: false,
      animated: false, // 开启动画控制
      currentIndex: -1, // 当前浏览的索引
      list: [] // 所有task清单
    }
  },
  computed: {
    task () {
      if (this.list.length && this.currentIndex > -1) {
        return this.list[this.currentIndex]
      } else {
        return {
          content: '',
          labels: [],
          createTimeText: '-',
          updateTimeText: '-'
        }
      }
    },
    prev () {
      if (this.list.length && this.currentIndex - 1 > -1) {
        return this.list[this.currentIndex - 1]
      } else {
        return {
          content: '',
          labels: [],
          createTimeText: '-',
          updateTimeText: '-'
        }
      }
    },
    next () {
      if (this.list.length && this.currentIndex + 1 < this.list.length) {
        return this.list[this.currentIndex + 1]
      } else {
        return {
          content: '',
          labels: [],
          createTimeText: '-',
          updateTimeText: '-'
        }
      }
    },
    currentParentName () {
      if (this.task.content && this.task.parentId) {
        const parent = this.list.find(item => item.createTime === this.task.parentId)
        return parent?.content || ''
      } else {
        return ''
      }
    }
  },

  mounted () {
    eventBus.$on('showItemDetail', (params) => {
      const today = dateUtil.formatDateTime('YYYY-MM-DD', new Date())
      const yesterday = dateUtil.formatDateTime('YYYY-MM-DD', new Date() - 1000 * 60 * 60 * 24)
      const tomorrow = dateUtil.formatDateTime('YYYY-MM-DD', new Date() + 1000 * 60 * 60 * 24)
      this.list = params.list || []
      this.list = this.list.map(item => {
        if (item.createTime) {
          item.createTimeText = dateUtil.formatDateTime('YYYY-MM-DD HH:mm:ss', item.createTime)
          const [date, time] = item.createTimeText.split(' ')
          if (date === today) {
            item.createTimeText = `Today ${time}`
          } else if (date === yesterday) {
            item.createTimeText = `Yesterday ${time}`
          }
        } else {
          item.createTimeText = '-'
        }
        if (item.updateTime) {
          item.updateTimeText = dateUtil.formatDateTime('YYYY-MM-DD HH:mm:ss', item.updateTime)
          const [date, time] = item.updateTimeText.split(' ')
          if (date === today) {
            item.updateTimeText = `Today ${time}`
          } else if (date === yesterday) {
            item.updateTimeText = `Yesterday ${time}`
          }
        } else {
          item.updateTimeText = '-'
        }
        if (item.doneTime) {
          item.doneTimeText = dateUtil.formatDateTime('YYYY-MM-DD HH:mm:ss', item.doneTime)
          const [date, time] = item.doneTimeText.split(' ')
          if (date === today) {
            item.doneTimeText = `Today ${time}`
          } else if (date === yesterday) {
            item.doneTimeText = `Yesterday ${time}`
          }
        } else {
          item.doneTimeText = ''
        }
        if (item.dueTime) {
          item.dueTimeText = dateUtil.formatDateTime('YYYY-MM-DD HH:mm:ss', item.dueTime)
          const [date, time] = item.dueTimeText.split(' ')
          if (date === today) {
            item.dueTimeText = `Today ${time}`
          } else if (date === tomorrow) {
            item.dueTimeText = `Tomorrow ${time}`
          } else if (date === yesterday) {
            item.dueTimeText = `Yesterday ${time}`
          }
        } else {
          item.dueTimeText = ''
        }
        return item
      })
      this.currentIndex = params.index || 0
      this.show()
    })

    ipcRenderer.on('sys_cancel', () => {
      if (system.isPanelActive && this.isShow) {
        this.close()
      }
    })
  },

  beforeDestroy () {
    eventBus.$off('showItemDetail')
  },

  methods: {
    toggle (changedIndex) {
      let tryIndex = this.currentIndex + changedIndex
      if (tryIndex < 0) {
        tryIndex = 0
      } else if (tryIndex > this.list.length - 1) {
        tryIndex = this.list.length - 1
      }
      this.currentIndex = tryIndex
    },
    show () {
      this.isShow = true
      system.isPanelActive = true
      sleep(100).then(() => {
        this.animated = true
      })
    },
    close () {
      this.animated = false
      sleep(200).then(() => {
        this.isShow = false
        system.isPanelActive = false
      })
    }
  }
}
</script>

<style scoped lang="scss">
@import "../assets/css/var.scss";

.bed-detail-panel {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  width: 100%;
  height: 100%;
  // font-family: 'Monaco';
  .container {
    position: relative;
    margin: 5% auto;
    width: 800px;
    padding: 60px 0 60px;
    border-radius: $border-radius;
    background: $sheet-bgcolor;
    box-shadow: $sheet-boxshadow;
    opacity: 0;
    transition: all $transition-time;
    .box-previous {
      position: absolute;
      left: 60px;
      right: 60px;
      top: 20px;
      z-index: 1;
      border: 1px solid #ddd;
      border-radius: 1px;
      background: #eee;
      box-shadow: 0px -1px 2px 1px rgba(122, 122, 122, .2);
      opacity: 0.2;
      cursor: pointer;
      user-select: none;
      transition: all 0.4s;
      &:hover {
        opacity: 1;
        box-shadow: 0px -1px 5px 1px rgba(122, 122, 122, .2);
      }
      .box-content {
        padding: 10px 20px;
        line-height: 20px;
        font-size: 12px;
      }
      .box-tags {
        padding: 0 20px;
        // white-space: nowrap;
        // overflow: hidden;
        .common-tag {
          margin-right: 5px;
        }
      }
    }
    .box-up-icon {
      position: absolute;
      top: 22px;
      left: 0;
      right: 0;
      z-index: 1;
      text-align: center;
      pointer-events: none;
    }
    .box-current {
      position: relative;
      // left: 60px;
      // right: 60px;
      z-index: 3;
      // margin: 0 60px;
      padding: 16px 0;
      background: #fcfcfc;
      box-shadow: 0px 0px 8px 1px rgba(12, 12, 12, .3);
      overflow: hidden;
      .box-parent-info {
        padding: 0 24px;
        color: $sub-font-color;
        .sub-title {
          display: inline-block;
          color: $secondary-font-color;
          // font-weight: bold;
          text-transform: capitalize;
        }
        .title {
          display: inline-block;
          vertical-align: top;
          color: $primary-font-color;
          // font-weight: bold;
        }
      }
      .box-content {
        min-height: 60px;
        padding: 12px 24px;
        line-height: 22px;
      }
      .box-tags {
        padding: 0 24px;
        // white-space: nowrap;
        // overflow: hidden;
        .common-tag {
          margin-right: 6px;
        }
      }
      .comment {
        margin-top: 6px;
        border-top: 1px solid $border-color;
        padding: 6px 24px 12px;
        color: #999;
        font-size: 11px;
      }
    }
    .box-next {
      position: absolute;
      left: 40px;
      right: 40px;
      bottom: 4px;
      z-index: 2;
      border: 1px solid #ddd;
      border-radius: 1px;
      background: #f7f7f7;
      box-shadow: 0px 1px 2px 1px rgba(122, 122, 122, .2);
      opacity: 0.3;
      transition: all 0.4s;
      cursor: pointer;
      user-select: none;
      &:hover {
        opacity: 1;
        box-shadow: 0px 1px 6px 1px rgba(122, 122, 122, .2);
      }
      .box-content {
        padding: 10px 20px;
        line-height: 20px;
        font-size: 12px;
      }
      .box-tags {
        padding: 0 20px 6px;
        // white-space: nowrap;
        // overflow: hidden;
        .common-tag {
          margin-right: 5px;
        }
      }
    }
    .box-down-icon {
      position: absolute;
      bottom: 20px;
      left: 0;
      right: 0;
      z-index: 2;
      text-align: center;
      pointer-events: none;
    }
    &.animated {
      margin-top: 15%;
      opacity: 1;
    }
  }
}
@media (prefers-color-scheme: dark) {
  .bed-detail-panel {
    .container {
      background: $sheet-bgcolor-dark;
      box-shadow: none;
      .box-previous {
        border: 1px solid #888;
        background: $dark-2;
      }
      .box-current {
        background: $dark-3;
        .box-parent-info {
          color: $sub-font-color-dark;
          .sub-title {
            color: $secondary-font-color-dark;
          }
          .title {
            color: $primary-font-color-dark;
          }
        }
        .comment {
          border-top: 1px solid $dark-2;
          color: $secondary-font-color-dark;
        }
      }
      .box-next {
        border: 1px solid #888;
        background: $dark-2;
      }
    }
  }
}
</style>
