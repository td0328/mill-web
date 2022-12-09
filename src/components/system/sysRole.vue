<template>
  <div class="main">
    <el-container style="height: 100%;width: 100%;">
      <el-header ref="refHeader" style="background-color: #FFFFFF;padding: 15px;display:table;margin-bottom: 10px;">
        <div style="display:table-cell;height: 100%;">
          <el-form ref="refFormQuery" :model="queryWrapper" label-width="80px">
            <el-row>
              <el-col :span="6">
                <el-form-item label="角色名称" style="margin-bottom:0;" prop="roleName">
                  <el-input v-model="queryWrapper.roleName" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
        <div style="display:table-cell;height: 100%;width:180px;text-align: right">
          <el-button type="primary" icon="Search" @click="getSysRoleByQueryWrapper">查询</el-button>
          <el-button type="primary" icon="Refresh" @click="refFormQuery.resetFields();">重置</el-button>
        </div>
      </el-header>
      <el-main style="background-color: #FFFFFF;--el-main-padding: 15px;">
        <div class="innerMain" ref="innerMain">
          <div ref="innerMainTitle" style="display:table;width: 100%;height: 32px;margin-bottom: 10px;">
            <div style="display:table-cell;height: 100%;">角色配置</div>
            <div style="display:table-cell;height: 100%;width:300px;text-align: right">
              <el-button v-if="toolUtils.getPermission(name,'add')" type="primary" icon="Plus" @click="showAddSysRole">新增</el-button>
              <el-button v-if="toolUtils.getPermission(name,'delete')" type="danger" icon="Delete" @click="deleteSysRoleByIds">删除</el-button>
            </div>
          </div>
          <el-table
              ref="refTableSysRole"
              :data="pageDataSysRole.records"
              :height="heightTable"
              highlight-current-row
              border
              style="width: 100%"
              row-key="title"
              default-expand-all
              :header-cell-style="toolUtils.headerCellStyle"
              @selection-change="toolUtils.changeCheckBoxValue($event,checkBoxDataSysRole)">
            <el-table-column align="center" prop="id" type="selection" label="id" width="40"></el-table-column>
            <el-table-column align="center" prop="roleName" label="角色名称" :show-overflow-tooltip=true></el-table-column>
            <el-table-column align="center" prop="roleDescription" label="角色说明" :show-overflow-tooltip=true></el-table-column>
            <el-table-column align="center" label="操作" :width="widthActionColumn">
              <template v-slot="scope">
                <el-button icon="View" type="primary" size="small" @click="showSeeSysRole(scope.$index, scope.row)">查看</el-button>
                <el-button icon="EditPen" v-if="toolUtils.getPermission(name,'edit')" type="primary" size="small" @click="showEditSysRole(scope.$index, scope.row)">编辑</el-button>
                <el-button
                    icon="Delete"
                    v-if="toolUtils.getPermission(name,'delete')"
                    size="small"
                    type="danger"
                    @click="deleteSysRoleById(scope.$index, scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div ref="refPagination" style="padding-top: 5px;padding-bottom: 5px;">
            <el-pagination
                :total="pageDataSysRole.total"
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
        v-model="dialogSysRole"
        :title="dialogTitleSysRole"
        width="600px"
        @before-close="dialogSysRole=false"
        @close="closeDialogSysRole"
    >
      <el-scrollbar :max-height="heightDialogScrollbar" wrap-style="padding: 10px 20px 0 20px;">
        <el-form :rules="rulesSysRole" ref="fromSysRole" :model="sysRole" label-width="80px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input  v-model="sysRole.roleName" />
          </el-form-item>
          <el-form-item label="角色说明" prop="roleDescription">
            <el-input  v-model="sysRole.roleDescription" />
          </el-form-item>
          <el-form-item label="角色权限" prop="roleDescription">
            <el-tree
                style="width: 100%;"
                :data="treeSysMenu"
                ref="refTreeSysMenu"
                show-checkbox
                node-key="id"
                default-expand-all
                :default-checked-keys="defaultCheckedKeysTreeSysMenu"
                :expand-on-click-node="false"
                :check-on-click-node="true"
                :props="{ class: customNodeClass }"
            />
          </el-form-item>
        </el-form>
      </el-scrollbar>
      <template #footer>
        <el-button v-if="isBtnSave" type="primary" @click="saveSysRole">确认</el-button>
        <el-button @click="dialogSysRole=false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>


