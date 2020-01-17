<template>
    <!-- 基本信息 -->
    <div class="c-wrapper-20" v-cloak>
        <div v-show='infoIsShow'>
            <el-form :inline="true" :model="searchKey" :rules="rules" ref="searchForm" size='small'>
                <el-form-item label="RSU编号" prop='rsuId'>
                    <el-select
                        v-model.trim="searchKey.rsuId"
                        clearable
                        filterable
                        remote
                        reserve-keyword
                        placeholder="请输入关键词"
                        :remote-method="rsRsuIdRemoteMethod"
                        @clear="rsRsuIdOption.searchFilter.clearFunc(rsRsuIdOption)"
                        @focus="rsRsuIdOption.searchFilter.remoteMethodClick(rsRsuIdOption, searchKey, 'rsuId')"
                        @blur="rsRsuIdOption.searchFilter.remoteMethodBlur(searchKey, 'rsuId')"
                        :loading="rsRsuIdOption.loading">
                        <el-option
                            v-for="item in rsRsuIdOption.filterOption"
                            :key="item"
                            :label="item"
                            :value="item">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="时间" prop='time'>
                    <el-date-picker
                        v-model.trim="searchKey.time"
                        type="datetimerange"
                        :picker-options="timeOption"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button type="warning" icon="el-icon-search" :loading='searchLoad' @click="searchClick">查询</el-button>
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
                max-height="724">
                <el-table-column type="index" label="序号" :index='indexMethod'></el-table-column>
                <el-table-column prop="msgCnt" min-width='10' label="消息编号"></el-table-column>
                <el-table-column prop="rsuId" label="RSU编号" min-width='10'></el-table-column>
                <el-table-column label="时间" min-width='14'>
                    <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.time,type='yy-mm-dd hh:mm:ss:ms')}}</template>
                </el-table-column>
                <el-table-column label="经度" min-width='9'>
                    <template slot-scope="scope">{{scope.row.lonRsm}}</template>
                </el-table-column>
                <el-table-column label="纬度" min-width='9'>
                    <template slot-scope="scope">{{scope.row.latRsm}}</template>
                </el-table-column>
                <el-table-column prop="elevRsm" label="高程" min-width='9'></el-table-column>
                <el-table-column prop='vehicleNum' label="车辆个数" min-width='8'></el-table-column>
                <el-table-column prop='personNum' label="行人个数" min-width='8'></el-table-column>
                <!-- <el-table-column prop='num' label="参与者个数" min-width='8'></el-table-column> -->
                <el-table-column label="操作" min-width='5'>
                    <template slot-scope="scope">
                        <el-button size="small" icon="el-icon-view" circle type="warning" plain @click="detail(scope.row)"></el-button>
                    </template>
                </el-table-column>
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
        <rsm-detail ref='rsm' v-show='rsmdIsShow' :data='panel.data' @goBack='backFn'></rsm-detail>
    </div>
</template>
<script>
import {findRsmPage} from '@/api/v2x';
// 模糊查询封装
import SearchFilter from '@/assets/js/module/searchFilter.js'
import {requestqueryRSUList} from '@/api/search';
import RsmDetail from '@/components/v2x/rsm/RsmDetail.vue'
export default {
    name: 'BsmCom',
    components: {
        RsmDetail,
    },
    data(){
        return {
            infoIsShow:true,
            rsmdIsShow:false,
            loading:false,
            searchLoad:false,
            searchKey: {
                rsuId: '',
                startTime: '',
                endTime: '',
                time:[]
            },
            pageOption: {
                page: 1,
                size: 10,
                total: 0,
            },
            dataList: [],  
            panel: {
                title: '提示',
                type: '',
                msg: '',
                data: [],
                show: false,
                cfgShow: false,
            },  
            current: {
                top: 0,
                accessPlatform: null,
            },
            rsRsuIdOption: {
                loading: false,
                timer: null,
                searchFilter:new SearchFilter(),
                filterOption: [],
                defaultOption: [],
                defaultFlag: false,
                request:requestqueryRSUList
            },
            historySearchKey: {}
        }
    },
    methods: {
        initPageOption() {
            this.dataList = [];
            this.pageOption.total = 0;
            this.pageOption.page = 1;
        },
        detail(item){
            this.panel.title = '明细';
            this.panel.type = 'detail';
            this.panel.data = item;
            this.$refs.rsm.init(item);
            this.infoIsShow = false;
            this.rsmdIsShow = true;
        },
        initPaging(){
            this.pageOption.page = 1;
            this.pageOption.total = 0;
            this.pageOption.size = 10;
        },
        findRsmPage(){
            this.dataList = [];
            this.loading = true;
            
            let _params = {
                page: {
                    "pageSize": this.pageOption.size,
                    "pageIndex": this.pageOption.page-1
                },
                ... this.historySearchKey
            }
            findRsmPage(_params).then(res => {
                if(res.status == '200'){
                    this.dataList = res.data.list;
                    this.pageOption.total = res.data.totalCount;
                    this.$refs.table.bodyWrapper.scrollTop = 0;
                }
                this.loading = false;
                this.searchLoad = false;
            }).catch(err => {
                this.loading = false;
                this.searchLoad = false;
            })
        },
        searchClick(){
            this.$refs.searchForm.validate((valid) => {
                if (valid) {
                    this.searchLoad = true;
                    this.historySearchKey = this.searchKey;
                    this.historySearchKey.startTime = this.searchKey.time ? this.$dateUtil.dateToMs(this.searchKey.time[0]) : '';
                    this.historySearchKey.endTime = this.searchKey.time ? this.$dateUtil.dateToMs(this.searchKey.time[1]) : '';
                    this.initPaging();
                    this.findRsmPage();
                } else {
                    return false;
                }
            });
        },
        resetClick(){
            this.$refs.searchForm.resetFields();
            this.rsRsuIdOption.filterOption = this.rsRsuIdOption.defaultOption;
        },
        rsRsuIdRemoteMethod(query) {
            this.rsRsuIdOption.searchFilter.publicRemoteMethod({
                query: query,
                searchOption: this.rsRsuIdOption,
                searchObj: this.searchKey,
                key: 'rsuId'
            });
        },
        getIsNan(val){
            return typeof(val) == 'number' && window.isNaN(val);
        },
        changePageSize(value) {//每页显示条数变更
            this.initPageOption();
            this.pageOption.size = value;
            this.findRsmPage();
        },
        changePageCurrent(value) {//页码变更
            this.pageOption.page = value;
            this.findRsmPage();
        },
        backFn(){
            this.infoIsShow = true;
            this.rsmdIsShow = false;
        },
        indexMethod(index){
            return index + this.pageOption.size * (this.pageOption.page-1) + 1;
        }
    },
    mounted(){
        //获取当前时间的前一个小时
        let startTime = this.$dateUtil.timeToConversion(new Date(new Date().getTime() - 1 * 60 * 60 * 1000));
        this.searchKey.time = [startTime,this.$dateUtil.getNowFormatDate()];
        this.historySearchKey.startTime = this.searchKey.time ? this.$dateUtil.dateToMs(this.searchKey.time[0]) : '';
        this.historySearchKey.endTime = this.searchKey.time ? this.$dateUtil.dateToMs(this.searchKey.time[1]) : '';
        this.findRsmPage();
    }
}
</script>
