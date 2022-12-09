<template>
  <div class="main" ref="refMain">
    <el-row :gutter="10" style="height: 100%">
      <el-col :span="8">
        <div class="column-col">
          <el-table  :height="heightTable" 	:data="dataTable"
                     @row-click = "rowClickTable"
                     ref="tableConfigTitle"
                     highlight-current-row
                     @selection-change="toolUtils.changeCheckBoxValue($event,checkBoxDataTable)"
                     :header-cell-style="headerStyleTable">
                <el-table-column type="selection" width="30"></el-table-column>
            <el-table-column prop="tableName" :show-overflow-tooltip=true  label="表名称">
              <template #header>
                <el-button @click="dialogDataSource=true" class="linkColour" >连接库</el-button>
                <el-button v-if="btnDeleteSysTableConfig&&toolUtils.getPermission(name,'delete')" @click="deleteTile" class="linkColour" >删除</el-button>
                <el-button v-if="btnCreateCode" class="linkColour" >代码生成</el-button>
              </template>
            </el-table-column>
            <el-table-column :formatter="formatTitle" :show-overflow-tooltip=true prop="content"  label="标题"></el-table-column>
            <el-table-column align="right">
              <template v-slot="scope">
                <el-button v-if="toolUtils.getPermission(name,'edit')" size="small" type="primary" @click.stop="editTitle(scope.$index, scope.row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="column-col">
          <el-table :height="heightTable"	:data="tableConfig.columns"
                    :scrollbar-always-on=true
                    highlight-current-row
                    @row-click = "rowClickColumn"
                    :row-class-name="tableRowClassName"
                    :header-cell-style="headerStyleColumn">
            <el-table-column :show-overflow-tooltip=true prop="columnName">
              <template #header>
                <el-input v-model="tableConfig.sort" placeholder="排序" readonly>
                </el-input>
              </template>
            </el-table-column>
            <el-table-column :show-overflow-tooltip=true prop="title" label="标题" />
            <el-table-column align="right" label="操作" width="135">
              <template v-slot="scope">
                <el-popconfirm
                    confirm-button-text="倒序"
                    cancel-button-text="正序"
                    title="请选择排序方式"
                    cancel-button-type="primary"
                    @confirm="setSort(scope.$index, scope.row,'add','desc')"
                    @cancel="setSort(scope.$index, scope.row,'add','asc')"
                >
                  <template #reference>
                    <el-button @click.stop="" size="small" type="primary">排序</el-button>
                  </template>
                </el-popconfirm>
                <el-button size="small" type="danger" @click.stop="setSort(scope.$index, scope.row,'del','')">取消</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      <el-col :span="8">
        <!-- 列配置开始 -->
        <template v-if="columnConfigShow">
          <div class="column-col">
            <el-scrollbar :height="heightTable">
              <el-form :rules="fromRules" ref="columnConfigFrom" :model="columnConfig" label-width="100px" style="padding-right: 20px;padding-top: 20px">
                <el-form-item label="列标题" prop="title">
                  <el-input v-model="columnConfig.title"/>
                </el-form-item>
                <el-form-item label="数据类型" prop="columnType">
                  <el-select v-model="columnConfig.columnType" placeholder="请选择" style="width: 100%;">
                    <el-option v-for="(item,idx) in dataTypeList" :label="item.text" :value="item.value" :key="idx"/>
                  </el-select>
                </el-form-item>
                <el-row>
                  <el-col :span="12">
                    <el-form-item label="列表显示">
                      <el-switch v-model="columnConfig.isShow"/>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="查询条件">
                      <el-switch v-model="columnConfig.isQuery"/>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="12">
                    <el-form-item label="新增显示">
                      <el-switch v-model="columnConfig.isAdd"/>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="编辑显示">
                      <el-switch v-model="columnConfig.isEdit"/>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="12">
                    <el-form-item label="查看显示">
                      <el-switch v-model="columnConfig.isSee"/>
                    </el-form-item>
                  </el-col>
                </el-row>
                <!-- 整数 -->
                <template v-if="columnConfig.columnType==='integer'">
                  <el-form-item label="最小值" prop="integerMin">
                    <el-input-number :step="1" v-model="columnConfig.integerMin" style="width: 100%"/>
                  </el-form-item>
                  <el-form-item label="最大值" prop="integerMax">
                    <el-input-number :min="columnConfig.integerMin*1" :step="1" v-model="columnConfig.integerMax" style="width: 100%"/>
                  </el-form-item>
                </template>
                <!-- 小数 -->
                <template v-if="columnConfig.columnType==='decimal'">
                  <el-form-item label="最小值" prop="decimalMin">
                    <el-input-number :precision="columnConfig.numericScale" v-model="columnConfig.decimalMin" style="width: 100%"/>
                  </el-form-item>
                  <el-form-item label="最大值" prop="decimalMax">
                    <el-input-number :precision="columnConfig.numericScale" v-model="columnConfig.decimalMax" style="width: 100%"/>
                  </el-form-item>
                </template>
                <!-- 系统状态 -->
                <template v-if="columnConfig.columnType==='state'">
                  <el-form-item label="系统状态" prop="stateId">
                    <el-select v-model="columnConfig.stateId" placeholder="请选择" style="width: 100%;">
                      <el-option v-for="(item,idx) in stateClassList" :label="item.name" :value="item.id" :key="idx"/>
                    </el-select>
                  </el-form-item>
                </template>
                <!-- 字符串 -->
                <template v-if="columnConfig.columnType==='string'">
                  <el-form-item label="正则式">
                    <el-input v-model="columnConfig.regular"/>
                  </el-form-item>
                  <el-form-item label="提示">
                    <el-input v-model="columnConfig.tips"/>
                  </el-form-item>
                </template>
                <!-- 数据选择 -->
                <template v-if="columnConfig.columnType==='selector'">
                  <el-form-item label="主表显示">
                    <el-switch v-model="columnConfig.isMasterShow"/>
                  </el-form-item>
                  <el-form-item label="显示列" prop="selectorShow">
                    <el-input v-model="columnConfig.selectorShow" readonly>
                      <template #suffix>
                        <el-icon @click="this.dialogSelectorShow=true"><Grid /></el-icon>
                      </template>
                    </el-input>
                  </el-form-item>
                  <el-form-item label="查询列" prop="selectorQuery">
                    <el-input v-model="columnConfig.selectorQuery" readonly>
                      <template #suffix>
                        <el-icon @click="this.dialogSelectorQuery=true"><Grid /></el-icon>
                      </template>
                    </el-input>
                  </el-form-item>
                  <el-form-item label="条件SQL">
                    <el-input v-model="columnConfig.selectorWhere">
                    </el-input>
                  </el-form-item>
                </template>
                <!-- 下拉选择 -->
                <template v-if="columnConfig.columnType==='select'">
                  <template v-if="!!columnConfig.referencedTableName">
                    <el-form-item label="条件SQL">
                      <el-input v-model="columnConfig.selectTableWhere" style="width: 100%"/>
                    </el-form-item>
                  </template>
                  <template v-else>
                    <el-form-item label="数据字典">
                      <el-input v-model="columnConfig.selectDictId" readonly>
                        <template #suffix>
                          <el-icon><Grid /></el-icon>
                        </template>
                      </el-input>
                    </el-form-item>
                  </template>
                </template>
                <!-- 复选框 -->
                <template v-if="columnConfig.columnType==='checkbox'">
                  <el-form-item label="数据字典" prop="checkboxDictId">
                    <el-select v-model="columnConfig.checkboxDictId" placeholder="请选择" style="width: 100%;">
                      <el-option v-for="(item,idx) in dataDictionaryList" :label="item.name" :value="item.id" :key="idx"/>
                    </el-select>
                  </el-form-item>
                </template>
                <!-- 单选按钮 -->
                <template v-if="columnConfig.columnType==='radio'">
                  <el-form-item label="数据字典">
                    <el-input v-model="columnConfig.radioDictId" placeholder="请选择数据源" readonly>
                      <template #suffix>
                        <el-icon><Grid /></el-icon>
                      </template>
                    </el-input>
                  </el-form-item>
                </template>
                <!-- 文本框 -->
                <!-- 开关 -->
                <!-- 富文本框 -->
                <!-- 文件 -->
                <!-- 图片 -->
                <template v-if="columnConfig.columnType==='image'">
                  <el-form-item label="最小张数" prop="imageMin">
                    <el-input-number :min="0" :max="99" :step="1" v-model="columnConfig.imageMin" style="width: 100%"/>
                  </el-form-item>
                  <el-form-item label="最大张数" prop="imageMax">
                    <el-input-number :min="columnConfig.imageMin*1" :max="100" :step="1" v-model="columnConfig.imageMax" style="width: 100%"/>
                  </el-form-item>
                </template>
                <!-- 日期 -->
                <template v-if="columnConfig.columnType==='date'">
                  <el-form-item label="当前起">
                    <el-switch v-model="columnConfig.dateStart" />
                  </el-form-item>
                  <el-form-item label="默认当前">
                    <el-switch v-model="columnConfig.dateCurrent" />
                  </el-form-item>
                </template>
                <!-- 时间 -->
                <!-- 年份 -->
                <!-- 日期时间 -->
                <template v-if="columnConfig.columnType==='datetime'">
                  <el-form-item label="当前起">
                    <el-switch v-model="columnConfig.datetimeStart" />
                  </el-form-item>
                  <el-form-item label="默认当前">
                    <el-switch v-model="columnConfig.datetimeCurrent" />
                  </el-form-item>
                </template>
                <!-- 日期范围 -->
                <template v-if="columnConfig.columnType==='dateRange'">
                  <el-form-item label="当前起">
                    <el-switch v-model="columnConfig.dateRangeStart" />
                  </el-form-item>
                </template>
                <!-- 日期时间范围 -->
                <template v-if="columnConfig.columnType==='datetimeRange'">
                  <el-form-item label="当前起">
                    <el-switch v-model="columnConfig.datetimeRangeStart" />
                  </el-form-item>
                </template>
                <el-form-item>
                  <el-button type="primary" @click="saveColumnConfig">保存</el-button>
                </el-form-item>
              </el-form>
            </el-scrollbar>
          </div>
        </template>
        <!-- 列配置结束 -->
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
            <el-button @click="dialogDataSource = false">取消</el-button>
            <el-button type="primary" @click="getTableConfig">连接</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
    <!--表标题配置-->
    <el-dialog
        v-model="dialogTableTitle"
        title="配置表"
        width="350px"
        @before-close="this.dialogTableTitle=false"
    >
      <el-scrollbar :max-height="heightDialogScrollbar" wrap-style="padding: 10px 20px 0 20px;">
        <el-form :rules="fromRules" ref="titleFrom" :model="tableConfig" label-width="80px">
          <el-form-item label="表标题" prop="title">
            <el-input  v-model="tableConfig.title" />
          </el-form-item>
        </el-form>
      </el-scrollbar>
      <template #footer>
        <el-button type="primary" @click="tableTitle">确认</el-button>
        <el-button @click="this.dialogTableTitle=false">取消</el-button>
      </template>
    </el-dialog>
    <!-- 数据选选择显示列 -->
    <el-dialog v-model="dialogSelectorShow" :draggable="true" width="390px" top="10vh" title="显示列">
      <el-table :data="pColumnList" :height="heightDialogTable">
        <el-table-column :show-overflow-tooltip=true property="columnName" label="列名称"/>
        <el-table-column :show-overflow-tooltip=true property="title" label="列标题"/>
        <el-table-column align="right" label="操作" width="150px">
          <template v-slot="scope">
            <el-button size="small" type="primary" @click.stop="selectorShow(scope.$index, scope.row,'add')">引用</el-button>
            <el-button size="small" type="danger" @click.stop="selectorShow(scope.$index, scope.row,'del')">取消</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <!-- 数据选选择查询列 -->
    <el-dialog v-model="dialogSelectorQuery" :draggable="true" width="390px" top="10vh" title="显示列">
      <el-table :data="pColumnList" :height="heightDialogTable">
        <el-table-column :show-overflow-tooltip=true property="columnName" label="列名称"/>
        <el-table-column :show-overflow-tooltip=true property="title" label="列标题"/>
        <el-table-column align="right" label="操作" width="150px">
          <template v-slot="scope">
            <el-button size="small" type="primary" @click.stop="selectorQuery(scope.$index, scope.row,'add')">引用</el-button>
            <el-button size="small" type="danger" @click.stop="selectorQuery(scope.$index, scope.row,'del')">取消</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>
