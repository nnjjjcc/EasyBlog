<template>
  <div class="app">
    <el-config-provider :locale="locale"
    :message="config">
    <router-view/>
  </el-config-provider>

  </div>
</template>
<script setup>

import {reactive} from "vue"
import  zhCn  from 'element-plus/lib/locale/lang/zh-cn'
//汉化
const locale=zhCn
const config =reactive({
  max:1,
})
</script>
<style lang="scss">
.app{
  width: 1488px;
}
</style>
