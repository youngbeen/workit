<template>
  <section class="bed-action-bar">
    <div class="icon-btn" :class="[isFilterActive && 'active']" title="Filter" @click="showFilter()">
      <font-awesome-icon :icon="['fas', 'filter']" />&nbsp;
      <span v-show="isFilterActive">{{ filteredCount }}/{{ totalCount }}</span>
    </div>
    <div class="icon-btn lg" title="Search" @click="showSeach()">
      <font-awesome-icon :icon="['fas', 'search']" />
    </div>
    <div class="icon-btn lg" title="Sort" v-show="system.tab !== 'history'" @click="sort()">
      <font-awesome-icon :icon="['fas', 'sort-amount-down']" />
    </div>
    <div class="icon-btn" title="Unlink All" v-show="system.tab !== 'history'" @click="unlink()">
      <font-awesome-icon :icon="['fas', 'unlink']" />
    </div>
    <div class="icon-btn lg" title="Clear" v-show="system.tab === 'history'" @click="clear()">
      <font-awesome-icon :icon="['fas', 'trash-alt']" />
    </div>
    <div class="icon-btn lg" title="Add New" v-show="system.tab !== 'history'" @click="add()">
      <font-awesome-icon :icon="['fas', 'plus']" />
    </div>
  </section>
</template>

<script>
import { ipcRenderer } from 'electron'
import eventBus from '@/eventBus'
import system from '@/models/system'

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
    sort () {
      eventBus.$emit('proceedSort')
    },
    unlink () {
      ipcRenderer.send('asynchronous-message', {
        type: 'unlink_all_tasks'
      })
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
  background: #fff;
  .icon-btn {
    margin-left: 12px;
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
</style>
