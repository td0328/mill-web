import {createRouter,createWebHashHistory} from 'vue-router'
export default createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            name:'login',
            component: ()=> import('../../components/login.vue')
        },
        {
            path: '/homePage',
            name:'homePage',
            component: ()=> import('../../components/homePage.vue'),
        },
    ]
})
