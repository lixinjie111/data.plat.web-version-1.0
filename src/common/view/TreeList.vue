<template>
 <!-- :class="tree.css" -->
    <div class="yk-tree yk-tree-normal">
        <!-- <div class="yk-tree-header" :class="tree.css">
            <span v-if="tree.isShow" class="oi yk-pointer" data-glyph="arrow-thick-left" title="收起菜单" aria-hidden="true" @click="showTree(false);"></span>
            <span v-if="!tree.isShow" class="oi yk-pointer" data-glyph="arrow-thick-right" title="展开菜单" aria-hidden="true" @click="showTree(true);"></span>
        </div> -->

        <ul>
            <li v-for="(item,index) in menuList" :key="index" :class="item.css"  :title="item.name">                
                <div class="yk-tree-item" :class="tree.paddingCss" @click="menuClick(item);">                    
                    <span class="oi yk-ico" :class="item.iconClass" :title="item.name" aria-hidden="true"></span>                        
                    <div v-if="tree.isShow" class="yk-tree-title">
                         <!-- @click="showSub(item,true);" -->
                        <span>  
                            {{ item.name }}
                        </span>
                         <!-- @click="showSub(item,true);" -->
                        <img v-if="item.children && item.children.length > 0 && !item.isCheck"  class="yk-tree-btn" src="static/icon/spread10.png" title="展开">
                         <!-- @click="showSub(item,false);" -->
                        <img v-if="item.children && item.children.length > 0 && item.isCheck"  class="yk-tree-btn" src="static/icon/packup10.png" title="收起">
                    </div>
                </div>
                <div v-if="tree.isShow && item.children && item.children.length > 0 && item.isCheck" class="yk-tree-sub">
                    <ul>
                        <li v-for="(sub,subIndex) in item.children" :key="subIndex" :class="sub.css">
                            <div class="yk-tree-item"  @click="menuClick(sub);">
                                <div class="yk-tree-sub-item">
                                     <!-- @click="showSub(sub,true);" -->
                                    <span>
                                        {{ sub.name }}
                                    </span>
                                     <!-- @click="showSub(sub,true);" -->
                                    <img v-if="sub.children && sub.children.length > 0 && !sub.isCheck" class="yk-tree-btn" src="static/icon/spread10.png" title="展开">
                                     <!-- @click="showSub(sub,false);" -->
                                    <img v-if="sub.children && sub.children.length > 0 && sub.isCheck" class="yk-tree-btn" src="static/icon/packup10.png" title="收起"> 
                                </div>
                            </div>
                            <div v-if="sub.children && sub.children.length > 0 && sub.isCheck" class="yk-tree-ssub">
                                <ul>
                                    <li v-for="(ssub,ssubIndex) in sub.children" :key="ssubIndex" :class="ssub.css">
                                        <div class="yk-tree-item"  @click="menuClick(ssub);">
                                            <div class="yk-tree-ssub-item">
                                                {{ ssub.name }}
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </ul>
                </div>
            </li>
        </ul>
       
    </div>
</template>
<script>
// import MenuList from '@/assets/menu.json'
import MenuList from '@/assets/manage-menu.json'
import { Utils } from '@/common/utils/utils.js'

