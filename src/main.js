// main.ts
import { createApp } from 'vue'
import { reactive } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/lib/locale/lang/zh-cn'//element-plus
import 'element-plus/dist/index.css'
import '@/assets/css/global.css'
import "@/assets/iconfont/iconfont.scss";
import App from './App.vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from '@/assets/utils/routes.js'
import axios from 'axios'
import VueAxios from 'vue-axios'
import {showLoading,hideLoading} from '@/assets/utils/loading.js'
import request from '@/assets/utils/request.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import VueCookies from 'vue-cookies'
import store from '@/assets/utils/store.js'
import toolUtils from '@/assets/utils/toolUtils.js'


const app = createApp(App)



for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.config.globalProperties.$showLoading = showLoading;
app.config.globalProperties.$hideLoading = hideLoading;
app.config.globalProperties.$reactive = reactive;

app.config.globalProperties.request = request;
app.config.globalProperties.$ElMessage = ElMessage;
app.config.globalProperties.$ElMessageBox = ElMessageBox;
app.config.globalProperties.$toolUtils = toolUtils;
app.use(router)
app.use(store)
app.use(VueCookies, { expires: '7d'})
//console.log(this.$router)
app.use(ElementPlus, {locale:zhCn}).use(VueAxios, axios)
app.mount('#app')