<template>
<div v-cloak>
    <el-form :inline="true" :model="searchKey" ref='searchForm' size='small'>
        <el-form-item label="组名称" prop='name'>
            <el-input v-model.trim="searchKey.name"></el-input>
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
        <el-table-column prop="name" label="组名称"></el-table-column>
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
import {findVehicleGroup} from '@/api/vehicle';
export default {
    name:'GroupList',
    props: ['title','type','data'],
    components: {},
    data () {
        return {
            searchLoading:false,
            loading: false,
            dataList:[],
            selector: [],
            searchKey: {
                name: '',  
            },
            historySearchKey: {},
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
            let _params = Object.assign({},this.historySearchKey,{
                'page':{
                    'pageSize': this.pageOption.size,
                    'pageIndex': this.pageOption.page-1
                }
            });
            findVehicleGroup(_params).then(res => {
                if(res.status == '200'){
                    this.dataList = res.data.list;
                    this.pageOption.total = res.data.totalCount;
                    this.$refs.table.bodyWrapper.scrollTop = 0;
                    let inputs = document.querySelectorAll(".yk-table tbody input");
                    inputs.forEach(function(item){
                        item.checked = false;
                    });
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
            this.historySearchKey = this.searchKey;
            this.initData();
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
