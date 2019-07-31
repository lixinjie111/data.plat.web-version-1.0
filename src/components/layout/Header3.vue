<template>
    <div id="header">
        <div class="logo">
            <img src="static/images/logo.png" class="logo-img"/>
            <!-- <em class="name">数据管理平台</em> -->
        </div>
        <div class="userinfo">
            <el-dropdown trigger="hover">
                <span class="el-dropdown-link userinfo-inner">
                    <i class="icon iconfont el-icon-mc-yonghuzhongxin_f c-vertical-middle"></i>
                    <em class="name c-vertical-middle">{{$store.state.user.name}}</em>
                </span>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item divided>版本v1.1</el-dropdown-item>
                    <el-dropdown-item divided @click.native="resetPassword">修改密码</el-dropdown-item>
                    <el-dropdown-item divided @click.native="logoutClick">登出</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
        <dialog-reset-password v-if="dialogResetPasswordFlag" @cancleFunc="cancleFunc"></dialog-reset-password>
    </div>
</template>
<script>
import {requestLogout} from '@/api/login'
import SessionUtils from '@/store/session.js'
import DialogResetPassword from "./components/resetPassword.vue";
export default {
    components: {
        DialogResetPassword
    },
    data(){
        return {
            name: 'Header',
            dialogResetPasswordFlag: false,
        }
    },
    methods: {
        logoutClick(){
            let token = SessionUtils.getItem('login').token;
            requestLogout({
                token:token
            }).then(res => {
                if(res.status == '200'){
                    this.$router.push('/login');
                    this.$store.dispatch('logout');
                    SessionUtils.deleteItem('login');
                }
            });
        },
        resetPassword(){ 
            this.dialogResetPasswordFlag = true;
        },
        cancleFunc() {
            this.dialogResetPasswordFlag = false;
        },
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
        @include layoutMode(align);
        .logo-img {
            height: 26px;
            margin-right: 10px;
        }
        .name {
            font-size: 24px;
            line-height: 28px;
            color: #fff;
            letter-spacing: 3px;
        }
    }
}
</style>


