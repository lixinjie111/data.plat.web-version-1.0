<template>
<div id='groups' v-cloak>
    <el-form :inline="true" :model="searchKey" ref='searchForm' size='small'>
        <el-form-item label="数据ID" prop='dataId'>
            <el-input v-model.trim="searchKey.dataId"></el-input>
        </el-form-item>
        <el-form-item>
            <el-button type="warning" icon="el-icon-search" :loading='searchLoading' @click="searchClick('searchKey')">查询</el-button>
            <el-button type="warning" plain icon="el-icon-setting" @click="resetClick">重置</el-button>
        </el-form-item>
    </el-form>
    <el-table :data="dataList" v-loading="loading" class='c-mt-10 c-mb-70' stripe>
        <el-table-column fixed align="center" prop="timestamp" label="时间戳"></el-table-column>
        <el-table-column align="center" prop="dataId" label="数据ID"></el-table-column>
        <el-table-column align="center" prop="enName" label="英文名称"></el-table-column>
        <el-table-column align="center" prop="chName" label="中文名称"></el-table-column>
        <el-table-column align="center" prop="enName" label="数据值"></el-table-column>
        <el-table-column align="center" label="时间">
            <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.timestamp)}}</template>
        </el-table-column>    
    </el-table>
</div>
</template>
<script>
import Paging from '@/common/view/Paging.vue'
import {getDetatilList} from '@/api/vehicle';
export default {
    props: ['title','type','data'],
    components: {
        Paging,
    },
    data(){
        return {
            searchLoading:false,
            pageOption: {
                page: 1,
                size: 10,
                total: 0,
                hideSize: true,
            },
            current: {
                top: 0,
                height: 100,
            },
            searchKey:{
                queryId:'',
                dataId:''
            },
            dataList: [],
            currentPage:1,
            loading:false
        }
    },
    methods: {
        init(queryId,dataId){
            if(queryId != undefined) this.searchKey.queryId = queryId;
            if(dataId != undefined) this.searchKey.dataId = dataId;
            // this.$refs.page.internalCurrentPage = this.currentPage;
            this.pageOption.page = 1;
            this.getDetatil();
        },
        getDetatil(){
            let _this = this;
            this.dataList = [];
            this.loading = true;
            getDetatilList({
                page: {
                    'pageSize': this.pageOption.size,
                    'pageIndex': this.pageOption.page-1
                },
                'queryId': this.searchKey.queryId,
                'sId': this.searchKey.dataId,
            }).then(res => {
                if(res.status == '200'){
                    this.dataList = res.data.list;
                    this.pageOption.total = res.data.totalCount;
                }
                this.loading = false;
            })
        },
        searchClick(){
            this.pageOption.page = 0;
            this.getDetatil();
        },
        backClick(){
            this.$emit('detailPanelBack')
        },
        resetClick(){
            this.searchKey.dataId ="";
        },
        handleSizeChange(value) {//每页显示条数变更
            this.pageOption.size = value;
            this.getDetatil();
        },
        handleCurrentChange(value) {//页码变更
            this.pageOption.page = value;
            this.getDetatil();
        }
    },
    mounted(){
    }
}
</script>
<style scoped>
.yk-gap10{
    background: #fff;
    margin: 10px 0px;
}

.yk-cfg-box{
    width: 100%;
    height: 100%;
    position: relative;
}

.yk-b-border{
    border-bottom: 1px dashed #d5e1e2;
    margin-bottom: 10px;
}

.yk-sub-box{
    margin: 10px 0px;
    position: relative;
    background: #F7F9FA;
}

.yk-s-block{
    display: inline-block;
    vertical-align: top;
    background: #fff;
    height: 160px;
    width: 22%;
}
.yk-s-block:hover{
    border: 2px solid #00c1de;
    border-radius: 3px;
    -webkit-border-radius: 3px;
    -moz-border-radius: 3px;
    -ms-border-radius: 3px;
    -o-border-radius: 3px;
}

.yk-t-color{
    background: #F7F9FA!important;
}

.yk-s-block .title{
    text-align: left;
    height: 36px;
    line-height: 36px;
    font-size: 16px;
    color: #5F6E82;
    padding-left: 10px;
}
.yk-s-block .body{
    font-size: 42px;
    color: #475669;
    padding: 10px;
}
.yk-top150{
    margin-top: 150px!important;
}
</style>
