import {createRouter,createWebHistory} from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import request from '@/assets/utils/request.js'

import store from '@/assets/utils/store.js'

const router = createRouter({
    //mode: 'history',
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            name:'login',
            component: ()=> import('../../components/system/login.vue')
        },
        {
            path: '/',
            name:'homePage',
            component: ()=> import('../../components/system/homePage.vue'),
        },
        {
            path: '/:catchAll(.*)',
                hidden: true,
            component: () => import('../../components/error/404.vue')//这个是我自己的路径
        }


]
})
// 导航守卫
// 使用 router.beforeEach 注册一个全局前置守卫，判断用户是否登陆
router.beforeEach(async (to) => {
    NProgress.start()
    if (to.path !== '/login') {
        let token = localStorage.getItem('UserToken');
        // 判断token是否为空如果为空则跳转到登录页 如果有则放行
        if (token === null || token === '') {
            return { name: 'login' }
        }
    }else{
        let token = localStorage.getItem('UserToken');
        // 判断token是否为空如果为空则跳转到登录页 如果有则放行
        if (token !== null && token !== '') {
            return { name: 'homePage' }
        }
    }
    //页面加载路由
    if(!store.state.isLoadMenu&&to.path !== '/login'){
        await request.asyncPost('/getMySysUserAndMySysMenuAndMySysPermissionByUserId',{}).then((res={})=>{
            let menu =  res.data.menu
            localStorage.setItem('userPermission',JSON.stringify(res.data.permission));
            menu.forEach((item) =>{
                item.children.forEach((itemItem) =>{
                    router.addRoute('homePage', {
                        path: itemItem.path,
                        name: itemItem.name,
                        meta:{
                            title: itemItem.title,
                            icon: itemItem.icon,
                            keepAlive: true
                        },
                        component : ()=> import (`../../${itemItem.url}.vue`)
                    })
                })
            })

            store.commit('loadMenu')//标识菜单已加载
            router.replace(to)
        })
    }
    /*
    let menuStr = localStorage.getItem("userMenu")
    //console.log(menuStr)
    if(!store.state.isLoadMenu&&menuStr!=null&&menuStr!=='undefined'){
        let menu = JSON.parse(menuStr)
        //console.log(menu._value)
        menu.forEach((item) =>{
            item.children.forEach((itemItem) =>{
                router.addRoute('homePage', {
                    path: itemItem.path,
                    component : ()=> import (`../../${itemItem.url}.vue`)
                })
            })
        })
        store.commit('loadMenu')//标识菜单已加载
        await router.replace(to)
    }

     */

});
router.afterEach(() => {
    NProgress.done()
})

export default router