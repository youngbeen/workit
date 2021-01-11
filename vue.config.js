module.exports = {
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
}
