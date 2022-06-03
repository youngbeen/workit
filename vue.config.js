const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        // options placed here will be merged with default configuration and passed to electron-builder
        productName: 'Workit',
        mac: {
          icon: './workit_icon.png'
        },
        win: {
          icon: './workit_icon.png'
        },
        electronDownload: {
          mirror: 'https://npm.taobao.org/mirrors/electron/'
        }
      }
    }
  },
  configureWebpack: {
    target: 'electron-renderer'
  }
})
