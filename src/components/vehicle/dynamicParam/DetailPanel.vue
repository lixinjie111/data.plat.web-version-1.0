<template>
<div class="c-view-dialog">
    <div class="c-scroll-wrap">
        <div class="c-scroll-inner">
            <h3 class="c-title">
                动态参数<i class='el-icon-arrow-right'></i>动态详情
                <el-page-header @back="backClick" class="c-return-btn"></el-page-header>
            </h3>
            <div class="c-wrapper-20">
                <el-form :inline="true" :model="searchKey" ref='searchForm' size='small'>
                    <el-form-item label="数据编号" prop='dataId'>
                        <el-input v-model.trim="searchKey.dataId"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="warning" icon="el-icon-search" :loading='searchLoading' @click="searchClick">查询</el-button>
                        <el-button type="warning" plain icon="el-icon-setting" @click="resetClick">重置</el-button>
                    </el-form-item>
                </el-form>
                <el-table
                    :data="dataList" 
                    v-loading='loading'
                    stripe
                    border>
                    <el-table-column prop="timestamp" label="时间戳"></el-table-column>
                    <el-table-column prop="dataId" label="数据编号"></el-table-column>
                    <el-table-column prop="enName" label="英文名称"></el-table-column>
                    <el-table-column prop="chName" label="中文名称"></el-table-column>
                    <el-table-column prop="enName" label="数据值"></el-table-column>
                    <el-table-column label="时间">
                        <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.timestamp)}}</template>
                    </el-table-column>    
                </el-table>
            </div>
        </div>
    </div>
</div>

</template>
<script>
import {getDetatilList} from '@/api/vehicle';
export default {
    props: ['title','type','data'],
    components: {
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
        init(dataDetail){
            this.pageOption.page = 1;
            this.getDetatil(dataDetail);
        },
        getDetatil(dataDetail){
            let _this = this;
            this.dataList = [];
            this.loading = true;
            getDetatilList({
                page: {
                    'pageSize': this.pageOption.size,
                    'pageIndex': this.pageOption.page-1
                },
                'queryId': dataDetail.queryId,
                'sId': this.searchKey.dataId,
            }).then(res => {
                if(res.status == '200'){
                    this.dataList = res.data.list;
                    this.pageOption.total = res.data.totalCount;
                }
                this.loading = false;
            }).catch(err => {
                this.loading = false;
                this.searchLoading = false;
            });
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