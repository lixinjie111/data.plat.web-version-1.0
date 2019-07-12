<template>
    <div class="yk-menu-box">
        <div class="yk-logo">
            
            <img src="@/assets/images/logo-2.png">
            <!-- <span>国家运营平台 v2.0</span> -->
            运营管理平台
            <sub>v1.0</sub>
        </div>
        <ul class="yk-menu-ul yk-menu-ul-xm yk-menu-ul-sm yk-menu-ul-md yk-menu-ul-lg">
            <!-- :class="{'yk-menu-selected': item.isCheck}" -->
            <li v-for="(item,index) in navList" :key="index" :class="item.css">
                <a @click="navClick(item);">
                    <span>{{ item.name }}</span>
                </a>
            </li>
        </ul>
        <div class="yk-user-info yk-user-info-xm yk-user-info-sm yk-user-info-lg">
            <span>当前用户：国家运营平台</span>
            <a>退出</a>
        </div>
    </div>
</template>
<script>
export default {
    data(){
        return {
            name: 'Header',
            navList: [
                
            ],
        }
    },
    methods: {
         navClick(value){
            this.$router.push({path: value.path});
            this.initUIByURL(value);
        },
        
        initUIByURL(value){
            if(value.path == '/cfgManage'){
                this.initUI({id: 1});
                return;
            }
            for(let i=0;i<this.navList.length;i++){
                let temp = this.navList[i];
                temp.css = temp.path == value.path ? 'yk-menu-selected' : '';
                temp.isCheck = temp.path == value.path;
            }
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
        background: #080808;
        /* background: #1A2732; */
        /* background: #09192A; */
        /* background: #1A1A1A; */
        height: 64px;
    }
    .yk-logo{
        left: 0px;
        top: 0px;
        position:absolute;
        width: 260px;
        height: 64px;
        line-height: 64px;
        padding-right: 10px;
        padding-left: 10px;
        vertical-align: middle;
        color: #ffffff;
        font-family: 'MicrosoftYaHei';
        /* font-size: 14px; */
        font-size: 22px;
        font-weight: 100;
    }
    .yk-logo img{
        /* height: 64px; */
        /* line-height: 64px; */
        margin-top: 16px;
        /* margin-right: 5px; */
    }
    
    
    .yk-menu-selected{
        border-bottom: 2px solid #37B6E6!important;
        color: #37B6E6!important;
    }
    .yk-menu-selected a span{
        color: #37B6E6!important;
    }

    .yk-menu-ul{
        top: 0px;
        left: 280px;
        right: 210px;
        position:absolute;
        height: 64px;
        margin: 0px;
        padding: 0px;
        display: inline-block;
        text-align: center;
    }
    .yk-menu-ul li{
        margin: 0px;
        /* padding:0px 5px; */
        height:62px;
        line-height:62px;
        vertical-align: middle;    
        display: inline-block;
        cursor: pointer;
    }
    .yk-menu-ul li:hover{
        border-bottom:2px solid #5aaaeb!important;
        color:#5aaaeb;
        /* background: #ccd; */
    }
    .yk-menu-ul li a{
        color:#ffffff!important;
        text-decoration-line: none!important;
    }
    .yk-menu-ul li a:hover{
        color:#37B6E6!important;
        /* text-decoration-line: 2px solid #37B6E6!important; */
        /* background: #acd; */
    }

    .yk-user-info{
        display: block; 
        float: right;
        width: 210px;
        padding-right: 10px;
        height: 64px;
        color: #ffffff;
        font-family: 'MicrosoftYaHei';
        font-size: 12px;
        text-align: right;
    }
    .yk-user-info span,a{
        display: inline-block;
        height: 64px;
        line-height: 64px;
        vertical-align: bottom;
    }
    
</style>