<script setup>
import {ref,reactive,nextTick, onMounted} from "vue";
import request from '@/assets/utils/request.js'
import toolUtils from '@/assets/utils/toolUtils.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import store from "@/assets/utils/store";

const name = ref("sysTableConfig")
let dialogDataSource = ref(false)
let dataSource =ref({dataType:'',dataName:''})
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
const fromRules = reactive({
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  columnType: [{ required: true, message: '选择数据类型', trigger: 'blur' }],
  imageMin: [{ required: true, message: '请输入', trigger: 'blur' }],
  imageMax: [{ required: true, message: '请输入', trigger: 'blur' }],
  integerMin: [{ required: true, message: '请输入', trigger: 'blur' }],
  integerMax: [{ required: true, message: '请输入', trigger: 'blur' }],
  checkboxDictId: [{ required: true, message: '请选择', trigger: 'blur' }],
  decimalMin: [{ required: true, message: '请输入', trigger: 'blur' }],
  decimalMax: [{ required: true, message: '请输入', trigger: 'blur' }],
  stateId: [{ required: true, message: '请输入', trigger: 'blur' }],
  selectorShow: [{ required: true, message: '请选择', trigger: 'blur' }],
  selectorQuery: [{ required: true, message: '请选择', trigger: 'blur' }],
})
let dialogSelectorShow = ref(false)
let dialogSelectorQuery = ref(false)

