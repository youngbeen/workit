<template>
  <section class="bed-note-panel" :class="[!isShow && 'collapse']">
    <div class="title" :class="[animated && 'animated']" v-show="isShow">
      Related Notes
    </div>

    <div class="box-notes">
      <div class="note" :class="[noteAnimated && 'animated']" :style="{ transitionDelay: index / 20 + 's' }" v-for="(item, index) in displayedData" :key="index">
        {{ item.content }}
        <div class="tags">
          <span class="common-tag sm" v-for="label in item.labels" :key="label">{{ label }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { sleep } from '@youngbeen/sleep'

export default {
  props: {
    data: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  data () {
    return {
      isShow: false,
      animated: false,
      noteAnimated: false,
      displayedData: [],
      tc: null
    }
  },
  watch: {
    data: {
      handler: function (newVal, oldVal) {
        // console.log(newVal, oldVal)
        if (oldVal || newVal) {
          if ((!oldVal || !oldVal.length) && newVal && newVal.length) {
            // 展开
            this.isShow = true
            this.tc = setTimeout(() => {
              this.animated = true
              this.displayedData = newVal
              sleep(10).then(() => {
                this.noteAnimated = true
              })
            }, 400)
          } else if (oldVal && oldVal.length && (!newVal || !newVal.length)) {
            // 折叠关闭
            clearTimeout(this.tc)
            this.isShow = false
            this.displayedData = []
            this.animated = false
            this.noteAnimated = false
          } else {
            // 展开 => 展开
            clearTimeout(this.tc)
            this.animated = true
            this.noteAnimated = false
            this.displayedData = []
            this.tc = setTimeout(() => {
              this.displayedData = newVal
              sleep(10).then(() => {
                this.noteAnimated = true
              })
            }, 400)
          }
        }
      },
      immediate: true
    }
  }
}
</script>

<style scoped lang="scss">
@import "../assets/css/var.scss";

.bed-note-panel {
  width: 240px;
  height: 100%;
  border-left: 1px solid $border-color;
  border-right: 1px solid $border-color;
  background: $sidebar-bgcolor;
  transition: all $transition-time-normal;
  &.collapse {
    width: 0;
    border-left: 1px solid rgba(220, 255, 255, 0);
  }
  .title {
    height: 40px;
    line-height: 48px;
    padding: 0 10px;
    color: $sub-font-color;
    font-weight: bold;
    opacity: 0;
    cursor: default;
    transition: all $transition-time;
    user-select: none;
    &.animated {
      opacity: 1;
    }
  }
  .box-notes {
    height: calc(100% - 40px);
    padding: 0 10px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 4px;
      background: $scrollbar-thumb-color;
    }
    .note {
      margin: 10px 0;
      padding: 6px;
      border-radius: $border-radius;
      background: $sheet-bgcolor;
      box-shadow: 0px 0px 1px 1px rgba(122, 122, 122, .4);
      opacity: 0;
      transition: all $transition-time;
      &.animated {
        opacity: 1;
      }
      &:hover {
        box-shadow: 0px 0px 8px 1px rgba(122, 122, 122, .4);
      }
      .tags {
        text-align: right;
        .common-tag {
          margin-right: 6px;
        }
      }
    }
  }
}
@media (prefers-color-scheme: dark) {
  .bed-note-panel {
    border-left: 1px solid $border-color-dark;
    border-right: 1px solid $border-color-dark;
    background: $sidebar-bgcolor-dark;
    .title {
      color: $sub-font-color-dark;
    }
    .box-notes {
      &::-webkit-scrollbar-thumb {
        background: $scrollbar-thumb-color-dark;
      }
      .note {
        background: $dark-2;
        &:hover {
          box-shadow: 0px 0px 3px 1px rgba(122, 122, 122, .4);
        }
        .common-tag {
          background: $dark-3;
        }
      }
    }
  }
}
</style>
