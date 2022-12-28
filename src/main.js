import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from '@/router'
import store from '@/store'
import ElementPlus from 'element-plus'
import './assets/main.css'
import 'element-plus/dist/index.css'
import './assets/global.css'
import "@/assets/icon/iconfont.css"
import Request from './utils/Request'
import message from './utils/Message'
import Confirm from './utils/Confirm'
import axios from 'axios'
import Table from './components/com/Table.vue'
import Cover from './components/com/Cover.vue'
import Dialog from './components/com/Dialog.vue'
import Window from './components/com/Window.vue'
import EditorMarkdown from './components/com/EditorMarkdown.vue'
import EditorHtml from './components/com/EditorHtml.vue'
import CoverUpload from './components/com/CoverUpload.vue'
import Verify from './utils/Verify.js'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(store)
app.use(ElementPlus)
app.config.globalProperties.Request = Request
app.config.globalProperties.message = message
app.config.globalProperties.Verify = Verify
app.config.globalProperties.Confirm = Confirm
app.config.globalProperties.globalInfo = {
    imageUrl: "/api/file/getImage/"
}
app.mount('#app')
app.component("Table", Table)
app.component("Cover", Cover)
app.component("Dialog", Dialog)
app.component("Window", Window)
app.component("EditorMarkdown", EditorMarkdown)
app.component("EditorHtml", EditorHtml)
app.component("CoverUpload", CoverUpload)
axios.defaults.baseURL = '/api'