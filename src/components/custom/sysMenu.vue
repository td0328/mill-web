<template>
  <div class="main" ref="refMain">
    <el-container style="background-color: #FFFFFF;height: 100%;width: 100%;">
      <el-header>
        <el-row style="height: 100%;" align="middle">
          <el-col :span="6" >
            菜单配置
          </el-col>
          <el-col :span="18" >
            <div style="float: right;">
              <el-button @click="this.dialogDataSource=true" class="linkColour" >连接库</el-button>
              <el-button v-if="isShowBtn&&toolUtils.getPermission(name,'add')" type="primary" icon="Plus" @click="addSysMenu">新增</el-button>
              <el-button v-if="isShowBtn&&toolUtils.getPermission(name,'delete')" type="danger" icon="Delete" @click="deleteSysMenu">删除</el-button>
            </div>
          </el-col>
        </el-row>
      </el-header>
      <el-main style="padding-top: 0;padding-bottom: 0;" >
        <div class="innerMain" ref="innerMain">
          <el-table
              :data="dataSysMenu"
              :height="heightTable"
              highlight-current-row
              border
              style="width: 100%"
              row-key="title"
              default-expand-all
              :header-cell-style="toolUtils.headerCellStyle"
              @row-click = "rowClickSysMenu"
              @selection-change="toolUtils.changeCheckBoxValue($event,checkBoxDataSysMenu)">
            <el-table-column align="center" prop="id" type="selection" label="id" width="40"></el-table-column>
            <el-table-column align="center" prop="title" label="标题" :show-overflow-tooltip=true></el-table-column>
            <el-table-column align="center" prop="icon" label="图标"></el-table-column>
            <el-table-column align="center" prop="type" :formatter="formatterType" label="菜单类型"></el-table-column>
            <el-table-column align="center" prop="tableName" label="对应表"></el-table-column>
            <el-table-column align="center" prop="pageName" label="页面名称"></el-table-column>
            <el-table-column align="center" prop="sort" label="排序"></el-table-column>
            <el-table-column align="center" label="操作" width="150" >
              <template v-slot="scope">
                <el-button v-if="toolUtils.getPermission(name,'edit')" size="small" @click="showEdit(scope.$index, scope.row)">编辑</el-button>
                <el-button
                    v-if="toolUtils.getPermission(name,'delete')"
                    size="small"
                    type="danger"
                    @click="deleteSysMenuById(scope.$index, scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-row>
            <el-col :span="12">
              <el-table
                  :data="dataSysPermission"
                  :height="heightSublist"
                  highlight-current-row
                  border
                  style="width: 100%"
                  row-key="title"
                  default-expand-all
                  @row-click = "rowClickSysPermission"
                  :header-cell-style="headerCellStyleSubTable">
                <el-table-column align="center" :show-overflow-tooltip=true prop="permissionCode" label="code"></el-table-column>
                <el-table-column align="center" :show-overflow-tooltip=true prop="permissionName" label="名称"></el-table-column>
                <el-table-column align="center" label="操作">
                  <template #header>
                    <el-button type="primary" v-if="newBtnSysPermission&&toolUtils.getPermission(name,'add')" size="small" @click="addSysPermission" class="linkColour" >新增</el-button>
                  </template>
                  <template v-slot="scope">
                    <el-button v-if="toolUtils.getPermission(name,'edit')" :disabled="isDisabled(scope.$index, scope.row)" size="small" @click.stop="editSysPermission(scope.$index, scope.row)">编辑</el-button>
                    <el-button
                        v-if="toolUtils.getPermission(name,'delete')"
                        :disabled="isDisabled(scope.$index, scope.row)"
                        size="small"
                        type="danger"
                        @click.stop="deleteSysPermissionById(scope.$index, scope.row)"
                    >删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-col>
            <el-col :span="12"><div class="grid-content ep-bg-purple-dark" />
              <el-table
                  :data="dataSysRequestPath"
                  :height="heightSublist"
                  highlight-current-row border
                  style="width: 100%"
                  row-key="title"
                  default-expand-all
                  :header-cell-style="headerCellStyleSubTable">
                <el-table-column align="center" :show-overflow-tooltip=true prop="url" label="请求路径"></el-table-column>
                <el-table-column align="center" :show-overflow-tooltip=true prop="description" label="名称"></el-table-column>
                <el-table-column align="center" label="操作">
                  <template #header>
                    <el-button type="primary" v-if="newBtnSysRequestPath&&toolUtils.getPermission(name,'add')" size="small" @click="addSysRequestPath">新增</el-button>
                  </template>
                  <template v-slot="scope">
                    <el-button v-if="toolUtils.getPermission(name,'edit')" size="small" @click="editSysRequestPath(scope.$index, scope.row)">编辑</el-button>
                    <el-button
                        v-if="toolUtils.getPermission(name,'delete')"
                        size="small"
                        type="danger"
                        @click="deleteSysRequestPath(scope.$index, scope.row)"
                    >删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-col>
          </el-row>
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
        <el-form :rules="rules" ref="dataFrom" :model="dataSource" label-width="80px">
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
            <el-button @click="dialogDataSource = false">取消</el-button>
            <el-button type="primary" @click="getSysMenu">连接</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
    <!--菜单配置-->
    <el-dialog
        v-model="dialogSysMenu"
        title="菜单配置"
        width="350px"
        @before-close="this.dialogSysMenu=false"
    >
      <el-scrollbar :max-height="heightDialogScrollbar" wrap-style="padding: 10px 20px 0 20px;">
        <el-form :rules="rules" ref="sysMenuFrom" :model="sysMenu" label-width="80px">
          <el-form-item label="父菜单">
            <el-select v-model="sysMenu.pid" :disabled="disabled" placeholder="请选择" style="width: 100%;">
              <el-option  label="一级菜单" value=""/>
              <el-option v-for="(item,idx) in dataSysMenu" :label="item.title" :value="item.id" :key="idx"/>
            </el-select>
          </el-form-item>
          <el-form-item v-if="sysMenu.pid===''" label="图标">
            <el-input  v-model="sysMenu.icon" />
          </el-form-item>
          <el-form-item label="标题" prop="title">
            <el-input  v-model="sysMenu.title" />
          </el-form-item>
          <el-form-item v-if="sysMenu.pid!==''" label="菜单类型" prop="type">
            <el-select v-model="sysMenu.type" :disabled="disabled" placeholder="请选择" style="width: 100%;">
              <el-option  label="表结构页面" value="0" />
              <el-option  label="定制页面" value="1" />
              <el-option  label="系统页面" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item  prop="tableName" label="表名称" v-if="sysMenu.type==='0'&& sysMenu.pid!==''">
            <el-input v-model="sysMenu.tableName" />
          </el-form-item>
          <el-form-item prop="pageName" label="页面名称" v-if="sysMenu.type==='1'&& sysMenu.pid!==''">
            <el-input v-model="sysMenu.pageName" />
          </el-form-item>
          <el-form-item prop="sort" label="排序">
            <el-input v-model.number="sysMenu.sort" />
          </el-form-item>
        </el-form>
      </el-scrollbar>
      <template #footer>
        <el-button type="primary" @click="saveSysMenu">确认</el-button>
        <el-button @click="this.dialogSysMenu=false">取消</el-button>
      </template>
    </el-dialog>
    <!--权限配置-->
    <el-dialog
        v-model="dialogSysPermission"
        title="权限配置"
        width="350px"
        @before-close="this.dialogSysPermission=false"
        style="padding: 0"
    >
      <el-scrollbar :max-height="heightDialogScrollbar" wrap-style="padding: 10px 20px 0 20px;">
        <el-form :rules="rules" ref="fromSysPermission" :model="sysPermission" label-width="80px">
          <el-form-item label="code" prop="permissionCode">
            <el-input  v-model="sysPermission.permissionCode" />
          </el-form-item>
          <el-form-item label="权限名" prop="permissionName">
            <el-input  v-model="sysPermission.permissionName" />
          </el-form-item>
        </el-form>
      </el-scrollbar>
      <template #footer>
        <el-button type="primary" @click="saveSysPermission">确认</el-button>
        <el-button @click="this.dialogSysPermission=false">取消</el-button>
      </template>
    </el-dialog>
    <!--请求配置-->
    <el-dialog
        v-model="dialogSysRequestPath"
        title="请求配置"
        width="350px"
        @before-close="this.dialogSysRequestPath=false"
    >
      <el-scrollbar :max-height="heightDialogScrollbar" wrap-style="padding: 10px 20px 0 20px;">
        <el-form :rules="rules" ref="fromSysRequestPath" :model="sysRequestPath" label-width="80px">
          <el-form-item label="请求路径" prop="urls">
            <el-input  v-model="sysRequestPath.url" />
          </el-form-item>
          <el-form-item label="名称" prop="description">
            <el-input  v-model="sysRequestPath.description" />
          </el-form-item>
        </el-form>
      </el-scrollbar>
      <template #footer>
        <el-button type="primary" @click="saveSysRequestPath">确认</el-button>
        <el-button @click="this.dialogSysRequestPath=false">取消</el-button>
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
const name = ref("sysMenu")
let dataSource =ref({dataType:''})
let source  = localStorage.getItem("dataSource")
if(source!==null&&source!=='')dataSource.value = JSON.parse(localStorage.getItem("dataSource"))