<script setup>
import {ref,reactive,nextTick, onMounted} from "vue";
import request from '@/assets/utils/request.js'
import toolUtils from '@/assets/utils/toolUtils.js'
import { ElMessage, ElMessageBox } from 'element-plus'
const name = ref("sysRole")
const refFormQuery = ref()
let queryWrapper =ref({
  roleName:'',
  pageNum:1,
  pageSize:20
})
let pageDataSysRole =ref({
  records:[],
  total:0
})
let widthActionColumn = ref(0)
const refTableSysRole = ref()
const getSysRoleByQueryWrapper = () => {
  request.post('/getSysRoleByQueryWrapper',queryWrapper.value).then((res={})=>{

    pageDataSysRole.value = res
    nextTick(()=>{
      widthActionColumn.value = toolUtils.widthActionColumn(refTableSysRole)
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
  getSysRoleByQueryWrapper();
  //设置高度
  nextTick(function () {
    heightDialogScrollbar.value = document.body.clientHeight * 0.7 - 54 - 62 ;
    heightTable.value = innerMain.value.offsetHeight - innerMainTitle.value.offsetHeight - refPagination.value.offsetHeight;
    window.onresize = function() {
      heightDialogScrollbar.value = document.body.clientHeight * 0.7 - 54 - 62 ;
      heightTable.value = innerMain.value.offsetHeight - innerMainTitle.value.offsetHeight - refPagination.value.offsetHeight;
    }
  })
})
let sysRole = ref({})
let dialogTitleSysRole = ref('')
let treeSysMenu = ref([])
let saveUrlSysRole = ref('')
const refTreeSysMenu = ref()
let dialogSysRole = ref(false)
const showAddSysRole = () => {
  sysRole.value = {}
  dialogTitleSysRole.value = '新增'
  treeSysMenu.value = []
  request.post('/getTreeSysMenu').then((res={})=>{
    treeSysMenu.value = res.data.tree
    saveUrlSysRole.value = '/addSysRole'
    dialogSysRole.value = true
    nextTick(() => {
      refTreeSysMenu.value.setCheckedKeys([], false)
    })
  })
}
let isBtnSave = ref(false)
const showSeeSysRole = (idx,row) =>{
  isBtnSave.value = false
  sysRole.value.id = row['id']
  sysRole.value.roleName = row['roleName']
  sysRole.value.roleDescription = row['roleDescription']
  request.post('/getTreeSysMenu',{id:row['id']}).then((res={})=>{
    treeSysMenu.value = res.data.tree
    defaultCheckedKeysTreeSysMenu.value = res.data.default
    saveUrlSysRole.value = '/editSysRole'
    dialogSysRole.value = true
  })
}
let defaultCheckedKeysTreeSysMenu = ref([])
const showEditSysRole = (idx,row) =>{
  isBtnSave.value = true
  dialogTitleSysRole.value = '编辑'
  sysRole.value.id = row['id']
  sysRole.value.roleName = row['roleName']
  sysRole.value.roleDescription = row['roleDescription']
  request.post('/getTreeSysMenu',{id:row['id']}).then((res={})=>{
    treeSysMenu.value = res.data.tree
    defaultCheckedKeysTreeSysMenu.value = res.data.default
    saveUrlSysRole.value = '/editSysRole'
    dialogSysRole.value = true
  })
}
const closeDialogSysRole = () =>{
  refTreeSysMenu.value.setCheckedKeys([], false)
}
const fromSysRole = ref()
const rulesSysRole = reactive({
  roleName: [{ required: true, message: '请输入', trigger: 'change' }],
  roleDescription: [{ required: true, message: '请输入', trigger: 'change' }],
})
const saveSysRole = () =>{
  //获取所有选中的子节点
  let checkedKeys = refTreeSysMenu.value.getCheckedKeys()
  //获取所有选中的父节点（半选中）
  let hafCheckedKeys = refTreeSysMenu.value.getHalfCheckedKeys()
  //组合
  let menuIds = checkedKeys.concat(hafCheckedKeys)
  if(menuIds.length===0){
    ElMessage.error("请选择角色权限")
    return
  }
  sysRole.value.menuIds = menuIds
  fromSysRole.value.validate((valid) => {
    if(valid) {
      request.post(saveUrlSysRole.value,sysRole.value).then((res={})=>{
        getSysRoleByQueryWrapper();
        dialogSysRole.value = false
        ElMessage.success(res.msg)
        // 此处只接收成功数据，失败数据不返回
      })
    }
  })
}
let checkBoxDataSysRole = ref([])
const deleteSysRoleById = (idx,row) => {
  let params = {ids:[row['id']]}
  let contentText = '你确认要删除这条信息吗？'
  ElMessageBox.confirm(contentText,'警告',{
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    //type: 'error',
  }).then(() => {
    request.post('/deleteSysRoleByIds',params).then((res={})=>{
      if(res.success){
        getSysRoleByQueryWrapper();
        ElMessage.success(res.msg)
      }else{
        ElMessage.error(res.msg)
      }

    })
  }).catch(() =>{})
}
const deleteSysRoleByIds = () => {
  if(checkBoxDataSysRole.value['value'].length>0){
    let params = {ids:checkBoxDataSysRole.value['value']}
    let contentText = '你确认要删除这'+checkBoxDataSysRole.value['value'].length+'条数据吗？'
    ElMessageBox.confirm(contentText,'警告',{
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      //type: 'error',
    }).then(() => {
      request.post('/deleteSysRoleByIds',params).then((res={})=>{
        if(res.success){
          getSysRoleByQueryWrapper();
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
const customNodeClass = (data) => {
  return data['className']
}
</script>

<style>
.el-tree-node.is-expanded.treeSubmenu > .el-tree-node__children {
  display: flex;
  flex-direction: row;
}

.treeSysPermission:nth-child(n+2) > .el-tree-node__content{
  padding-left: 0px !important;
}
</style>