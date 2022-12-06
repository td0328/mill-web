<template>
  <div class="main">
    <el-container style="height: 100%;width: 100%;">
      <el-header ref="refHeader" style="background-color: #FFFFFF;padding: 15px;display:table;margin-bottom: 10px;">
        <div style="display:table-cell;height: 100%;">
          <el-form ref="refFormQuery" :model="queryWrapper" label-width="80px">
            <el-row>
              <el-col :span="6">
                <el-form-item label="用户名称" style="margin-bottom:0;" prop="userName">
                  <el-input v-model="queryWrapper.userName" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
        <div style="display:table-cell;height: 100%;width:180px;text-align: right">
          <el-button type="primary" icon="Search" @click="getSysUserByQueryWrapper">查询</el-button>
          <el-button type="primary" icon="Refresh" @click="this.$refs.refFormQuery.resetFields();">重置</el-button>
        </div>
      </el-header>
      <el-main style="background-color: #FFFFFF;--el-main-padding: 15px;">
        <div class="innerMain" ref="innerMain">
          <div ref="innerMainTitle" style="display:table;width: 100%;height: 32px;margin-bottom: 10px;">
            <div style="display:table-cell;height: 100%;">用户管理</div>
            <div style="display:table-cell;height: 100%;width:300px;text-align: right">
              <el-button v-if="toolUtils.getPermission(name,'add')" type="primary" icon="Plus" @click="showAddSysUser">新增</el-button>
              <el-button v-if="toolUtils.getPermission(name,'delete')" type="danger" icon="Delete" @click="deleteSysUserByIds">删除</el-button>
            </div>
          </div>
          <el-table
              :data="pageDataSysUser.records"
              :height="heightTable"
              highlight-current-row
              border
              style="width: 100%"
              row-key="title"
              default-expand-all
              ref="refTableSysUser"
              :header-cell-style="toolUtils.headerCellStyle"
              @selection-change="toolUtils.changeCheckBoxValue($event,checkBoxDataSysUser)">
            <el-table-column align="center" prop="id" type="selection" label="id" width="40"></el-table-column>
            <el-table-column align="center" prop="account" label="账号" :show-overflow-tooltip=true></el-table-column>
            <el-table-column align="center" prop="userName" label="用户名称" :show-overflow-tooltip=true></el-table-column>
            <el-table-column align="center" prop="lastLoginTime" :formatter="toolUtils.formatDate" label="上一次登录时间" :show-overflow-tooltip=true></el-table-column>
            <el-table-column align="center" prop="enabled" label="是否可用" :show-overflow-tooltip=true>
              <template v-slot="scope" v-if="toolUtils.getPermission(name,'edit')"><el-switch v-model="scope.row.enabled" @change="(value) => changeEnabled(value,scope.row)"/></template>
              <template v-slot="scope" v-else>
                <span v-if="scope.row.enabled">是</span>
                <span v-else>否</span>
              </template>
            </el-table-column>
            <el-table-column align="center" :fixed="'right'" label="操作" :width="widthActionColumn">
              <template v-slot="scope">
                <el-button icon="Refresh" v-if="toolUtils.getPermission(name,'resetPassword')" type="primary" size="small" @click="resetPassword(scope.$index, scope.row)">重置密码</el-button>
                <el-button icon="View" type="primary" size="small" @click="showSeeSysUser(scope.$index, scope.row)">查看</el-button>
                <el-button icon="EditPen" v-if="toolUtils.getPermission(name,'edit')" type="primary" size="small" @click="showEditSysUser(scope.$index, scope.row)">编辑</el-button>
                <el-button
                    icon="Delete"
                    v-if="toolUtils.getPermission(name,'delete')"
                    size="small"
                    type="danger"
                    @click="deleteSysUserById(scope.$index, scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div ref="refPagination" style="padding-top: 5px;padding-bottom: 5px;">
            <el-pagination
                :total="pageDataSysUser.total"
                :pager-count="5"
                :page-sizes="[20, 50, 100, 200, 1000]"
                :default-page-size="20"
                :layout="'->,total,sizes,prev, pager, next,jumper'"
                background
            />
          </div>
        </div>
      </el-main>
    </el-container>
    <!--新增-->
    <el-dialog
        v-model="dialogSysUser"
        :title="dialogTitleSysUser"
        width="350px"
        @before-close="this.dialogSysUser=false"
    >
      <el-scrollbar :max-height="heightDialogScrollbar" wrap-style="padding: 10px 20px 0 20px;">
        <el-form :rules="rulesSysUser" ref="fromSysUser" :model="sysUser" label-width="80px">
          <el-form-item label="账号" prop="account">
            <el-input  v-model="sysUser.account" />
          </el-form-item>
          <el-form-item label="用户名称" prop="userName">
            <el-input  v-model="sysUser.userName" />
          </el-form-item>
          <el-form-item label="分配角色">
            <el-checkbox-group v-model="checkboxSysRoleValue">
              <el-checkbox v-for="(item,idx) in checkboxSysRole" :label="item.id" :key="idx">{{item.roleName}}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </el-scrollbar>
      <template #footer>
        <el-button v-if="isBtnSave" type="primary" @click="saveSysUser(fromSysUser)">确认</el-button>
        <el-button @click="this.dialogSysUser=false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import {ref,reactive,nextTick, onMounted} from "vue";
