<template>
    <div>
        <el-button type="danger"
        @click="showEdit('add')" v-if="userInfo.roleType==1">新增分类</el-button>
        <Table :columns="columns"
                :showPagination="false"
                :dataSource="tableData"
                :fetch="loadDataList"
                :options="tableOptions">
                <template #cover="{index,row}">
                  <Cover :cover="row.cover"></Cover>         
                </template>
                <template #op="{index,row}"  v-if="userInfo.roleType==1">
                  <div op>
<a href="javascript:void(0)" class="a-link" @click="showEdit('update',row)">修改</a>
<el-divider direction="vertical" />
<a href="javascript:void(0)" class="a-link" @click="del(row)">删除</a>
<el-divider direction="vertical" />
<a href="javascript:void(0)" 
:class="[index==0?'not-allow':'a-link']" @click="changeSort(index,up)">上移</a>
<el-divider direction="vertical" />
<a href="javascript:void(0)" 
:class="[index==tableData.list.length-1?'not-allow':'a-link']" @click="changeSort(index,down)">下移</a>

                  </div>

                </template>


        </Table>
        <Dialog 
                width="500px"
                :show="dialgoConfig.show"
                :title="dialgoConfig.title"
                :buttons="dialgoConfig.buttons"
                @close="dialgoConfig.show=false">
        <el-form 
                label-width="80px"
                :model="formData"
               :rules="rules"
               ref="formDataRef">
        <el-form-item label="名称"
        prop="categoryName">
          <el-input 
                    
                    placeholder="输入名称"
                    v-model="formData.categoryName"
                    >
  
          </el-input>
        </el-form-item>
        <el-form-item
              label="封面"
              prop="cover">
          <CoverUpload v-model="formData.cover"></CoverUpload>
        </el-form-item>
        <el-form-item label="简介" 
            prop="categoryDesc">
            <el-input v-model="formData.categoryDesc"
              type="textarea"
              :autosize="{minRows:4,maxRows:4}"/>
        </el-form-item>
      </el-form>
              </Dialog>
    </div>
</template>
<script setup>
import {getCurrentInstance,ref, reactive, nextTick} from "vue"
import VueCookies from 'vue-cookies'
const userInfo = ref(VueCookies.get("userInfo") || {});
const {proxy} = getCurrentInstance()
const api={
    "loadDataList": "/category/loadAllCategory4Blog", 
    "saveCategory": "/category/saveCategory4Blog",
  "delCategory": "category/delCategory4Blog",
  "changeSort": "category/changeCategorySort4Blog"
}
const columns = [{
  label: "封面",
  prop: "cover",
  width: 100,
  scopedSlots: "cover",//插槽
}, {
  label: "名称",
  prop: "categoryName",
  width: 200,
}, {
  label: "简介",
  prop: "categoryDesc",
}, {
  label: "博客数量",
  prop: "blogCount",
  width: 100,
}, {
  label: "操作",
  prop: "op",
  width: 200,
  scopedSlots: "op",
}]
//新增 修改
const dialgoConfig=reactive({
  show:false,
  title:"标题",
  buttons:[
    {
      type:"danger",
      text:"确定",
      click:(e)=>{
        submitForm()
      },
  },
  ]
})
const formData=ref({

})
const rules ={
  categoryName:[{required:true,message:"请输入分类名称"}]
}
const formDataRef=ref(

)
const showEdit=(type,data)=>{
dialgoConfig.show=true
nextTick(()=>{
  formDataRef.value.resetFields()
if(type =="add"){
  dialgoConfig.title="新增分类"
  formData.value={}
}
else if(type == "update")
{
  dialgoConfig.title="编辑分类"
  formData.value=JSON.parse(JSON.stringify(data))
}
})

}

const tableData =reactive({})
const tableOptions={
    extHeight:10
}
const loadDataList= async()=>{
let result =await proxy.Request({
    url:api.loadDataList
})
if(!result){return}
tableData.list=result.data
}
const submitForm=()=>{
  formDataRef.value.validate(async(valid)=>{
    if(!valid){
      return
    }
    let params={}
    Object.assign(params,formData.value)
    let result =await proxy.Request({
url:api.saveCategory,
params,

    })
    if(!valid){
      return
    }
    dialgoConfig.show=false
    proxy.message.success("保存成功")
    loadDataList()
  })
}
//删除
const del = (data)=>{
  proxy.Confirm(`你确定要删除-【${data.categoryName}】`,async()=>{
    let result =await proxy.Request({
      url:api.delCategory,
      params:{
        categoryId:data.categoryId
      }
    })
    if (!result){return}
    loadDataList()
  })
}
//修改排序
const changeSort = async (index,type)=>{
  let categoryList =tableData.list
  if(type === "down" && index === categoryList.length-1 || type === "up" && index===0)
  {return}
  let temp =categoryList[index]
  let number = type =="down" ?1:-1

  categoryList.splice(index,1);
  categoryList.splice(index+number,0,temp)
  let result =await proxy.Request({
    url:api.changeSort,
    dataType:"json",
    params:categoryList
  })
  if(!result){
    return
  }
  proxy.message.success("重新排序成功")
}
</script>
<style lang="scss">
.op{
  display: flex;
  align-items: center;
  .a-link{
    color: rgb(0, 103, 220);
    text-decoration: none;
  }
}
.not-allow{
  cursor: not-allowed;
}


</style>