<template>
  <section class="bed-left-nav" @mouseover="handleMouseover" @mouseout="handleMouseout">
    <div class="box-group">
      <div class="nav" :class="[system.tab === 'inbox' && 'active']" @click="changeTab('inbox')" @dragover.prevent="handleDragover" @drop.prevent="handleDrop($event, 'inbox')">
        <div class="title">
          <span class="icon-image">
            <font-awesome-icon :icon="['fas', 'inbox']" />
          </span>
          &nbsp;Inbox
        </div>
        <span class="badge" :class="[(isShowCount || system.tab === 'inbox') && data.inbox.length && 'show']">{{ data.inbox.length }}</span>
      </div>
    </div>
    <div class="box-group">
      <div class="nav" :class="[system.tab === 'current' && 'active']" @click="changeTab('current')" @dragover.prevent="handleDragover" @drop.prevent="handleDrop($event, 'current')">
        <div class="title">
          <span class="icon-image" :class="[system.tab === 'current' && 'compass-lost']">
            <font-awesome-icon :icon="['fas', 'compass']" />
          </span>
          &nbsp;Current
        </div>
        <span class="badge" :class="[(isShowCount || system.tab === 'current') && data.current.length && 'show']">{{ data.current.length }}</span>
      </div>
      <div class="nav" :class="[system.tab === 'coming' && 'active']" @click="changeTab('coming')" @dragover.prevent="handleDragover" @drop.prevent="handleDrop($event, 'coming')">
        <div class="title">
          <span class="icon-image">
            <font-awesome-icon :icon="['fas', 'history']" />
          </span>
          &nbsp;Coming
        </div>
        <span class="badge" :class="[(isShowCount || system.tab === 'coming') && data.coming.length && 'show']">{{ data.coming.length }}</span>
      </div>
      <div class="nav" :class="[system.tab === 'anytime' && 'active']" @click="changeTab('anytime')" @dragover.prevent="handleDragover" @drop.prevent="handleDrop($event, 'anytime')">
        <div class="title">
          <span class="icon-image">
            <font-awesome-icon :icon="['fas', 'mug-hot']" />
          </span>
          &nbsp;Anytime
        </div>
        <span class="badge" :class="[(isShowCount || system.tab === 'anytime') && data.anytime.length && 'show']">{{ data.anytime.length }}</span>
      </div>
      <div class="nav" :class="[system.tab === 'someday' && 'active']" @click="changeTab('someday')" @dragover.prevent="handleDragover" @drop.prevent="handleDrop($event, 'someday')">
        <div class="title">
          <span class="icon-image">
            <font-awesome-icon :icon="['fas', 'calendar-alt']" />
          </span>
          &nbsp;Someday
        </div>
        <span class="badge" :class="[(isShowCount || system.tab === 'someday') && data.someday.length && 'show']">{{ data.someday.length }}</span>
      </div>
    </div>
    <div class="box-group">
      <div class="nav" :class="[system.tab === 'tracking' && 'active']" @click="changeTab('tracking')" @dragover.prevent="handleDragover" @drop.prevent="handleDrop($event, 'tracking')">
        <div class="title">
          <span class="icon-image" :class="[system.tab === 'tracking' && 'eye-bling']">
            <font-awesome-icon :icon="['fas', 'eye']" />
          </span>
          &nbsp;Tracking
        </div>
        <span class="badge" :class="[(isShowCount || system.tab === 'tracking') && data.tracking.length && 'show']">{{ data.tracking.length }}</span>
      </div>
      <div class="nav" :class="[system.tab === 'note' && 'active']" @click="changeTab('note')" @dragover.prevent="handleDragover" @drop.prevent="handleDrop($event, 'note')">
        <div class="title">
          <span class="icon-image">
            <font-awesome-icon :icon="['fas', 'book']" />
          </span>
          &nbsp;Note
        </div>
        <span class="badge" :class="[(isShowCount || system.tab === 'note') && data.note.length && 'show']">{{ data.note.length }}</span>
      </div>
    </div>
    <div class="box-group">
      <div class="nav" :class="[system.tab === 'history' && 'active']" @click="changeTab('history')">
        <div class="title">
          <span class="icon-image">
            <font-awesome-icon :icon="['fas', 'archive']" />
          </span>
          &nbsp;History
        </div>
        <span class="badge" :class="[(isShowCount || system.tab === 'history') && data.history.length && 'show']">{{ data.history.length }}</span>
      </div>
    </div>
  </section>
</template>

<script>
import eventBus from '@/eventBus'
import { ipcRenderer } from 'electron'
import system from '@/models/system'
import systemCtrl from '@/ctrls/systemCtrl'

export default {
  name: 'leftNav',
  props: {
    data: {
      required: true
    }
  },
  data () {
    return {
      isHover: false,
      isShowCount: false,
      queue: ['inbox', 'current', 'coming', 'anytime', 'someday', 'tracking', 'note', 'history'],
      system
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
    },
    handleDrop (e, cat) {
      // console.log('drop', index)
      e.dataTransfer.dropEffect = 'move'
      // console.log(`from ${e.dataTransfer.getData('sourceCat')} index ${e.dataTransfer.getData('sourceIndex')} to ${cat}`)
      const sourceCat = e.dataTransfer.getData('sourceCat')
      const sourceIndex = e.dataTransfer.getData('sourceIndex')
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
    }
  }
}
</script>

<style scoped lang="scss">
@import "../assets/css/var.scss";

.bed-left-nav {
  width: 180px;
  height: 100%;
  // border-right: 1px solid $border-color;
  background: #f1f1f1;
  // box-shadow: 0px 0px 4px 0 rgba(122, 122, 122, .2) inset;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  transition: all $transition-time;
  .box-group {
    position: relative;
    margin: 10px;
    &:not(:last-child):after {
      content: '';
      display: block;
      position: absolute;
      left: 0;
      bottom: -5px;
      width: 80%;
      height: 1px;
      border-bottom: 1px solid #e1e1e1;
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
      }
      .badge {
        padding: 0 5px;
        border-radius: 24px;
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
  &:hover {
    box-shadow: 0px 0px 2px 0 rgba(122, 122, 122, .2) inset;
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