import request from '@/assets/utils/request.js'
import toolUtils from '@/assets/utils/toolUtils.js'
import { ElMessage, ElMessageBox } from 'element-plus'
const name = ref("sysUser")
//条件查询
let queryWrapper =ref({
  userName:'',
  pageNum:1,
  pageSize:20
})
let pageDataSysUser =ref({
  records:[],
  total:0
})
let widthActionColumn = ref(0)
const refTableSysUser = ref()
const getSysUserByQueryWrapper = () =>{
  request.post('/getSysUserByQueryWrapper',queryWrapper.value).then((res={})=>{
    pageDataSysUser.value = res
    nextTick(()=>{
      widthActionColumn.value = toolUtils.widthActionColumn(refTableSysUser)
    })
  })
}
const refHeader = ref()
let heightDialogScrollbar = ref(0)
let heightTable = ref(0)
const innerMain = ref()
const innerMainTitle = ref()
const refPagination = ref()
onMounted(()=>{
  getSysUserByQueryWrapper();
  nextTick(function () {
    heightDialogScrollbar.value = document.body.clientHeight * 0.7;
    heightTable.value = innerMain.value.offsetHeight - innerMainTitle.value.offsetHeight - refPagination.value.offsetHeight;
    window.onresize = function() {
      heightDialogScrollbar.value = document.body.clientHeight * 0.7;
      heightTable.value =  innerMain.value.offsetHeight - innerMainTitle.value.offsetHeight - refPagination.value.offsetHeight;
    }
  })
})
const changeEnabled = (val, row) => {
  let params = {id:row.id,enabled:val}
  request.post('/setEnabled',params).then((res={})=>{
    ElMessage.success(res.msg)
  })
}
//新增
let sysUser = ref({})
let dialogTitleSysUser = ref('')
let checkboxSysRole = ref([])
let checkboxSysRoleValue = ref([])
let saveUrlSysUser = ref('')
let dialogSysUser = ref(false)
const showAddSysUser = () =>{
  sysUser.value = {}
  dialogTitleSysUser.value = '新增'
  request.post('/getAllSysRoleByUserId').then((res={})=>{
    checkboxSysRole.value = res.data['checkboxSysRole']
    checkboxSysRoleValue.value = []
    saveUrlSysUser.value = '/addSysUser'
    dialogSysUser.value = true
  })
}
let isBtnSave = ref(false)
const showSeeSysUser = (idx,row) => {
  isBtnSave.value = false
  dialogTitleSysUser.value = '查看'
  sysUser.value.id = row['id']
  sysUser.value.account = row['account']
  sysUser.value.userName = row['userName']
  request.post('/getAllSysRoleByUserId',{userId:row['id']}).then((res={})=>{
    checkboxSysRole.value = res.data['checkboxSysRole']
    checkboxSysRoleValue.value = res.data['checkboxSysRoleValue']
    saveUrlSysUser.value = '/editSysUser'
    dialogSysUser.value = true
  })
}
const showEditSysUser = (idx,row) =>{
  isBtnSave.value = true
  dialogTitleSysUser.value = '编辑'
  sysUser.value.id = row['id']
  sysUser.value.account = row['account']
  sysUser.value.userName = row['userName']
  request.post('/getAllSysRoleByUserId',{userId:row['id']}).then((res={})=>{
    checkboxSysRole.value = res.data['checkboxSysRole']
    checkboxSysRoleValue.value = res.data['checkboxSysRoleValue']
    saveUrlSysUser.value = '/editSysUser'
    dialogSysUser.value = true
  })
}
const resetPassword = (idx,row) =>{
  sysUser.value.id = row['id']
  ElMessageBox.confirm('你确认要重置密码吗？重置后密码为123456','警告',{
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    //type: 'error',
  }).then(() => {
    request.post('/resetPassword', sysUser.value).then((res={})=>{
      getSysUserByQueryWrapper();
      ElMessage.success(res.msg)
    })
  }).catch(() =>{})
}
const deleteSysUserById = (idx,row) =>{
  let params = {ids:[row['id']]}
  let contentText = '你确认要删除这条信息吗？'
  ElMessageBox.confirm(contentText,'警告',{
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    //type: 'error',
  }).then(() => {
    request.post('/deleteSysUserByIds',params).then((res={})=>{
      if(res.success){
        getSysUserByQueryWrapper();
        ElMessage.success(res.msg)
      }else{
        ElMessage.error(res.msg)
      }

    })
  }).catch(() =>{})
}
let checkBoxDataSysUser = ref([])
const deleteSysUserByIds = () => {
  if(checkBoxDataSysUser.value['value'].length>0){
    let params = {ids:checkBoxDataSysUser.value['value']}
    let contentText = '你确认要删除这'+checkBoxDataSysUser.value.length+'条数据吗？'
    ElMessageBox.confirm(contentText,'警告',{
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      //type: 'error',
    }).then(() => {
      request.post('/deleteSysUserByIds',params).then((res={})=>{
        if(res.success){
          getSysUserByQueryWrapper();
          ElMessage.success(res.msg)
        }else{
          ElMessage.error(res.msg)
        }
      })
    }).catch(() =>{})
  }else{
    ElMessage.error('请选择要删除的数据')
  }
}
const rulesSysUser = reactive({
  account: [{ required: true, message: '只能输入5-25个字母、数字、下划线',pattern:/^(\w){5,25}$/, trigger: 'change' }],
  userName: [{ required: true, message: '请输入', trigger: 'change' }],
})
const fromSysUser = ref()
const saveSysUser = (formEl) =>{
  if(checkboxSysRoleValue.value.length===0){
    ElMessage.error("请选择角色")
  }
  sysUser.value.roleIds = checkboxSysRoleValue.value
  formEl.validate((valid) => {
    if(valid) {
      request.post(saveUrlSysUser.value,sysUser.value).then((res={})=>{
        if(res.success){
          getSysUserByQueryWrapper();
          dialogSysUser.value = false
          ElMessage.success(res.msg)
        }else{
          ElMessage.error(res.msg)
        }
        // 此处只接收成功数据，失败数据不返回
      })
    }
  })
}
</script>

<style>
.el-tree-node.is-expanded.treeSubmenu > .el-tree-node__children {
  display: flex;
  flex-direction: row;
}

.treeSysPermission:nth-child(n+2) > .el-tree-node__content{
  padding-left: 0 !important;
}
</style>