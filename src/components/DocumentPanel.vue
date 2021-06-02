<template>
  <section class="bed-document-panel" v-show="isShow">
    <div class="container">
      <div class="box-row">
        <div class="icon-btn lg" @click="close()">
          <font-awesome-icon :icon="['fas', 'chevron-left']" />
        </div>
        <div class="title">
          Guide
        </div>
      </div>

      <div class="box-content">
        <div class="title">
          Shortcuts
        </div>
        <p>
          <span class="code">Workit</span> now supports 3 types of shortcuts
        </p>
        <p class="bullet">
          <span class="keycode">Command/Ctrl</span> + <span class="keycode">A</span> (Fast task adding)
        </p>
        <p class="bullet">
          <span class="keycode">Command/Ctrl</span> + <span class="keycode">Shift</span> + <span class="keycode">A</span> (Fast task adding with extra option)
        </p>
        <p class="bullet">
          <span class="keycode">Command/Ctrl</span> + <span class="keycode">Up/Down</span> (Toggle in left navigations)
        </p>
        <div class="title">
          Smart Content Analyse
        </div>
        <p>
          You may think editing task in seperated area from content area is a bit of difficult. There's another way to achive it. <span class="code">Workit</span> supports smart content detect and analyse, which means you can achive below same goals via input content. (No matter the position in content is)
        </p>
        <div class="sub-title">
          Fast labels tagging by <span class="code">##</span>
        </div>
        <p>
          Whenever you input something in <span class="code">##</span> pair, the content inside will be fixed into labels and automatically be merged into current labels. e.g.
        </p>
        <div class="code-block">
          Task content blahblah...#tag1,tag-2#
        </div>
        <div class="sub-title">
          Fast due date setting/postpone by <span class="code">~~</span>
        </div>
        <p>
          Whenever you input something in <span class="code">~~</span> pair, the content inside will be fixed into due date and current task due date will be set automatically.
        </p>
        <p>
          Numbers are treated as post days after today. e.g.
        </p>
        <div class="code-block">
          # Task due date will be set as today 6pm<br/>
          Task content blahblah...~0~<br/><br/>
          # Task due date will be set as next workday 6pm<br/>
          Task content blahblah...~1~
        </div>
        <p>
          Weekdays are supported. e.g.
        </p>
        <div class="code-block">
          # Task due date will be set as the target day 6pm<br/>
          Task content blahblah...~mo~<br/>
          Task content blahblah...~Mo~<br/>
          Task content blahblah...~Monday~<br/>
          Task content blahblah...~星期三~<br/>
          Task content blahblah...~星期4~<br/>
          Task content blahblah...~星期日~<br/>
          Task content blahblah...~星期天~<br/>
          Task content blahblah...~周日~
        </div>
        <p>
          Date format is supported as well. e.g.
        </p>
        <div class="code-block">
          # Task due date will be set as the target day 6pm<br/>
          Task content blahblah...~03-23~<br/>
          Task content blahblah...~2021-03-23~
        </div>
        <div class="sub-title">
          Fast repeat task setting by <span class="code">^^</span>
        </div>
        <p>
          Whenever you input something in <span class="code">^^</span> pair, the content inside will be fixed into repeat type and current task repeat type will be set automatically. e.g.
        </p>
        <div class="code-block">
          Task content blahblah...^mo^<br/>
          Task content blahblah...^everymo^<br/>
          Task content blahblah...^Monday^<br/>
          Task content blahblah...^星期三^<br/>
          Task content blahblah...^每星期4^<br/>
          Task content blahblah...^每个周日^<br/>
          Task content blahblah...^ew^<br/>
          Task content blahblah...^每个工作日^<br/>
          Task content blahblah...^once^
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ipcRenderer } from 'electron'
// import eventBus from '@/eventBus'
import system from '@/models/system'

export default {
  name: 'documentPanel',
  data () {
    return {
      isShow: false
    }
  },

  mounted () {
    ipcRenderer.on('sys_showguide', () => {
      if (system.isPanelActive) {
        return
      }
      this.show()
    })
  },

  methods: {
    show () {
      this.isShow = true
      system.isPanelActive = true
    },
    close () {
      this.isShow = false
      system.isPanelActive = false
    }
  }
}
</script>

<style scoped lang="scss">
@import "../assets/css/var.scss";

.bed-document-panel {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 99;
  width: 100%;
  height: 100%;
  .container {
    height: 100%;
    background: $primary-bgcolor;
    // box-shadow: 1px 1px 28px 2px rgba(12, 12, 12, .4);
    transition: all $transition-time;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 4px;
      background: $scrollbar-thumb-color;
    }
    .box-row {
      display: flex;
      // justify-content: space-between;
      align-items: center;
      position: fixed;
      left: 0;
      top: 0;
      right: 0;
      z-index: 100;
      height: 50px;
      padding: 0 18px 0 80px;
      // border-bottom-right-radius: $border-radius;
      // border-bottom-left-radius: $border-radius;
      background: $sheet-bgcolor;
      box-shadow: $sheet-boxshadow;
      .title {
        color: $secondary-font-color;
        font-weight: bold;
      }
    }
    .box-content {
      padding: 62px 18px 12px;
      .code {
        margin: 0;
        padding: .2em .4em;
        border-radius: 6px;
        background-color: $border-color;
        font-size: 85%;
      }
      .keycode {
        padding: 3px 5px;
        vertical-align: middle;
        font-size: 11px;
        line-height: 10px;
        border: 1px solid $border-color;
        border-radius: 6px;
        box-shadow: inset 0 -1px 0 $border-color;
      }
      .title {
        margin: 24px 0 16px;
        padding-bottom: 8px;
        border-bottom: 1px solid $border-color;
        color: $primary-font-color;
        font-size: 1.5em;
        font-weight: 600;
        line-height: 1.25;
      }
      .sub-title {
        margin: 24px 0 16px;
        color: $primary-font-color;
        font-size: 1.25em;
        font-weight: 600;
        line-height: 1.25;
      }
      .bullet {
        position: relative;
        margin-left: 20px;
        &:before {
          content: " ";
          position: absolute;
          left: -12px;
          top: 8px;
          width: 4px;
          height: 4px;
          border-radius: 100%;
          background: $primary-font-color;
        }
      }
      .code-block {
        padding: 16px;
        border-radius: 6px;
        background-color: $border-color;
        font-size: 90%;
        line-height: 1.45;
        // overflow: auto;
      }
    }
  }
}
@media (prefers-color-scheme: dark) {
  .bed-document-panel {
    .container {
      background: $primary-bgcolor-dark;
      &::-webkit-scrollbar-thumb {
        background: $scrollbar-thumb-color-dark;
      }
      .box-row {
        background: $sheet-bgcolor-dark;
        box-shadow: none;
        .title {
          color: $secondary-font-color-dark;
        }
      }
      .box-content {
        .code {
          background-color: $border-color-dark;
        }
        .keycode {
          border: 1px solid $border-color-dark;
          box-shadow: inset 0 -1px 0 $border-color-dark;
        }
        .title {
          border-bottom: 1px solid $border-color-dark;
          color: $primary-font-color-dark;
        }
        .sub-title {
          color: $primary-font-color-dark;
        }
        .bullet {
          &:before {
            background: $primary-font-color-dark;
          }
        }
        .code-block {
          background-color: $border-color-dark;
        }
      }
    }
  }
}
</style>
