<template>
<div v-cloak>
        <el-form :inline="true" :model="searchKey" ref="searchForm" size='small'>
            <el-form-item label="CAN数据编号" prop='sid'>
                <el-input v-model.trim="searchKey.sid" clearable></el-input>
            </el-form-item>
            <el-form-item label="英文名称" prop='enName'>
                <el-input v-model.trim="searchKey.enName" clearable></el-input>
            </el-form-item>
            <el-form-item label="中文名称" prop='chName'>
                <el-input v-model.trim="searchKey.chName" clearable></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="warning" icon="el-icon-search" :loading='searchLoading' @click="searchClick">查询</el-button>
                <el-button type="warning" plain icon="el-icon-setting" @click="resetClick">重置</el-button>
            </el-form-item>
        </el-form>
        <el-table
            ref="table"
            :data="dataList" 
            v-loading='loading'
            stripe
            border
            class="c-mb-70"
            max-height="724" 
            @selection-change="handleSelectionChange">
            <el-table-column type="selection"></el-table-column>
            <el-table-column prop="sid" label="CAN数据编号"></el-table-column>
            <el-table-column prop="name" label="英文名称"></el-table-column>
            <el-table-column prop="longidentifier" label="中文名称"></el-table-column>
            <el-table-column prop="datType" label="类型"></el-table-column>
            <el-table-column prop="description" label="描述"></el-table-column>
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
import {findVehicleProperty} from '@/api/vehicle';
export default {
    name:'FullList',
    props: ['title','type','data'],
     components: {},
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
            historySearchKey:{},
            pageOption: {
                page: 1,
                size: 10,
                total: 0,
            },
        }
    },
    methods: {
        initPageOption() {
            this.dataList = [];
            this.pageOption.total = 0;
            this.pageOption.page = 1;
        },
        init(){
            this.initPaging();
            this.initData();         
        },
        initPaging(){
            this.pageOption.page = 1;
            this.pageOption.total = 0;
            this.pageOption.size = 10;
        },
        initData(){
            this.loading = true;
            let _params = Object.assign({}, this.historySearchKey, {
                page:{
                    'pageSize': this.pageOption.size,
                    'pageIndex': this.pageOption.page - 1
                }
            });
            findVehicleProperty(_params).then(res => {
                if(res.status == '200'){
                    this.dataList = res.data.list;
                    this.pageOption.total = res.data.totalCount;
                    this.$refs.table.bodyWrapper.scrollTop = 0;
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
            this.$refs.searchForm.validate((valid) => {
                if (valid) {
                    this.searchLoading = true;
                    this.historySearchKey = this.searchKey;
                    this.initData();
                } else {
                    return false;
                }
            });
        },
        resetClick(){
            this.$refs.searchForm.resetFields();
        },
        handleSelectionChange(val) {
            this.selector = [];
            this.selector = val;
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
