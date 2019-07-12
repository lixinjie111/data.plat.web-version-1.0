<template>
    <div id="header">
        <div class="logo">
            <img src="static/images/logo.png" class="logo-img"/>
            <!-- <em class="name c-vertical-middle">管理后台</em> -->
        </div>
        <div class="userinfo">
            <el-dropdown trigger="hover">
                <span class="el-dropdown-link userinfo-inner">
                    <img src="static/icon/user.png" class="user-img"/>
                    <em class="name c-vertical-top">admin2</em>
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
    background: #000;
    color: #999;
    position: relative;
    padding: 12px 28px 12px 25px;
    height: 36px;
    @include layoutMode(between);
    .userinfo {
        .userinfo-inner {
            cursor: pointer;
            @include layoutMode(both);
            .user-img {
                width: 36px;
                height: 36px;
                margin-right: 10px;
            }
        }
    }
    .logo {
        .logo-img {
            height: 27px;
            margin-right: 10px;
            margin-top: 5px;
        }
        .name {
            font-size: 22px;
        }
    }
}
</style>


