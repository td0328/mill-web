<template>
  <el-container style="background-color: #FFFFFF;height: 100%;width: 100%;">
    <el-header>
      <el-row style="height: 100%;" align="middle">
        <el-col :span="6" >
          数据字典
        </el-col>
        <el-col :span="18" >
          <div style="float: right;">
            <el-button @click="this.dialogDataSource=true" class="linkColour" >连接库</el-button>
            <el-button v-if="isShowBtn" type="primary" icon="Plus" @click="addSysDictClass">新增</el-button>
            <el-button v-if="isShowBtn" type="danger" icon="Delete" @click="deleteSysDictClass">删除</el-button>
          </div>
        </el-col>
      </el-row>
    </el-header>
    <el-main style="padding-top: 0;padding-bottom: 0;">
      <el-table :data="sysDictClassData" :height="tableHeight" border style="width: 100%" :header-cell-style="headerCellStyle" @selection-change="changeCheckBoxValueSysDictClass">
        <el-table-column align="center" prop="id" type="selection" label="id" width="30"></el-table-column>
        <el-table-column align="center" prop="name" label="名称"></el-table-column>
        <el-table-column align="center" label="操作" width="180" >
          <template v-slot="scope">
            <el-button size="small" @click="showEdit(scope.$index, scope.row)">修改</el-button>
            <el-button
                size="small"
                type="danger"
                @click="deleteSysDictClassById(scope.$index, scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
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
      @before-close="this.dialogSysDictClass=false"
  >
    <el-form :rules="rules" ref="sysDictClassFrom" :model="sysDictClass" label-width="80px">
      <el-form-item label="名称" prop="name">
        <el-input  v-model="sysDictClass.name" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveDictClass">确认</el-button>
        <el-button @click="this.dialogSysDictClass=false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
<script>
export default {
  name: "sysDictClass",
  data(){
    return{
      sysDictClassData:[],
      checkBoxDataSysDictClass:[],
      tableHeight:0,
      dialogDataSource:false,
      dataSource:{dataType:''},
      dialogSysDictClass:false,
      isShowBtn:false,
      sysDictClass:{},
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
    changeCheckBoxValueSysDictClass(val){
      let _this = this
      _this.checkBoxDataSysDictClass = []
      val.forEach(function(item) {
        if (_this.checkBoxDataSysDictClass.indexOf(item.id)===-1) {
          _this.checkBoxDataSysDictClass.push(item.id);
        }
      })
    },
    rowDelete(){},
    headerCellStyle(){
      return {
        'background-color': '#F2F6FC',
        'text-align': 'center',
        'font-weight': 'normal'
      }
    },
    getDictClass(){
      let _this = this;
      this.$refs.dataFrom.validate((valid) => {
        if(valid) {
          _this.$request.get('/sysDictClass',_this.dataSource).then((res={})=>{
            _this.sysDictClassData = res.data
            _this.dialogDataSource = false
            _this.isShowBtn = true
            _this.$message.success(res.msg)
            localStorage.setItem("dataSource",JSON.stringify(_this.dataSource))
            // 此处只接收成功数据，失败数据不返回
          })
        }
      })
    },
    saveDictClass(){
      let _this = this;
      this.$refs.sysDictClassFrom.validate((valid) => {
        if(valid) {
          _this.$request.post('/sysDictClass',_this.sysDictClass).then((res={})=>{
            _this.sysDictClassData = res.data
            _this.dialogSysDictClass = false
            _this.$message.success(res.msg)
            // 此处只接收成功数据，失败数据不返回
          })
        }
      })
    },
    addSysDictClass(){
      this.sysDictClass.id = ''
      this.sysDictClass.name = ''
      this.dialogSysDictClass = true
    },
    showEdit(idx,row){
      this.sysDictClass.id = row['id']
      this.sysDictClass.name = row['name']
      this.dialogSysDictClass = true
    },
    deleteSysDictClass(){
      let _this = this
      if(_this.checkBoxDataSysDictClass.length>0){
        let params = {ids:_this.checkBoxDataSysDictClass}
        let contentText = '你确认要删除这'+_this.checkBoxDataSysDictClass.length+'条信息吗？可能会影响系统运行'
        _this.$ElMessageBox.confirm(contentText,'警告',{
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          //type: 'error',
        }).then(() => {
          _this.$request.del('/sysDictClass',params).then((res={})=>{
            _this.sysDictClassData = res.data
            _this.$message.success(res.msg)
          })
        }).catch(() =>{})
      }else{
        _this.$message.error('请选择要删除的数据')
      }
    },
    deleteSysDictClassById(idx,row){
      let _this = this
      //let ids = [row['id']]
      let params = {ids:[row['id']]}
      let contentText = '你确认要删除这条信息吗？可能会影响系统运行'
      _this.$ElMessageBox.confirm(contentText,'警告',{
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        //type: 'error',
      }).then(() => {
        _this.$request.del('/sysDictClass',params).then((res={})=>{
          _this.sysDictClassData = res.data
          _this.$message.success(res.msg)
        })
      }).catch(() =>{})
    },
  },
  created(){
    this.dataSource = JSON.parse(localStorage.getItem("dataSource"))
  },
  mounted:function(){
    let _this = this
    //设置高度
    let clearance = 53 + 20 + 20 + 60
    this.$nextTick(function () {
      _this.tableHeight =  document.body.clientHeight - clearance;
      window.onresize = function() {
        _this.tableHeight =  document.body.clientHeight - clearance;
      }
    })
  }

}
</script>