let heightDialogTable = ref(0)
let heightTable = ref(0)
let heightDialogScrollbar = ref(0)
const refMain = ref()
onMounted(()=>{
  //设置高度
  nextTick(function () {
    heightDialogTable.value = document.body.clientHeight*0.7-60
    heightTable.value =  refMain.value.offsetHeight //当前页面总高度
    heightDialogScrollbar.value = document.body.clientHeight * 0.7 ;
    window.onresize = function() {
      heightDialogTable.value = document.body.clientHeight*0.7-60
      heightTable.value =  refMain.value.offsetHeight //当前页面总高度
      heightDialogScrollbar.value = document.body.clientHeight * 0.7 ;
    }
  })
})
//格式化表标题
const formatTitle = (row, column, cellValue) => {
  if(cellValue!=null){
    let json =  JSON.parse(cellValue)
    cellValue = json.title
  }
  return cellValue
}
//删除表配置
let checkBoxDataTable = ref([])
let tableSchema = ref('')
let dataTable = ref([])
let tableConfig = ref({tableName:'',columns:[],sort:''})
const deleteTile = () => {
  if(checkBoxDataTable.value['value'].length>0){
    let params = {ids:checkBoxDataTable.value['value'],tableSchema:tableSchema.value}
    let contentText = '你确认要删除这'+checkBoxDataTable.value['value'].length+'条表配置以及响应的列配置吗？'
    ElMessageBox.confirm(contentText,'警告',{
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      //type: 'error',
    }).then(() => {
      params = Object.assign(params, store.state.dataSource);
      request.post('/'+dataSource.value.dataType+'/deleteSysTableConfigByIds',params).then((res={})=>{
        dataTable.value = res.data
        tableConfig.value = {}
        ElMessage.success(res.msg)
      })
    }).catch(() =>{})
  }else{
    ElMessage.error('请选择要删除的表配置')
  }
}
//编辑表标题
let saveUrlSysTableConfig = ref('')
let dialogTableTitle = ref(false)
const editTitle = (index,row) => {
  let content = row['content']
  if(content.length>0){
    tableConfig.value.title = JSON.parse(content).title
    tableConfig.value.tableName = row['tableName']
    saveUrlSysTableConfig.value = '/editSysTableConfigTitle'
    dialogTableTitle.value = true
  }
}
//选择表配置
let columnConfigShow = ref(false)
const rowClickTable = (row) => {
  columnConfigShow.value = false
  let title = row['content']
  tableConfig.value = {}
  tableConfig.value.tableName = row['tableName']
  if(title==null||title===''){
    dialogTableTitle.value=true
    tableConfig.value.title = ''
    saveUrlSysTableConfig.value = '/addSysTableConfig'
  }else {
    let params = {tableName:tableConfig.value.tableName}
    params = Object.assign(params, store.state.dataSource);
    request.post('/'+dataSource.value.dataType+'/getTableColumnConfigByTableName',params).then((res={})=>{
      tableConfig.value = res.data
      tableConfig.value.sort = JSON.stringify(tableConfig.value.sort)
    })
  }
}
//获取表配置
const dataFrom = ref()
let btnCreateCode = ref(false)
let btnDeleteSysTableConfig = ref(false)
const getTableConfig = () => {
  dataFrom.value.validate((valid) => {
    if(valid) {
      dataSource.value.key =  dataSource.value.dataName
      request.post('/'+dataSource.value.dataType+'/getAllSysTableConfigByTableSchema',dataSource.value).then((res={})=>{
        dataTable.value = res.data
        tableSchema.value = dataSource.value.dataName
        btnCreateCode.value = true
        btnDeleteSysTableConfig.value = true
        dialogDataSource.value = false
        ElMessage.success(res.msg)
        localStorage.setItem("dataSource",JSON.stringify(dataSource.value))
        store.commit('setDataSource',dataSource.value)
        // 此处只接收成功数据，失败数据不返回
      })
    }
  })
}
//新增和编辑表配置提交
const titleFrom = ref()
let columnData = ref([])
const tableTitle = () => {
  titleFrom.value.validate((valid) => {
    if(valid) {
      tableConfig.value.tableSchema = tableSchema.value
      let params = Object.assign(tableConfig.value, store.state.dataSource);
      request.post('/'+dataSource.value.dataType+saveUrlSysTableConfig.value,params).then((res={})=>{
        dataTable.value = res.data
        columnData.value = []
        dialogTableTitle.value = false
        ElMessage.success(res.msg)
        // 此处只接收成功数据，失败数据不返回
      })
    }
  })
}

