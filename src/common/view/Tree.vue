<template>
 <!-- :class="tree.css" -->
    <div class="yk-tree yk-tree-normal">
        <!-- <div class="yk-tree-header" :class="tree.css">
            <span v-if="tree.isShow" class="oi yk-pointer" data-glyph="arrow-thick-left" title="收起菜单" aria-hidden="true" @click="showTree(false);"></span>
            <span v-if="!tree.isShow" class="oi yk-pointer" data-glyph="arrow-thick-right" title="展开菜单" aria-hidden="true" @click="showTree(true);"></span>
        </div> -->
        <!-- 一级菜单 -->
        <div class="yk-tree-body">
            <ul>
                <li v-for="(item,index) in menuList" :key="index" :class="item.css" @click="menuClick(item);" :title="item.name">                
                    <div class="yk-tree-item" :class="tree.paddingCss">
                        
                        <!-- caret-bottom caret-top -->
                        <span v-if="item.children && item.children.length > 0 && !item.isCheck" class="oi yk-ico yk-right" data-glyph="plus" title="展开" aria-hidden="true" @click="showSub(item,true);"></span>
                        <span v-if="item.children && item.children.length > 0 && item.isCheck" class="oi yk-ico yk-right" data-glyph="minus" title="收起" aria-hidden="true" @click="showSub(item,false);"></span>
                        
                        <span class="oi yk-ico" :class="tree.icoCss" :data-glyph="item.ico" :title="item.name" aria-hidden="true"></span>
                        
                        <div v-if="tree.isShow" class="yk-block">
                            <label>                                
                                <input v-if="!item.children || !item.children.length" type="checkbox">
                                {{ item.name }}
                            </label>                            
                            <!-- <span v-if="item.children && item.children.length > 0 && !item.isCheck" class="oi yk-ico yk-right" data-glyph="plus" title="展开" aria-hidden="true" @click="showSub(item,true);"></span>
                            <span v-if="item.children && item.children.length > 0 && item.isCheck" class="oi yk-ico yk-right" data-glyph="minus" title="收起" aria-hidden="true" @click="showSub(item,false);"></span> -->
                        </div>
                    </div>
                    <!-- 二级菜单 -->
                    <div v-if="tree.isShow && item.children && item.children.length > 0 && item.isCheck" class="yk-tree-sub">
                        <ul>
                            <li v-for="(sub,subIndex) in item.children" :key="subIndex" :class="sub.css" @click="menuClick(sub);">
                                <div class="yk-tree-item">
                                    <div class="yk-tree-sub-item">
                                        <label>                                            
                                            <input v-if="!sub.operations || !sub.operations.length" type="checkbox">
                                            {{ sub.name }}
                                        </label>                                        
                                        <span v-if="sub.operations && sub.operations.length > 0 && !sub.isCheck" class="oi yk-ico yk-right" data-glyph="plus" title="展开" aria-hidden="true" @click="showSub(sub,true);"></span>
                                        <span v-if="sub.operations && sub.operations.length > 0 && sub.isCheck" class="oi yk-ico yk-right" data-glyph="minus" title="收起" aria-hidden="true" @click="showSub(sub,false);"></span>
                                    </div>
                                </div>

                                <!-- 权限列表 -->
                                <div v-if="sub.operations && sub.operations.length > 0 && sub.isCheck" class="yk-tree-ssub">
                                    <ul>
                                        <li v-for="(ssub,ssubIndex) in sub.operations" :key="ssubIndex" :class="ssub.css" @click="menuClick(ssub);">
                                            <div class="yk-tree-item">
                                                <div class="yk-tree-ssub-item">
                                                    <label>                                                        
                                                        <input type="checkbox">
                                                        {{ ssub.name }}
                                                    </label>                                                    
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <!-- 权限列表 -->
                    <div v-if="tree.isShow && item.operations && item.operations.length > 0 && item.isCheck" class="yk-tree-sub">
                        <ul>
                            <li v-for="(sub,subIndex) in item.operations" :key="subIndex" :class="sub.css" @click="menuClick(sub);">
                                <div class="yk-tree-item">
                                    <div class="yk-tree-sub-item">
                                        <label>                                            
                                            <input type="checkbox">
                                            {{ sub.name }}
                                        </label>                                                                                
                                    </div>
                                </div>                                
                            </li>
                        </ul>
                    </div>
                </li>
            </ul>
        </div>        
    </div>
</template>
<script>

import MenuList from '@/assets/manage-menu.json'
// import MenuList from '@/assets/menu.json'
import { Utils } from '@/common/utils/utils.js'
import TList from '@/common/utils/list.js'

