<template>
    <!-- 基本信息 -->
    <div class="c-wrapper-20" v-cloak>
        <el-form ref="searchForm" :inline="true" :model="searchKey" :rules="rules" class="demo-form-inline" size="small">
            <el-form-item label="路侧基本点:">
                <el-input v-model.trim="searchKey.rsPtId" clearable @change="changeEvent($event, 'rsPtId')" @blur='getRequestData("rsPtId")' @keyup.13='getRequestData("rsPtId")'></el-input>
            </el-form-item>
            <el-form-item label="摄像头ID:">
                <el-select v-model="searchKey.cameraId" @change='getRequestData("cameraId")' v-if="cameraIdList.length > 0">
                    <el-option
                        v-for="item in cameraIdList"
                        :key="item.value"
                        :label="item.value"
                        :value="item.value"
                    ></el-option>
                </el-select>
                <el-input v-model.trim="searchKey.cameraId" clearable @change="changeEvent($event, 'cameraId')" @blur='getRequestData("cameraId")' @keyup.13='getRequestData("cameraId")' v-else></el-input>
            </el-form-item>
            <el-form-item label="摄像头序列号:" prop='serialNum'>
                <el-select v-model="searchKey.serialNum" @change='getRequestData("serialNum")' v-if="!inputFlag">
                    <el-option
                        v-for="item in serialNumList"
                        :key="item.value"
                        :label="item.value"
                        :value="item.value"
                    ></el-option>
                </el-select>
                <el-input v-model.trim="searchKey.serialNum" clearable @change="changeEvent($event, 'serialNum')" @blur='getRequestData("serialNum")' @keyup.13='getRequestData("serialNum")' v-else></el-input>
            </el-form-item>
            <el-form-item label="感知设备ID:">
                <el-select v-model="searchKey.deviceId" @change='getRequestData("deviceId")' v-if="!inputFlag">
                    <el-option
                        v-for="item in deviceIdList"
                        :key="item.value"
                        :label="item.value"
                        :value="item.value"
                    ></el-option>
                </el-select>
                <el-input v-model.trim="searchKey.deviceId" clearable @change="changeEvent($event, 'deviceId')" @blur='getRequestData("deviceId")' @keyup.13='getRequestData("deviceId")' v-else></el-input>
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

            <!-- <el-form-item label="开始时间:" prop='startTime'>
                <el-date-picker
                    v-model.trim="searchKey.startTime"
                    type="date"
                    placeholder="开始时间"
                    :picker-options="startTimeOption">
                </el-date-picker>
            </el-form-item>
            <el-form-item label="结束时间:" prop='endTime'>
                <el-date-picker
                    v-model.trim="searchKey.endTime"
                    type="date"
                    placeholder="结束时间"
                    :picker-options="endTimeOption">
                </el-date-picker>
            </el-form-item> -->
            <el-form-item>
                <el-button type="warning" icon="el-icon-search" :loading='loading' @click="searchClick('searchKey')">查询</el-button>
            </el-form-item>
        </el-form>
        <el-table 
            :data="showDataList"
            v-loading="loading" 
            stripe>
            <el-table-column fixed align="center" min-width="5%" label="编号" type="index" :index="indexMethod"></el-table-column>
            <el-table-column align="center" min-width="20%" label="摄像头序列号" prop="serialNum"></el-table-column>
            <el-table-column align="center" min-width="35%" label="文件名称" prop="fileName"></el-table-column>
            <el-table-column align="center" min-width="15%" label="开始时间">
                <template slot-scope="scope">{{$dateUtil.formatTimeReal(scope.row.startTime)}}</template>
            </el-table-column>
            <el-table-column align="center" min-width="15%" label="结束时间">
                <template slot-scope="scope">{{$dateUtil.formatTimeReal(scope.row.endTime)}}</template>
            </el-table-column>
            <el-table-column align="center" min-width="10%" label="操作">
                <template slot-scope="scope">
                    <el-button size="mini" type="primary" :loading="scope.row.loading" @click="goDetail(scope.row)">打开</el-button>
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
import TList from '@/common/utils/list.js'
import VueDatepickerLocal from 'vue-datepicker-local'
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
            loading: false,
            cameraIdList:[],
            serialNumList:[],
            deviceIdList:[],
            inputFlag: true,
            requestData: {},
            searchKey: {
                rsPtId:'',
                cameraId:'',
                // serialNum:'3402000000132000001601',
                serialNum:'3402000000132000001401',
                deviceId:'',
                startTime: new Date(),
                endTime: new Date()
            },
            rules:{
                serialNum:[
                    { required: true, message: '摄像头序列号不能为空!', trigger: 'blur' },
                ],
                startTime:[
                    { required: true, message: '开始时间不能为空', trigger: 'change' },
                    { validator: _checkStartTime, trigger: 'blur' }
                ],
                endTime:[
                    { required: true, message: '结束时间不能为空', trigger: 'change' },
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
            panel: {
                title: '提示',
                type: '',
                msg: '',
                data: '',
                show: false,
                cfgShow: false,
            },
            dataList: [],
            showDataList: []
        }
    },
    mounted(){
        let _timeStart = new Date("2019-06-10 10:47:09").getTime();
        // console.log(_timeStart);
        let _videoTime = 773.560*1000;
        let _timeEnd = _timeStart+_videoTime;
        // console.log(_timeEnd);
        // console.log(new Date(_timeEnd));
    },
    methods: {
        initPageOption() {
            this.dataList = [];
            this.pageOption.total = 0;
            this.pageOption.page = 1;
        },
        changeEvent($event, type) {
            if($event == '') {
                this.searchKey.rsPtId = '';
                this.searchKey.cameraId = '';
                this.searchKey.serialNum = '';
                this.searchKey.deviceId = '';
                this.inputFlag = true;
                this.requestData = {};
                this.initSearch();
            }
        },
        goDetail(row){
            this.$router.push('/percepDetail/'+row.serialNum+'/'+row.startTime+'/'+row.endTime);
        },
        initSearch(){
            this.cameraIdList = [];
            this.serialNumList = [];
            this.deviceIdList = [];
        },
        getRequestData(type){
            if(this.searchKey[type] != '') {

                this.requestData = {};

                if(type == 'rsPtId') {

                    this.inputFlag = false;

                    this.searchKey.cameraId = '';
                    this.searchKey.serialNum = '';
                    this.searchKey.deviceId = '';

                }else {

                    if(type == 'cameraId' && this.cameraIdList.length == 0) {

                        this.inputFlag = true;
                        this.searchKey.rsPtId = '';
                        this.searchKey.serialNum = '';
                        this.searchKey.deviceId = '';
                    }else if(type == 'serialNum' && this.serialNumList.length == 0) {

                        this.inputFlag = true;
                        this.searchKey.rsPtId = '';
                        this.searchKey.cameraId = '';
                        this.searchKey.deviceId = '';
                    }else if(type == 'deviceId' && this.deviceIdList.length == 0) {

                        this.inputFlag = true;
                        this.searchKey.rsPtId = '';
                        this.searchKey.cameraId = '';
                        this.searchKey.serialNum = '';
                    }
                }

                this.requestData[type] = this.searchKey[type];
                
                this.getCameraIds(type);

            }else {
                this.inputFlag = true;
            }
  
        },
        getCameraIds(type){//获取摄像头Id列表
            this.$api.post('perception/findRoadMonitorCamera', this.requestData, response => {
                if(response.status == 200){
                    let info = response.data;
                    if(info.length > 0) {
                        this.searchKey.rsPtId = info[0].rsPtId;
                        if(type == 'rsPtId') {
                            this.initSearch();
                            info.forEach(element => {
                                this.cameraIdList.push({
                                    value: element.cameraId
                                });
                                this.serialNumList.push({
                                    value: element.serialNum
                                });
                                this.deviceIdList.push({
                                    value: element.deviceId
                                });
                            });
                        }else {
                            if(this.searchKey.rsPtId != info[0].rsPtId) this.searchKey.rsPtId = info[0].rsPtId;
                            if(this.searchKey.cameraId != info[0].cameraId) this.searchKey.cameraId = info[0].cameraId;
                            if(this.searchKey.serialNum != info[0].serialNum) this.searchKey.serialNum = info[0].serialNum;
                            if(this.searchKey.deviceId != info[0].deviceId) this.searchKey.deviceId = info[0].deviceId;
                        }
                    }else {
                        this.$message.error("没要找到对应信息！");
                    }
                }else{
                    this.$message.error("获取列表error！");
                }
            });
        },
        initData(params){
            this.initPaging();
            this.loading = true;
            this.$api.post('perception/findVideoRecords',params,response => {
                if(response.status >= 200 && response.status < 300){
                    response.data.forEach((item) => {
                        item.loading = false;
                    });
                    this.dataList = response.data.data;
                    this.pageOption.total = response.data.data.length;
                    if(this.pageOption.total > this.paging.size) {
                        this.initShowData();
                    }else {
                        this.showDataList = this.dataList;
                    }
                }else{
                    this.$message.error("获取列表error！");
                }
                this.loading = false;
            }, error => {
                this.$message.error("获取列表error！");
                this.loading = false;
            });
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
            this.$refs.searchForm.validate((valid) => {
                if (valid) {
                    let _params = {
                        serialNum:  this.searchKey.serialNum,
                        startTime:  this.$dateUtil.dateToMs(this.searchKey.startTime),
                        endTime:  this.$dateUtil.dateToMs(this.searchKey.endTime)
                    }
                    this.initPaging();
                    this.initData(_params);
                } else {
                    return false;
                }
            });
        },
        getCarmSerial(){
            let serialNum = this.searchKey.serialNum;
            this.getCameraIds('',serialNum,'','');
        }
    }
}
</script>
