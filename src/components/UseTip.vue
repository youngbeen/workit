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
          content: `Use ${formatKeystroke('Command/Ctrl')} + ${formatKeystroke('N')} to add a new task`
        },
        {
          type: 'info',
          content: `Use ${formatKeystroke('Command/Ctrl')} + ${formatKeystroke('Shift')} + ${formatKeystroke('N')} to add a new task in swift`
        },
        {
          type: 'info',
          content: `Use ${formatKeystroke('Command/Ctrl')} + ${formatKeystroke('Up/Down')} to toggle between navigations`
        },
        {
          type: 'info',
          content: 'Try #labels# in content input to add labels in swift'
        },
        {
          type: 'info',
          content: 'Try ~1~ in content input to set due date to tomorrow in swift'
        },
        {
          type: 'info',
          content: 'Try ~monday~ in content input to set due date to Monday in swift'
        },
        {
          type: 'info',
          content: 'Try ^workday^ or ^ew^ in content input to make task repeat in every workday in swift'
        },
        {
          type: 'info',
          content: 'Try ^friday^ in content input to make task repeat in every friday in swift'
        },
        {
          type: 'info',
          content: 'Drag and drop a task onto another one can change their sequence or relations'
        },
        {
          type: 'info',
          content: 'Drag a task onto left navigation and drop task into that category'
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
