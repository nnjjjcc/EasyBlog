<template>
    <div class="layout">
      <el-container class="container">
        <el-header class="header">
          <div class="logo">新宿Blog</div>
        <div class="user-info">
        <span>欢迎回来，</span>
        <el-dropdown trigger="hover">
    <span class="nick-name">
      {{userInfo.nickName}}
      <span class="iconfont icon-close"></span>
    </span>
    
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item>
        <span @click="goUserInfo">个人信息</span>
          
        </el-dropdown-item>
        <el-dropdown-item @click="logout">退出</el-dropdown-item>
      </el-dropdown-menu>
    </template>
        </el-dropdown>
        <div class="avatar">
          <img :src="userInfo.avatar">
        </div>
        </div>
      </el-header>
        
        <el-container class="container">
          <el-aside width="200px" 
          class="left-aside">
          <div>
            <el-button class="post-btn"
            @click="createHtml">发布</el-button>
          </div>
          <div class="menu-panel">
            <ul >
            <li v-for="(menu,index) in menuList"> 
              <!-- //图标 -->
            <span class="menu-title-p"
            @click="openClose(index)">
            <span :class="['iconfont',menu.icon]"></span>
            <span class="menu-title">{{menu.title}}</span>
            <span :class="['iconfont','open-close',menu.open?'icon-open':'icon-close']"></span>
          </span>
            
            <ul class="sub-menu" 
            v-show="menu.open">
            <li v-for="subMenu in menu.children">
              <router-link :to="subMenu.path"
                 :class="['sub-menu-item',activePath==subMenu.path?'active':'']">{{subMenu.title}}</router-link>
              </li>
            </ul>
            </li>
          </ul>
          </div>
       
        </el-aside>
          <el-main class="right-main"><router-view/></el-main>
        </el-container>
      </el-container>
      <Dialog :show="progressDialog.show"
      :title="progressDialog.title" 
      :buttons="progressDialog.buttons"
      @close="progressDialog.show= false"
      :show-close="false"
      :showCancel="false"
       width="400px">
       <div class="progress-container">
        <div class="progress-panel">
          <el-progress type="circle"
                        :percentage="progressInfo.progress"
                        :status="progressInfo.status"
                        :color="colors"/>
        </div>
        <div class="error"
              v-if="progressInfo.result== 0">
         <div>生成页面出错了：{{ progressInfo.errorMsg }}</div>
         <div class="info">具体错误，请查看服务器日志</div>
        </div>
        <div class="success"
       v-if="progressInfo.progress == 100 && progressInfo.result == 1">
              发布成功
         </div>
        <div class="btn-panel"
          v-if="progressInfo.progress == 100 || progressInfo.result == 0">
         <el-button class="btn"
                    type="primary"
                    @click="progressDialog.show = false">关闭</el-button>
</div>
</div>
</Dialog>
    </div>
</template>
<script setup>
import { useStore } from "vuex";
import VueCookies from 'vue-cookies'
import {getCurrentInstance, reactive, ref, watch} from "vue"
import { useRoute,useRouter } from 'vue-router';
import { Store } from 'vuex';
const store = useStore();
const {proxy} = getCurrentInstance()
const router =useRouter()
const route =useRoute()
const menuList=ref([
  {
    title:"博客",
    icon:"icon-blog",
    open:true,
    children:[
      {title:'博客管理',
    path:"/blog/list",},
    {
      title:"分类管理",
      path:"/blog/category",
    }
    ],

  },
  {
    title:"专题",
    icon:"icon-zhuanti",
    open:true,
    children:[
      {title:'专题管理',
    path:"/special/list",}
    ],
  },
  {
    title:"设置",
    icon:"icon-settings",
    open:true,
    children:[
      {title:'个人信息设置',
         path:"/settings/my",
        },
    {
      title:"博客成员",
      path:"/settings/user",
    },
    {
      title:"系统设置",
      path:"/settings/Sysinfo",
      roleType:1,
    }
    ],
  },
  {
    title:"回收站",
    icon:"icon-delete",
    open:true,
    children:[
      {title:'回收站',
    path:"/recovery/list",}
    ], 
  },
])
const api ={
  "getUserInfo": "getUserInfo",
  "logout":"logout",
  "createHtml":"createHtml",
  "checkProgress":"checkProgress"
}

//
const openClose = (index)=>{
 const open= menuList.value[index].open;
 menuList.value[index].open = !open;
}
const userInfo =ref({});
const getUserInfo = async () => {
  let result = await proxy.Request({
    url: api.getUserInfo
  })

  if (!result) {
    return;
  }
  //保留头像
  userInfo.value = result.data;
  userInfo.value.avatar = proxy.globalInfo.imageUrl+result.data.avatar;

}
getUserInfo();

