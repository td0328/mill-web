const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  chainWebpack: config => {
    config
        .plugin('html')
        .tap(args => {
          args[0].title = '开发者工厂'
          return args
        })
  },
  lintOnSave:false,
  transpileDependencies: true
})
