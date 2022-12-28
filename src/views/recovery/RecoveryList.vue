<template>
    <div class="body">
      <div class="top-panel">
        <el-form @submit.native.prevent
                 :model="searchForm"
                 class="search-form"
                 labelAlign="left">
          <el-row :gutter="5">
            <el-col :span="5">
              <el-form-item label="标题">
                <el-input v-model="searchForm.titleFuzzy"
                          placeholder="支持模糊搜索"
                          @keyup.enter.native="loadDataList"
                          allowClear />
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item>
                <el-button type="danger"
                           @click="loadDataList()">搜索</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <Table :columns="columns"
             :fetch="loadDataList"
             :dataSource="tableData"
             :options="tableOptions">
        <template #cover="{ index, row }">
          <cover :cover="row.cover"></cover>
        </template>
  
        <template #blogInfo="{ index, row }">
          <div>标题：{{ row.title }}</div>
          <div>文章类型：{{ row.blogType==0?'博客':'专题' }}
            <el-divider direction="vertical" /> <span>{{row.blogType==0?'分类':'专题'}}</span>：{{ row.categoryName||'--' }}
          </div>
          <div>作者：{{ row.nickName }}</div>
        </template>
        <!-- 操作 -->
        <template #status="{ index, row }">
          <span v-if="row.status == 1"
                :style="{ color: 'green' }">{{
            row.statusName
          }}</span>
          <span v-else
                :style="{ color: 'red' }">{{ row.statusName }}</span>
        </template>
  
        <template #timeInfo="{ index, row }">
          <div>创建时间：{{ row.createTime }}</div>
          <div>更新时间：{{ row.lastUpdateTime }}</div>
        </template>
  
        <template #operation="{ index, row }">
          <template v-if="row.userId == userInfo.userId || userInfo.roleType == 1">
            <a class="a-link"
               href="javascript:void(0)"
               @click="reductionBlog(row)"
               v-if="userInfo.userId==row.userId">还原</a>
            <span v-else>--</span>
            <el-divider direction="vertical" />
            <a class="a-link"
               href="javascript:void(0)"
               @click="delBlog(row)"
               v-if="userInfo.userId==row.userId">删除</a>
            <span v-else>--</span>
          </template>
          <span v-else>--</span>
        </template>
      </Table>
    </div>
  </template>
  <script setup>
  import VueCookies from 'vue-cookies'
  import { ref, reactive, getCurrentInstance } from "vue";
  import { useRouter } from "vue-router";
  const router = useRouter();
  const { proxy } = getCurrentInstance();
  
  const api = {
    loadDataList: "/blog/loadRecoveryList",
    delBlog: "/blog/delBlog",
    reductionBlog: "/blog/reductionBlog",
  };
  
  const userInfo = ref(VueCookies.get("userInfo") || {});
  
  const tableData = reactive({});
  const tableOptions = reactive({
    extHeight: 40,
  });
  
  const columns = [
    {
      label: "封面",
      prop: "cover",
      width: 80,
      scopedSlots: "cover",
    },
    {
      label: "文章信息",
      prop: "title",
      scopedSlots: "blogInfo",
    },
    {
      label: "编辑器",
      prop: "editorTypeName",
      width: 100,
    },
    {
      label: "评论",
      prop: "allowCommentTypeName",
      width: 80,
    },
    {
      label: "时间",
      prop: "createTime",
      scopedSlots: "timeInfo",
      width: 260,
    },
    {
      label: "操作",
      prop: "operation",
      width: 150,
      scopedSlots: "operation",
    },
  ];
  const searchForm = reactive({});
  
  const loadDataList = async () => {
    let params = {
      pageNo: tableData.pageNo,
      pageSize: tableData.pageSize,
    };
    Object.assign(params, searchForm);
  
    let result = await proxy.Request({
      url: api.loadDataList,
      params: params,
    });
    if (!result) {
      return;
    }
    Object.assign(tableData, result.data);
  };
  //删除
  const delBlog = (data) => {
    proxy.Confirm(`确认要删除【${data.title}】吗，删除后无法找回？`, async () => {
      let result = await proxy.Request({
        url: api.delBlog,
        params: {
          blogId: data.blogId,
        },
      });
      if (!result) {
        return;
      }
      proxy.message.success("删除成功");
      loadDataList();
    });
  };
  
  //恢复博客
  const reductionBlog = (data) => {
    proxy.Confirm(
      `确认要恢复【${data.title}】吗？恢复后博客为草稿状态。`,
      async () => {
        let result = await proxy.Request({
          url: api.reductionBlog,
          params: {
            blogId: data.blogId,
          },
        });
        if (!result) {
          return;
        }
        proxy.message.success("恢复成功");
        loadDataList();
      }
    );
  };
  </script>
  