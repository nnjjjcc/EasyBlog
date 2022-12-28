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

      <Dialog :show="dialogConfig.show"
              :title="dialogConfig.title"
              :buttons="dialogConfig.buttons"
              width="800px"
              @close="dialogConfig.show=false">
        <el-form :model="blogFormData"
                 :rules="rules"
                 ref="settingsFormRef"
                 label-width="80px"
                 class="blog-setting-form">
          <el-form-item label="博客分类"
                        prop="categoryId">
            <el-select v-model="blogFormData.categoryId"
                       clearable
                       placeholder="请选择分类"
                       :style="{width:'100%'}">
              <el-option :value="0"
                         label="全部分类"></el-option>
              <el-option :value="item.categoryId"
                         :label="item.categoryName"
                         v-for="item in categoryList"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="封面"
                        prop="cover">
            <CoverUpload v-model="blogFormData.cover"></CoverUpload>
          </el-form-item>
          <el-form-item label="博客类型"
                        prop="type">
            <el-radio-group v-model="blogFormData.type">
              <el-radio :label="0">原创</el-radio>
              <el-radio :label="1">转载</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="原文地址"
                        prop="reprintUrl"
                        v-if="blogFormData.type==1">
            <el-input v-model="blogFormData.reprintUrl"
                      placeholder="请输入原文地址">
            </el-input>
          </el-form-item>
          <el-form-item label="评论"
                        prop="allowComment">
            <div class="allow-comment">
              <el-radio-group v-model="blogFormData.allowComment">
                <el-radio :label="1">允许</el-radio>
                <el-radio :label="0">不允许</el-radio>
              </el-radio-group>
              <span class="info">请先在评论设置里设置好相应参数，评论才会生效</span>
            </div>

          </el-form-item>
          <el-form-item label="博客摘要"
                        prop="summary">
            <el-input v-model="blogFormData.summary"
                      type="textarea"
                      placeholder="请输入摘要"
                      :autosize="{minRows:4,maxRows:4}">
            </el-input>
          </el-form-item>
          <el-form-item label="博客标签"
                        prop="categoryDesc">
            <div class="tag-input-panel">
              <div class="tag-list">
                <el-tag v-for="(item,index) in blogFormData.tag"
                        @close="closeTag(index)"
                        closable
                        class="tag-item">
                  {{item}}
                </el-tag>
              </div>

              <span class="info"
                    v-if="blogFormData.tag.length==0">添加标签更容易被搜索引擎收录</span>
              <span class="iconfont icon-add"
                    @click="showTagInputHandler"
                    v-if="!showTagInput"></span>
              <el-input class="tag-input"
                        v-if="showTagInput"
                        v-model="tagInputValue"
                        @blur="tagInputResult"
                        @keyup.enter="tagInputResult"></el-input>
            </div>
          </el-form-item>
        </el-form>
      </Dialog>

    </Window>

</template>
<script setup>
import { getCurrentInstance, nextTick, onMounted, onUnmounted, reactive, ref } from "vue"

const { proxy } = getCurrentInstance();

const editorMarkdownHeight = window.innerHeight - 60 - 20 - 30 - 50 - 10 - 50 - 10;
const editorHtmlHeight = window.innerHeight - 60 - 20 - 30 - 50 - 100 - 50;

const api = {
  loadAllCategory4Blog: "/category/loadAllCategory4Blog",
  saveBlog: "/blog/saveBlog",
  getUserInfo: "getUserInfo",
  getBlogDetail: "/blog/getBlogById",
  autoSave: "/blog/autoSaveBlog"
}

const init = (type, data) => {
  startTimer();
  windowConfig.show = true;
  nextTick(() => {
    blogFormRef.value.resetFields();
    blogFormData.value = { tag: [] };
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
  if (blogFormData.value.title == undefined || blogFormData.value.content == undefined || timmer.value == null || dialogConfig.show) {
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
      showSettings();
    }
  }]
})

const emit = defineEmits();
const closeWindow = () => {
  windowConfig.show = false;
  emit("callback")
  if (timmer.value !== null) {
    cleanTimer();
  }
}



//博客正文
const blogFormRef = ref(null);
const blogFormData = ref({ tag: [] });

//markdown编辑器设置html内容
const setHtmlContent = (htmlContent) => {
  blogFormData.value.content = htmlContent
}
//第一步提交 展示配置弹窗
const showSettings = () => {
  blogFormRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    blogFormData.tag = blogFormData.tag == null ? [] : blogFormData.tag;
    dialogConfig.show = true;
  });
}

const rules = {
  title: [{ required: true, message: "请输入标题" }],
  content: [{ required: true, message: "请输入正文" }],
  categoryId: [{ required: true, message: "请选择博客分类" }],
  type: [{ required: true, message: "请选择博客类型" }],
  allowComment: [{ required: true, message: "请选择是否允许评论" }],
  reprintUrl: [{ required: true, message: "请输入原文地址" }],
}

//博客设置
const dialogConfig = reactive({
  show: false,
  title: "博客设置",
  buttons: [{
    type: "danger",
    text: "确定",
    click: (e) => {
      submitBlog();
    }
  }]
})
//博客分类
const categoryList = ref([]);
const loadCategory = async () => {
  let result = await proxy.Request({
    url: api.loadAllCategory4Blog,
  })
  if (!result) {
    result
  };
  categoryList.value = result.data;
} 
onMounted(() => {
  loadCategory();
})

onUnmounted(() => {
  cleanTimer();
})

//删除标签
const closeTag = (index) => {
  blogFormData.value.tag.splice(index, 1);
}

//是否显示tag输入框
const showTagInput = ref(false)

const showTagInputHandler = () => {
  showTagInput.value = true;
}
//tag输入框的值
const tagInputValue = ref(null);

const tagInputResult = (e) => {
  if (tagInputValue.value == undefined) {
    return;
  }
  showTagInput.value = false;
  if (blogFormData.value.tag.indexOf(tagInputValue.value) == -1) {
    blogFormData.value.tag.push(tagInputValue.value);
  }
  tagInputValue.value = undefined;
}

const settingsFormRef = ref();
const submitBlog = () => {
  settingsFormRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    const params = {
    }
    Object.assign(params, blogFormData.value);
    params.tag = params.tag.join("|");
    let result = await proxy.Request({
      url: api.saveBlog,
      params
    });
    if (!result) {
      return;
    }
    proxy.message.success("保存博客成功");
    dialogConfig.show = false;
    closeWindow();
  });
}

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
.blog-setting-form {
  .allow-comment {
    display: flex;
    .info {
      margin-left: 10px;
      color: rgb(175, 175, 175);
      font-size: 13px;
    }
  }

  .tag-input-panel {
    display: flex;
    align-items: center;
    .tag-list {
      display: flex;
      .tag-item {
        margin-right: 10px;
      }
    }
    .info {
      color: rgb(175, 175, 175);
      font-size: 13px;
      margin-right: 10px;
    }
    .icon-add {
      color: rgb(6, 170, 234);
      font-size: 20px;
      margin-right: 10px;
      cursor: pointer;
    }
    .tag-input {
      width: 100px;
    }
  }
}

.title-input {
  width: 100%;
  border-bottom: 1px solid #ddd;
  .el-input__wrapper{
    box-shadow: none;
  }
  input{
    font-size: 18px;
  }
}



</style>