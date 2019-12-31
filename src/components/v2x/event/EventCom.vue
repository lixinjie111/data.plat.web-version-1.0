<template>
    <!-- 基本信息 -->
    <div class="c-wrapper-20" v-cloak>
        <el-form :inline="true" :model="searchKey" :rules="rules" ref="searchForm" size='small'>
            <el-form-item label="自车编号" prop='hvid'>
                <el-select
                    v-model.trim="searchKey.hvid"
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
            <el-table-column prop="msgCnt" label="消息编号" min-width="10%"></el-table-column>
            <el-table-column prop="hvid" label="自车编号" min-width="10%"></el-table-column>
            <el-table-column prop="rvid" label="远车编号" min-width="10%"></el-table-column>
            <el-table-column label="预警类型" min-width="10%">
                <template slot-scope="scope">
                    <div v-if="scope.row.event == 0">无预警/解除预警</div>
                    <div v-if="scope.row.event == 1">前向碰撞预警</div>
                    <div v-if="scope.row.event == 2">交叉路口碰撞预警</div>
                    <div v-if="scope.row.event == 3">左转辅助</div>
                    <div v-if="scope.row.event == 4">变道预警</div>
                    <div v-if="scope.row.event == 5">逆向超车预警</div>
                    <div v-if="scope.row.event == 6">紧急制动预警</div>
                    <div v-if="scope.row.event == 9">紧急车辆提醒</div>
                    <div v-if="scope.row.event == 10">盲区提醒</div>
                    <div v-if="scope.row.event == 12">路侧告警</div>
                </template>
            </el-table-column>
            <el-table-column prop="alarmLvl" label="预警级别" min-width="10%"></el-table-column>
            <el-table-column prop="dist" label="车距(m)" min-width="8%"></el-table-column>
            <el-table-column label="gps时间(ms)" min-width="20%">
                <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.gpstime,type='yy-mm-dd hh:mm:ss:ms')}}</template>
            </el-table-column>
            <el-table-column prop="hlon" label="自车经度" min-width="12%"></el-table-column>
            <el-table-column prop="hlat" label="自车纬度" min-width="12%"></el-table-column>
            <el-table-column prop="hheading" label="自车航向角 " min-width="10%"></el-table-column>
            <el-table-column prop="rlon" label="远车经度" min-width="12%"></el-table-column>
            <el-table-column prop="rlat" label="远车纬度" min-width="12%"></el-table-column>
            <el-table-column prop="rheading" label="远车航向角" min-width="10%"></el-table-column>   
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
// 模糊查询封装
import SearchFilter from '@/assets/js/module/searchFilter.js'
import {requestqueryVehicleList} from '@/api/search';
import {findEventList} from '@/api/v2x';
export default {
    name: 'EventCom',
    components: {
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
            // startTime:'',
            // endTime:'',
            loading:false,
            searchLoad:false,
            searchKey: {
                hvid: '',
                startTime: '',
                endTime: ''
            },
            pageOption: {
                page: 1,
                size: 10,
                total: 0,
            },
            dataList: [],   
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
    methods: {
        initPageOption() {
            this.dataList = [];
            this.pageOption.total = 0;
            this.pageOption.page = 1;
        },
        initPaging(){
            this.pageOption.page = 1;
            this.pageOption.total = 0;
            this.pageOption.size = 10;
        },
        findEventList(){
            this.dataList = [];
            this.loading = true;
            
            let _params = {
                page: {
                    "pageSize": this.pageOption.size,
                    "pageIndex": this.pageOption.page-1
                },
                ... this.historySearchKey
            }
            findEventList(_params).then(res => {
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
                    this.historySearchKey.startTime = this.$dateUtil.dateToMs(this.searchKey.startTime) || '';
                    this.historySearchKey.endTime = this.$dateUtil.dateToMs(this.searchKey.endTime) || '';
                    this.initPaging();
                    this.findEventList();
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
        changePageSize(value) {//每页显示条数变更
            this.initPageOption();
            this.pageOption.size = value;
            this.findEventList();
        },
        changePageCurrent(value) {//页码变更
            this.pageOption.page = value;
            this.findEventList();
        },
        indexMethod(index){
            return (this.pageOption.page-1) * this.pageOption.size + index + 1;
        }
    },
    mounted(){
        this.searchKey.startTime = this.$dateUtil.GetDateStr(2);
        this.searchKey.endTime = this.$dateUtil.getNowFormatDate();
        this.historySearchKey.startTime = this.$dateUtil.dateToMs(this.searchKey.startTime) || '';
        this.historySearchKey.endTime = this.$dateUtil.dateToMs(this.searchKey.endTime) || '';
        this.findEventList();
    },
}
</script>

