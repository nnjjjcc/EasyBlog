import { fileURLToPath, URL } from 'node:url'
import path from "path"
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    hmr: true,
    port: 3001,
    // 代理
    proxy: {
      '/api': { //// 所有包含有'api'字符串的请求地址都会转发到target指向的地址
        target: "http://localhost:8081/",//目标代理接口地址
        secure: false,
        changeOrigin: true,      //开启代理，在本地创建一个虚拟服务端
        pathRewrite: {
          '^/api': '/api',  //通过pathRewrite重写地址
        }
      },
    }

  },


  resolve: {
    //配置路径别名
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
