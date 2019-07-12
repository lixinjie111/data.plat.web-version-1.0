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
                    <div v-if="tree.isShow" class="yk-block yk-160">
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
    methods: {
        initUI(item,list){
            for(let i=0;i<list.length;i++){
                const temp = list[i];
                const bool = item.id == temp.id;
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
<style scoped>
    
    .yk-tree{        
        /* font-family: 'MicrosoftYaHei'; */
        font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;        
        color: #999;        
    }
    .yk-tree-normal{        
        font-size: 16px;   
        margin-bottom: 10px; 
        
        /* transition: width 0.2s;
        -moz-transition: width 0.2s;
        -o-transition: width 0.2s;
        -webkit-transition: width 0.2s; */
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
        margin-right: 5px;
    }
    .yk-tree-ico-min{
        font-size: 22px;
    }
    .yk-tree-header{
        height: 30px;
        border-bottom: 1px solid #56585a;        
        /* border-bottom: 1px solid #F1F4F7;         */
        /* padding-right: 10px; */
        /* color: #30A5FF; */
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
        border-bottom: 1px solid #56585a;
        /* border-bottom: 1px solid #F1F4F7; */
        background: #373D41;
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
    .yk-tree-item{
        font-size: 16px;
        height: 50px;
        line-height: 50px;
        cursor: pointer;
        position: relative;
    }
    .yk-tree-pad{
        padding: 0px 0px 0px 62px;
    }
    .yk-tree-pad-min{
        padding: 15px 15px;
        
    }
    .yk-tree-sub-item{
        padding-left: 62px;
    }
    .yk-tree-ssub-item{
        font-size: 13px;
        padding-left: 60px;
    }
    
    .yk-tree-li{        
        /* color: #30A5FF; */
        /* color: #fff; */
        border-bottom: 1px solid #0b1119;
        /* border-bottom: 1px solid #F1F4F7; */
    }
    .yk-tree-li:last-child{
        border-bottom: 0px;
    }
    .yk-tree-li:hover{
        /* background: #2B2F32; */
        /* background: #E9ECF2; */
        /* color: #fff; */
    }
    .yk-tree-li-selected{
        color: #f59307!important;
        border-right:4px solid #f59307 !important;
        /* background: #00c1de!important; */
        /* color: #ffffff!important;
        background: rgb(31, 30, 30)!important; */
        /* background: rgb(15, 15, 15); */
        /* background: #30A5FF; */
    }

    .yk-tree-sub{
        background: #f9f9f9;
    }
    .yk-tree-sub ul{
        list-style: none;
        margin: 0px;
        padding: 0px;
    }
    .yk-tree-sub ul li{
        background: #101113;
        /* background: #2B2F32; */
        /* color: #fff; */
        border-bottom: 1px solid #56585a;
        /* border-bottom: 1px solid rgb(215, 240, 247); */
    }
    .yk-tree-sub ul li:hover{
        color: #fff;
        /* background: #272727; */
    }
    .yk-tree-sub ul li:last-child{
        border-bottom: 0px;
    }

    .yk-tree-ssub{
        /* background: #f9f9f9; */
        /* color: #fff; */
        background: #2B2F32;
    }
    .yk-tree-ssub ul{
        list-style: none;
        padding: 0px;
        margin: 0px;
    }
    
    .yk-tree-ssub ul li:hover{
        color: #fff;
        /* background: rgb(31, 30, 30); */
    }

    .yk-160{
        width: 160px;
    }

    .yk-tree-btn{
        width: 17px;
        float: right;
        margin-right: 10px;
        margin-top: 14px;
        cursor: pointer;
    }
    .yk-ico{
        width:20px;
        height:22px;
        position:absolute;
        top:50%;
        left:33px;
        margin-top:-11px;
        background-repeat: no-repeat;
        background-position: center center;
    }
    .icon-home{
        background:url(../../assets/icon/home.png);
    }
    .icon-device{
        background:url(../../assets/icon/cl.png);
    }
    .icon-video{
        background:url(../../assets/icon/cz.png);
    }
    .icon-roadside{
        background:url(../../assets/icon/roadside.png);
    }
    .icon-v2x{
        background:url(../../assets/icon/vx.png);
    }
    .icon-platform{
        background:url(../../assets/icon/platform.png);
    }
    .icon-system{
        background:url(../../assets/icon/sys.png);
    }
    
</style>

