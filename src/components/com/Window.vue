<template>
    <div class="window" 
    :style="{width:windowWidth+'px'}"
    v-if="show">
        <div class="title">
            <span class="iconfont icon-fanhui"
            @click="close" ></span>
        </div>
        <div class="body">
            <slot></slot>
        </div>
        <template v-if="buttons&&buttons.length>0 ||showCancel">
             <div class="footer">
                <el-button link @click="close" v-if="showCancel">
                取消
               </el-button>
                <el-button v-for="btn in buttons"
                :type="btn.type"
                @click="btn.click">
               {{btn.text}}
               </el-button>
             </div>
            
        </template>
    </div>
</template>
<script setup>
import { ref } from 'vue';
const windowWidth =window.innerWidth -280 
const props =defineProps({
    show:{
        type:Boolean,
        default:false
    },
    buttons:{
    type:Array
    },
    showCancel: {
    type: Boolean,
    default: true,
  },
})
const emit = defineEmits(["close"]);
const close = () => {
  emit("close")

}
</script>
<style lang="less">
.window{
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: calc(100vh - 70px);
    background: rgb(255, 255, 255);
    z-index: 50;
    .title{
        height: 30px;
        display: flex;
        align-items: center;
        padding: 10px;
        .icon-fanhui{
            cursor: pointer;
            font-size: 10px;
        }

    }
    .body{
        height: calc(100vh - 151px);
        padding: 10px;
        overflow: auto;
    }
    .footer{
        padding-top: 5px;
        border-top: 1px solid #ddd;
        text-align: center;
        line-heigh: 50px;
        }
}
</style>