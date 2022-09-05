<template>
  <section class="bed-left-nav" @mouseover="handleMouseover" @mouseout="handleMouseout">
    <logo-comp></logo-comp>
    <div class="box-sys-actions"
      :class="[isShowCount && 'show']">
      <span class="icon-btn"
        style="color: #aaa;"
        @click="handleMinWindow()">
        <font-awesome-icon :icon="['fas', 'minus-square']" />
      </span>
      <span class="icon-btn"
        style="color: rgb(196,43,28);"
        @click="handleCloseWindow()">
        <font-awesome-icon :icon="['fas', 'window-close']" />
      </span>
    </div>
    <div class="box-group">
      <div class="nav" :class="[system.tab === 'focus' && 'active']" @click="changeTab('focus')">
        <div class="title">
          <span class="icon-image">
            <font-awesome-icon :icon="['fas', 'bullseye']" />
          </span>
          Focus
        </div>
        <span class="badge" :class="[(isShowCount || system.tab === 'focus') && showCounts.focus && 'show']">{{ showCounts.focus }}</span>
      </div>
      <div class="nav" :class="[system.tab === 'inbox' && 'active']" @click="changeTab('inbox')" @dragover.prevent="handleDragover" @drop.prevent="handleDrop($event, 'inbox')">
        <div class="title">
          <span class="icon-image">
            <font-awesome-icon :icon="['fas', 'inbox']" />
          </span>
          Inbox
        </div>
        <span class="badge" :class="[(isShowCount || system.tab === 'inbox') && showCounts.inbox && 'show']">{{ showCounts.inbox }}</span>
      </div>
    </div>
    <div class="box-group">
      <div class="nav" :class="[system.tab === 'current' && 'active']" @click="changeTab('current')" @dragover.prevent="handleDragover" @drop.prevent="handleDrop($event, 'current')">
        <div class="title">
          <span class="icon-image" :class="[system.tab === 'current' && 'compass-lost']">
            <font-awesome-icon :icon="['fas', 'compass']" />
          </span>
          Current
        </div>
        <span class="badge" :class="[(isShowCount || system.tab === 'current') && showCounts.current && 'show']">{{ showCounts.current }}</span>
      </div>
      <div class="nav" :class="[system.tab === 'coming' && 'active']" @click="changeTab('coming')" @dragover.prevent="handleDragover" @drop.prevent="handleDrop($event, 'coming')">
        <div class="title">
          <span class="icon-image">
            <font-awesome-icon :icon="['fas', 'history']" />
          </span>
          Coming
        </div>
        <span class="badge" :class="[(isShowCount || system.tab === 'coming') && showCounts.coming && 'show']">{{ showCounts.coming }}</span>
      </div>
      <div class="nav" :class="[system.tab === 'anytime' && 'active']" @click="changeTab('anytime')" @dragover.prevent="handleDragover" @drop.prevent="handleDrop($event, 'anytime')">
        <div class="title">
          <span class="icon-image">
            <font-awesome-icon :icon="['fas', 'mug-hot']" />
          </span>
          Anytime
        </div>
        <span class="badge" :class="[(isShowCount || system.tab === 'anytime') && showCounts.anytime && 'show']">{{ showCounts.anytime }}</span>
      </div>
      <div class="nav" :class="[system.tab === 'someday' && 'active']" @click="changeTab('someday')" @dragover.prevent="handleDragover" @drop.prevent="handleDrop($event, 'someday')">
        <div class="title">
          <span class="icon-image">
            <font-awesome-icon :icon="['fas', 'calendar-check']" />
          </span>
          Someday
        </div>
        <span class="badge" :class="[(isShowCount || system.tab === 'someday') && showCounts.someday && 'show']">{{ showCounts.someday }}</span>
      </div>
    </div>
    <div class="box-group">
      <div class="nav" :class="[system.tab === 'tracking' && 'active']" @click="changeTab('tracking')" @dragover.prevent="handleDragover" @drop.prevent="handleDrop($event, 'tracking')">
        <div class="title">
          <span class="icon-image" :class="[system.tab === 'tracking' && 'eye-bling']">
            <font-awesome-icon :icon="['fas', 'eye']" />
          </span>
          Tracking
        </div>
        <span class="badge" :class="[(isShowCount || system.tab === 'tracking') && showCounts.tracking && 'show']">{{ showCounts.tracking }}</span>
      </div>
      <div class="nav" :class="[system.tab === 'note' && 'active']" @click="changeTab('note')" @dragover.prevent="handleDragover" @drop.prevent="handleDrop($event, 'note')">
        <div class="title">
          <span class="icon-image">
            <font-awesome-icon :icon="['fas', 'book']" />
          </span>
          Note
        </div>
        <span class="badge" :class="[(isShowCount || system.tab === 'note') && showCounts.note && 'show']">{{ showCounts.note }}</span>
      </div>
      <div class="nav" :class="[system.tab === 'calendar' && 'active']" @click="changeTab('calendar')">
        <div class="title">
          <span class="icon-image">
            <font-awesome-icon :icon="['fas', 'calendar-alt']" />
          </span>
          Calendar
        </div>
      </div>
    </div>
    <div class="box-group">
      <div class="nav" :class="[system.tab === 'history' && 'active']" @click="changeTab('history')">
        <div class="title">
          <span class="icon-image">
            <font-awesome-icon :icon="['fas', 'archive']" />
          </span>
          History
        </div>
        <span class="badge" :class="[(isShowCount || system.tab === 'history') && showCounts.history && 'show']">{{ showCounts.history }}</span>
      </div>
    </div>

    <span class="icon-btn sys-btn"
      :class="[isShowCount && 'show']"
      @click="handleShowSysActions">
      <font-awesome-icon :icon="['fas', 'sliders-h']" />
    </span>

    <pop-actions :callback="confirmAction"></pop-actions>
  </section>
