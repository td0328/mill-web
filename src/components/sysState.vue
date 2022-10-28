<template>
  <el-row :gutter="10" style="height: 100%">
    <el-col :span="10">
      <el-table  :height="tableHeight" 	:data="stateClassData"
                 @row-click = "rowClickStateClass"
                 highlight-current-row
                 @selection-change="changeCheckBoxValueStateClass"
                 :header-cell-style="headerStyleStateClass">
        <el-table-column prop="id" type="selection" width="30"></el-table-column>
        <el-table-column prop="name" :show-overflow-tooltip=true  label="名称">
          <template #header>
            <el-button @click="this.dialogDataSource=true">连接库</el-button>
            <el-button @click="addStateClass" >新增</el-button>
            <el-button @click="deleteStateClass" >删除</el-button>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip=true prop="content" label="操作"></el-table-column>
        <el-table-column align="right">
          <template v-slot="scope">
            <el-button size="small" type="primary" @click.stop="editStateClass(scope.$index, scope.row)">修改</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-col>
    <el-col :span="14">
      <el-table  :height="tableHeight" 	:data="stateData"
                 highlight-current-row
                 @selection-change="changeCheckBoxValueState"
      >
        <el-table-column prop="id" type="selection" width="30"></el-table-column>
        <el-table-column prop="value" :show-overflow-tooltip=true  label="值"></el-table-column>
        <el-table-column prop="name" :show-overflow-tooltip=true  label="名称"></el-table-column>

        <el-table-column align="right">
          <template v-if="this.state.classId!=null&&this.state.classId!==''" #header>
            <el-button @click="addState" >新增</el-button>
            <el-button @click="deleteState" >删除</el-button>
          </template>
          <template v-slot="scope">
            <el-button size="small" type="primary" @click.stop="editState(scope.$index, scope.row)">修改</el-button>
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
          <el-input v-model="dataSource.port" />
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
    <el-form :rules="rules" ref="stateClassFrom" :model="stateClass" label-width="80px">
      <el-form-item label="名称" prop="name">
        <el-input  v-model="stateClass.name" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveStateClass">确认</el-button>
        <el-button @click="this.dialogStateClass=false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
  <el-dialog
      v-model="dialogState"
      title="系统状态"
      width="350px"
      @before-close="this.dialogState=false"
  >
    <el-form :rules="rules" ref="stateFrom" :model="state" label-width="80px">
      <el-form-item label="值" prop="value">
        <el-input :disabled="isStateValue" v-model.number="state.value" />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input  v-model="state.name" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveState">确认</el-button>
        <el-button @click="this.dialogState=false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
