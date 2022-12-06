<template>
  <el-container style="height: 100%;background-color: #F5F7FA;">
    <el-aside>
      <div class="menu" :style="{ width: isCollapse ? '65px' : '180px' }">
        <div class="logo flx-center">
          <img src="@/assets/images/logo.png" alt="logo" />
          <span v-show="!isCollapse">开发者工厂</span>
        </div>
        <el-scrollbar>
          <el-menu
              ref="refTreeMenu"
              :default-active="router.currentRoute.value.name.toString()"
              :collapse="isCollapse"
              background-color="#191a20"
              text-color="#bdbdc0"
              active-text-color="#ffffff"
          >
            <template v-for="(menu,idx) in menuList" :key="idx">
              <el-sub-menu :index="menu.index+''">
                <template #title>
                  <el-icon><el-icon><component :is=menu.icon></component></el-icon></el-icon>
                  <span>{{menu.title}}</span>
                </template>
                <el-menu-item style="min-width: 180px" v-for="(item,itemIdx) in menu.children" :key="itemIdx" :index="item.name" @click="toPage(item)">{{ item.title }}</el-menu-item>
              </el-sub-menu>
            </template>
          </el-menu>
        </el-scrollbar>
      </div>
    </el-aside>
    <el-container>
      <el-header style="height: 53px;background: #FFFFFF;border-radius: 0 0 0 0;opacity: 1;padding-left: 25px;padding-right: 25px;">
        <div class="tool-bar-lf">
          <el-icon class="collapse-icon" @click="this.isCollapse = !this.isCollapse">
            <component :is="isCollapse ? 'expand' : 'fold'"></component>
          </el-icon>
          <el-breadcrumb :separator-icon="ArrowRight">
            <transition-group name="breadcrumb" mode="out-in">
              <template v-if="breadcrumbList">
                <!-- other -->
                <el-breadcrumb-item v-for="item in breadcrumbList" :key="item.path">
                  <div class="breadcrumb-item">
                    <el-icon class="breadcrumb-icon" v-if="item.icon">
                      <component :is="item.icon"></component>
                    </el-icon>
                    <span class="breadcrumb-title">{{ item.title }}</span>
                  </div>
                </el-breadcrumb-item>
              </template>
            </transition-group>
          </el-breadcrumb>
        </div>
        <div class="tool-bar-ri">
          <div class="header-icon">
            <!-- 消息
            <div class="message">
              <el-popover placement="bottom" :width="310" trigger="click">
                <template #reference>
                  <el-badge :value="5" class="item">
                    <i :class="'iconfont iconfont icon-news'" class="toolBar-icon"></i>
                  </el-badge>
                </template>
                <el-tabs v-model="activeName">
                  <el-tab-pane label="通知(5)" name="first">
                    <div class="message-list">
                      <div class="message-item">
                        <img src="@/assets/images/msg01.png" alt="" class="message-icon" />
                        <div class="message-content">
                          <span class="message-title">一键三连 Geeker-Admin 🧡</span>
                          <span class="message-date">一分钟前</span>
                        </div>
                      </div>
                      <div class="message-item">
                        <img src="@/assets/images/msg02.png" alt="" class="message-icon" />
                        <div class="message-content">
                          <span class="message-title">一键三连 Geeker-Admin 💙</span>
                          <span class="message-date">一小时前</span>
                        </div>
                      </div>
                      <div class="message-item">
                        <img src="@/assets/images/msg03.png" alt="" class="message-icon" />
                        <div class="message-content">
                          <span class="message-title">一键三连 Geeker-Admin 💚</span>
                          <span class="message-date">半天前</span>
                        </div>
                      </div>
                      <div class="message-item">
                        <img src="@/assets/images/msg04.png" alt="" class="message-icon" />
                        <div class="message-content">
                          <span class="message-title">一键三连 Geeker-Admin 💜</span>
                          <span class="message-date">一星期前</span>
                        </div>
                      </div>
                      <div class="message-item">
                        <img src="@/assets/images/msg05.png" alt="" class="message-icon" />
                        <div class="message-content">
                          <span class="message-title">一键三连 Geeker-Admin 💛</span>
                          <span class="message-date">一个月前</span>
                        </div>
                      </div>
                    </div>
                  </el-tab-pane>
                  <el-tab-pane label="消息(0)" name="second">
                    <div class="message-empty">
                      <img src="@/assets/images/notData.png" alt="notData" />
                      <div>暂无消息</div>
                    </div>
                  </el-tab-pane>
                  <el-tab-pane label="代办(0)" name="third">
                    <div class="message-empty">
                      <img src="@/assets/images/notData.png" alt="notData" />
                      <div>暂无代办</div>
                    </div>
                  </el-tab-pane>
                </el-tabs>
              </el-popover>
            </div>
            -->
            <div class="fullscreen">
              <i :class="['iconfont', isFullscreen ? 'icon-narrow' : 'icon-enlarge']" class="toolBar-icon" @click="toggle"></i>
            </div>
          </div>
          <span class="username">{{sysUser.userName}}</span>
          <el-dropdown trigger="click">
            <div class="avatar">
              <img src="@/assets/images/avatar.gif" alt="avatar" />
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="dialogPassword = true">
                  <el-icon><Edit /></el-icon>修改密码
                </el-dropdown-item>
                <el-dropdown-item @click="logout" divided>
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <!--修改密码-->
          <el-dialog
              v-model="dialogPassword"
              title="修改密码"
              width="350px"
              @before-close="dialogPassword=false"
          >
            <el-scrollbar :max-height="400" wrap-style="padding: 10px 20px 0 20px;">
              <el-form :rules="rulesPassword" ref="fromPassword" :model="password" label-width="80px">
                <el-form-item label="旧密码" prop="oidPassword">
                  <el-input type="password" v-model="password.oidPassword" />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                  <el-input type="password" v-model="password.newPassword" />
                </el-form-item>
                <el-form-item label="新密码" prop="twoPassword">
                  <el-input type="password" v-model="password.twoPassword" />
                </el-form-item>
              </el-form>
            </el-scrollbar>
            <template #footer>
              <el-button type="primary" @click="editPassword(fromPassword)">确认</el-button>
              <el-button @click="dialogPassword=false">取消</el-button>
            </template>
          </el-dialog>
          <!-- infoDialog -->
          <!--<InfoDialog ref="infoRef"></InfoDialog>-->
          <!-- passwordDialog -->
          <!--<PasswordDialog ref="passwordRef"></PasswordDialog>-->
        </div>
      </el-header>
      <div class="tabs-box">
        <div class="tabs-menu">
          <el-tabs v-model="tabsMenuValue" type="card" @tab-click="tabClick" @tab-remove="tabRemove">
            <el-tab-pane v-for="item in tabsMenuList" :key="item.path" :label="item.title" :name="item.path" :closable="true">
              <template #label>
                {{ item.title }}
              </template>
            </el-tab-pane>
          </el-tabs>
          <el-dropdown trigger="click">
            <el-button size="small" type="primary">
              <span>更多</span>
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="refreshCurrentPage">
                  <el-icon><Refresh /></el-icon>刷新
                </el-dropdown-item>
                <!--
                <el-dropdown-item @click="maximize">
                  <el-icon><FullScreen /></el-icon>最大化
                </el-dropdown-item>
                -->
                <el-dropdown-item divided @click="closeCurrentTab">
                  <el-icon><Remove /></el-icon>关闭当前
                </el-dropdown-item>
                <el-dropdown-item @click="closeOtherTab">
                  <el-icon><CircleClose /></el-icon>关闭其他
                </el-dropdown-item>
                <el-dropdown-item @click="closeAllTab">
                  <el-icon><FolderDelete /></el-icon>关闭所有
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <el-main style="--el-main-padding: 12px;">
        <router-view v-slot="{ Component, route }">
          <transition appear name="fade-transform" mode="out-in">
            <keep-alive  v-if="isRouterRefresh">
              <component :is="Component" :key="route.path"/>
            </keep-alive>
          </transition>
        </router-view>
      </el-main>
      <el-footer>
        <div class="footer flx-center">
           2022 © 开发者工厂
        </div>
      </el-footer>
    </el-container>
  </el-container>