</template>

<script>
import eventBus from '@/eventBus'
import { ipcRenderer } from 'electron'
import { navigations, sysActions } from '@/models/DictMap'
import system from '@/models/system'
import config from '@/models/config'
import systemCtrl from '@/ctrls/systemCtrl'
import LogoComp from './LogoComp.vue'
import PopActions from '@/components/PopSysActions.vue'

export default {
  components: {
    LogoComp,
    PopActions
  },

  props: {
    counts: {
      type: Object,
      required: true
    },
    mainCounts: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      isHover: false,
      isShowCount: false,
      queue: navigations.map(item => item.value),
      sysActionOptions: sysActions,
      system,
      config
    }
  },
  computed: {
    showCounts () {
      if (this.config.leftnavNumbersMode === 'main') {
        return this.mainCounts
      } else {
        return this.counts
      }
    }
  },

  mounted () {
    ipcRenderer.on('sys_navup', () => {
      if (system.isPanelActive) {
        return
      }
      const nowIndex = this.queue.findIndex(item => item === system.tab)
      let tryIndex = nowIndex - 1
      if (tryIndex < 0) {
        tryIndex = this.queue.length - 1
      }
      systemCtrl.changeTab(this.queue[tryIndex])
    })
    ipcRenderer.on('sys_navdown', () => {
      if (system.isPanelActive) {
        return
      }
      const nowIndex = this.queue.findIndex(item => item === system.tab)
      let tryIndex = nowIndex + 1
      if (tryIndex > this.queue.length - 1) {
        tryIndex = 0
      }
      systemCtrl.changeTab(this.queue[tryIndex])
    })
  },

  methods: {
    changeTab (name) {
      if (system.tab !== name) {
        systemCtrl.changeTab(name)
      }
    },
    handleMouseover () {
      this.isHover = true
      this.isShowCount = true
    },
    handleMouseout () {
      this.isHover = false
      this.isShowCount = false
    },
    handleDragover (e) {
      // console.log('over', e)
      e.dataTransfer.dropEffect = 'move'
      this.$emit('e-hover-nav')
    },
    handleDrop (e, cat) {
      // console.log('drop', index)
      e.dataTransfer.dropEffect = 'move'
      // console.log(`from ${e.dataTransfer.getData('sourceCat')} index ${e.dataTransfer.getData('sourceIndex')} to ${cat}`)
      const sourceCat = e.dataTransfer.getData('sourceCat')
      const sourceIndex = parseInt(e.dataTransfer.getData('sourceIndex'))
      if (sourceCat === cat) {
        // 相同分类，不需操作
        return
      }
      eventBus.$emit('changeCat', {
        tag: {
          cat: sourceCat,
          index: sourceIndex
        },
        value: cat
      })
    },
    handleShowSysActions (e) {
      const options = [...this.sysActionOptions]
      eventBus.$emit('showPopSysActions', {
        options,
        position: {
          left: e.clientX,
          top: e.clientY
        }
      })
    },
    confirmAction (data) {
      switch (data.value) {
        case 'about':
          eventBus.$emit('showAboutMe')
          break
        case 'document':
          eventBus.$emit('showDocument')
          break
        case 'export':
          ipcRenderer.send('asynchronous-message', {
            type: 'sys_export_file',
            content: window.localStorage.getItem('workitSaveData')
          })
          break
        case 'import':
          ipcRenderer.send('asynchronous-message', {
            type: 'sys_import_trigger'
          })
          break
        case 'reset':
          ipcRenderer.send('asynchronous-message', {
            type: 'sys_reset_trigger'
          })
          break
        case 'statistics':
          eventBus.$emit('showStatistics')
          break
        case 'config':
          eventBus.$emit('showConfig')
          break
        case 'copy_all_content':
          eventBus.$emit('copyContent', true)
          break
      }
    },
    handleMinWindow () {
      ipcRenderer.send('window-min')
    },
    handleCloseWindow () {
      ipcRenderer.send('window-close')
    }
  }
}
</script>

