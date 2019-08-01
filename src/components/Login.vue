<template>
    <div class="yk-box yk-login-box yk-center">
        <div class="yk-middle-box">
            <div class="yk-middle">
                <div class="yk-login">            
                    <form>
                        <div class="yk-form-group yk-login-header yk-center">                    
                            <div class="yk-logo-img-box">
                                <img class="yk-margin-left-30" src="static/images/login-logo.png">                                
                            </div>
                            <div class="yk-title">
                                智能网联汽车数据管理平台
                            </div>
                        </div>
                        <div class="yk-form-group">
                            <span class="yk-input-title">用户名：</span>
                            <input class="yk-login-input yk-margin-10 yk-margin-top-20" autocomplete="off" v-model='user.name' placeholder="请输入用户名">
                        </div>
                        <div class="yk-form-group yk-border-bottom ">
                            <span class="yk-input-title">密&nbsp;&nbsp;&nbsp;码：</span>
                            <input class="yk-login-input yk-margin-10 yk-margin-bottom-20" type="password" autocomplete="off" v-model='user.pass' placeholder="请输入密码" @keyup.enter="loginClick">
                        </div>
                        <div class="yk-form-group yk-center">
                            <span class="yk-btn-login yk-margin-10 yk-margin-top-20" @click="loginClick">登录</span>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { mapActions } from 'vuex';
import {requestLogin} from '@/api/login'
import SessionUtils from '@/store/session.js'

export default {
    name: 'Login',
    data(){
        return {
            user: {
                name: '',
                pass: '',
            }
        }
    },
    methods:{
        loginClick(){
            //跳过登陆直接进入系统
            // this.$router.push('/main');
            // let temp = {
            //     name: 'admin',
            //     pass: 123456
            // }
            // SessionUtils.setItem('login',temp);
            
            if(!this.user || !this.user.name || !this.user.pass) return;
            requestLogin({
                "userNo": this.user.name, 
                "password": this.user.pass, 
                "platform": "20000"
            }).then(res => {
                if(res.status == '200'){
                    let temp = res.data;
                    SessionUtils.setItem('login',temp);
                    this.$router.push('/home');
                    this.$message.success(res.message);
                }
            })
            
        },
    },
    mounted(){

    },
    destroyed(){

    },
}
</script>
<style scoped>    
    
    .yk-btn-login{
        width: 260px;
        display: inline-block;
        padding: 6px 12px;
        margin-bottom: 0;
        font-size: 14px;
        font-weight: 400;
        line-height: 1.42857143;
        text-align: center;
        white-space: nowrap;
        vertical-align: middle;
        cursor: pointer;
        background: #00c1de;
        border-color: #00c1de; 
        /* background-color: #67bcfd; */               
        /* border-color: #67bcfd;         */
        color: #fff;
        border-radius: 3px;
        user-select: none;
        background-image: none;
        border: 1px solid transparent;
        border-radius: 4px;
    }
    .yk-btn-login:hover{
        background: #33CDE5;
        /* opacity: 0.8; */
    }
    .yk-login-input{
        background: transparent;        
        border: 1px solid #eee;
        box-shadow: none;        
        padding: 6px 12px;
        font-size: 14px;
        line-height: 1.42857143;
        color:#fff;        
        background-image: none;
        border: 1px solid #585757;        
        border-radius: 4px;
        -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075);
        box-shadow: inset 0 1px 1px rgba(0,0,0,.075);
        -webkit-transition: border-color ease-in-out .15s,-webkit-box-shadow ease-in-out .15s;
        -o-transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;
        transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;
    }
    /* .yk-login-input::placeholder{
        /* color: #a5c8e4; */
        /* color: rgb(157, 223, 243); */
    /*} */
    .yk-form-group {
        display: inline-block;
        width: 100%;
        
    }
    .yk-login-header{        
        border-bottom: 1px dashed #545350;        
        font-family: 'MicrosoftYaHei';
        font-size: 30px;
        font-weight: 100;        
    }
    .yk-login-header div{
        height: 46px;
        line-height: 46px;        
        letter-spacing: 5px;
    }
    .yk-logo-img-box{
        text-align:left;
        margin-top:10px;
    }
    .yk-margin-10{
        margin: 10px;
    }
    .yk-margin-top-20{
        margin-top: 20px;
    }
    .yk-margin-right-30{
        margin-right: 20px;
    }
    .yk-margin-right-50{
        margin-right: 50px;
    }
    .yk-margin-bottom-20{
        margin-bottom: 20px;
    }
    .yk-margin-left-30{
        // margin-left:30px;
        margin: 0 auto;
    }
    .yk-input-title{
        user-select: none;        
    }
    .yk-border-bottom{
        border-bottom: 1px dashed #545350;        
    }
    .yk-title{
        margin-bottom:10px;
        user-select: none;
    }
</style>


