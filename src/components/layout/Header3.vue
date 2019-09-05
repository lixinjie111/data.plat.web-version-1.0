<template>
    <div id="header">
        <div class="logo">
            <img src="static/images/logo.png" class="logo-img"/>
            <!-- <em class="name">运营管理平台</em> -->
        </div>

        <div class="userinfo">
            <el-dropdown trigger="hover">
                <span class="el-dropdown-link userinfo-inner">
                    <i class="icon iconfont el-icon-mc-yonghuzhongxin_f c-vertical-middle"></i>
                    <em class="name c-vertical-middle">{{loginInfo.userNo}}</em>
                </span>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item divided>版本v1.0</el-dropdown-item>
                    <el-dropdown-item divided @click.native="resetPassword">修改密码</el-dropdown-item>
                    <el-dropdown-item divided @click.native="logoutClick">退出</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
        <dialog-reset-password v-if="dialogResetPasswordFlag" @cancleFunc="cancleFunc"></dialog-reset-password>
    </div>
</template>
<script>

import SessionUtils from '@/store/session.js'
import { requestLogout } from '@/api/login/index'
import DialogResetPassword from "./components/resetPassword.vue";
export default {
    components: {
        DialogResetPassword
    },
    data(){
        return {
            loginInfo: JSON.parse(SessionUtils.getItem('login')),
            name: 'Header',
            isSubMenu: false,
            userName:'',
            dialogResetPasswordFlag: false,
        }
    },
    mounted(){
        console.log(JSON.parse(SessionUtils.getItem('login')));
    },
    methods: {
        logoutClick(){
            requestLogout({
                token: this.loginInfo.token
            }).then(res => {
                if(res.status == '200'){
                    this.$router.push('/login');
                    this.$store.dispatch('logout');
                    localStorage.removeItem("yk-token");
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
    }
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


