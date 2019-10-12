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
                        @clear="$searchFilter.clearFunc(rsVehicleOption)"
                        @focus="$searchFilter.remoteMethodClick(rsVehicleOption, searchKey, 'vehicleId', searchUrl)"
                        @blur="$searchFilter.remoteMethodBlur(searchKey, 'vehicleId')"
                        :loading="rsVehicleOption.loading">
                        <el-option
                            v-for="item in rsVehicleOption.filterOption"
                            :key="item"
                            :label="item"
                            :value="item">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="开始时间" prop='startTime'>
                    <el-date-picker
                        v-model.trim="searchKey.startTime"
                        type="datetime"
                        placeholder="开始时间"
                        :picker-options="startTimeOption">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="结束时间" prop='endTime'>
                    <el-date-picker
                        v-model.trim="searchKey.endTime"
                        type="datetime"
                        placeholder="结束时间"
                        :picker-options="endTimeOption">
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
import BsmDetail from '@/components/v2x/bsm/BsmDetail.vue'
import {findBSMList} from '@/api/v2x';
import {requestqueryVehicleList} from '@/api/search';
export default {
    name: 'BsmCom',
    components: {
        BsmDetail
    },
    data(){
        let _this = this,
            _checkStartTime = (rule, value ,callback) => {
                let _startTime = value ? this.$dateUtil.dateToMs(this.$dateUtil.formatTime(value)) : null,//标准时间转为时间戳
                    _endTime = this.searchKey.endTime ? this.$dateUtil.dateToMs(this.$dateUtil.formatTime(this.searchKey.endTime)) : null;//标准时间转为时间戳
                if(_startTime){
                    if(_endTime) {
                        if(_startTime > _endTime){
                            callback(new Error('开始时间必须小于结束时间'));
                        }else {
                            callback();
                        }
                    }else {
                        callback();
                    }
                }else {
                    callback();
                }
            },
            _checkEndTime = (rule, value ,callback) => {
                let _startTime = this.searchKey.startTime ? this.$dateUtil.dateToMs(this.$dateUtil.formatTime(this.searchKey.startTime)) : null,//标准时间转为时间戳
                    _endTime = value ? this.$dateUtil.dateToMs(this.$dateUtil.formatTime(value)) : null;//标准时间转为时间戳
                if(_endTime){
                    if(_startTime) {
                        if(_startTime > _endTime){
                            callback(new Error('开始时间必须小于结束时间'));
                        }else {
                            callback();
                        }
                    }else {
                        callback();
                    }
                }else {
                    callback();
                }
            };
        return {
            loading:false,
            searchLoad:false,
            detailInfo:{},
            detailLayShow:false,
            searchKey: {
                vehicleId: '',
                startTime: '',
                endTime: ''
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
            rules:{
                startTime:[
                    { validator: _checkStartTime, trigger: 'blur' }
                ],
                endTime:[
                    { validator: _checkEndTime, trigger: 'blur' }
                ]
            },
            startTimeOption: {
                disabledDate: time => {
                    let _time = time.getTime(),
                        _newTime = new Date().getTime(), 
                        _endDateVal = _this.searchKey.endTime ? _this.$dateUtil.dateToMs(_this.$dateUtil.formatTime(_this.searchKey.endTime, "yy-mm-dd")+' 00:00:00') : null;
                    if (_endDateVal) {
                        return _time > _endDateVal || _time > _newTime;
                    }else {
                        return _time > _newTime;
                    }
                }
            },
            endTimeOption: {
                disabledDate: time => {
                    let _time = time.getTime(),
                        _newTime = new Date().getTime(), 
                        _startDateVal = _this.searchKey.startTime ? _this.$dateUtil.dateToMs(_this.$dateUtil.formatTime(_this.searchKey.startTime, "yy-mm-dd")+' 00:00:00') : null;
                    if (_startDateVal) {
                        return  _time < _startDateVal || _time > _newTime;
                    }else {
                        return _time > _newTime;
                    }
                }

            },
            rsVehicleOption: {
                loading: false,
                timer: null,
                filterOption: [],
                defaultOption: [],
                defaultFlag: false
            },
            searchUrl: requestqueryVehicleList,
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
                    this.historySearchKey.startTime = this.$dateUtil.dateToMs(this.searchKey.startTime) || '';
                    this.historySearchKey.endTime = this.$dateUtil.dateToMs(this.searchKey.endTime) || '';
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
            this.$searchFilter.publicRemoteMethod({
                query: query,
                searchOption: this.rsVehicleOption,
                searchObj: this.searchKey,
                key: 'vehicleId',
                request: this.searchUrl
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
        this.searchKey.startTime = this.$dateUtil.GetDateStr(1);
        this.searchKey.endTime = this.$dateUtil.getNowFormatDate();
        this.historySearchKey.startTime = this.$dateUtil.dateToMs(this.searchKey.startTime) || '';
        this.historySearchKey.endTime = this.$dateUtil.dateToMs(this.searchKey.endTime) || '';
        this.findBSMLists();
    },
    beforeDestroy(){

    },
}
</script>
