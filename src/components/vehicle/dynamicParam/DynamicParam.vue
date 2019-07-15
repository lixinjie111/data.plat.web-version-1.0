<template>
    <!-- 基本信息 -->
    <div class="c-wrapper-20" v-cloak>
        <div v-show="!panel.detailShow && !panel.localDataShow">
            <el-form :inline="true" :model="searchKey" :rules="rules" ref="searchForm" size='small' class="demo-form-inline">
                <el-form-item label="车辆编号" prop='vehicleId'>
                    <el-input v-model.trim="searchKey.vehicleId"></el-input>
                </el-form-item>
                <el-form-item label="事件名称">
                    <el-input v-model.trim="searchKey.eventName"></el-input>
                </el-form-item>
                <el-form-item label="事件编号">
                    <el-input v-model.trim="searchKey.eventNo"></el-input>
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
                    <el-button type="warning" icon="el-icon-search" :loading='loading' @click="searchClick('searchKey')">查询</el-button>
                    <el-button type="warning" plain icon="el-icon-setting" @click="resetClick">重置</el-button>
                </el-form-item>
            </el-form>

            <div class="c-button-wrapper c-text-right">
                <el-button size="mini" plain icon="el-icon-edit" @click="localClick();">获取本地数据</el-button>
            </div>
            
            <el-table :data="dataList" v-loading='loading' stripe border max-height="620" class='c-mb-70'>
                <el-table-column fixed align="center" prop="eventName" label="事件名称"></el-table-column>
                <el-table-column align="center" prop="eventNo" label="事件编号"></el-table-column>
                <el-table-column align="center" prop="vehicleId" label="车辆编号"></el-table-column>
                <el-table-column align="center" label="事件触发时间">
                    <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.eventTime)}}</template>
                </el-table-column>
                <el-table-column align="center" label="数据采集开始时间">
                    <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.beginTime)}}</template>
                </el-table-column>
                <el-table-column align="center" label="数据采集结束时间">
                    <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.endTime)}}</template>
                </el-table-column>
                <el-table-column align="center" prop="status" label="采集状态"></el-table-column>
                <el-table-column align="center" prop="vehicleId" label="操作"></el-table-column>                
            </el-table>
            
            <div class="c-page clearfix">
                <el-pagination
                    background
                    @current-change="changePageCurrent" 
                    :current-page="pageOption.page" 
                    :total="pageOption.total"
                    @size-change="changePageSize"
                    :page-sizes="[10,20,50,100,200,500]" 
                    :page-size="pageOption.size"
                    layout="total, sizes, prev, pager, next">
                </el-pagination>
            </div>
        </div>
        <div>
            <local-data-panel ref="localDataPanel" @localDataPanelBack="init" v-show="!panel.detailShow && panel.localDataShow" :title="panel.title" :type="panel.type" :data="panel.data"></local-data-panel>
            <detail-panel ref="detailPanel" @detailPanelBack="panelBack" v-show="panel.detailShow && !panel.localDataShow" :title="panel.title" :type="panel.type" :data="panel.data"></detail-panel>
        </div>

    </div>
</template>
<script>
import TList from '@/common/utils/list.js'
import DatePicker from 'vue2-datepicker'
import LocalDataPanel from '@/components/vehicle/dynamicParam/LocalDataPanel.vue'
import DetailPanel from './DetailPanel.vue'

export default {
    name: 'BaseMessage',
    components: {
        LocalDataPanel,DatePicker,DetailPanel
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
            isTimeShow:false,
            isVehicleShow:false,
            loading:false,
            searchKey: {
                vehicleId: '',
                eventName: '',
                eventNo: '',
                startTime: '',
                endTime: ''
            },
            pageOption: {
                page: 1,
                size: 10,
                total: 0,
            },
            currentPage:1,
            dataList: [],
            panel: {
                title: '提示',
                type: '',
                msg: '',
                data: this.initCarVo(),
                detailShow: false,
                localDataShow: false,
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
            }  
        }
    },
    methods: {
        initCarVo(){
            return {
                "id":"",
                "vehicleId":"",
                "vin":"",
                "plateNo":"",
                "color":"",
                "phoneNum":"",
                "brandModelId":"",
                "brand": 0,
                "model": 0,
                "type": 0,
                "usage": 0,
                "engineType": 0,
                "emission": 0,
                "size": 0,
                "autoLevel": 0,
                "accessPlatform": 0,
            };
        },
        initPageOption() {
            this.dataList = [];
            this.pageOption.total = 0;
            this.pageOption.page = 1;
        },
        init(){
            this.isTimeShow = false;
            this.isVehicleShow = false;
            this.panel.detailShow = false;
            this.panel.localDataShow=false;
            this.initPaging();
            this.initSearch();
            this.dataList = [];
        },
        initPaging(){
            this.pageOption.page = 1;
            this.pageOption.total = 0;
            this.pageOption.size = 10;
        },
        initSearch(){
            this.searchKey = {
                vehicleId: '',
                eventName: '',
                eventNo: '',
                startTime: '',
                endTime: ''
            };
        },
        initData(){
            let _this = this;
            _this.dataList = [];
            _this.loading = true;
            _this.$api.post('dataPlatApp/dynamic/event/list',{
                "pageSize": this.pageOption.size,
                "pageIndex": this.pageOption.page - 1,
                "param":{
                    vehicleId: this.searchKey.vehicleId,
                    eventName: this.searchKey.eventName,
                    eventNo: this.searchKey.eventNo,
                    startTime: this.$dateUtil.dateToMs(_this.searchKey.startTime),
                    endTime: this.$dateUtil.dateToMs(_this.searchKey.endTime)
                }
            },response => {
                if(response.status >= 200){
                    if(response.data.list && response.data.list.length > 0){
                        _this.dataList = response.data.list;
                        _this.pageOption.total = response.data.totalCount;
                    }
                }else{
                    _this.$message.error("获取列表失败！");
                }
                _this.loading = false;
            },error => {
                _this.loading = false;
            });
        },
        localClick(){
            this.panel.title = '获取本地数据';
            this.panel.type = 'local';
            this.panel.detailShow = false;
            this.panel.localDataShow = true;
            this.$refs.localDataPanel.init();

        },

        lookClick(queryId){
            this.panel.title = '查看';
            this.panel.type = 'look';
            this.panel.detailShow = true;
            this.panel.localDataShow = false;
            this.$refs.detailPanel.init(queryId);
        },
        panelBack(){
            this.panel.detailShow = false;
            this.panel.localDataShow = false;
        },
        searchClick(){
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
            this.$refs.searchForm.resetFields();
        },
        cfgPanelFn(data){
            this.panel.show = false;
            this.panel.cfgShow = false;
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
    mounted(){
        let _this=this;
        this.init();
    },
    beforeDestroy(){

    },
}
</script>
<style>
#bread-crumb li{ display:inline}
</style>
