<template>
  <section class="comp-index-indicator">
    {{ index + 1 }}
  </section>
</template>

<script>
export default {
  props: {
    index: {
      type: Number,
      required: true
    }
  }
}
</script>

<style scoped lang="scss">
.comp-index-indicator {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 0;
  color: rgba(210, 210, 210, 0.2);
  line-height: 23px;
  font-size: 44px;
}
@media (prefers-color-scheme: dark) {
  .comp-index-indicator {
    color: rgba(90, 90, 90, .2);
  }
}
</style>
