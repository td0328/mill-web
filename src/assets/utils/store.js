import {createStore} from "vuex"


export default createStore({
    state:{
        isLoadMenu:false,//判断是否加载了菜单
        currentMenu:{    //当前菜单信息
            key:'',
            meta:[]
        },
        dataSource:{}
    },
    getters:{

    },
    mutations:{
        loadMenu (state) {
            state.isLoadMenu=true
        },
        setDataSource(state,dataSource){
            state.dataSource = dataSource
        }

    },
    modules:{

    }
})