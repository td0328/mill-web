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
          <el-button type="primary" icon="Refresh" @click="this.$refs.refFormQuery.resetFields();">重置</el-button>
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
        @before-close="this.dialogSysRole=false"
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
        <el-button @click="this.dialogSysRole=false">取消</el-button>
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
  //this.$refs['refTreeSysMenu'].setCheckedKeys([], false)
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
/*
export default {
  name: "sysRole",
  data() {
    return {
      queryWrapper:{
        roleName:'',
        pageNum:1,
        pageSize:20
      },
      rulesQuery: this.$reactive({}),
      pageDataSysRole: {
        total:0
      },
      heightTable:0,
      heightDialogScrollbar:0,
      checkBoxDataSysRole:[],
      dialogSysRole:false,
      sysRole:{
        roleName:'',
        roleDescription:''
      },
      rulesSysRole: this.$reactive({
        roleName: [{ required: true, message: '请输入', trigger: 'change' }],
        roleDescription: [{ required: true, message: '请输入', trigger: 'change' }],
      }),
      treeSysMenu:[],
      saveUrlSysRole:'',
      dialogTitleSysRole:'',
      defaultCheckedKeysTreeSysMenu:[],

    }
  },
  methods:{
    headerCellStyle(){
      return {
        'background-color': '#F2F6FC',
        'text-align': 'center',
        'font-weight': 'normal',
        'height':'40'
      }
    },
    changeCheckBoxValueSysRole(val){
      let _this = this
      _this.checkBoxDataSysRole = []
      val.forEach(function(item) {
        if (_this.checkBoxDataSysRole.indexOf(item.id)===-1) {
          _this.checkBoxDataSysRole.push(item.id);
        }
      })
    },
    getSysRoleByQueryWrapper(){
      let _this = this;
      _this.$request.post('/getSysRoleByQueryWrapper',_this.queryWrapper).then((res={})=>{
        _this.pageDataSysRole = res
      })
    },
    customNodeClass (data){
      return data['className']
    },
    showAddSysRole(){
      this.sysRole = {}
      this.dialogTitleSysRole = '新增'
      //this.$refs['refTreeSysMenu'].setCheckedKeys([], false)
      let _this = this;
      _this.$request.post('/getTreeSysMenu').then((res={})=>{
        _this.treeSysMenu = res.data.tree
        _this.saveUrlSysRole = '/addSysRole'
        _this.$nextTick(() => {
          _this.$refs['refTreeSysMenu'].setCheckedKeys([])
        })
        _this.dialogSysRole = true
      })
    },
    showEditSysRole(idx,row){
      let _this = this;
      _this.$nextTick(() => {
        _this.$refs['refTreeSysMenu'].setCheckedKeys([])
      })
      this.dialogTitleSysRole = '编辑'
      this.sysRole.id = row['id']
      this.sysRole.roleName = row['roleName']
      this.sysRole.roleDescription = row['roleDescription']
      _this.$request.post('/getTreeSysMenu',{id:row['id']}).then((res={})=>{
        _this.treeSysMenu = res.data.tree
        _this.defaultCheckedKeysTreeSysMenu = res.data.default
        _this.saveUrlSysRole = '/editSysRole'
        _this.$nextTick(() => {
          _this.dialogSysRole = true
        })

      })
    },
    saveSysRole(){
      let _this = this
      //获取所有选中的子节点
      let checkedKeys = _this.$refs['refTreeSysMenu'].getCheckedKeys()
      //获取所有选中的父节点（半选中）
      let hafCheckedKeys = _this.$refs['refTreeSysMenu'].getHalfCheckedKeys()
      //组合
      let menuIds = checkedKeys.concat(hafCheckedKeys)
      if(menuIds.length===0){
        _this.$message.error("请选择角色权限")
        return
      }
      _this.sysRole.menuIds = menuIds
      this.$refs.fromSysRole.validate((valid) => {
        if(valid) {
          _this.$request.post(_this.saveUrlSysRole,_this.sysRole).then((res={})=>{
            _this.getSysRoleByQueryWrapper();
            _this.dialogSysRole = false
            _this.$message.success(res.msg)
            // 此处只接收成功数据，失败数据不返回
          })
        }
      })
    },
    deleteSysRoleById(idx,row){
      let _this = this
      let params = {ids:[row['id']]}
      let contentText = '你确认要删除这条信息吗？'
      _this.$ElMessageBox.confirm(contentText,'警告',{
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        //type: 'error',
      }).then(() => {
        _this.$request.post('/deleteSysRoleByIds',params).then((res={})=>{
          if(res.success){
            _this.getSysRoleByQueryWrapper();
            _this.$message.success(res.msg)
          }else{
            _this.$message.error(res.msg)
          }

        })
      }).catch(() =>{})
    },
    deleteSysRoleByIds(){
      let _this = this
      if(_this.checkBoxDataSysRole.length>0){
        let params = {ids:_this.checkBoxDataSysRole}
        let contentText = '你确认要删除这'+_this.checkBoxDataSysRole.length+'条数据吗？'
        _this.$ElMessageBox.confirm(contentText,'警告',{
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          //type: 'error',
        }).then(() => {
          _this.$request.post('/deleteSysRoleByIds',params).then((res={})=>{
            if(res.success){
              _this.getSysRoleByQueryWrapper();
              _this.$message.success(res.msg)
            }else{
              _this.$message.error(res.msg)
            }
          })
        }).catch(() =>{})
      }else{
        _this.$message.error('请选择要删除的数据')
      }
    },

  },
  mounted:function(){
    let _this = this
    _this.getSysRoleByQueryWrapper();
    //设置高度
    let heightHeader= this.$refs.refHeader.$el.offsetHeight;
    if(heightHeader>0)heightHeader+=10
    let clearanceTable = 53 + 12 +12 + heightHeader + 32 + 10 + 15 + 15 + 36 + 5
    let clearanceDialogScrollbar = 54  + 62
    this.$nextTick(function () {
      _this.heightDialogScrollbar = document.body.clientHeight * 0.7  - clearanceDialogScrollbar;
      _this.heightTable = document.body.clientHeight - clearanceTable;
      window.onresize = function() {
        _this.heightDialogScrollbar = document.body.clientHeight * 0.7  - clearanceDialogScrollbar;
        _this.heightTable =  document.body.clientHeight - clearanceTable;
      }
    })
  }
}

 */
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