const init =()=>{
  userInfo.value=VueCookies.get("userInfo")
  userInfo.value.avatar=proxy.globalInfo.imageUrl+userInfo.value.avatar
}
init();
const activePath=ref(null)
watch(route,(newVal,oldVal)=>{
activePath.value=newVal.path
},{immediate:true,deep:true})
//跳转个人信息界面
const goUserInfo =()=>{
  router.push("../settings/my")
}

//删除
const logout = ()=>{
  proxy.Confirm(`你确定要删除退出吗`,async()=>{
    let result =await proxy.Request({
      url:api.logout,
     
    })
    if (!result){return}
    router.push("/login")
  })
}
//监听store
watch(()=> store.state.userInfo,(newVal,oldVal)=>{
  const avatar =proxy.globalInfo.imageUrl+newVal.avatar
  const nickName =newVal.nickName
  userInfo.value={avatar,nickName}
},{immediate:true,deep:true})
//发布
const colors =[
{ color:"#f56c6c", percentage:20},
{ color:"te6a23c", percentage:40},
{ color:"#6f7ad3", percentage:60 },
{ color:"#1989fa", percentage:80 },
{ color:"#5cb87a", percentage:100 }
]
const progressDialog =reactive({
  title:"发布",
  buttons:[],
  show:false
})
const progressInfo =reactive({
  progress:0
})
let checkTimer =null
const createHtml =async ()=>{
  progressDialog.show=true
  progressInfo.progress=0
  progressInfo.status=undefined
  let result =await proxy.Request({
    url:api.createHtml
  })
if (!result){
  return
}
checkProgress()
checkTimer =setInterval(()=>{
  checkProgress()
},1000)
}
const checkProgress = async()=>{
  let result =await proxy.Request({
    url:api.checkProgress,
    showLoading:false
  })
  if (!result){
  return
}
if(result.data.result ==0){
  progressInfo.status="exception"
  progressInfo.errorMsg=result.data.errorMsg
} else{
  progressInfo.progress=result.data.progress
}
progressInfo.result=result.data.result
if(
  (result.data.progress == 100||result.data.result == 0)&&
  checkTimer != null
){
  clearInterval(checkTimer)
}
}
</script>
<style lang="scss">
.layout{
    width: 1488px;
    .header{
        border-bottom: 1px solid #ddd;
        background: #fff;
        display: flex;
        justify-content: space-between;
        .logo{
          font-size: 30px;
        }
        .user-info{
          display: flex;
          align-items: center;
          .nick-name{
            color: rgb(5, 159, 214);
            cursor: pointer;
            .icon-close{
            font-size: 14px;
          }
          }
         .avatar{
          margin-left: 10px;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 25px;
          background: #ddd;
          img{
            border-radius: 25px;
            width: 100%;
          }
         }
        }


    }
    .example-showcase .el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}
    .container{
      padding-top: 10px;
        background: #f5f6f7;
        height: calc(100vh - 60px);
      .left-aside{
      padding: 0px 15px;
      width: 250px;
      .post-btn{
        background: green;
        color: #fff;
        height: 40px;
        width: 100%;
      }
      .menu-panel{
       
        ul,li{
          padding: 0px;
          margin: 0px;
          list-style: none;
        }
        .menu-title-p{
          padding: 0px 5px;
          line-height: 40px;
          cursor: pointer;
          display: flex;
          .iconfont{
          color: #91949a;
          font-size: 18px;
          }

          .menu-title{
            flex: 1;
            margin-left: 10px;
            color: #3f4042;
          }
          .open-close{
            width: 20px;
          }
        }
        .menu-title-p:hover{
          background: #ddd;
        }
        .sub-menu{
          width: 100%;
         
          
      
          .sub-menu-item{
            margin-left: 20px;
          padding-left: 25px;
            font-size: 14px;
            padding: 0px 10px;
         display: block;
         cursor: pointer;
         line-height: 40px;
         text-decoration: none;
         color: #3f4042;
          }
          .active{
            background: #ddd;
          }
          .sub-menu-item:hover{
            background: #ddd;
          }
        }

      }
    }
    

    .right-main{
      background: #fff;
      padding: 20px 10px 10px 10px;
       .sub-menu-item{
        line-height: 30px;
       }
    }
}
    }
  
.progress-container{
 .progress-panel{
 display: flex;
 justify-content:center;
}
.error {
color: red;
margin-top:20px;
.info{
font-size:13px;
}
}
.success{
margin-top:20px;
text-align:center;
font-size:16px;
color: green;
}
.btn-panel{
text-align:center;
margin-top:20px;
.btn{
margin:Opx auto;
}
}
}
</style>