<template>
    <div class="yk-menu-box yk-right">
        <div class="yk-block">
            <ul :class=" $store.state.isSubMenu ? 'yk-sub-menu' : 'yk-nav' ">
                <li class="yk-border0" @click.stop="showSubMenu();">
                    <img class="yk-user-ico" src="static/icon/user.png">
                    <div class="yk-user-title">admin</div>
                    <!-- 当前用户：管理员  -->
                    <!-- {{ $store.state.user.name }} -->
                </li>
                <!-- <li>                    
                    <img class="yk-user-ico" src="static/icon/logout.png">
                    <div class="yk-user-title" title="退出登录" @click="logoutClick">退出</div>
                </li> -->
            </ul>           
        </div>
        <div v-if="$store.state.isSubMenu" class="yk-f-right">
            <ul class="yk-nav yk-sub-menu-box yk-sub-menu">                
                <li>
                    <img class="yk-user-ico" src="static/icon/version.png">
                    <div class="yk-user-title">版本v1.0</div>
                </li>
               <li>                    
                    <img class="yk-user-ico" src="static/icon/logout.png">
                    <div class="yk-user-title" title="退出登录" @click="logoutClick">退出</div>
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
import SessionUtils from '@/store/session.js'

export default {
    data(){
        return {
            name: 'Header',
            isSubMenu: false,
        }
    },
    methods: {
        logoutClick(){
            
            this.$router.push('/login');
            
            SessionUtils.deleteItem('login');
        },
        showSubMenu(){
            let bool = !this.$store.state.isSubMenu;           
            
            this.$store.dispatch('showSubMenu',bool);
        }
    },
   
    
    mounted(){
        
    },
    beforeDestroy(){

    },
}
</script>
<style scoped>
    .yk-menu-box{
        height: 60px;
        /* width: calc(100% - 240px); */
        margin-left: 240px;
        line-height: 60px;
        /* background: #FFF; */
        border: 0;
        color: #999;
        background:#000;
    }
    
    .yk-user-title{
        display: inline-block;
        line-height:60px;
    }
    
    .yk-user-ico{
        margin-top: 13px;
        margin-right: 10px;
        width: 35px;
    }
    .yk-btn-logout{
        cursor: pointer;
        /* color: #00c1de; */
        height: 55px;
        line-height: 55px;
    }
    .yk-btn-logout:hover{
        color: #33CDE5;
        /* color: #30A5FF; */
    }
    .yk-nav li{
        display: inline-block;
        vertical-align: top;
        width: 120px;
        height: 30px;
        line-height: 30px;
        text-align: center;
        cursor: pointer;
        color: #475669;
        font-size: 16px;
        text-align: left;

        /* border-left: 1px solid #00C1DE;
        border-right: 1px solid #00C1DE; */
    }
    .yk-nav li:hover{
        background: rgb(232, 232, 233);
        /* background: #F4F8FC; */
    }

    .yk-border0{
        border: 0!important;
    }

    .yk-sub-menu-box{
        top: 30px;
        right: 0px;
        position: absolute;
        width: 120px;
        z-index: 9999;
        
    }
    .yk-sub-menu{
        margin-top: 25px;
        background: #f6f8fa;
    }
    .yk-sub-menu li{
        display: block;
        float:right;
        /* vertical-align: top; */
        width: 120px;
        height: 30px;
        line-height: 30px;
        text-align: center;
        cursor: pointer;
        color: #475669;
        font-size: 14px;
        text-align: left;
    }
    .yk-sub-menu li:hover{
        background: rgb(232, 232, 233);
    }
    .yk-sub-menu li{
        /* border: 1px solid #5DBDFF; */
        border-left: 1px solid #e3e8e9;
        border-right: 1px solid #e3e8e9;
        border-bottom: 1px solid #e3e8e9;
        /* border-left: 1px solid #00C1DE;
        border-right: 1px solid #00C1DE;
        border-bottom: 1px solid #00C1DE; */
    }
    .yk-sub-menu li:first-child{
        border-top: 1px solid #e3e8e9;
    }
    .yk-sub-menu li:last-child{
        /* border-bottom: 1px solid #5DBDFF; */
    }
</style>


