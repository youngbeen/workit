<template>
  <section class="bed-action-bar">
    <div class="icon-btn"
      :class="[isFilterActive && 'active']"
      v-show="system.tab !== 'calendar'"
      title="Filter"
      @click="showFilter()">
      <font-awesome-icon :icon="['fas', 'filter']" />
      <span v-show="isFilterActive">&nbsp;{{ filteredCount }}/{{ totalCount }}</span>
    </div>
    <div class="icon-btn lg"
      title="Toggle Sub Task Display Mode"
      v-show="system.tab !== 'calendar'"
      @click="toggleSubTaskDisplayMode()">
      <font-awesome-icon :icon="['fas', 'cookie']" v-show="system.subTaskDisplayMode === 'full'" />
      <font-awesome-icon :icon="['fas', 'cookie-bite']" v-show="system.subTaskDisplayMode === 'fit'" />
      <font-awesome-icon :icon="['fas', 'envelope-square']" v-show="system.subTaskDisplayMode === 'openFit'" />
    </div>
    <!-- <div class="icon-btn lg" title="Sort" v-show="system.tab !== 'history'" @click="sort()">
      <font-awesome-icon :icon="['fas', 'sort-amount-down']" />
    </div> -->
    <!-- <div class="icon-btn" title="Unlink All" v-show="system.tab !== 'history'" @click="unlink()">
      <font-awesome-icon :icon="['fas', 'unlink']" />
    </div> -->
    <div class="icon-btn lg"
      v-show="system.tab === 'history'"
      title="Clear"
      @click="clear()">
      <font-awesome-icon :icon="['fas', 'trash-alt']" />
    </div>
    <div class="icon-btn lg"
      v-show="system.tab !== 'history'"
      title="Add New"
      @click="add()">
      <font-awesome-icon :icon="['fas', 'plus']" />
    </div>

    <div class="icon-btn lg"
      title="Search"
      style="position: fixed; right: 12px; top: 12px;"
      @click="showSeach()">
      <font-awesome-icon :icon="['fas', 'search']" />
    </div>
  </section>
</template>

<script>
// import { ipcRenderer } from 'electron'
import eventBus from '@/eventBus'
import system from '@/models/system'
import dataCtrl from '@/ctrls/dataCtrl'

export default {
  name: 'actionBar',
  props: {
    filteredCount: {
      type: Number,
      required: true
    },
    totalCount: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      system
    }
  },
  computed: {
    isFilterActive () {
      return this.system.filter.fromTime || this.system.filter.toTime || this.system.filter.tags.length
    }
  },

  methods: {
    // sort () {
    //   eventBus.$emit('proceedSort')
    // },
    // unlink () {
    //   ipcRenderer.send('asynchronous-message', {
    //     type: 'unlink_all_tasks'
    //   })
    // },
    toggleSubTaskDisplayMode () {
      const modeMap = new Map([
        ['full', 'fit'],
        ['fit', 'openFit'],
        ['openFit', 'full']
      ])
      system.subTaskDisplayMode = modeMap.get(system.subTaskDisplayMode)
      dataCtrl.savePrefers()
    },
    add () {
      eventBus.$emit('showAddItem')
    },
    showFilter () {
      eventBus.$emit('showFilters')
    },
    showSeach () {
      eventBus.$emit('showSearch')
    },
    clear () {
      eventBus.$emit('clearHistory')
    }
  }
}
</script>

<style scoped lang="scss">
@import "../assets/css/var.scss";

.bed-action-bar {
  display: flex;
  align-items: center;
  padding: 12px 12px;
  border-bottom: 1px solid $border-color;
  background: $toolbar-bgcolor;
  .icon-btn {
    &:not(:first-of-type) {
      margin-left: 6px;
    }
    &.active {
      position: relative;
      &:after {
        position: absolute;
        right: -1px;
        top: -1px;
        width: 6px;
        height: 6px;
        content: ' ';
        border-radius: 50%;
        background: $color-active;
        // box-shadow: 0 0 2px 1px rgba(255, 255, 255, .9);
      }
    }
  }
}
@media (prefers-color-scheme: dark) {
  .bed-action-bar {
    border-bottom: 1px solid $border-color-dark;
    background: $toolbar-bgcolor-dark;
    .icon-btn {
      &.active {
        &:after {
          background: $color-active-dark;
        }
      }
    }
  }
}
</style>
