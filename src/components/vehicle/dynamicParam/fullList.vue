<template>
<div id='lists'>
    <div class="yk-panel-box yk-bgcolor-white">
        <el-form :inline="true" :model="searchKey" :rules="rules" ref="searchForm" size='small' class="demo-form-inline">
            <el-form-item label="SID:" prop='sid'>
                <el-input v-model.trim="searchKey.sid"></el-input>
            </el-form-item>
            <el-form-item label="英文名称:">
                <el-input v-model.trim="searchKey.enName"></el-input>
            </el-form-item>
            <el-form-item label="中文名称:">
                <el-input v-model.trim="searchKey.chName"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" :loading="searchLoading" @click="searchClick('searchKey')">查询</el-button>
                <el-button type="primary" @click="resetClick()">重置</el-button>
            </el-form-item>
        </el-form>
        <!-- <div class="yk-search-box">                
                
                <div class="yk-search-block">
                    <label class="yk-w-40">SID</label>
                    <input class="yk-input  " v-model.trim="searchKey.sid">
                    <label title="必填" class="yk-form-tip">*</label>
                </div>

                <div class="yk-search-block">
                    <label class="yk-w-68">英文名称: </label>
                    <input class="yk-input" v-model.trim="searchKey.enName">
                </div>  

                <div class="yk-search-block">
                    <label class="yk-w-68">中文名称: </label>
                    <input class="yk-input" v-model.trim="searchKey.chName">
                </div>                
 
                <div class="yk-search-block">
                    <span class="yk-btn yk-btn-gap" @click="searchClick();">查询</span>
                    <span class="yk-btn" @click="resetClick();">重置</span>
                </div>                
        </div> -->
        <el-table :data="dataList" class='c-mt-10' v-loading="loading" @selection-change="handleSelectionChange" stripe>
            <el-table-column align="center" type="selection"></el-table-column>
            <el-table-column align="center" prop="sid" label="SID"></el-table-column>
            <el-table-column align="center" prop="name" label="英文名称"></el-table-column>
            <el-table-column align="center" prop="longidentifier" label="中文名称"></el-table-column>
            <el-table-column align="center" prop="datType" label="类型"></el-table-column>
            <el-table-column align="center" prop="description" label="描述"></el-table-column>
        </el-table>
        <!-- <div class="yk-min-300"  id="fullDataTable" style="max-height:240px;overflow-y:auto;">
            <table class="yk-table yk-t-10" >
                <thead>
                    <tr>
                        <th style='width:4%;'>
                           <input type="checkbox" v-model="selector.isAll" @click="selectAll();">
                        </th>
                        <th style="width:6%;">SID</th>
                        <th style="width:27%;">英文名称</th>
                        <th style="width:27%;">中文名称</th>
                        <th style="width:27%;">类型</th>
                        <th style="width:27%;">描述</th>
                    </tr>
                </thead>
                <tbody :style='{"height":(paging.total<=10 ? "auto" : "405px")}'>
                    <tr v-for="(item,index) in dataList" :key=index>
                        <td style='width:4%;'>
                            <input type="checkbox" name='data' v-model="item.isCheck" @click.stop="selectRow(item);">
                        </td>
                        <td style="width:6%;">{{item.sid}}</td>
                        <td style="width:27%;">{{item.name}}</td>
                        <td style="width:27%;">{{item.longidentifier}}</td>
                        <td style="width:27%;">{{item.datType}}</td>
                        <td style="width:26%;">{{item.description}}</td>
                    </tr>
                </tbody>
            </table>
        </div> -->
         <paging class="yk-paging" :hide-size="paging.hideSize" :current-page="paging.index" :total-count="paging.total" @pagingEvent="pagingFn" @PageSizeEvent="pagingSizeFn"></paging>
    </div>
  
</div>   
</template>
<script>
import Paging from '@/common/view/Paging.vue'
import TList from '@/common/utils/list.js'
export default {
    name:'FullList',
    props: ['title','type','data'],
     components: {
        Paging,TList
    },
    data () {
        return {
            searchLoading:false,
            loading:false,
            selector: [],
             current: {
                top: 0,
                height: 100,
            },
            dataList:[],
            searchKey: {
                sid: null,
                enName:'',
                chName:''
            },
            paging: {
                index: 0,
                size: 10,
                total: 0,
            },
            operPlatUrl:'',
            rules:{
                sid:[
                    { required: true, message: 'Sid不能为空!', trigger: 'blur' }
                ],
            },
        }
    },
    methods: {
         init(){
            this.operPlatUrl = window.cfg.operPlatUrl;
            this.initPaging();
            this.initSearch();
            this.initData();         
        },
        initPaging(){
            this.paging.index = 0;
            this.paging.total = 0;
            this.paging.size = 10;
        },
        initSearch(){
            this.searchKey = {
                sid: null,
                enName:'',
                chName:''
            };
        },
        initData(){
            let _this=this;
            // _this.selector.isAll =false;
            // _this.selector.list = [];
            // _this.selector.item= null;
            // _this.searchLoading = true;
            _this.loading = true;
            _this.$api.post(this.operPlatUrl + "vehicleTerminal/remote/findVehicleProperty",{     
                sid:this.searchKey.sid,
                name:this.searchKey.enName,
                longidentifier:this.searchKey.chName,          
                "page":{
                    "pageSize": _this.paging.size,
                    "pageIndex": _this.paging.index
                }
            },response => {
                _this.dataList = response.data.list;
                _this.paging.total = response.data.totalCount;
                let inputs = document.querySelectorAll(".yk-table tbody input");
                inputs.forEach(function(item){
                    item.checked =false;
                });
                _this.searchLoading = false;
                _this.loading = false;
            },error => {
                _this.searchLoading = false;
                _this.loading = false;
            });
        },
        searchClick(){
            this.paging.index = 0;
            this.paging.total = 0;
            this.$refs.searchForm.validate((valid) => {
                if (valid) {
                    this.searchLoading = true;
                   this.initData();
                } else {
                    return false;
                }
            });
        },
        resetClick(){
            this.init();
        },
        handleSelectionChange(val) {
            this.selector = [];
            val.forEach(item => {
                this.selector.push(item.sid);
            });
        },
        // selectAll(){
        //     this.selector.isAll = !this.selector.isAll;
        //     TList.setListProp(this.dataList,'isCheck',this.selector.isAll);
        //     this.selector.list = this.selector.isAll ? TList.copyList(this.dataList) : [];
        //     this.selector.item = null;
        // },
        // selectRow(item){
        //     item.isCheck = !item.isCheck;

        //     let bool = TList.getItemById(this.selector.list,item.id);
        //     if(item.isCheck && !bool){
        //         this.selector.list.push(item);
        //     }else if(!item.isCheck && bool){
        //         TList.deleteItemById(this.selector.list, item.id);
        //     }
        //     this.selector.item = item;
        // },
        // initFullTableHeight(){
        //     let boxHeight = document.body.clientHeight;
        //     this.current.top = document.getElementById('fullDataTable').offsetTop;
        //     this.current.height = boxHeight - this.current.top -  40;     // 页面头部的高度为55  分页的高度为40
        // },
        pagingFn(value){
            this.paging.index = value;
            this.paging.total = 0;
            this.initData();
        },
        pagingSizeFn(value){
            this.paging.size = value;
            this.paging.total = 0;
            this.initData();
        },
    },
}
</script>
