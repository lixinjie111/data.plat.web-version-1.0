<template>
<div id='lists' v-cloak>
        <el-form :inline="true" :model="searchKey" ref="searchForm" size='small' class="demo-form-inline">
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
                <el-button type="warning" icon="el-icon-search" :loading='searchLoading' @click="searchClick('searchKey')">查询</el-button>
                <el-button type="warning" plain icon="el-icon-setting" @click="resetClick">重置</el-button>
            </el-form-item>
        </el-form>
        <el-table :data="dataList" class='c-mt-10 c-mb-70' max-height="499" v-loading="loading" @selection-change="handleSelectionChange" stripe>
            <el-table-column fixed align="center" type="selection"></el-table-column>
            <el-table-column align="center" prop="sid" label="SID"></el-table-column>
            <el-table-column align="center" prop="name" label="英文名称"></el-table-column>
            <el-table-column align="center" prop="longidentifier" label="中文名称"></el-table-column>
            <el-table-column align="center" prop="datType" label="类型"></el-table-column>
            <el-table-column align="center" prop="description" label="描述"></el-table-column>
        </el-table>
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
import TList from '@/common/utils/list.js'
import {findVehicleProperty} from '@/api/vehicle';
export default {
    name:'FullList',
    props: ['title','type','data'],
     components: {
        TList
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
            pageOption: {
                page: 1,
                size: 10,
                total: 0,
            },
            operPlatUrl:'',
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
                sid: null,
                enName:'',
                chName:''
            };
        },
        initData(){
            this.loading = true;
            findVehicleProperty({
                'sid':this.searchKey.sid,
                'name':this.searchKey.enName,
                'longidentifier':this.searchKey.chName,          
                page:{
                    'pageSize': this.pageOption.size,
                    'pageIndex': this.pageOption.page - 1
                }
            }).then(res => {
                if(res.status == '200'){
                    this.dataList = res.data.list;
                    this.pageOption.total = res.data.totalCount;
                    let inputs = document.querySelectorAll(".yk-table tbody input");
                    inputs.forEach(function(item){
                        item.checked = false;
                    });
                }
                this.searchLoading = false;
                this.loading = false;
            }).catch(err => {
                this.searchLoading = false;
                this.loading = false;
            })
        },
        searchClick(){
            this.pageOption.page = 1;
            this.pageOption.total = 0;
            this.searchLoading = true;
            this.$refs.searchForm.validate((valid) => {
                if (valid) {
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
