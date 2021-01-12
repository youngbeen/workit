<template>
  <section class="bed-use-tip">
    <div class="tip-film" :style="{ top: tipIndex * -30 + 'px' }">
      <div class="tip" v-for="(tip, index) in tips" :key="index" v-html="tip.content"></div>
    </div>
  </section>
</template>

<script>
import { formatKeystroke } from '@/utils/CommonUtil'

export default {
  name: 'useTip',
  data () {
    return {
      tipIndex: 0,
      tips: [
        {
          type: 'info',
          content: 'Workit uses auto-saving to save your data'
        },
        {
          type: 'info',
          content: `You can use ${formatKeystroke('Command/Ctrl')} + ${formatKeystroke('A')} to add a new task`
        },
        {
          type: 'info',
          content: `You can use ${formatKeystroke('Command/Ctrl')} + ${formatKeystroke('Shift')} + ${formatKeystroke('A')} to add a new task with extra config`
        },
        {
          type: 'info',
          content: `You can use ${formatKeystroke('Command/Ctrl')} + ${formatKeystroke('Up/Down')} to toggle navigations`
        },
        {
          type: 'info',
          content: 'You can drag tasks to change their positions'
        },
        {
          type: 'info',
          content: 'You can drag a task and drop it into left navigation to change category'
        },
        {
          type: 'info',
          content: 'Not having any tasks yet here'
        }
      ],
      tc: null
    }
  },

  mounted () {
    this.tc = setInterval(() => {
      let nextIndex = this.tipIndex + 1
      if (nextIndex > this.tips.length - 1) {
        nextIndex = 0
      }
      this.tipIndex = nextIndex
    }, 1000 * 10)
  },

  beforeDestroy () {
    clearInterval(this.tc)
    this.tc = null
  }
}
</script>

<style scoped lang="scss">
.bed-use-tip {
  position: relative;
  height: 20px;
  color: #999;
  font-size: 13px;
  overflow: hidden;
  .tip-film {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    text-align: center;
    transition: all 0.4s;
    .tip {
      margin-bottom: 10px;
      height: 20px;
      // line-height: 20px;
    }
  }
}
</style>
