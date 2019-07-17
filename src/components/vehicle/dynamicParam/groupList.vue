<template>
<div id='groups' v-cloak>
    <el-form :inline="true" :model="searchKey" size='small' class="demo-form-inline">
        <el-form-item label="组名称:" prop='name'>
            <el-input v-model.trim="searchKey.name"></el-input>
        </el-form-item>
        <el-form-item>
            <el-button type="warning" icon="el-icon-search" :loading='searchLoading' @click="searchClick('searchKey')">查询</el-button>
            <el-button type="warning" plain icon="el-icon-setting" @click="resetClick">重置</el-button>
        </el-form-item>
    </el-form>
    <div style='height:620px;'>
        <el-table :data="dataList" v-loading="loading" class='c-mt-10' @selection-change="handleSelectionChange" stripe>
            <el-table-column fixed align="center" type="selection"></el-table-column>
            <el-table-column align="center" prop="name" label="组名称"></el-table-column>
            <el-table-column align="center" prop="description" label="描述"></el-table-column>
        </el-table>
    </div>
    <div class="c-page clearfix">
        <el-pagination
            background
            @current-change="changePageCurrent" 
            :current-page="pageOption.page" 
            :total="pageOption.total"
            @size-change="changePageSize"
            :page-sizes="[10,20,50,100,200]" 
            :page-size="pageOption.size"
            layout="total, sizes, prev, pager, next">
        </el-pagination>
    </div>
</div>
</template>
<script>
import {findVehicleGroup} from '@/api/vehicle';
import TList from '@/common/utils/list.js'
export default {
    name:'GroupList',
    props: ['title','type','data'],
    components: {
        TList
    },
    data () {
        return {
            searchLoading:false,
            loading: false,
            dataList:[],
            selector: [],
            searchKey: {
                name: '',  
            },
            pageOption: {
                page: 1,
                size: 10,
                total: 0,
            },
            operPlatUrl:''
        }
    },
    methods: {
        initPageOption() {
            this.dataList = [];
            this.pageOption.total = 0;
            this.pageOption.page = 1;
         },
         init(){
            this.operPlatUrl = window.config.operPlatUrl;
            this.initPaging();
            this.initSearch();
            this.initData();
        },
        initPaging(){
            this.pageOption.page = 1;
            this.pageOption.total = 0;
            this.pageOption.size = 10;
        },
        initSearch(){
            this.searchKey = {
                  name: ''
            };
        },
        initData(){
            this.loading = true;
            findVehicleGroup({
                'name':this.searchKey.name,  
                'page':{
                    'pageSize': this.pageOption.size,
                    'pageIndex': this.pageOption.page-1
                }
            }).then(res => {
                if(res.status == '200'){
                    this.dataList = res.data.list;
                    this.pageOption.total = res.data.totalCount;
                    let inputs = document.querySelectorAll(".yk-table tbody input");
                    inputs.forEach(function(item){
                        item.checked = false;
                    });
                }else{
                    this.$message.error(res.message);
                }
                this.loading = false;
            }).catch(err => {
                this.loading = false;
            })
        },
        searchClick(){
            this.pageOption.page = 1;
            this.pageOption.total = 0;
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
        changePageSize(value) {//每页显示条数变更
            this.initPageOption();
            this.pageOption.size = value;
            this.initData();
        },
        changePageCurrent(value) {//页码变更
            this.pageOption.page = value;
            this.initData();
        },
    },
}
</script>