let heightTable = ref(0)
let heightSublist = ref(0)
let heightDialogScrollbar = ref(0)
const refMain = ref()
const innerMain = ref()
onMounted(()=>{
  //设置高度
  nextTick(function () {
    let heightMain = innerMain.value.offsetHeight //当前页面总高度
    heightTable.value =  heightMain * 0.5;
    heightSublist.value =  heightMain * 0.5
    heightDialogScrollbar.value = document.body.clientHeight * 0.7;
    window.onresize = function() {
      heightMain = innerMain.value.offsetHeight //当前页面总高度
      heightTable.value =  heightMain * 0.5;
      heightSublist.value =  heightMain * 0.5;
      heightDialogScrollbar.value = document.body.clientHeight * 0.7;
    }
  })
})
const rules = reactive({
  dataType: [{required: true,message: '请选择数据库类型',trigger: 'change'}],
  url:[{required: true,trigger: 'blur',message: '请输入正确的IP地址',pattern: /^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))$/}],
  port: [{required: true,message: '请输入正确的端口号',trigger: 'change',type: 'integer'}],
  dataName: [{ required: true, message: '请输入正确的数据库名称',pattern:/^(^[0-9]*$)|(^[A-Za-z]+$)/, trigger: 'change' }],
  username: [{ required: true, message: '请输入正确的用户名',pattern:/^(^[0-9]*$)|(^[A-Za-z]+$)/, trigger: 'change' }],
  password: [{ required: true, message: '请输入密码', trigger: 'change' }],
  title: [{ required: true, message: '请输入', trigger: 'change' }],
  type: [{ required: true, message: '请选择', trigger: 'change' }],
  tableName: [{ required: true, message: '请输入', trigger: 'change' }],
  pageName: [{ required: true, message: '请输入', trigger: 'change' }],
  sort: [{ required: true,type:'integer', message: '请输入整数', trigger: 'change' }],
  permissionCode: [{ required: true, message: '请输入', trigger: 'change' }],
  permissionName: [{ required: true, message: '请输入', trigger: 'change' }],
  //urls: [{ required: true, message: '请输入', trigger: 'change' }],
  description: [{ required: true, message: '请输入', trigger: 'change' }],
})

