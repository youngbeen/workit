<template>
  <section class="pop-link" v-show="isShow">
    <div class="bg" @click="close(true)"></div>
    <div class="box-options" :class="[isAnimationDone ? 'animated': '']" :style="{ left: left + 'px', top: top + 'px' }">
      <div class="tip">Link To</div>
      <div class="option" :title="option.text" v-for="(option, index) in options" :key="option.value" @click="select(option.value, index)">
        <font-awesome-icon :icon="['fas', 'link']" />&nbsp;<span class="common-tag sm" v-if="option.labels.length">{{ option.labels[0] }}</span>{{ option.text }}
      </div>
    </div>
  </section>
</template>

<script>
import eventBus from '@/eventBus'

export default {
  props: {
    callback: {
      type: Function,
      required: true
    },
    cancel: {
      type: Function,
      required: true
    }
  },
  data () {
    return {
      isShow: false,
      isAnimationDone: false,
      options: [],
      left: 0,
      top: 0,
      tag: null
    }
  },

  mounted () {
    eventBus.$on('showPopLink', params => {
      this.options = params.options || []
      this.left = params.position.left || 0
      this.top = params.position.top || 0
      // 修正位置
      if (this.left > 0) {
        this.left -= 200
      }
      if (this.top > 400) {
        this.top -= 20 * this.options.length + 30
      }
      this.tag = params.tag
      this.show()
    })
  },

  beforeDestroy () {
    eventBus.$off('showPopLink')
  },

  methods: {
    select (value, index) {
      this.callback({
        value,
        index,
        tag: this.tag
      })
      this.close()
    },
    show () {
      this.isAnimationDone = false
      this.isShow = true
      setTimeout(() => {
        this.isAnimationDone = true
      }, 10)
    },
    close (isCancel = false) {
      this.isShow = false
      if (isCancel) {
        this.cancel()
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "../assets/css/var.scss";

.pop-link {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 80;
  width: 100%;
  height: 100%;
  .bg {
    position: absolute;
    left: 0;
    top: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
    // background: rgba(0, 0, 0, .2);
  }
  .box-options {
    position: absolute;
    // right: 10px;
    // top: 38px;
    z-index: 10;
    width: 240px;
    padding: $menu-padding;
    border: 1px solid $menu-border-color;
    border-radius: $border-radius;
    background: $menu-bgcolor;
    box-shadow: $menu-boxshadow;
    opacity: 0;
    overflow: hidden;
    transition: all $transition-time;
    &.animated {
      opacity: 1;
    }
    .tip {
      padding-left: 4px;
      // border-bottom: 2px solid #ccc;
      color: $category-color;
      font-size: $sub-font-size;
      font-weight: bold;
    }
    .option {
      width: 240px;
      height: $menu-item-height;
      // line-height: $menu-item-height;
      padding: 0 $menu-item-padding-x;
      border-radius: $menu-item-border-radius;
      font-weight: 500;
      cursor: pointer;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      &:hover {
        background: $color-active;
        color: $menu-item-color-active;
      }
    }
  }
}
</style>
