const toolUtils = {
    getPermission(pageName,code){
        let userPermission = JSON.parse(localStorage.getItem("userPermission"))
        for(let item of userPermission) {
            if(item.permissionCode === (code+'_'+pageName))return true
        }
        return false
    },
    // 表头部重新渲染
    widthActionColumn(table) {
        let widthActionColumn = 0
        const rowList = Array.from(table.value.$el.getElementsByClassName('el-table__row'));
        rowList.forEach(item =>{
            const btnList = Array.from(item.lastChild.firstChild.childNodes)
            let w = 0
            btnList.forEach(item =>{
                if(item.offsetWidth!==undefined){
                    if(w>0)w+=11//不止一个按钮加上间距
                    w+=item.offsetWidth
                }
            })
            if(w>widthActionColumn)widthActionColumn = w
        })
        if(widthActionColumn>0)widthActionColumn+=34
        return widthActionColumn
    },
    headerCellStyle(){
        return {
            'background-color': '#F2F6FC',
            'text-align': 'center',
            'font-weight': 'normal',
            'height':'40'
        }
    },
    formatDate(row, column) {
        // 获取单元格数据
        let data = row[column.property];
        if(data == null) {
            return null;
        }
        let dt = new Date(data)
        return dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate() + ' ' + dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds()
    },
    changeCheckBoxValue (val,checkBoxData) {
        checkBoxData.value = []
        val.forEach(function(item) {
            if (checkBoxData.value.indexOf(item.id)===-1) {
                checkBoxData.value.push(item.id);
            }
        })
    }
}
export default toolUtils