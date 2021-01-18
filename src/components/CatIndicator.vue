<template>
  <section class="comp-cat-indicator">
    {{ fixedContent }}
  </section>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      required: false,
      default: ''
    }
  },
  computed: {
    fixedContent () {
      if (this.name) {
        return this.name[0].toUpperCase() + this.name.substring(1)
      } else {
        return ''
      }
    }
  }
}
</script>

<style scoped lang="scss">
.comp-cat-indicator {
  position: absolute;
  right: 0;
  top: 0;
  z-index: 0;
  color: rgba(210, 210, 210, 0.3);
  // line-height: 23px;
  font-size: 16px;
  transform-origin: top left;
  transform: rotate(90deg);
}
@media (prefers-color-scheme: dark) {
  .comp-cat-indicator {
    color: rgba(90, 90, 90, .3);
  }
}
</style>
