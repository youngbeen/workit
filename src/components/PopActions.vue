<template>
  <section class="pop-actions" v-show="isShow">
    <div class="bg" @click="close(true)"></div>
    <div class="box-options" :class="[isAnimationDone ? 'animated': '']" :style="{ left: left + 'px', top: top + 'px' }">
      <div class="option" v-for="(option, index) in options" :key="option.value" @click="select(option.value, index)">{{ option.label }}</div>
    </div>
  </section>
</template>

<script>
import { sleep } from '@youngbeen/sleep'
import eventBus from '@/eventBus'

export default {
  name: 'popActions',
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
    eventBus.$on('showPopActions', params => {
      this.options = params.options || []
      this.left = params.position.left || 0
      this.top = params.position.top || 0
      // 修正位置
      if (this.left > 0) {
        this.left -= 128
      }
      if (this.top > 400) {
        this.top -= 24 * this.options.length
      }
      this.tag = params.tag
      this.show()
    })
  },

  beforeDestroy () {
    eventBus.$off('showPopActions')
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
      sleep(10).then(() => {
        this.isAnimationDone = true
      })
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

.pop-actions {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 80;
  .bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    // background: rgba(0, 0, 0, .2);
    z-index: -1;
  }
  .box-options {
    position: absolute;
    right: 0px;
    top: 38px;
    z-index: 10;
    width: 120px;
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
    .option {
      height: $menu-item-height;
      line-height: $menu-item-height;
      padding: 0 $menu-item-padding-x;
      border-radius: $menu-item-border-radius;
      // font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      user-select: none;
      &:hover {
        background: $color-active;
        color: $menu-item-color-active;
      }
    }
  }
}
@media (prefers-color-scheme: dark) {
  .pop-actions {
    .box-options {
      border: 1px solid $border-color-dark;
      background: $dark-1;
      box-shadow: none;
      .option {
        &:hover {
          background: $color-active-dark;
          color: $menu-item-color-active;
        }
      }
    }
  }
}
</style>