const headerStyleTable = ({row}) => {
  row[0].colSpan = 1 //第三列的表头占据3个单元格
  row[1].colSpan = 3
  row[2].colSpan = 0
  row[3].colSpan = 0
}
const headerStyleColumn = ({row}) => {
  row[0].colSpan = 3 //第三列的表头占据3个单元格
  row[1].colSpan = 0
  row[2].colSpan = 0

}
// 设置表排序
const setSort = (i,row,type,sort) => {
  let params = {
    tableName:tableConfig.value.tableName,
    column:row['columnName'],
    type:type,
    sort:sort
  }
  params = Object.assign(params, store.state.dataSource);
  request.post('/'+dataSource.value.dataType+'/editSysTableConfigSort',params).then((res={})=>{
    tableConfig.value = res.data
    tableConfig.value.sort = JSON.stringify(tableConfig.value.sort)
    ElMessage.success(res.msg)
    // 此处只接收成功数据，失败数据不返回
  })
}
//给表格行添加序号
const tableRowClassName = ({ row, rowIndex }) => {
  row.index = rowIndex;
}
//点击列
let dataTypeList = ref([])
let dataDictionaryList = ref([])
let stateClassList = ref([])
let columnConfig = ref({
  selectorQuery:'',
  isAdd:false,
  isEdit:false,
  isKey:false,
  isQuery:false,
  isShow:false,
  isSee:true,
  numericScale:0,
  isMasterShow:false,
  selectorWhere:'',
  referencedTableName:'',
  selectTableWhere:'',
  selectDictId:'',
  radioDictId:'',
  dateStart:false,
  dateCurrent:false,
  datetimeStart:false,
  datetimeCurrent:false,
  dateRangeStart:false,
  datetimeRangeStart:false,
  selectorShow:false
})
let pColumnList = ref([])
const rowClickColumn = (row) => {
  columnConfigShow.value = false
  let col = tableConfig.value.columns[row.index];
  if(col.isKey&&col.extra==="auto_increment"){
    ElMessage.success("该列为自增长主键，无需配置")
    return;
  }
  let columnName = row['columnName'];
  let params = {tableName:tableConfig.value.tableName,columnName:columnName}
  params = Object.assign(params, store.state.dataSource);
  request.post('/'+dataSource.value.dataType+'/getColumnTypeData',params).then((res={})=>{
    dataTypeList.value = res.data['dataTypeList']
    dataDictionaryList.value = res.data['dataDictionaryList']
    stateClassList.value = res.data['stateClassList']
    columnConfig.value = JSON.parse(JSON.stringify(tableConfig.value.columns[row.index]))
    columnConfigShow.value = true
    //给数据选择赋值
    pColumnList.value = res.data['pColumnList']
    // 此处只接收成功数据，失败数据不返回
  })
}
//保存表配置
const columnConfigFrom = ref()
const saveColumnConfig = () => {
  columnConfigFrom.value.validate((valid) => {
    if(valid) {
      let params = Object.assign(columnConfig.value, store.state.dataSource);
      params['columnDateType'] = columnConfig.value['dateType']
      request.post('/'+dataSource.value.dataType+'/editColumnConfig',params).then((res={})=>{
        let newColumn = res.data
        for(let i=0;i<tableConfig.value.columns.length;i++){
          if(tableConfig.value.columns[i].columnName===newColumn.columnName){
            tableConfig.value.columns[i] = newColumn;
            break;
          }
        }
        columnConfig.value = JSON.parse(JSON.stringify(newColumn))
        ElMessage.success(res.msg)
        // 此处只接收成功数据，失败数据不返回
      })
    }
  })
}
const selectorShow = (idx,row,type) => {
  let str = columnConfig.value.selectorShow
  let rowColumnName = row["columnName"]
  if(str==null||str==='')str='[]'
  let strJson = JSON.parse(str)
  strJson.forEach((item,idx) =>{
    if(item===rowColumnName)strJson.splice(idx,1)
  })
  if(type==='add'){
    strJson[strJson.length] = rowColumnName
  }
  if(strJson.length>0){
    str = JSON.stringify(strJson)
  }else{
    str = ''
  }
  columnConfig.value.selectorShow = str
}
const selectorQuery = (idx,row,type) => {
  let str = columnConfig.value.selectorQuery
  let rowColumnName = row["columnName"]
  if(str==null||str==='')str='[]'
  let strJson = JSON.parse(str)
  strJson.forEach((item,idx) =>{
    if(item===rowColumnName)strJson.splice(idx,1)
  })
  if(type==='add'){
    strJson[strJson.length] = rowColumnName
  }
  if(strJson.length>0){
    str = JSON.stringify(strJson)
  }else{
    str = ''
  }
  columnConfig.value.selectorQuery = str
}
</script>
<style scoped>
.column-col{
  background-color: #FFFFFF;
  width: 100%;
  height: 100%;
}
</style>