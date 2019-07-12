<template>
    <div id="header">
        <div class="logo">
            <img src="static/images/logo.png" class="logo-img c-vertical-middle"/>
            <em class="name c-vertical-middle">运营管理后台</em>
        </div>
        <div class="userinfo">
            <el-dropdown trigger="hover">
                <span class="el-dropdown-link userinfo-inner">
                    <i class="icon iconfont el-icon-mc-yonghuzhongxin_f c-vertical-middle"></i>
                    <em class="name c-vertical-middle">admin2</em>
                </span>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item divided @click.native="logoutClick">登出</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
    </div>
</template>
<script>
import SessionUtils from '@/store/session.js'

export default {
    data(){
        return {
            name: 'Header'
        }
    },
    methods: {
        logoutClick(){
            
            this.$router.push('/login');
            
            SessionUtils.deleteItem('login');
        }
    },
   
    
    mounted(){
        
    },
    beforeDestroy(){

    },
}
</script>
<style lang="scss" scoped>
@import "@/assets/scss/theme.scss";
#header {
    background: #1a1d20;
    position: relative;
    padding: 11px 20px;
    height: 28px;
    @include layoutMode(between);
    .userinfo {
        .userinfo-inner {
            cursor: pointer;
            color: #999;
            .icon {
                font-size: 28px;
                line-height: 28px;
                margin-right: 10px;
            }
        }
    }
    .logo {
        overflow: hidden;
        .logo-img {
            height: 25px;
            margin-right: 10px;
        }
        .name {
            font-size: 20px;
            line-height: 28px;
            color: #fff;
            opacity: 0;
        }
    }
}
</style>


