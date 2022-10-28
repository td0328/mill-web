<template>
  <el-container style="height: 100%;background-color: #F5F7FA;">
    <el-header style="height: 53px;background: #FFFFFF;border-radius: 0 0 0 0;opacity: 1;padding-left: 25px;padding-right: 25px;">
      <div class="home-header-logo float-left center-align" >开发工厂</div>
      <div class="float-right center-align">
        <el-dropdown>
          <el-icon><SwitchButton /></el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="user-name float-right center-align">
        <el-dropdown>
            <div class="personal">张三</div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>个人中心</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="float-right center-align">
        <el-dropdown>
          <img alt="" class="head-img personal" src="../assets/img/head-img.jpg">
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>个人中心</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    <el-container>
      <el-aside style="width: 180px;background: #FFFFFF;box-shadow: 8px 0 32px 0 rgba(0,0,0,0.03999999910593033);border-radius: 0 0 0 0;opacity: 1;">
        <el-menu
            default-active="2"
            class="el-menu-vertical-demo"
            style="height: 100%"
        >
          <template v-for="(menu,indexS) in menuList" :key="indexS">
            <el-sub-menu v-if="menu.subMenu.length>1"  :index="indexS+''">
              <template #title>
                <el-icon><el-icon><component :is=menu.icon></component></el-icon></el-icon>
                <span>{{menu.title}}</span>
              </template>
              <el-menu-item v-for="(item,itemIndex) in menu" :key="itemIndex" :index="indexS+'-'+itemIndex">{{ item.title }}</el-menu-item>
            </el-sub-menu>
            <el-menu-item v-else :index="indexS+''" @click="goPage(menu.path)">
              <template #title>
                <el-icon><component :is=menu.icon></component></el-icon>
                <span>{{menu.title}}</span>
              </template>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
//let router = this.$router
export default {
  name: 'HomePage',
  data() {
    return {
      menuList:[
        {
          "icon":"Coin",
          "path": "/homePage/databaseConfig",     //菜单项所对应的路由路径
          "title": "数据库配置",     //菜单项名称
          "subMenu": []        //是否有子菜单，若没有，则为[]
        },
        {
          "icon":"Stopwatch",
          "path": "/homePage/sysState",     //菜单项所对应的路由路径
          "title": "系统状态配置",     //菜单项名称
          "subMenu": []        //是否有子菜单，若没有，则为[]
        }
      ],
    }
  },
  methods:{
    goPage(path){
      this.$routers.push(path)
    }
  },
  created(){
    this.$routers.addRoute('homePage',{
      path: 'databaseConfig',
      component: ()=> import('../components/databaseConfig.vue'),
    })
    this.$routers.addRoute('homePage',{
      path: 'sysState',
      component: ()=> import('../components/sysState.vue'),
    })
  }
}
</script>
<style scoped>
.home-header-logo{
  font-size: 16px;
  height: 100%;
}
.user-name{
  font-size: 12px;
  padding-right: 15px;
  padding-left: 10px;
}
.head-img{
  width: 24px;
  height: 24px;
  border-radius: 50%;

}
.personal{
  cursor: pointer;
}
</style>
