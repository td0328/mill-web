<template>
  <div class="main">
    <el-container style="background-color: #FFFFFF;height: 100%;width: 100%;">
      <el-header>
        <el-row style="height: 100%;" align="middle">
          <el-col :span="6" >
            数据字典
          </el-col>
          <el-col :span="18" >
            <div style="float: right;">
              <el-button @click="dialogDataSource=true" class="linkColour" >连接库</el-button>
              <el-button v-if="isShowBtn&&toolUtils.getPermission(name,'add')" type="primary" icon="Plus" @click="addSysDictClass">新增</el-button>
              <el-button v-if="isShowBtn&&toolUtils.getPermission(name,'delete')" type="danger" icon="Delete" @click="deleteSysDictClass">删除</el-button>
            </div>
          </el-col>
        </el-row>
      </el-header>
      <el-main style="padding-top: 0;padding-bottom: 0;">
        <div class="innerMain" ref="innerMain">
          <el-table :data="dataSysDictClass" :height="heightTable" border style="width: 100%" :header-cell-style="toolUtils.headerCellStyle" @selection-change="toolUtils.changeCheckBoxValue($event,checkBoxDataSysDictClass)">
            <el-table-column align="center" prop="id" type="selection" label="id" width="30"></el-table-column>
            <el-table-column align="center" prop="name" label="名称"></el-table-column>
            <el-table-column align="center" label="操作" width="180" >
              <template v-slot="scope">
                <el-button v-if="toolUtils.getPermission(name,'edit')" size="small" @click="showEdit(scope.$index, scope.row)">修改</el-button>
                <el-button
                    v-if="toolUtils.getPermission(name,'delete')"
                    size="small"
                    type="danger"
                    @click="deleteSysDictClassById(scope.$index, scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-main>
    </el-container>
    <!--数据库连接-->
    <el-drawer
        ref="drawerRef"
        v-model="dialogDataSource"
        title="连接数据库"
        :show-close="false"
        direction="ltr"
        size="180"
    >
      <div class="demo-drawer__content">
        <el-form :rules="rulesDataSource" ref="dataFrom" :model="dataSource" label-width="80px">
          <el-form-item label="库类型" prop="dataType">
            <el-select v-model="dataSource.dataType">
              <el-option label="mysql" value="mysql" />
              <el-option label="oracle" value="oracle" />
              <el-option label="sqlserver" value="sqlserver" />
              <el-option label="postgresql" value="postgresql" />
            </el-select>
          </el-form-item>
          <el-form-item label="IP地址" prop="url">
            <el-input v-model="dataSource.url" />
          </el-form-item>
          <el-form-item label="端口号" prop="port">
            <el-input v-model.number="dataSource.port" />
          </el-form-item>
          <el-form-item label="库名称" prop="dataName">
            <el-input v-model="dataSource.dataName" />
          </el-form-item>
          <el-form-item label="用户名" prop="username">
            <el-input v-model="dataSource.username" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input type="password" v-model="dataSource.password" />
          </el-form-item>
          <el-form-item>
            <el-button @click="dialogDataSource = false">取消</el-button>
            <el-button type="primary" @click="getDictClass">连接</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
    <!--数据字典类型-->
    <el-dialog
        v-model="dialogSysDictClass"
        title="数据字典类型"
        width="350px"
        @before-close="dialogSysDictClass=false"
    >
      <el-scrollbar :max-height="heightDialogScrollbar" wrap-style="padding: 10px 20px 0 20px;">
        <el-form :rules="rulesSysDictClass" ref="sysDictClassFrom" :model="sysDictClass" label-width="80px">
          <el-form-item label="名称" prop="name">
            <el-input  v-model="sysDictClass.name" />
          </el-form-item>
        </el-form>
      </el-scrollbar>
      <template #footer>
        <el-button type="primary" @click="saveDictClass">确认</el-button>
        <el-button @click="dialogSysDictClass=false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import {ref,reactive,nextTick, onMounted} from "vue";
import request from '@/assets/utils/request.js'
import toolUtils from '@/assets/utils/toolUtils.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import store from "@/assets/utils/store";

