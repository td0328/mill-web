const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer:{
    proxy:{
      '/api':{
        // 跨域的服务器地址
        target: 'http://127.0.0.1:8081',
        // 是否允许跨域
        changeOrigin: true,
        // 替换掉请求路径的/api为“”
        pathRewrite:{'^/api': ""}
      },
    }
  }
})
