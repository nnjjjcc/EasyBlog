<template>
    <Window :show="windowConfig.show"
            :buttons="windowConfig.buttons"
            :showCancel="false"
            @close="windowConfig.show = false">
      <div class="my-title"> {{blog.title}}</div>
      <div v-html="blog.content"
           class="blog-detail"></div>
    </Window>

</template>  
<script setup>
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-light.css"; //样式

import { getCurrentInstance, ref, reactive, nextTick } from "vue"
const { proxy } = getCurrentInstance();

const api = {
  getBlogDetail: "/blog/getBlogById",
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

const blog = ref({});
const showDetail = async (blogId) => {
  windowConfig.show = true;
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
    overflow: hidden;
  }
}
</style>