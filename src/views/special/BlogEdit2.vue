<template>
    
      <!--新增修改弹窗-->
      <Window :show="windowConfig.show"
              :buttons="windowConfig.buttons"
              @close="closeWindow">
        <el-form :model="blogFormData"
                 :rules="rules"
                 ref="blogFormRef">
          <el-form-item prop="title">
            <div class="title-input">
              <el-input placeholder="请输入博客标题"
                        v-model="blogFormData.title">
              </el-input>
            </div>
          </el-form-item>
          <el-form-item prop="content">
            <div :style="{'width':'100%'}">
              <EditorHtml :height="editorHtmlHeight"
                          v-model="blogFormData.content"
                          v-if="blogFormData.editorType==0"></EditorHtml>
              <EditorMarkdown v-else
                              :height="editorMarkdownHeight"
                              v-model="blogFormData.markdownContent"
                              @htmlContent="setHtmlContent"></EditorMarkdown>
            </div>
  
          </el-form-item>
        </el-form>
      </Window>
 
  </template>
  <script setup>
  import { getCurrentInstance, nextTick, onMounted, onUnmounted, reactive, ref } from "vue"
  
  const { proxy } = getCurrentInstance();
  
  const editorMarkdownHeight = window.innerHeight - 60 - 20 - 30 - 50 - 10 - 50 - 10;
  const editorHtmlHeight = window.innerHeight - 60 - 20 - 30 - 50 - 100 - 50;
  
  const api = {
    saveBlog: "/blog/saveBlog4Special",
    getUserInfo: "getUserInfo",
    getBlogDetail: "/blog/getBlogById",
    autoSave: "/blog/autoSaveBlog4Special"
  }
  
  const init = (type, data) => {
    startTimer();
    windowConfig.show = true;
    nextTick(() => {
      blogFormRef.value.resetFields();
      blogFormData.value = { categoryId: data.categoryId, pBlogId: data.blogId };
      if (type === "add") {
        getUserInfo();
      } else {
        getBlogDetail(data.blogId);
      }
    })
  }
  
  defineExpose({ init });
  
  const getUserInfo = async () => {
    let result = await proxy.Request({
      url: api.getUserInfo,
    })
    if (!result) {
      return;
    }
    blogFormData.value.editorType = result.data.editorType;
  }
  
  const getBlogDetail = async (blogId) => {
    let result = await proxy.Request({
      url: api.getBlogDetail,
      params: {
        blogId: blogId
      }
    })
    if (!result) {
      return
    }
    blogFormData.value = result.data;
    if (result.data.tag) {
      blogFormData.value.tag = result.data.tag.split("|");
    } else {
      blogFormData.value.tag = [];
    }
  }
  
  let timmer = ref(null);
  const startTimer = () => {
    timmer.value = setInterval(() => {
      autoSave();
    }, 10000);
  }
  
  
  const cleanTimer = () => {
    if (timmer.value !== null) {
      clearInterval(timmer.value);
      timmer.value = null;
    }
  }
  
  //自动保存
  const autoSave = async () => {
    if (blogFormData.value.title == undefined || blogFormData.value.content == undefined || timmer.value == null) {
      return;
    }
    const params = {};
    Object.assign(params, blogFormData.value)
    let result = await proxy.Request({
      url: api.autoSave,
      showLoading: false,
      params: params
    })
    if (!result) {
      return;
    }
    blogFormData.value.blogId = result.data;
  }
  
  
  //新增,修改
  const windowConfig = reactive({
    show: false,
    buttons: [{
      type: "danger",
      text: "确定",
      click: (e) => {
        submitBlog();
      }
    }]
  })
  
  //博客正文
  const blogFormRef = ref(null);
  const blogFormData = ref({ tag: [] });
  
  //markdown编辑器设置html内容
  const setHtmlContent = (htmlContent) => {
    blogFormData.value.content = htmlContent
  }
  //第一步提交 展示配置弹窗
  const submitBlog = () => {
    blogFormRef.value.validate(async (valid) => {
      if (!valid) {
        return;
      }
      let params = Object.assign({}, blogFormData.value);
      let result = await proxy.Request({
        url: api.saveBlog,
        params
      })
      if (!result) {
        return;
      }
      proxy.message.success("保存博客成功");
      closeWindow();
    });
  }
  
  const emit = defineEmits();
  const closeWindow = () => {
    windowConfig.show = false;
    emit("callback")
    if (timmer.value !== null) {
      cleanTimer();
    }
  }
  
  const rules = {
    title: [{ required: true, message: "请输入标题" }],
    content: [{ required: true, message: "请输入正文" }],
    categoryId: [{ required: true, message: "请选择博客分类" }],
    type: [{ required: true, message: "请选择博客类型" }],
    allowComment: [{ required: true, message: "请选择是否允许评论" }],
    reprintUrl: [{ required: true, message: "请输入原文地址" }],
  }
  
  onUnmounted(() => {
    cleanTimer();
  })
  
  </script>
<style lang="scss">
.is-error .title-input .el-input__wrapper {
  box-shadow: none;
}

.title-input {
  width: 100%;
  border-bottom: 1px solid #ddd;
  .el-input__wrapper {
    box-shadow: none;
  }

  .el-form-item.is-error .el-input__wrapper {
    box-shadow: none;
  }

  input {
    font-size: 18px;
  }
}
</style>