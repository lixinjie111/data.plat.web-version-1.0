<template>
<div id='groups'>
    <div class="yk-panel-box yk-bgcolor-white">
        <el-form :inline="true" :model="searchKey" size='small' class="demo-form-inline">
            <el-form-item label="组名称:" prop='name'>
                <el-input v-model.trim="searchKey.name"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" :loading="searchLoading" @click="searchClick">查询</el-button>
                <el-button type="primary" @click="resetClick()">重置</el-button>
            </el-form-item>
        </el-form>
        <!-- <div class="yk-search-box">                
            <div class="yk-search-block">
                <label class="yk-w-40">组名称: </label>
                <input class="yk-input  " v-model.trim="searchKey.name">
            </div>

            <div class="yk-search-block">
                <span class="yk-btn yk-btn-gap" @click="searchClick();">查询</span>
                <span class="yk-btn" @click="resetClick();">重置</span>
            </div>                
        </div> -->
        <el-table :data="dataList" v-loading="loading" class='c-mt-10' @selection-change="handleSelectionChange" stripe>
            <el-table-column align="center" type="selection"></el-table-column>
            <el-table-column align="center" prop="name" label="组名称"></el-table-column>
            <el-table-column align="center" prop="description" label="描述"></el-table-column>
        </el-table>
        <!-- <div class="yk-min-300" id="groupDataTable" style="max-height:450px;overflow-y:auto;">
            <table class="yk-table yk-t-10">
                <thead>
                    <tr>
                        <th style="width:4%;">
                            <input type="checkbox" v-model="selector.isAll" @click="selectAll();">
                        </th>
                        <th style="width:48%;">组名称</th>
                        <th style="width:48%;">描述</th>
                    </tr>
                </thead>
                <tbody :style='{"height":(paging.total<=10 ? "auto" : "405px")}'>
                    <tr v-for="(item,index) in dataList" :key=index>
                        <td style="width:4%;">
                           <input type="checkbox" v-model="item.isCheck" @click.stop="selectRow(item);">
                        </td>
                        <td style="width:48%;">{{item.name}}</td>
                        <td style="width:47%;">{{item.description}}</td>
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
    name:'GroupList',
    props: ['title','type','data'],
    components: {
        Paging,TList
    },
    data () {
        return {
            pageIndex: 0,
            pageSize: 10,
            totalCount: 0,
            searchLoading:false,
            loading: false,
            dataList:[],
            selector: [],
            searchKey: {
                name: '',  
            },
            paging: {
                index: 0,
                size: 10,
                total: 0,
            },
            operPlatUrl:''
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
                  name: ''
            };
        },
        initData(){
            // this.selector.isAll =false;
            // this.selector.list = [];
            // this.selector.item= null;
            // this.searchLoading = false;
            this.loading = true;
            this.$api.post(this.operPlatUrl + "vehicleTerminal/remote/findVehicleGroup",{     
                name:this.searchKey.name,  
                "page":{
                    "pageSize": this.paging.size,
                    "pageIndex": this.paging.index
                }
            },response => {
                this.dataList = response.data.list;
                this.paging.total = response.data.totalCount;
                let inputs = document.querySelectorAll(".yk-table tbody input");
                inputs.forEach(function(item){
                    item.checked = false;
                });
                this.loading = false;
            },error => {
                this.loading = false;
            });
        },
        searchClick(){
            this.paging.index =0;
            this.paging.total = 0;
            this.searchLoading = true;
            this.initData();
        },
        resetClick(){
            this.init();
        },
        handleSelectionChange(val) {
            this.selector = [];
            val.forEach(item => {
                this.selector.push(item.id);
            });
        },
        // selectAll(){
        //     this.selector.isAll = !this.selector.isAll;
        //     TList.setListProp(this.dataList,'isCheck',this.selector.isAll);
        //     this.selector.list = this.seleector.isAll ? TList.copyList(this.dataList) : [];
        //     this.selector.item = null;
        //     },
        // selectRow(item){
        //     item.isCheck = !item.isCheck;
        //     let bool = TList.getItemById(this.selector.list, item.id);
        //     if(item.isCheck && !bool){
        //         this.selector.list.push(item);
        //     }else if(!item.isCheck && bool){
        //         TList.deleteItemById(this.selector.list, item.id);
        //     }
        //     this.selector.item = item;
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
        initLocalDataPanelHeight(){
            let boxHeight = document.body.clientHeight;
            this.current.top = document.getElementById('groupDataTable').offsetTop;
            this.current.height = boxHeight - this.current.top;
        },
    },
}
</script>