</template>

<script setup>
import {ref,watch, reactive,nextTick,onMounted} from "vue";
import request from '@/assets/utils/request.js'
import { useFullscreen } from "@vueuse/core";
import router from '@/assets/utils/routes.js'
import { ElMessage } from 'element-plus'
import { ArrowRight } from "@element-plus/icons-vue";

const { toggle, isFullscreen } = useFullscreen();
//const activeName = ref("first");
const isCollapse  = ref(false);
let menuList = ref([]);
let sysUser = ref({});
const refTreeMenu = ref()
onMounted(()=>{
  request.post('/getMySysUserAndMySysMenuAndMySysPermissionByUserId',{}).then((res={})=>{
    menuList.value = res.data.menu
    sysUser.value = res.data['sysUser']
    localStorage.setItem('userPermission',JSON.stringify(res.data.permission));
    setBreadcrumb()
  })
  //refTreeMenu.value.open(router.currentRoute.value.fullPath)
})

//修改密码
const dialogPassword = ref(false);
const password = reactive({
  oidPassword:'',
  newPassword:'',
  twoPassword:'',
})
const rulesPassword = reactive({
  oidPassword: [
      { required: true, message: '请输入旧密码', trigger: 'blur'}
  ],
  newPassword:[
      {required: true, message: '请输入新密码', trigger: 'blur'},
      { message: '密码必须由6-16位字母、数字组成',pattern:/^(?=.*\d)(?=.*[A-z])[\da-zA-Z]{6,16}$/, trigger: 'blur'}
  ],
  twoPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur'},
    {
      message: '两次密码不一致',
      trigger: 'blur',
      validator(rule, value) {
        return password.newPassword === value;
      },
    },
  ]
})
const fromPassword = ref()
const editPassword = (formEl)=>{
  if (!formEl) return
  formEl.validate((valid) => {
    if(valid) {
      request.post('/editPassword',password).then((res={})=>{
        if(res.success){
          logout("修改成功，请重新登录")
          //localStorage.setItem('UserToken',res.data.token);
          //router.push("/")
        }else{
          ElMessage.error(res.msg)
        }
      })
    }
  })
}
//注销登录
const logout = (msg) =>{
  request.get('/logout',{}).then((res={})=>{
    localStorage.removeItem("UserToken")
    localStorage.removeItem("userPermission")
    router.push("/login")
    if(msg==null)msg=res.msg
    ElMessage.success(msg)
  })
}

