<template>
  <section class="comp-efficiency-bar">
    <div class="base"
      :style="{
        width: div <= 1 ? '100%' : rDiv * 100 + '%'
      }">&nbsp;</div>
    <div class="bar"
      :style="{
        width: div <= 1 ? div * 100 + '%' : '100%'
      }">{{ div > 0.9 ? '🚀' : '' }} {{ (div * 100).toFixed(1) }}%</div>
  </section>
</template>

<script>
export default {
  props: {
    base: {
      type: Number,
      required: true,
      default: 1
    },
    bar: {
      type: Number,
      required: true,
      default: 1
    }
  },

  computed: {
    div () {
      if (this.base) {
        return this.bar / this.base
      } else {
        return 1
      }
    },
    rDiv () {
      if (this.bar) {
        return this.base / this.bar
      } else {
        return 1
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "../assets/css/var.scss";

.comp-efficiency-bar {
  position: relative;
  height: 24px;
  // background: red;
  overflow: hidden;
  .base {
    box-sizing: border-box;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
    height: 24px;
    border: 2px solid rgba($color-active, .8);
    transition: all $transition-time-normal;
  }
  .bar {
    box-sizing: border-box;
    position: absolute;
    left: 2px;
    top: 2px;
    z-index: 2;
    height: 20px;
    line-height: 20px;
    padding-right: 3px;
    background: linear-gradient(90deg, rgba(49, 192, 49, 0.7), rgba(49, 192, 49, 0.4), rgba(49, 192, 49, 0.7));
    background-size: 1000px;
    background-clip: padding-box;
    text-align: right;
    animation: rolling 8s linear infinite;
    // transition: all $transition-time-normal;
  }
}
@keyframes rolling {
  0% {
    background-position: 0px;
  }
  100% {
    background-position: 1000px;
  }
}
</style>
