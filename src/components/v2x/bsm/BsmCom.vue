<template>
    <!-- 基本信息 -->
    <div class="c-wrapper-20" v-cloak>
        <div v-show="!panel.show" class="yk-container c-mt-10">
            <el-form :inline="true" :model="searchKey" :rules="rules" ref="searchForm" size='small'>
                <el-form-item label="车辆编号" prop='vehicleId'>
                    <el-select
                        v-model.trim="searchKey.vehicleId"
                        clearable
                        filterable
                        remote
                        reserve-keyword
                        placeholder="请输入关键词"
                        :remote-method="rsVehicleRemoteMethod"
                        @clear="rsVehicleOption.searchFilter.clearFunc(rsVehicleOption)"
                        @focus="rsVehicleOption.searchFilter.remoteMethodClick(rsVehicleOption, searchKey, 'vehicleId')"
                        @blur="rsVehicleOption.searchFilter.remoteMethodBlur(searchKey, 'vehicleId')"
                        :loading="rsVehicleOption.loading">
                        <el-option
                            v-for="item in rsVehicleOption.filterOption"
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
                <el-table-column prop="msgCnt" min-width="8%" label="消息编号"></el-table-column>
                <el-table-column prop="vehicleId" min-width="12%" label="车辆编号"></el-table-column>
                <el-table-column prop="plateNo" label="车牌号码" min-width="10%"></el-table-column>
                <el-table-column label="时间" min-width="16%">
                    <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.gpstime,type='yy-mm-dd hh:mm:ss:ms')}}</template>
                </el-table-column>
                <el-table-column label="经度" min-width="12%">
                    <template slot-scope="scope">{{scope.row.longitude}}</template>
                </el-table-column>
                <el-table-column label="纬度" min-width="12%">
                    <template slot-scope="scope">{{scope.row.latitude}}</template>
                </el-table-column>
                <el-table-column prop="altitude" label="高程" min-width="6%"></el-table-column>
                <el-table-column label="车速(km/h)" min-width="6%">
                    <template slot-scope="scope">{{scope.row.speed}}</template>
                </el-table-column>
                <el-table-column label="航向" min-width="6%">
                    <template slot-scope="scope">{{scope.row.heading}}</template>
                </el-table-column>
                <el-table-column prop="angle" label="方向盘转角" min-width="10%"></el-table-column>
                <el-table-column label="刹车踏板" min-width="8%">
                    <template slot-scope="scope">
                        <span>{{scope.row.brakePedal | brakePedalFilter}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" min-width="5%"> 
                    <template slot-scope="scope">
                        <el-button size="small" icon="el-icon-view" circle type="warning" plain @click="detail(scope.row)"></el-button>
                    </template>
                </el-table-column>
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
        <!-- 设备基本信息 -->
        <bsm-detail title="基本信息" v-if='detailLayShow' :infoTagData="detailInfo" @backClick='backFn'></bsm-detail>
    </div>
</template>
<script>
// 模糊查询封装
import SearchFilter from '@/assets/js/module/searchFilter.js'
import BsmDetail from '@/components/v2x/bsm/BsmDetail.vue'
import {findBSMList} from '@/api/v2x';
import {requestqueryVehicleList} from '@/api/search';
export default {
    name: 'BsmCom',
    components: {
        BsmDetail
    },
    data(){
        return {
            loading:false,
            searchLoad:false,
            detailInfo:{},
            detailLayShow:false,
            searchKey: {
                vehicleId: '',
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
            },  
            current: {
                top: 0,
                accessPlatform: null,
            },
            rsVehicleOption: {
                loading: false,
                searchFilter:new SearchFilter(),
                timer: null,
                filterOption: [],
                defaultOption: [],
                defaultFlag: false,
                request:requestqueryVehicleList
            },
            historySearchKey: {}
        }
    },
    filters:{
        brakePedalFilter(brakePedal){
            const brakePedalMap = {
                'on||ON':'是',
                'off||OFF':'否',
                'unavailable||UNAVAILABLE':'不支持'
            }
            return brakePedalMap[brakePedal];
        }
    },
    methods: {
        initPageOption() {
            this.dataList = [];
            this.pageOption.total = 0;
            this.pageOption.page = 1;
        },
        detail(item){
            this.detailInfo = item;
            this.panel.show = false;
            this.detailLayShow = true;
        },
        initPaging(){
            this.pageOption.page = 1;
            this.pageOption.total = 0;
            this.pageOption.size = 10;
        },
        findBSMLists(){
            this.loading = true;
            let _params = {
                page: {
                    "pageSize": this.pageOption.size,
                    "pageIndex": this.pageOption.page-1
                },
                ... this.historySearchKey
            }
            findBSMList(_params).then(res => {
                this.dataList = [];
                if(res.status == '200'){
                    res.data.list.forEach((item) => {
                        item.loading = false;
                    });
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
                    this.findBSMLists();
                } else {
                    return false;
                }
            });
        },
        resetClick(){
            this.$refs.searchForm.resetFields();
            this.rsVehicleOption.filterOption = this.rsVehicleOption.defaultOption;
        },
        rsVehicleRemoteMethod(query) {
            this.rsVehicleOption.searchFilter.publicRemoteMethod({
                query: query,
                searchOption: this.rsVehicleOption,
                searchObj: this.searchKey,
                key: 'vehicleId'
            });
        },
        getIsNan(val){
            return typeof(val) == 'number' && window.isNaN(val);
        },
        changePageSize(value) {//每页显示条数变更
            this.initPageOption();
            this.pageOption.size = value;
            this.findBSMLists();
        },
        changePageCurrent(value) {//页码变更
            this.pageOption.page = value;
            this.findBSMLists();
        },
        backFn(){
            this.panel.show = false;
            this.detailLayShow = false;
        },
        indexMethod(index){
            return (this.pageOption.page-1) * this.pageOption.size + index + 1;
        },
    },
    mounted(){
        //获取当前时间的前一个小时
        let startTime = this.$dateUtil.timeToConversion(new Date(new Date().getTime() - 1 * 60 * 60 * 1000));
        this.searchKey.time = [startTime,this.$dateUtil.getNowFormatDate()];
        this.historySearchKey.startTime = this.searchKey.time ? this.$dateUtil.dateToMs(this.searchKey.time[0]) : '';
        this.historySearchKey.endTime = this.searchKey.time ? this.$dateUtil.dateToMs(this.searchKey.time[1]) : '';
        this.findBSMLists();
    },
    beforeDestroy(){

    },
}
</script>