const toPage = (item) => {
  addTabs(item)
}
//------------------------------------------------
const tabsMenuValue = ref(router.currentRoute.value.fullPath);
const tabsMenuList = ref([])

// 刷新当前页面
const isRouterRefresh = ref(true);
const refreshCurrentPage = () => {
  ElMessage({ type: "success", message: "刷新当前页面" });
  isRouterRefresh.value = false;
  nextTick(function () {
    isRouterRefresh.value = true;
  });
};
const tabClick = (tabsPaneContext) => {
  router.push(tabsPaneContext.props.name);
};
let breadcrumbList = ref([{icon:'',title:''}])
const setBreadcrumb = () => {
  let path = router.currentRoute.value.fullPath;
  menuList.value.forEach((item) =>{
    item.children.forEach((childrenItem) =>{
      if(childrenItem.path===path){
        breadcrumbList.value[0] = {
          icon:item.icon,
          title:item.title
        }
        breadcrumbList.value[1] = {
          icon:childrenItem.icon,
          title:childrenItem.title
        }
      }
    })
  })
}
const addTabs = (tabItem) => {
  if(tabItem.path==='/')return
  if (tabsMenuList.value.every(item => item.path !== tabItem.path)) {
    tabsMenuList.value.push(tabItem);
  }
  setBreadcrumb()
  router.push(tabItem.path)
  tabsMenuValue.value = tabItem.path
}
const tabRemove = (tabPath) => {
  tabsMenuList.value = tabsMenuList.value.filter(item => item.path !== tabPath);
  if(tabsMenuList.value.length>0){
    let tabItem = tabsMenuList.value[tabsMenuList.value.length-1]
    addTabs(tabItem)
  }else{
    breadcrumbList.value = []
    router.push('/');
  }
};
// Close Current
const closeCurrentTab = () => {
  tabRemove(router.currentRoute.value.fullPath);
};

// Close Other
const closeOtherTab = () => {
  tabsMenuList.value.forEach((item) => {
    let path = router.currentRoute.value.fullPath
    if(item.path!==path){
      tabRemove(item.path);
    }
  })
};

// Close All
const closeAllTab = () => {
  tabsMenuList.value.forEach((item) => {
    tabRemove(item.path);
  })
};
// 监听路由的变化（防止浏览器后退/前进不变化 tabsMenuValue）
watch(
    () => router.currentRoute.value.fullPath,
    () => {
      tabsMenuValue.value = router.currentRoute.value.fullPath;
      //console.log(router.meta)
      const tabsParams = {
        //icon: router.meta.icon,
        title: router.currentRoute.value.meta.title,
        path: router.currentRoute.value.fullPath,
      };
      addTabs(tabsParams);
    },
    {
      immediate: true
    }
);
</script>
<style scoped lang="scss">
@import "../../assets/css/homePage.scss";
</style>