import { createRouter, createWebHistory } from 'vue-router'
import VueCookies from 'vue-cookies'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/login"
    },
    {
      path: '/login',
      name: '登录',
      component: () => import("@/views/login.vue")
    },
    {
      path: '/home',
      name: '框架页',
      component: () => import("@/views/Framework.vue"),
      redirect: "/blog/list",
      children: [
        {
          name: 'test',
          path: "/blog/test",
          component: () => import('../views/blog/Test.vue')
        },
        {
          name: '博客管理',
          path: "/blog/list",
          component: () => import('../views/blog/BlogList.vue')
        },
        {
          name: '分类管理',
          path: "/blog/category",
          component: () => import('../views/blog/BlogCategory.vue')
        },
        {
          name: '专题管理',
          path: "/special/list",
          component: () => import('../views/special/SpecialList.vue')
        },
        {
          name: '个人信息',
          path: "/settings/my",
          component: () => import('../views/settings/Myinfo.vue')
        },
        {
          name: '博客成员',
          path: "/settings/user",
          component: () => import('../views/settings/TeamUser.vue')
        },
        {
          name: '系统设置',
          path: "/settings/Sysinfo",
          component: () => import('../views/settings/Sysinfo.vue')
        },
        {
          name: '回收站',
          path: "/recovery/list",
          component: () => import('../views/recovery/RecoveryList.vue')
        },




      ],
    },
  ]
})

export default router
