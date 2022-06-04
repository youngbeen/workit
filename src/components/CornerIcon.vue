<template>
  <section class="comp-corner-icon">
    <font-awesome-icon :icon="['fas', icon]" class="icon" />
  </section>
</template>

<script>
export default {
  props: {
    icon: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped lang="scss">
@import "../assets/css/var.scss";

.comp-corner-icon {
  position: absolute;
  left: -20px;
  top: -20px;
  width: 40px;
  height: 40px;
  // line-height: 40px;
  background: $color-active;
  transform: rotate(135deg);
  text-align: center;
  font-size: 12px;
  .icon {
    color: #fff;
    transform: rotate(-135deg);
  }
}
@media (prefers-color-scheme: dark) {
  .comp-corner-icon {
    background: $color-active-dark;
    .icon {
      color: $primary-font-color-dark;
    }
  }
}
</style>
