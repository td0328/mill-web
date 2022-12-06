<template>
  <div class="main" ref="refMain">
    <el-row :gutter="10" style="height: 100%">
      <el-col :span="10">
        <el-table  :height="heightTable" 	:data="dataStateClass"
                   @row-click = "rowClickStateClass"
                   highlight-current-row
                   @selection-change="toolUtils.changeCheckBoxValue($event,checkBoxDataStateClass)"
                   :header-cell-style="headerStyleStateClass">
          <el-table-column prop="id" type="selection" width="30"></el-table-column>
          <el-table-column prop="name" :show-overflow-tooltip=true  label="名称">
            <template #header>
              <el-button @click="this.dialogDataSource=true">连接库</el-button>
              <el-button v-if="btnNewSysStateClass&&toolUtils.getPermission(name,'add')" @click="addStateClass" >新增</el-button>
              <el-button v-if="btnDeleteSysStateClass&&toolUtils.getPermission(name,'delete')" @click="deleteStateClass">删除</el-button>
            </template>
          </el-table-column>
          <el-table-column :show-overflow-tooltip=true prop="content" label="操作"></el-table-column>
          <el-table-column align="right">
            <template v-slot="scope">
              <el-button v-if="toolUtils.getPermission(name,'edit')" size="small" type="primary" @click.stop="editStateClass(scope.$index, scope.row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col :span="14">
        <el-table  :height="heightTable" 	:data="dataState"
                   highlight-current-row
                   @selection-change="toolUtils.changeCheckBoxValue($event,checkBoxDataState)"
        >
          <el-table-column prop="id" type="selection" width="30"></el-table-column>
          <el-table-column prop="value" :show-overflow-tooltip=true  label="值"></el-table-column>
          <el-table-column prop="name" :show-overflow-tooltip=true  label="名称"></el-table-column>

          <el-table-column align="right">
            <template v-if="this.state.classId!=null&&this.state.classId!==''" #header>
              <el-button v-if="toolUtils.getPermission(name,'add')" @click="addState" >新增</el-button>
              <el-button v-if="toolUtils.getPermission(name,'delete')" @click="deleteState" >删除</el-button>
            </template>
            <template v-slot="scope">
              <el-button v-if="toolUtils.getPermission(name,'edit')" size="small" type="primary" @click.stop="editState(scope.$index, scope.row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
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
          <el-form-item label="库类型">
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
            <el-button @click="this.dialogDataSource = false">取消</el-button>
            <el-button type="primary" @click="getStateClass">连接</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
    <!--系统状态类型-->
    <el-dialog
        v-model="dialogStateClass"
        title="系统状态类型"
        width="350px"
        @before-close="this.dialogStateClass=false"
    >
      <el-scrollbar :max-height="heightDialogScrollbar" wrap-style="padding: 10px 20px 0 20px;">
        <el-form :rules="rules" ref="stateClassFrom" :model="stateClass" label-width="80px">
          <el-form-item label="名称" prop="name">
            <el-input  v-model="stateClass.name" />
          </el-form-item>
        </el-form>
      </el-scrollbar>
      <template #footer>
        <el-button type="primary" @click="saveStateClass">确认</el-button>
        <el-button @click="this.dialogStateClass=false">取消</el-button>
      </template>
    </el-dialog>
    <el-dialog
        v-model="dialogState"
        title="系统状态"
        width="350px"
        @before-close="this.dialogState=false"
    >
      <el-scrollbar :max-height="heightDialogScrollbar" wrap-style="padding: 10px 20px 0 20px;">
        <el-form :rules="rules" ref="stateFrom" :model="state" label-width="80px">
          <el-form-item label="值" prop="value">
            <el-input :disabled="isStateValue" v-model.number="state.value" />
          </el-form-item>
          <el-form-item label="名称" prop="name">
            <el-input  v-model="state.name" />
          </el-form-item>
        </el-form>
      </el-scrollbar>
      <template #footer>
        <el-button type="primary" @click="saveState">确认</el-button>
        <el-button @click="this.dialogState=false">取消</el-button>
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

