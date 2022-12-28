<template>
  
      <Window :show="windowConfig.show"
              :buttons="windowConfig.buttons"
              :showCancel="false"
              @close="windowConfig.show = false">
        <el-row :gutter="10">
          <el-col :span="10">
            <el-card class="box-card">
              <template #header>
                <div class="card-header">
                  <span>专题文章</span>
                </div>
              </template>
              <el-tree class="tree-panel"
                       ref="refTree"
                       :data="blogList"
                       defaultExpandAll
                       node-key="blogId"
                       :expand-on-click-node="false"
                       :props="treeProps"
                       :highlight-current="true"
                       @node-click="treeNodeClick">
                <template #default="{ node, data }">
                  <span class="custom-node-style">
                    <span class="node-title">
                      <span v-if="data.status==0"
                            :style="{'color':'red','font-size':'13px'}"> {{ data.title }}</span>
                      <span v-else
                            :style="{'color':'green','font-size':'13px'}"> {{ data.title }}</span>
                    </span>
                  </span>
                </template>
              </el-tree>
            </el-card>
          </el-col>
          <el-col :span="14">
            <el-card class="box-card">
              <template #header>
                <div class="card-header">
                  <span>文章详情</span>
                </div>
              </template>
              <div v-if="blog.title">
                <div class="my-title"> {{blog.title}}</div>
                <div v-html="blog.content"
                     class="blog-detail"></div>
              </div>
              <div v-else
                   class="no-data">
                请选择专题文章，查看详情
              </div>
            </el-card>
          </el-col>
        </el-row>
  
      </Window>
   
  </template>
  <script setup>
  import hljs from "highlight.js";
  import "highlight.js/styles/atom-one-light.css"; //样式
  
  import { getCurrentInstance, ref, reactive, nextTick } from "vue"
  const { proxy } = getCurrentInstance();
  
  const api = {
    "getBlogDetail": "/blog/getBlogById",
    "getSpecialInfo": "blog/getSpecialInfo",
  }
  
  const windowConfig = reactive({
    show: false,
    buttons: [{
      type: "danger",
      text: "确定",
      click: (e) => {
        windowConfig.show = false;
      }
    }]
  })
  
  const currentBlogId = ref(null);
  const blog = ref({});
  const showDetail = async (data) => {
    windowConfig.show = true;
    currentBlogId.value = data.blogId;
    //获取所有文章树
    getSpecialInfo(data.categoryId);
    //获取详情
    showBlogDetail(data.blogId);
  }
  
  const showBlogDetail = async (blogId) => {
    let result = await proxy.Request({
      url: api.getBlogDetail,
      params: {
        blogId: blogId
      }
    })
    if (!result) {
      return;
    }
    blog.value = result.data;
    nextTick(() => {
      //高亮显示
      let blocks = document.querySelectorAll("pre code");
      blocks.forEach((block) => {
        hljs.highlightBlock(block);
      });
    });
  }
  
  const treeNodeClick = (data) => {
    if (data.blogId == "0") {
      blog.value = {};
      return;
    }
    showBlogDetail(data.blogId);
  }
  
  //属性展示专题
  const treeProps = {
    children: "children",
    label: "title",
    value: "blogId",
  };
  const blogList = ref([]);
  const refTree = ref(null);
  const getSpecialInfo = async (categoryId) => {
    let result = await proxy.Request({
      url: api.getSpecialInfo,
      params: {
        categoryId: categoryId,
        showType: "1"
      }
    })
    if (!result) {
      return;
    }
    blogList.value = result.data;
    nextTick(() => {
      refTree.value.setCurrentKey(currentBlogId.value);
    });
  }
  
  defineExpose({ showDetail })
  </script>
  <style lang="scss">
  .my-title {
    font-size: 18px;
  }
  
  .blog-detail {
    blockquote {
      padding: 0 1em;
      color: #6a737d;
      border-left: 0.25em solid #dfe2e5;
    }
  
    img {
      max-width: 80%;
    }
  }
  </style>