const name = ref("sysDictClass")
let dataSource =ref({dataType:''})
let source  = localStorage.getItem("dataSource")
if(source!==null&&source!=='')dataSource.value = JSON.parse(localStorage.getItem("dataSource"))
const rulesDataSource = reactive({
  dataType: [{required: true,message: '请选择数据库类型',trigger: 'change'}],
  url:[{required: true,trigger: 'blur',message: '请输入正确的IP地址',pattern: /^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))$/}],
  port: [{required: true,message: '请输入正确的端口号',trigger: 'change',type: 'integer'}],
  dataName: [{ required: true, message: '请输入正确的数据库名称',pattern:/^(^[0-9]*$)|(^[A-Za-z]+$)/, trigger: 'change' }],
  username: [{ required: true, message: '请输入正确的用户名',pattern:/^(^[0-9]*$)|(^[A-Za-z]+$)/, trigger: 'change' }],
  password: [{ required: true, message: '请输入密码', trigger: 'change' }]

})
const rulesSysDictClass = reactive({
  name: [{ required: true, message: '请输入', trigger: 'change' }],
  value: [{ required: true,type:'integer', message: '请输入', trigger: 'change' }]
})
let heightTable = ref(0)
let heightDialogScrollbar = ref(0)
const innerMain = ref()
onMounted(()=>{
  nextTick(function () {
    heightTable.value =  innerMain.value.offsetHeight //当前页面总高度
    heightDialogScrollbar.value = document.body.clientHeight * 0.7 ;
    window.onresize = function() {
      heightTable.value =  innerMain.value.offsetHeight //当前页面总高度
      heightDialogScrollbar.value = document.body.clientHeight * 0.7 ;
    }
  })
})
const dataFrom = ref()
let dataSysDictClass = ref([])
let dialogDataSource = ref(false)
let isShowBtn = ref(false)
const getDictClass = () => {
  dataFrom.value.validate((valid) => {
    if(valid) {
      request.post('/getAllSysDictClass',dataSource.value).then((res={})=>{
        dataSysDictClass.value = res.data
        dialogDataSource.value = false
        isShowBtn.value = true
        ElMessage.success(res.msg)
        localStorage.setItem("dataSource",JSON.stringify(dataSource.value))
        store.commit('setDataSource',dataSource.value)
        // 此处只接收成功数据，失败数据不返回
      })
    }
  })
}
const sysDictClassFrom = ref()
let saveUrlSysStateClass = ref('')
let sysDictClass = ref({})
let dialogSysDictClass = ref(false)
const saveDictClass = () => {
  sysDictClassFrom.value.validate((valid) => {
    if(valid) {
      let params = Object.assign(sysDictClass.value, store.state.dataSource);
      request.post(saveUrlSysStateClass.value,params).then((res={})=>{
        dataSysDictClass.value = res.data
        dialogSysDictClass.value = false
        ElMessage.success(res.msg)
        // 此处只接收成功数据，失败数据不返回
      })
    }
  })
}
const addSysDictClass = () => {
  saveUrlSysStateClass.value = '/addSysDictClass'
  sysDictClass.value.id = ''
  sysDictClass.value.name = ''
  dialogSysDictClass.value = true
}
const showEdit = (idx,row) => {
  saveUrlSysStateClass.value = '/editSysDictClass'
  sysDictClass.value.id = row['id']
  sysDictClass.value.name = row['name']
  dialogSysDictClass.value = true
}
let checkBoxDataSysDictClass = ref([])
const deleteSysDictClass = () => {
  if(checkBoxDataSysDictClass.value['value'].length>0){
    let params = {ids:checkBoxDataSysDictClass.value['value']}
    let contentText = '你确认要删除这'+checkBoxDataSysDictClass.value['value'].length+'条信息吗？可能会影响系统运行'
    ElMessageBox.confirm(contentText,'警告',{
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      //type: 'error',
    }).then(() => {
      params = Object.assign(params, store.state.dataSource);
      request.post('/deleteSysDictClassByIds',params).then((res={})=>{
        dataSysDictClass.value = res.data
        ElMessage.success(res.msg)
      })
    }).catch(() =>{})
  }else{
    ElMessage.error('请选择要删除的数据')
  }
}
const deleteSysDictClassById = (idx,row) => {
  let params = {ids:[row['id']]}
  let contentText = '你确认要删除这条信息吗？可能会影响系统运行'
  ElMessageBox.confirm(contentText,'警告',{
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    //type: 'error',
  }).then(() => {
    params = Object.assign(params, store.state.dataSource);
    request.post('/deleteSysDictClassByIds',params).then((res={})=>{
      dataSysDictClass.value = res.data
      ElMessage.success(res.msg)
    })
  }).catch(() =>{})
}
</script>