const name = ref("sysStateClass")
let dialogDataSource = ref(false)
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
const rules = reactive({
  name: [{ required: true, message: '请输入', trigger: 'change' }],
  value: [{ required: true,type:'integer', message: '请输入', trigger: 'change' }],
})
let heightTable = ref(0)
let heightDialogScrollbar = ref(0)
const refMain = ref()
onMounted(()=>{
  //设置高度
  nextTick(function () {
    heightTable.value =  refMain.value.offsetHeight //当前页面总高度
    heightDialogScrollbar.value = document.body.clientHeight * 0.7;
    window.onresize = function() {
      heightTable.value =  refMain.value.offsetHeight //当前页面总高度
      heightDialogScrollbar.value = document.body.clientHeight * 0.7 ;
    }
  })
})
let dataState = ref([])
let state = ref({classId:''})
const rowClickStateClass = (row) => {
  let params = Object.assign({classId:row['id']}, store.state.dataSource);
  request.post('/getSysStateByClassId', params).then((res={})=>{
    dataState.value = res.data
    state.value.classId = row['id']
    //_this.$message.success(res.msg)
    // 此处只接收成功数据，失败数据不返回
  })
}
const headerStyleStateClass = ({row}) => {
  row[0].colSpan = 1 //第三列的表头占据3个单元格
  row[1].colSpan = 3
  row[2].colSpan = 0
  row[3].colSpan = 0
}
let saveUrlSysStateClass = ref('')
let stateClass = ref({})
let dialogStateClass = ref(false)
const addStateClass = () => {
  saveUrlSysStateClass.value = '/addSysStateClass'
  stateClass.value.id = ''
  stateClass.value.name = ''
  dialogStateClass.value = true
}
let checkBoxDataStateClass = ref([])
let dataStateClass = ref([])
const deleteStateClass = () =>{
  if(checkBoxDataStateClass.value['value'].length>0){
    let params = {ids:checkBoxDataStateClass.value['value']}
    let contentText = '你确认要删除这'+checkBoxDataStateClass.value['value'].length+'条信息以及子项吗？'
    ElMessageBox.confirm(contentText,'警告',{
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      //type: 'error',
    }).then(() => {
      params = Object.assign(params, store.state.dataSource);
      request.post('/deleteStateClassByIds',params).then((res={})=>{
        dataStateClass.value = res.data
        ElMessage.success(res.msg)
      })
    }).catch(() =>{})
  }else{
    ElMessage.error('请选择要删除的状态')
  }
}
const editStateClass = (idx,row) => {
  saveUrlSysStateClass.value = '/editSysStateClass'
  stateClass.value.id = row['id']
  stateClass.value.name = row['name']
  dialogStateClass.value = true
}
const dataFrom = ref()
let btnNewSysStateClass = ref(false)
let btnDeleteSysStateClass = ref(false)
const getStateClass = () => {
  dataFrom.value.validate((valid) => {
    if(valid) {
      request.post('/getAllSysStateClass',dataSource.value).then((res={})=>{
        dataStateClass.value = res.data
        dialogDataSource.value = false
        btnNewSysStateClass.value = true
        btnDeleteSysStateClass.value = true
        state.value.classId = ''
        dataState.value = []
        ElMessage.success(res.msg)
        localStorage.setItem("dataSource",JSON.stringify(dataSource.value))
        store.commit('setDataSource',dataSource.value)
        // 此处只接收成功数据，失败数据不返回
      })
    }
  })
}
const stateClassFrom = ref()
const saveStateClass = () => {
  stateClassFrom.value.validate((valid) => {
    if(valid) {
      let params = Object.assign(stateClass.value, store.state.dataSource);
      request.post(saveUrlSysStateClass.value,params).then((res={})=>{
        dataStateClass.value = res.data
        dialogStateClass.value = false
        ElMessage.success(res.msg)
        // 此处只接收成功数据，失败数据不返回
      })
    }
  })
}
const stateFrom = ref()
const saveUrlSysState = ref('')
let dialogState = ref(false)
const saveState = () => {
  stateFrom.value.validate((valid) => {
    if(valid) {
      let params = Object.assign(state.value, store.state.dataSource);
      request.post(saveUrlSysState.value,params).then((res={})=>{
        if(res.success){
          dataState.value = res.data
          dialogState.value = false
          ElMessage.success(res.msg)
        }else{
          ElMessage.error(res.msg)
        }
        // 此处只接收成功数据，失败数据不返回
      })
    }
  })
}
let isStateValue = ref(false)
const addState = () => {
  saveUrlSysState.value = '/addSysState'
  state.value.id = ''
  state.value.value = ''
  state.value.name = ''
  isStateValue.value = false
  dialogState.value = true
}
const editState = (idx,row) => {
  saveUrlSysState.value = '/editSysState'
  state.value.id = row['id']
  state.value.value = row['value']
  state.value.name = row['name']
  isStateValue.value = true
  dialogState.value = true
}
let checkBoxDataState = ref([])
const deleteState = () => {
  if(checkBoxDataState.value['value'].length>0){
    let params = {ids:checkBoxDataState.value['value'],classId:state.value.classId}
    let contentText = '你确认要删除这'+checkBoxDataState.value['value'].length+'条信息吗？可能会影响系统运行'
    ElMessageBox.confirm(contentText,'警告',{
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      //type: 'error',
    }).then(() => {
      params = Object.assign(params, store.state.dataSource);
      request.post('/deleteSysStateByIds',params).then((res={})=>{
        dataState.value = res.data
        ElMessage.success(res.msg)
      })
    }).catch(() =>{})
  }else{
    ElMessage.error('请选择要删除的状态')
  }
}
</script>

<style scoped>

</style>