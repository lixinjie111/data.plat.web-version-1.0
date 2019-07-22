import Vue from 'vue'
import VueX from 'vuex'

import { Utils } from '@/common/utils/utils.js'

Vue.use(VueX)

const store = new VueX.Store({
    state: {
        platform: "20000",
        login: false,
        operations:[],
        token:'',
        user: {
            name: '',
            id: '',
        },     // 用户信息
        auth: {     // 权限

        },
        action: {   // 页面状态
            isLoading: false,       // 进度条
            isPrompt: false,        // 页面顶部提示框
            msg: '',            // 提示文字
        },
        menus: [],       // 菜单
        isSubMenu: false,   // 显示下拉菜单，版本号、退出登录
        defaultModule: '/vehicleMessage',     // 登录成功，默认打开车辆管理模块vehicleMessage
    },
    getters: {
        menuList: state => {
            return state.menus;
        },
        
    },
    mutations: {
        login(state,data){
            state.operations = data.data.operations;
            state.token = data.data.token;
            state.login = data.data.bool;
            state.user.name = data.data.loginName;
            state.user.id = data.data.userNo;
        },
        logout(state,data){
            state.operations = [];
            state.token = "";
            state.login = false;
            state.user.name = "";
            state.user.id = "";
        },
        initMenus(state,url){
            state.menus = Utils.setMenuByPath(url);
        },
        showLoading(state){
            state.action.isLoading = true;
        },
        hideLoading(state){
            state.action.isLoading = false;
        },
        showPrompt(state,msg){
            state.action.isPrompt = true;
            state.action.msg = msg;
        },
        hidePrompt(state){
            state.action.isPrompt = false;
            state.action.msg = '';
        },
        showSubMenu(state,bool){
            state.isSubMenu = bool;
        }
    },
    actions: {
        login(context,user){
            // console.log('store -- actions --- login : ' + JSON.stringify(user))
            let temp = {
                type: 'login',
                bool: true,
                data:user
            }
            context.commit('login',temp);
        },
        logout(context){
            let temp = {
                type: 'login',
                bool: false,
                data: null
            }
            context.commit('logout',temp);
        },
        initMenus(context,url){
            context.commit('initMenus',url);
        },
        showLoading(context){
            context.commit('showLoading');
        },
        hideLoading(context){
            context.commit('hideLoading');
        },
        showPrompt(context,msg){
            context.commit('showPrompt',msg);
        },
        hidePrompt(context){
            context.commit('hidePrompt');
        },
        showSubMenu(context,bool){
            
            context.commit('showSubMenu',bool);
        }
    }
})

export default store