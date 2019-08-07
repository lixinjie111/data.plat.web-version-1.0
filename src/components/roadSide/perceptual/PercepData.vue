<template>
    <!-- 基本信息 -->
    <div class="c-wrapper-20" v-cloak>
        <el-form ref="searchForm" :inline="true" :model="searchKey" size="small">
            <el-form-item label="路侧点名称:" prop='rsPtId'>
                <el-select
                    v-model.trim="searchKey.rsPtName"
                    filterable
                    remote
                    reserve-keyword
                    placeholder="请输入关键词"
                    :remote-method="rsPointNameRemoteMethod"
                    @focus="$searchFilter.remoteMethodClick(rsPointNameOption, searchKey, 'rsPtName', searchUrl)"
                    @blur="$searchFilter.remoteMethodBlur(searchKey, 'rsPtName')" 
                    :loading="rsPointNameOption.loading">
                    <el-option
                        v-for="item in rsPointNameOption.filterOption"
                        :key="item.rsPtName"
                        :label="item.rsPtName"
                        :value="item.rsPtName">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="摄像头编号:" prop='cameraId'>
                <el-select 
                    v-model="searchKey.cameraId"
                    filterable
                    remote
                    reserve-keyword
                    placeholder="请输入关键词"
                    :remote-method="rsCamCodeRemoteMethod"
                    @focus="$searchFilter.remoteMethodClick(rsCamCodeOption, searchKey, 'cameraId', searchUrl)"
                    @blur="$searchFilter.remoteMethodBlur(searchKey, 'cameraId')" 
                    :loading="rsCamCodeOption.loading"
                    >
                    <!-- :remote-method=""> -->
                    <el-option
                        v-for="item in rsCamCodeOption.filterOption"
                        :key="item.deviceId"
                        :label="item.deviceId"
                        :value="item.deviceId"
                    ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="摄像头序列号:" prop='serialNum'>
                <el-select 
                    v-model="searchKey.serialNum"
                    filterable
                    remote
                    reserve-keyword
                    placeholder="请输入关键词"
                    :remote-method="rsSerialNumRemoteMethod"
                    @focus="$searchFilter.remoteMethodClick(rsCamCodeOption, searchKey, 'serialNum', searchUrl)"
                    @blur="$searchFilter.remoteMethodBlur(searchKey, 'serialNum')" 
                    :loading="rsCamCodeOption.loading"
                    >
                    <!-- :remote-method=""> -->
                    <el-option
                        v-for="item in rsSerialNumOption.filterOption"
                        :key="item.serialNum"
                        :label="item.serialNum"
                        :value="item.serialNum"
                    ></el-option>
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
            :data="showDataList"
            v-loading="loading"  
            border
            class="c-mb-70"
            max-height="724"
            stripe>
            <el-table-column label="编号" type="index" :index="indexMethod"></el-table-column>
            <el-table-column min-width="17%" label="摄像头序列号" prop="serialNum"></el-table-column>
            <el-table-column min-width="45%" label="文件名称" prop="fileName"></el-table-column>
            <el-table-column min-width="15%" label="开始时间">
                <template slot-scope="scope">{{$dateUtil.formatTimeReal(scope.row.startTime)}}</template>
            </el-table-column>
            <el-table-column min-width="15%" label="结束时间">
                <template slot-scope="scope">{{$dateUtil.formatTimeReal(scope.row.endTime)}}</template>
            </el-table-column>
            <el-table-column min-width="8%" label="操作">
                <template slot-scope="scope">
                    <el-button size="small" icon="el-icon-view" circle type="warning" plain :loading="scope.row.loading" @click="goDetail(scope.row)"></el-button>
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
</template>
<script>
import {findVideoRecords,findRoadMonitorCameraInfo} from '@/api/roadSide';
import TList from '@/common/utils/list.js'
import VueDatepickerLocal from 'vue-datepicker-local'
import {requestRSCamList,requestqueryRoadPointList} from '@/api/search';
export default {
    name: 'VideoManage',
    components: {
        VueDatepickerLocal
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
        // 110108_001
        // 3402000000132000001101
        // 3402000000132000000301
        return {
            pageOption: {
                size: 10,
                total: 0,
                page: 1
            },
            searchLoad:false,
            loading: false,
            rsPtIdList:[],
            cameraIdList:[],
            serialNumList:['3402000000132000003001', '3402000000132000003101', '3402000000132000003201', '3402000000132000003301'],
            deviceIdList:[],
            inputFlag: true,
            requestData: {},
            searchKey: {
                rsPtId:'',
                rsPtName:'',
                cameraId:'',
                // serialNum:'',
                // serialNum:'3402000000132000001601',
                // serialNum:'3402000000132000001401',
                serialNum:'',
                deviceId:'',
                startTime:'' ,
                endTime: ''
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
            panel: {
                title: '提示',
                type: '',
                msg: '',
                data: '',
                show: false,
                cfgShow: false,
            },
            dataList: [],
            showDataList: [],
            rsCamCodeOption: {
                loading: false,
                timer: null,
                filterOption: [],
                defaultOption: [],
                defaultFlag: false
            },
            rsSerialNumOption: {
                loading: false,
                timer: null,
                filterOption: [],
                defaultOption: [],
                defaultFlag: false
            },
            rsPointNameOption: {
                loading: false,
                timer: null,
                filterOption: [],
                defaultOption: [],
                defaultFlag: false
            },
            searchUrl: requestRSCamList,
            roadPointUrl:requestqueryRoadPointList
        }
    },
    mounted(){
        this.searchKey.serialNum = '3402000000132000003001';
        this.searchKey.startTime = this.$dateUtil.GetDateStr(7);
        this.searchKey.endTime = this.$dateUtil.getNowFormatDate();
        this.initData();
    },
    methods: {
        initPageOption() {
            this.dataList = [];
            this.pageOption.total = 0;
            this.pageOption.page = 1;
        },
        goDetail(row){
            this.$router.push('/percepDetail/'+row.serialNum+'/'+row.startTime+'/'+row.endTime);
        },
        initSearch(){
            this.rsPtIdList = [];
            this.cameraIdList = [];
            this.serialNumList = [];
            this.deviceIdList = [];
        },
        initData(){
            // this.initPaging();
            this.loading = true;
            findVideoRecords({
                'serialNum':  this.searchKey.serialNum,
                'startTime': this.searchKey.startTime ? this.$dateUtil.dateToMs(this.searchKey.startTime) : '',
                'endTime':  this.searchKey.endTime ? this.$dateUtil.dateToMs(this.searchKey.endTime) : ''
            }).then(res => {
                if(res.status == '200'){
                    res.data.forEach((item) => {
                        item.loading = false;
                    });
                    this.dataList = res.data;
                    this.showDataList = this.dataList;
                    this.pageOption.total = res.data.length;
                    if(this.pageOption.total > this.pageOption.size) {
                        this.initShowData();
                    }else {
                        this.showDataList = this.dataList;
                    }
                }
                this.searchLoad = false;
                this.loading = false;
            }).catch(err => {
                this.loading = false;
                this.searchLoad = false;
            })
        },
        initPaging() {
            this.dataList = [];
            this.showDataList = [];
            this.pageOption.total = 0;
            this.pageOption.page = 1;
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
        initShowData() {
            let _index = this.pageOption.page-1;
            let _handleList = Object.assign([], this.dataList);
            this.showDataList = _handleList.splice(_index*this.pageOption.size, this.pageOption.size);
        },
        indexMethod(index) {
            return (this.pageOption.page-1) * this.pageOption.size + index + 1;
        },
        searchClick(){
            this.searchLoad = true;
            this.$refs.searchForm.validate((valid) => {
                if (valid) {
                    this.initPaging();
                    this.initData();
                } else {
                    return false;
                }
            });
        },
        getCarmSerial(){
            let serialNum = this.searchKey.serialNum;
            this.getCameraIds('',serialNum,'','');
        },
        resetClick(){
            this.$refs.searchForm.resetFields();
            this.rsCamCodeOption.defaultOption = [];
        },
        rsCamCodeRemoteMethod(query) {
            this.$searchFilter.publicRemoteMethod({
                query: query,
                searchOption: this.rsCamCodeOption,
                searchObj: this.searchKey,
                key: 'cameraId',
                request: this.searchUrl
            });
        },
        rsSerialNumRemoteMethod(query) {
            this.$searchFilter.publicRemoteMethod({
                query: query,
                searchOption: this.rsCamCodeOption,
                searchObj: this.searchKey,
                key: 'serialNum',
                request: this.searchUrl
            });
        },
        rsPointNameRemoteMethod(query) {
            this.$searchFilter.publicRemoteMethod({
                query: query,
                searchOption: this.rsPointNameOption,
                searchObj: this.searchKey,
                key: 'rsPtName',
                request: this.roadPointUrl
            });
        },
    }
}
</script>
