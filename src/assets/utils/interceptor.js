/**
 * 生成基础axios对象，并对请求和响应做处理
 * 前后端约定接口返回解构规范
 * {
 *    code:0,
 *    data:"成功",
 *    message:""
 * }
 */
import axios from 'axios'
import qs from 'qs'
import { ElMessage } from 'element-plus'
import router from '@/assets/utils/routes.js'

// 创建一个独立的axios实例
const service = axios.create({
    // 设置baseUr地址,如果通过proxy跨域可直接填写base地址
    baseURL: 'http://127.0.0.1:8081',
    // 定义统一的请求头部
    headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
    },
    // 配置请求超时时间
    timeout: 60000,
    // 如果用的JSONP，可以配置此参数带上cookie凭证，如果是代理和CORS不用设置
    withCredentials: true,
    paramsSerializer: params => {
        //console.log(params)
        return qs.stringify(params, {arrayFormat: 'repeat'})
        //return qs.stringify(params)
    }
});
service.defaults.withCredentials = true;
// 添加请求拦截器，在请求头中加token
service.interceptors.request.use(
    config => {
        //判断token是否存在
        if (localStorage.getItem('UserToken')) {
            // 在请求头中添加token
            config.headers.UserToken = localStorage.getItem('UserToken');
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    });

// 返回拦截
service.interceptors.response.use(response => {
    //console.log('拦截器')
    // 获取接口返回结果
    //登录状态失效后删除token
    const res = response.data;
    if(res.code>=2000&&res.code<3000){
        ElMessage.warning(res.msg);
        localStorage.removeItem("UserToken")
        router.push('/login').then()
    }
    return response
    //console.log(res)
},error => {
    return Promise.reject(error)
});
export default service;