export default {
    name: 'Tree',
    props: ['data','selectData'],
    data(){
        return {
            tree: {
                isShow: true,
                css: 'yk-tree-normal',
                icoCss: 'yk-tree-ico',
                paddingCss: 'yk-tree-pad',
            },
            menuList: [],
            selectList: [],
        }
    },
    watch: {
        'data' : function(data){
            this.menuList = data;
        },
        'selectData' : function(data){
            this.selectList = data;            
            this.initSelect();
        }
    },    
    methods: {
        init(){
            this.initUI(null,this.data);
        },
        initSelect(){
            for(let i=0;i<this.selectList.length;i++){
                let item = this.selectList[i];
                // console.log('11111111111111 ------------- item ' + item.id + ' name = ' + item.name)
                for(let j=0;j<this.menuList.length;j++){
                    let item2 = this.menuList[j];
                    // console.log('222222222222222 ------------- item2 ' + item2.id + ' name = ' + item2.name)
                    if(item2.operations){
                        for(let k=0;k<item2.operations;k++){
                            let item3 = item2.operations[k];
                            // console.log('333333333333333333 item3 ----------- ' + item3.id + ' name = ' + item3.name + ' --------- item : ' + item.id);
                            if(item3.id == item.id){
                                item3.isCheck = true;
                            }
                        }
                    }

                    if(item2.children){
                        for(let v=0;v<item2.children.length;v++){
                            let item4 = item2.children[v];
                            // console.log('44444444444444444 item3 ----------- ' + item4.id + ' name = ' + item4.name + ' --------- item : ' + item.id);
                            if(item4.operations){
                                for(let x=0;x<item4.operations.length;x++){
                                    let item5 = item4.operations[x];
                                    console.log('5555555555555555 item5 ----------- ' + item5.id + ' name = ' + item5.name + ' --------- item : ' + item.id);
                                    if(item4.id == item.id){
                                        item4.isCheck = true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        initUI(item,list){
            for(let i=0;i<list.length;i++){
                const temp = list[i];
                const bool = item.id == temp.id;
                // temp.css = bool ? 'yk-tree-li-selected' : 'yk-tree-li';
                temp.css = 'yk-tree-li';
                
                if(!bool){
                    if(temp.children && temp.children.length > 0){
                        this.initUI(item,temp.children);
                    }

                    if(temp.operations && temp.operations.length > 0){
                        this.initUI(item,temp.operations);
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

            }else{
                // item.css = 'yk-tree-li-selected';
                this.initUI(item,this.menuList);                
            }            
        },
        showSub(item,type){
            item.isCheck = type;
        },
        
    },
    created(){        
        
    },
    mounted(){
        this.tree.ishow = true;    
        
        window.onload = () =>{            
            let url = window.location.pathname;
            Utils.setMenuByPath(url);            
        }

        // this.menuList = TList.copyList(MenuList);
    },
    
    beforeDestroy(){

    },
    
    
}
</script>
<style scoped>
    
    .yk-tree{        
        font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;        
        overflow-y: auto;
        height: 100%;        
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
        border-bottom: 1px solid #F1F4F7;        
    }
    .yk-txt-right{
        text-align: right;
    }
    .yk-txt-left{
        text-align: left;
    }
    .yk-tree-body{
        border-bottom: 1px solid #F1F4F7;
    }
    .yk-tree-body ul{
        list-style: none;
        margin: 0px;
        padding: 0px;
    }
    .yk-tree-body ul > li{
        border-bottom: 1px solid #eee6e0;
    }
    .yk-tree-body ul > li:last-child{
        border-bottom: 0px;
    }
    .yk-tree-item{
        font-size: 13px;
        height: 40px;
        line-height: 40px;        
        cursor: pointer;
    }
    .yk-tree-pad{
        padding: 0px 10px;
    }
    .yk-tree-pad-min{
        padding: 15px 15px;        
    }
    .yk-tree-sub-item{
        font-size: 13px;
        padding-left: 35px;
    }
    .yk-tree-ssub-item{
        font-size: 13px;
        padding-left: 50px;
    }    
    .yk-tree-li{        
        border-bottom: 1px solid rgb(236, 94, 11);        
    }
    .yk-tree-li:last-child{
        border-bottom: 0px;
    }
    .yk-tree-li:hover{
        background: #E9ECF2;
    }
    .yk-tree-li-selected{
        color: #2b2a35!important;
        background: rgb(176, 176, 177);        
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
        border-bottom: 1px solid rgb(216, 223, 224);
    }
    .yk-tree-sub ul li:hover{
        background: rgb(217, 218, 222);
    }
    .yk-tree-sub ul li:last-child{
        border-bottom: 0px;
    }
    .yk-tree-ssub{        
        background: #f1f7ef;        
    }
    .yk-tree-ssub ul{
        list-style: none;
        padding: 0px;
        margin: 0px;
    }    
    .yk-tree-ssub ul li{        
       border-bottom: 1px solid rgb(218, 214, 212);
    }
    .yk-tree-ssub ul li:hover{
        background: rgb(233, 233, 238);
    }
    .yk-tree-ssub ul li:last-child{
        border-bottom: 0px;
    }    
    .yk-195{
        width: 195px;
    }
    
</style>