<script>
export default {
  name: "sysState",
  data(){
    return {
      tableHeight:0,
      stateClassData:[],
      stateData:[],
      checkBoxDataStateClass:[],
      checkBoxDataState:[],
      dialogDataSource:false,
      dialogStateClass:false,
      dialogState:false,
      stateClass:{},
      state:{},
      isStateValue:false,
      dataSource:{dataType:''},
      rules: this.$reactive({
        url:[{required: true,trigger: 'blur',message: '请输入正确的IP地址',pattern: /^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))$/}],
        port: [{required: true,message: '请输入正确的端口号',trigger: 'change',Type: 'integer'}],
        dataName: [{ required: true, message: '请输入正确的数据库名称',pattern:/^(^[0-9]*$)|(^[A-Za-z]+$)/, trigger: 'change' }],
        username: [{ required: true, message: '请输入正确的用户名',pattern:/^(^[0-9]*$)|(^[A-Za-z]+$)/, trigger: 'change' }],
        password: [{ required: true, message: '请输入密码', trigger: 'change' }],
        name: [{ required: true, message: '请输入', trigger: 'change' }],
        value: [{ required: true,type:'integer', message: '请输入', trigger: 'change' }],
      })
    }
  },
  methods:{
    rowClickStateClass(row){
      let _this = this
      _this.$request.get('/sysState', {classId:row['id']}).then((res={})=>{
        _this.stateData = res.data
        _this.state.classId = row['id']
        //_this.$message.success(res.msg)
        // 此处只接收成功数据，失败数据不返回
      })
    },
    changeCheckBoxValueStateClass(val){
      let _this = this
      _this.checkBoxDataStateClass = []
      val.forEach(function(item) {
        if (_this.checkBoxDataStateClass.indexOf(item.id)===-1) {
          _this.checkBoxDataStateClass.push(item.id);
        }
      })
    },
    changeCheckBoxValueState(val){
      let _this = this
      _this.checkBoxDataState = []
      val.forEach(function(item) {
        if (_this.checkBoxDataState.indexOf(item.id)===-1) {
          _this.checkBoxDataState.push(item.id);
        }
      })
    },
    headerStyleStateClass({row}){
      row[0].colSpan = 1 //第三列的表头占据3个单元格
      row[1].colSpan = 3
      row[2].colSpan = 0
      row[3].colSpan = 0
    },
    addStateClass(){
      this.stateClass.id = ''
      this.stateClass.name = ''
      this.dialogStateClass = true
    },
    deleteStateClass(){
      let _this = this
      if(_this.checkBoxDataStateClass.length>0){
        let params = {ids:_this.checkBoxDataStateClass}
        let contentText = '你确认要删除这'+_this.checkBoxDataStateClass.length+'条信息以及子项吗？'
        _this.$ElMessageBox.confirm(contentText,'警告',{
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          //type: 'error',
        }).then(() => {
          _this.$request.del('/sysStateClass',params).then((res={})=>{
            _this.stateClassData = res.data
            _this.$message.success(res.msg)
          })
        }).catch(() =>{})
      }else{
        _this.$message.error('请选择要删除的状态')
      }
    },
    editStateClass(idx,row){
      this.stateClass.id = row['id']
      this.stateClass.name = row['name']
      this.dialogStateClass = true
    },
    getStateClass(){
      let _this = this;
      this.$refs.dataFrom.validate((valid) => {
        if(valid) {
          _this.$request.get('/sysStateClass',_this.dataSource).then((res={})=>{
            _this.stateClassData = res.data
            _this.dialogDataSource = false
            _this.$message.success(res.msg)
            localStorage.setItem("dataSource",JSON.stringify(_this.dataSource))
            // 此处只接收成功数据，失败数据不返回
          })
        }
      })
    },
    saveStateClass(){
      let _this = this;
      this.$refs.stateClassFrom.validate((valid) => {
        if(valid) {
          _this.$request.post('/sysStateClass',_this.stateClass).then((res={})=>{
            _this.stateClassData = res.data
            _this.dialogStateClass = false
            _this.$message.success(res.msg)
            // 此处只接收成功数据，失败数据不返回
          })
        }
      })
    },
    saveState(){
      let _this = this;
      this.$refs.stateFrom.validate((valid) => {
        if(valid) {
          _this.$request.post('/sysState',_this.state).then((res={})=>{
            if(res.result){
              _this.stateData = res.data
              _this.dialogState = false
              _this.$message.success(res.msg)
            }else{
              _this.$message.error(res.msg)
            }
            // 此处只接收成功数据，失败数据不返回
          })
        }
      })
    },
    addState(){
      this.state.id = ''
      this.state.value = ''
      this.state.name = ''
      this.isStateValue = false
      this.dialogState = true
    },
    editState(idx,row){
      this.state.id = row['id']
      this.state.value = row['value']
      this.state.name = row['name']
      this.isStateValue = true
      this.dialogState = true
    },
    deleteState(){
      let _this = this
      if(_this.checkBoxDataState.length>0){
        let params = {ids:_this.checkBoxDataState,classId:_this.state.classId}
        let contentText = '你确认要删除这'+_this.checkBoxDataState.length+'条信息吗？可能会影响系统运行'
        _this.$ElMessageBox.confirm(contentText,'警告',{
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          //type: 'error',
        }).then(() => {
          _this.$request.del('/sysState',params).then((res={})=>{
            _this.stateData = res.data
            _this.$message.success(res.msg)
          })
        }).catch(() =>{})
      }else{
        _this.$message.error('请选择要删除的状态')
      }
    },
  },
  created(){
    this.dataSource = JSON.parse(localStorage.getItem("dataSource"))
  },
  mounted:function(){
    let _this = this
    //设置高度
    let clearance = 93
    this.$nextTick(function () {
      _this.tableHeight =  document.body.clientHeight - clearance;
      window.onresize = function() {
        _this.tableHeight =  document.body.clientHeight - clearance;
      }
    })
  }
}
</script>

<style scoped>

</style>