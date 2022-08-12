<template>
  <section class="bed-about-me" v-if="isShow">
    <div class="modal-bg" :class="[animated && 'animated']" @click="close()"></div>
    <div class="container" :class="[animated && 'animated']">
      <img class="logo" src="@/assets/Icon-MacOS-512x512@2x.png" alt="logo">
      <div class="title">Workit</div>
      <div class="version">{{ version }}</div>
      <div class="sub-title">Released under ISC, all rights reversed by youngbeen 2019 - present</div>
      <div class="sub-title">created by youngbeen with ❤️</div>
    </div>
  </section>
</template>

<script>
// import { ipcRenderer } from 'electron'
import { sleep } from '@youngbeen/sleep'
import eventBus from '@/eventBus'
import system from '@/models/system'
import projectInfo from '../../package.json'

export default {
  data () {
    return {
      isShow: false,
      animated: false, // 开启动画控制
      version: ''
    }
  },

  mounted () {
    this.version = projectInfo?.version || ''
    eventBus.$on('showAboutMe', () => {
      this.show()
    })
  },

  beforeDestroy () {
    eventBus.$off('showAboutMe')
  },

  methods: {
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

.bed-about-me {
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
    width: 480px;
    padding: 30px;
    border-radius: $border-radius;
    background: $sheet-bgcolor;
    box-shadow: $sheet-boxshadow;
    opacity: 0;
    transition: all $transition-time;
    text-align: center;
    .logo {
      width: 48px;
    }
    .title {
      margin: 12px 0 6px;
      font-weight: 600;
    }
    .version {
      margin-bottom: 12px;
      font-size: 10px;
    }
    &.animated {
      margin-top: 15%;
      opacity: 1;
    }
  }
}
@media (prefers-color-scheme: dark) {
  .bed-about-me {
    .container {
      background: $sheet-bgcolor-dark;
      box-shadow: none;
    }
  }
}
</style>