export default {
    name: 'TreeList',
    data(){
        return {
            tree: {
                isShow: true,
                css: 'yk-tree-normal',
                icoCss: 'yk-tree-ico',
                paddingCss: 'yk-tree-pad',
            },
            menuList: [],
        }
    },
    watch: {
        $route: {
            handler(newVal, oldVal) {
                this.initUI(newVal,this.menuList);
            },
            // 深度观察监听
            deep: true
        }
    },
    methods: {
        initUI(item,list){
            for(let i=0;i<list.length;i++){
                const temp = list[i];
                const bool = item.path == temp.path;
                temp.css = bool ? 'yk-tree-li-selected' : 'yk-tree-li';
                if(!bool){
                    if(temp.children && temp.children.length > 0){                   
                        this.initUI(item,temp.children);
                    }
                }
            }
        },
        showTree(bool){
            this.tree.isShow = bool;
            this.tree.css = bool ? 'yk-txt-left' : 'yk-txt-right';
            this.tree.icoCss = bool ? 'yk-tree-ico' : 'yk-tree-ico-min';
            this.tree.paddingCss = bool ? 'yk-tree-pad' : 'yk-tree-pad-min';

            this.$emit('YkEvtMenuShow',{show: bool});
        },
        menuClick(item){

            if(item.children && item.children.length > 0){
                item.isCheck = !item.isCheck;
            }else{
                item.css = 'yk-tree-li-selected';
                this.initUI(item,this.menuList);
                this.$router.push(item.path);
            }            
        },
        showSub(item,type){
            // item.isCheck = type;
            item.isCheck = !item.isCheck;
        },
        
        initMenu(){
            let url = window.location.hash;
            // let url = window.location.pathname;
            url = url.slice(1);
            Utils.setMenuByPath(url);
        }
    },
    created(){        
        
    },
    mounted(){
        this.tree.ishow = true;    
                
        this.initMenu();
        window.onload = () =>{            
          this.initMenu();           
        }

        this.menuList = MenuList;
    },
    
    beforeDestroy(){

    },
    
    
}
</script>
<style lang="scss" scoped>
@import "@/assets/scss/theme.scss";
    .yk-tree{        
        font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;        
        color: #B4CAEE;        
    }
    .yk-tree-normal{        
        font-size: 14px;
        
    }
    .yk-tree-min{
        width: 50px;
        font-size: 18px;

        transition: width 0.2s;
        -moz-transition: width 0.2s;
        -o-transition: width 0.2s;
        -webkit-transition: width 0.2s;
    }
    .yk-tree-ico{        
        font-size: 12px;
    }
    .yk-tree-ico-min{
        font-size: 22px;
    }
    .yk-tree-header{
        height: 30px;
        border-bottom: 1px solid #001938;
    }

    .yk-txt-right{
        text-align: right;
    }
    .yk-txt-left{
        text-align: left;
    }

    .yk-tree-body{
        width: 100%;
        height: 100%;
        border-bottom: 1px solid #001938;
        background: #032757;
        position: relative;
        overflow: hidden;
    }
    .yk-tree-body ul{
        list-style: none;
        margin: 0px;
        padding: 0px;
    }
    .yk-tree-body ul > li{
        background: #35404F;
    }

    .yk-tree-title {
        position: absolute;
        right: 0;
        bottom: 0;
        left: 37px;
        top: 0;
    }
    .yk-tree-item{
        font-size: 15px;
        height: 48px;
        line-height: 48px;
        cursor: pointer;
    }
    .yk-tree-pad{
        position: relative;
        padding: 0px 0px 0px 20px;
    }
    .yk-tree-pad-min{
        padding: 15px 15px;
        
    }
    .yk-tree-sub-item{
        padding-left: 40px;
    }
    .yk-tree-ssub-item{
        font-size: 13px;
        padding-left: 60px;
    }
    
    .yk-tree-li{        
       
        border-bottom: 1px solid #101113;
        
        background: #21272F;
        color: #7C7C7D;
        font-family: 'MicrosoftYaHei';
    }
    .yk-tree-li-selected{
        color: #F49308!important;
        border-right: 3px solid #F49308;
        
    }
    .yk-tree-li-selected .icon-home{
        background-image:url(../../assets/icon/home-on.png);
    }
    .yk-tree-sub{
        background: #101113;
    }
    .yk-tree-sub ul{
        list-style: none;
        margin: 0px;
        padding: 0px;
    }
    .yk-tree-sub ul li{
        background: #101113;
        border-bottom: 1px solid #000000;
    }
    .yk-tree-sub ul li:hover{
        color: #fff;
    }
    .yk-tree-sub ul li:last-child{
        border-bottom: 0px;
    }

    .yk-tree-ssub{
        background: #2B2F32;
    }
    .yk-tree-ssub ul{
        list-style: none;
        padding: 0px;
        margin: 0px;
    }
    
    .yk-tree-ssub ul li:hover{
        color: #fff;
    }

    .yk-tree-btn{
        float: right;
        margin-right: 10px;
        margin-top: 20px;
        cursor: pointer;
    }
    
    .yk-ico{
        width: 12px;
        height:16px;
        position:absolute;
        top:50%;
        left:20px;
        margin-top: -8px;
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center center;
    }
    .icon-home{
        background-image:url(../../assets/icon/home.png);
    }
    .icon-device{
        background-image:url(../../assets/icon/cl.png);
    }
    .icon-video{
        background-image:url(../../assets/icon/cz.png);
    }
    .icon-roadside{
        background-image:url(../../assets/icon/roadside.png);
    }
    .icon-v2x{
        background-image:url(../../assets/icon/vx.png);
    }
    .icon-platform{
        background-image:url(../../assets/icon/platform.png);
    }
    .icon-system{
        background-image:url(../../assets/icon/sys.png);
    }
    
</style>