let dialogDataSource = ref(false)
let dataSysMenu = ref([]  )
let isShowBtn = ref(false)
const dataFrom = ref()
const getSysMenu = () => {
  dataFrom.value.validate((valid) => {
    if(valid) {
      request.post('/getAllSysMenu',dataSource.value).then((res={})=>{
        dataSysMenu.value = res.data
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
const isDisabled = (idx,row) => {
  let code = row['permissionCode']
  return code.indexOf('get_') !== -1 || code.indexOf('add_') !== -1 || code.indexOf('edit_') !== -1 || code.indexOf('delete_') !== -1;
}
const headerCellStyleSubTable = ({ columnIndex }) => {
  let textAlign = 'center'
  if(columnIndex===2)textAlign = 'right'
  return {
    'background-color': '#F2F6FC',
    'text-align': textAlign,
    'font-weight': 'normal',
    'padding': '2px 0',
    'border-right': '0',
  }
}
let saveUrlSysMenu = ref('')
let disabled = ref(false)
let sysMenu = ref({id:''})
let dialogSysMenu = ref(false)
const addSysMenu = () =>{
  saveUrlSysMenu.value = '/addSysMenu'
  disabled.value = false
  sysMenu.value = {}
  sysMenu.value.id = ''
  sysMenu.value.pid = ''
  sysMenu.value.type = '0'
  dialogSysMenu.value = true
}
const showEdit = (idx,row) => {
  saveUrlSysMenu.value = '/editSysMenu'
  disabled.value = true
  sysMenu.value = {}
  sysMenu.value.id = row['id']
  let pid = ''
  if(row['pid']!==null)pid = row['pid']
  sysMenu.value.pid = pid
  sysMenu.value.icon = row['icon']
  sysMenu.value.title = row['title']
  sysMenu.value.type = row['type']+''
  sysMenu.value.tableName = row['tableName']
  sysMenu.value.pageName = row['pageName']
  sysMenu.value.sort = row['sort']
  dialogSysMenu.value = true
}
const sysMenuFrom = ref()
const saveSysMenu = () =>{
  sysMenuFrom.value.validate((valid) => {
    if(valid) {
      let params = Object.assign(sysMenu.value, store.state.dataSource);
      request.post(saveUrlSysMenu.value,params).then((res={})=>{
        dataSysMenu.value = res.data
        dialogSysMenu.value = false
        ElMessage.success(res.msg)
        // 此处只接收成功数据，失败数据不返回
      })
    }
  })
}
let checkBoxDataSysMenu = ref([])
const deleteSysMenu = () => {
  if(checkBoxDataSysMenu.value['value'].length>0){
    let params = {ids:checkBoxDataSysMenu.value['value']}
    let contentText = '你确认要删除这'+checkBoxDataSysMenu.value['value'].length+'条信息吗？可能会影响系统运行'
    ElMessageBox.confirm(contentText,'警告',{
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      //type: 'error',
    }).then(() => {
      params = Object.assign(params, store.state.dataSource);
      request.post('/deleteSysMenuByIds',params).then((res={})=>{
        dataSysMenu.value = res.data
        ElMessage.success(res.msg)
      })
    }).catch(() =>{})
  }else{
    ElMessage.error('请选择要删除的数据')
  }
}
const deleteSysMenuById = (idx,row) => {
  let params = {ids:[row['id']]}
  let contentText = '你确认要删除这条信息吗？可能会影响系统运行'
  ElMessageBox.confirm(contentText,'警告',{
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    //type: 'error',
  }).then(() => {
    params = Object.assign(params, store.state.dataSource);
    request.post('/deleteSysMenuByIds',params).then((res={})=>{
      dataSysMenu = res.data
      ElMessage.success(res.msg)
    })
  }).catch(() =>{})
}
const formatterType = (row, column, cellValue) => {
  if(cellValue===0)cellValue = '生成页面'
  if(cellValue===1)cellValue = '定制页面'
  if(cellValue===2)cellValue = '系统页面'
  return cellValue
}
let newBtnSysRequestPath = ref(false)
let dataSysRequestPath = ref([])
let newBtnSysPermission = ref(false)
let dataSysPermission = ref([])
const rowClickSysMenu = (row) => {
  newBtnSysRequestPath.value = false
  dataSysRequestPath.value = []
  if(row['pid']===null){
    newBtnSysPermission.value = false
    sysMenu.value.id = ''
    dataSysPermission.value = []
  }else{
    newBtnSysPermission.value = true
    sysMenu.value.id = row['id']
    let params = {menuId:sysMenu.value.id}
    params = Object.assign(params, store.state.dataSource);
    request.post('/getSysPermissionByMenuId',params).then((res={})=>{
      dataSysPermission.value = res.data
    })
  }
}

let sysPermission = ref({id:''})
const rowClickSysPermission = (row) => {
  newBtnSysRequestPath.value = true
  sysPermission.value.id = row['id']
  let params = {permissionId:row['id']}
  params = Object.assign(params, store.state.dataSource);
  request.post('/getSysRequestPathByPermissionId',params).then((res={})=>{
    dataSysRequestPath.value = res.data
  })
}
let saveUrlSysPermission = ref('')
let dialogSysPermission = ref(false)
const addSysPermission = () => {
  sysPermission.value.permissionCode = ''
  sysPermission.value.permissionName = ''
  saveUrlSysPermission.value = '/addSysPermission'
  dialogSysPermission.value = true
}
const editSysPermission = (idx,row) => {
  sysPermission.value.id = row['id']
  sysPermission.value.permissionCode = row['permissionCode']
  sysPermission.value.permissionName = row['permissionName']
  saveUrlSysPermission.value = '/editSysPermission'
  dialogSysPermission.value = true
}
const fromSysPermission = ref()
const saveSysPermission = () => {
  fromSysPermission.value.validate((valid) => {
    if(valid) {
      sysPermission.value.menuId = sysMenu.value.id
      let params = Object.assign(sysPermission.value, store.state.dataSource);
      request.post(saveUrlSysPermission.value,params).then((res={})=>{
        dataSysPermission.value = res.data
        dialogSysPermission.value = false
        newBtnSysRequestPath.value = false
        dataSysRequestPath.value = []
        ElMessage.success(res.msg)
        // 此处只接收成功数据，失败数据不返回
      })
    }
  })
}
const deleteSysPermissionById = (idx,row) => {
  ElMessageBox.confirm('删除该数据可能会引起系统故障，确定要删除吗？','警告',{
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    //type: 'error',
  }).then(() => {
    let params = {id:[row['id']]}
    params = Object.assign(params, store.state.dataSource);
    request.post('/deleteSysPermissionById',params).then((res={})=>{
      dataSysPermission.value = res.data
      ElMessage.success(res.msg)
    })
  }).catch(() =>{})
}
let sysRequestPath = ref({})
let saveUrlSysRequestPath = ref('')
let dialogSysRequestPath = ref(false)
const addSysRequestPath = () => {
  sysRequestPath.value = {}
  saveUrlSysRequestPath.value = '/addSysRequestPath'
  dialogSysRequestPath.value = true
}
const editSysRequestPath = (idx,row) => {
  saveUrlSysRequestPath.value = '/editSysRequestPath'
  sysRequestPath.value = {}
  sysRequestPath.value.id = row['id']
  sysRequestPath.value.url = row['url']
  sysRequestPath.value.description = row['description']
  dialogSysRequestPath.value = true
}
const fromSysRequestPath = ref()
const saveSysRequestPath = () => {
  fromSysRequestPath.value.validate((valid) => {
    if(valid) {
      sysRequestPath.value.permissionId = sysPermission.value.id
      sysRequestPath.value.urls = sysRequestPath.value['url']
      let params = Object.assign(sysRequestPath.value,store.state.dataSource);
      request.post(saveUrlSysRequestPath.value,params).then((res={})=>{
        dataSysRequestPath.value = res.data
        dialogSysRequestPath.value = false
        ElMessage.success(res.msg)
        // 此处只接收成功数据，失败数据不返回
      })
    }
  })
}
const deleteSysRequestPath = (idx,row) => {
  ElMessageBox.confirm('删除该数据可能会引起系统故障，确定要删除吗？','警告',{
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    //type: 'error',
  }).then(() => {
    let params = {id:[row['id']]}
    params = Object.assign(params, store.state.dataSource);
    request.post('/deleteSysRequestPathById',params).then((res={})=>{
      dataSysRequestPath.value = res.data
      ElMessage.success(res.msg)
    })
  }).catch(() =>{})
}
</script>