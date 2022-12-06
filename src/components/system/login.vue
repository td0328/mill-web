<template>
  <div class="login-page">
    <el-card class="box-card">
      <div class="clearfix">
        <span class="login-title">后台管理系统</span>
      </div>
      <div class="login-form">
        <el-form :model="sysUser" :rules="rules" ref="refDataFrom">
          <el-form-item prop="username">
            <el-input type="text" v-model="sysUser.username" auto-complete="off" placeholder="请输入用户名">
              <template #prepend><el-icon ><User /></el-icon></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input type="password" v-model="sysUser.password" auto-complete="off" placeholder="请输入密码">
              <template #prepend><el-icon><Key /></el-icon></template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button style="width:100%;" type="primary" @click="login(refDataFrom)" :loading="loading">登录</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script  setup>
import {ref,reactive} from "vue";
import request from '@/assets/utils/request.js'
import router from '@/assets/utils/routes.js'

//登录
let loading  = ref(false);
const rules = reactive({
  username: [{ required: true, message: '请输入账户', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur'}]
})
const sysUser = reactive({
  username: '',
  password: '',
})
const refDataFrom = ref()
const login = (formEl) => {
  if (!formEl) return
  formEl.validate((valid) => {
    loading.value = true
    if(valid) {
      loading.value = true
      request.post('/login',sysUser,{loading:false}).then((res={})=>{
        if(res.success){
          localStorage.setItem('UserToken',res.data.token);
          router.push("/")
        }else{
          //_this.$message.error(res.msg)
        }
        loading.value = false
      })
    }
  })
}
</script>

<style scoped>
.login-page{
  background-image: linear-gradient(180deg, #9ECCFB 0%, #84C0FD 100%);
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
.clearfix{
  width: 100%;
  text-align: center;
  padding-bottom: 18px;
}
.login-title{
  font-size: 20px;
}

.box-card {
  width: 275px;
}

</style>