<style scoped lang="scss">
@import "../assets/css/var.scss";

.bed-left-nav {
  position: relative;
  width: 180px;
  height: 100%;
  // border-right: 1px solid $border-color;
  background: $sidebar-bgcolor;
  // box-shadow: 0px 0px 4px 0 rgba(122, 122, 122, .2) inset;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  transition: all $transition-time;
  .box-sys-actions {
    display: flex;
    justify-content: flex-end;
    position: absolute;
    right: 10px;
    top: 12px;
    // width: 60px;
    // background: red;
    opacity: 0;
    transition: all $transition-time;
    &.show {
      opacity: 1;
    }
  }
  .box-group {
    position: relative;
    margin: 10px;
    &:not(:last-of-type):after {
      content: '';
      display: block;
      position: absolute;
      left: 0;
      bottom: -5px;
      width: 80%;
      height: 1px;
      border-bottom: 1px solid $border-color;
    }
    .nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      // margin: 3px 0;
      height: $sidebar-height;
      padding: 0 6px 0 12px;
      border-radius: $border-radius;
      transition: all $transition-time;
      cursor: pointer;
      user-select: none;
      // &:hover {
      //   background: #eee;
      //   opacity: 1;
      // }
      .title {
        display: flex;
        align-items: center;
        .spin {
          animation: spin infinite 4s linear;
        }
        .compass-lost {
          animation: compasslost infinite 6s ease-in-out;
        }
        .eye-bling {
          animation: eyebling infinite 5s linear;
        }
        span {
          margin-right: 4px;
        }
      }
      .badge {
        padding: 0 5px;
        border-radius: 10px;
        background: $sidebar-tab-badge-bgcolor;
        color: $sidebar-tab-badge-color;
        // font-size: 13px;
        font-weight: bold;
        opacity: 0;
        transition: all $transition-time;
        &.show {
          opacity: 1;
        }
      }
      &.active {
        position: relative;
        // color: #333;
        // font-weight: bold;
        background: $sidebar-tab-bgcolor-active;
        // opacity: 1;
        // &:before {
        //   position: absolute;
        //   left: -4px;
        //   top: 12px;
        //   // bottom: 6px;
        //   width: 4px;
        //   height: 4px;
        //   content: ' ';
        //   border-radius: 50%;
        //   background: #333;
        // }
        .badge {
          background: $sidebar-tab-badge-bgcolor-active;
        }
      }
    }
  }
  .sys-btn {
    position: absolute;
    left: 3px;
    bottom: 3px;
    opacity: 0;
    transition: all $transition-time;
    &.show {
      opacity: 1;
    }
  }
  &:hover {
    box-shadow: 0px 0px 2px 0 rgba(122, 122, 122, .2) inset;
  }
}
@media (prefers-color-scheme: dark) {
  .bed-left-nav {
    background: $sidebar-bgcolor-dark;
    .box-group {
      &:not(:last-child):after {
        border-bottom: 1px solid $border-color-dark;
      }
      .nav {
        color: $secondary-font-color-dark;
        .badge {
          background: $sidebar-tab-badge-bgcolor-dark;
          color: $sidebar-tab-badge-color-dark;
        }
        &.active {
          color: $primary-font-color-dark;
          background: $sidebar-tab-bgcolor-active-dark;
          .icon-image {
            color: $primary-font-color-dark;
          }
          .badge {
            background: $sidebar-tab-badge-bgcolor-active-dark;
            color: $primary-font-color-dark;
          }
        }
      }
    }
  }
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes compasslost {
  0% {
    transform: rotate(0deg);
  }
  12% {
    transform: rotate(120deg);
  }
  24% {
    transform: rotate(30deg);
  }
  28% {
    transform: rotate(70deg);
  }
  32% {
    transform: rotate(30deg);
  }
  80% {
    transform: rotate(1800deg);
  }
  100% {
    transform: rotate(1800deg);
  }
}
@keyframes eyebling {
  0% {
    transform: rotateX(0deg);
  }
  80% {
    transform: rotateX(0deg);
  }
  85% {
    transform: rotateX(90deg);
  }
  90% {
    transform: rotateX(0deg);
  }
  95% {
    transform: rotateX(90deg);
  }
  100% {
    transform: rotateX(0deg);
  }
}
</style>
