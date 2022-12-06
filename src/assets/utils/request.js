/**
 * request.js
 * 通过promise对axios做二次封装，针对用户端参数，做灵活配置
 */
import { ElLoading } from "element-plus";
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import instance from './interceptor'
/**
 * 核心函数，可通过它处理一切请求数据，并做横向扩展
 * @param {url} 请求地址
 * @param {params} 请求参数
 * @param {options} 请求配置，针对当前本次请求；
 * @param loading 是否显示loading
 * @param mock 本次是否请求mock而非线上
 * @param error 本次是否显示错误
 */
function request(url,params,options={loading:true,mock:false,error:true},method){
    NProgress.start()
    let loadingInstance;
    // 请求前loading
    if(options.loading)loadingInstance=ElLoading.service({lock: true,text: '加载中',background: 'rgba(0, 0, 0, 0.1)'});
    return new Promise((resolve,reject)=>{
        let data = {}
        // get请求使用params字段
        if(method =='get')data = {params}
        // post请求使用data字段
        if(method =='post')data = {params:params}
        // 通过mock平台可对局部接口进行mock设置
        if(options.mock)url='http://www.mock.com/mock/xxxx/api';
        instance({
            url,
            method,
            ...data,
        }).then((res)=>{
            // 此处作用很大，可以扩展很多功能。
            // 比如对接多个后台，数据结构不一致，可做接口适配器
            // 也可对返回日期/金额/数字等统一做集中处理
            if(res.status === 200){
                resolve(res.data);
            }else{
                // 通过配置可关闭错误提示
                if(options.error)ElMessage.error(res.statusText);
                reject(res);
            }
            NProgress.done()
        }).catch((error)=>{
            ElMessage.error(error.message)
            NProgress.done()
        }).finally(()=>{
            if(options.loading)loadingInstance.close();
            NProgress.done()
        })
    })
}
// 封装GET请求
function get(url,params,options){
    return request(url,params,options,'get')
}
// 封装POST请求
function post(url,params,options){
    return request(url,params,options,'post')
}
function put(url,params,options){
    params._method = "put"
    return request(url,params,options,'post')
}
function del(url,params,options){
    params._method = "delete"
    return request(url,params,options,'post')
}
async function asyncPost(url,params){
    let loadingInstance=ElLoading.service({lock: true,text: '加载中',background: 'rgba(0, 0, 0, 0.1)'});
    NProgress.start()
    let res = {};
    let method = 'post'
    let data = {params:params}
    await instance({
        url,
        method,
        ...data,
    }).then((s)=>{
        NProgress.done()
        res = s.data
    }).catch((error)=>{
        ElMessage.error(error.message)
        NProgress.done()
        res = null
    }).finally(()=>{
        loadingInstance.close();
        NProgress.done()
    })
    return res;
}
function submit(url,method,params,options){
    method = method.toLowerCase()
    switch (method) {
        case 'get':
            return request(url,params,options,'get')
            //break;
        case 'post':
            return request(url,params,options,'post')
            //break;
        case 'put':
            params._method = "put"
            return request(url,params,options,'post')
            //break;
        case 'del':
            params._method = "delete"
            return request(url,params,options,'post')
            //break;
    }
}
export default {
    get,post,put,del,submit,asyncPost
}