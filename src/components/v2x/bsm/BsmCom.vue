<template>
    <!-- 基本信息 -->
    <div class="c-wrapper-20" v-cloak>
        <div v-show="!panel.show && !panel.cfgShow" class="yk-container c-mt-10">
            <el-form :inline="true" :model="searchKey" :rules="rules" ref="searchForm" size='small' class="demo-form-inline">
                <el-form-item label="车辆编号:" prop='vehicleId'>
                    <el-input v-model="searchKey.vehicleId"></el-input>
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
                    <el-button type="warning" icon="el-icon-search" :loading='searchLoad' @click="searchClick('searchKey')">查询</el-button>
                    <el-button type="warning" plain icon="el-icon-setting" @click="resetClick">重置</el-button>
                </el-form-item>
            </el-form>
            <el-table :data="dataList" v-loading='loading' max-height="499" class='c-mt-10 c-mb-70' stripe>
                <el-table-column fixed align="center" type="index" label="No" :index='indexMethod'></el-table-column>
                <el-table-column align="center" prop="msgCnt" label="消息编号"></el-table-column>
                <el-table-column align="center" prop="vehicleId" label="车辆编号"></el-table-column>
                <el-table-column align="center" prop="plateNo" label="车牌号码"></el-table-column>
                <el-table-column align="center" label="时间">
                    <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.gpstime)}}</template>
                </el-table-column>
                <el-table-column align="center" label="经度">
                    <template slot-scope="scope">{{Number(scope.row.longitude).toFixed(8)}}</template>
                </el-table-column>
                <el-table-column align="center" label="纬度">
                    <template slot-scope="scope">{{Number(scope.row.latitude).toFixed(8)}}</template>
                </el-table-column>
                <el-table-column align="center" prop="altitude" label="高程"></el-table-column>
                <el-table-column align="center" label="车速">
                    <template slot-scope="scope">{{Number(scope.row.speed).toFixed(1)}}</template>
                </el-table-column>
                <el-table-column align="center" label="航向">
                    <template slot-scope="scope">{{Number(scope.row.heading).toFixed(1)}}</template>
                </el-table-column>
                <el-table-column align="center" prop="angle" label="方向盘转角"></el-table-column>
                <el-table-column align="center" label="刹车踏板">
                    <template slot-scope="scope">
                            <div v-if="scope.row.brakePedal == 'on' || scope.row.brakePedal == 'ON'" class="msg-right">是</div>
                            <div v-if="scope.row.brakePedal == 'off' || scope.row.brakePedal == 'OFF'" class="msg-right">否</div>
                            <div v-if="scope.row.brakePedal == 'unavailable' || scope.row.brakePedal == 'UNAVAILABLE'" class="msg-right">不支持</div>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="操作">
                    <template slot-scope="scope">
                        <el-button size="mini" type="warning" plain @click="detail(scope.row)">明细</el-button>
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
        <bsm-detail ref='bsmDetail' v-show='panel.cfgShow' :data='panel.data' @backClick='backFn'></bsm-detail>
    </div>
</template>
<script>
import Paging from '@/common/view/Paging.vue'
import BsmDetail from '@/components/v2x/bsm/BsmDetail.vue'
import {findBSMList} from '@/api/v2x';
export default {
    name: 'BsmCom',
    components: {
        Paging,
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
            startTime:'',
            endTime:'',
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
                cfgShow: false,
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
        }
    },
    methods: {
        init(){
            this.findBSMList();
            this.initPaging();
            this.initSearch();
        },
        initPageOption() {
            this.dataList = [];
            this.pageOption.total = 0;
            this.pageOption.page = 1;
        },
        detail(item){
            this.panel.title = '明细';
            this.panel.type = 'detail';
            this.panel.data = item;
            this.panel.show = false;
            this.panel.cfgShow = true;
            this.$refs.bsmDetail.init(item);
        },
        initPaging(){
            this.pageOption.page = 1;
            this.pageOption.total = 0;
            this.pageOption.size = 10;
        },
        initSearch(){
            this.searchKey = {
                vid: '',
                startTime: '',
                endTime: ''
            };
        },
        findBSMList(){
            this.dataList = [];
            this.loading = true;
            findBSMList({
                vehicleId : this.searchKey.vehicleId,
                startTime:this.searchKey.startTime ? this.$dateUtil.dateToMs(this.searchKey.startTime) : '',
                endTime:this.searchKey.endTime ? this.$dateUtil.dateToMs(this.searchKey.endTime) : '',
                page: {
                    "pageSize": this.pageOption.size,
                    "pageIndex": this.pageOption.page-1
                }, 
            }).then(res => {
                if(res.status == '200'){
                    res.data.list.forEach((item) => {
                        item.loading = false;
                    });
                    this.dataList = res.data.list;
                    this.pageOption.total = res.data.totalCount;
                }
            }).catch(err => {
                this.loading = false;
            })
        },
        searchClick(){
            this.searchLoad = true;
            let startTime = new Date(this.searchKey.startTime).getTime();
            let endTime = new Date(this.searchKey.endTime).getTime();
            if(this.getIsNan(startTime) == false && this.getIsNan(endTime) == false){
                if(startTime > endTime){
                    this.$message.error("结束时间不能小于开始时间！");
                    return;
                }
            }
            this.$refs.searchForm.validate((valid) => {
                if (valid) {
                    this.findBSMList();
                } else {
                    return false;
                }
            });
        },
        resetClick(){
            this.$refs.searchForm.resetFields();
            this.init();
        },
        getIsNan(val){
            return typeof(val) == 'number' && window.isNaN(val);
        },
        changePageSize(value) {//每页显示条数变更
            this.initPageOption();
            this.pageOption.size = value;
            this.findBSMList();
        },
        changePageCurrent(value) {//页码变更
            this.pageOption.page = value;
            this.findBSMList();
        },
        backFn(){
            this.panel.show = false;
            this.panel.cfgShow = false;
        },
        indexMethod(index){
            return (this.pageOption.index-1) * this.pageOption.size + index + 1;
        }
    },
    mounted(){
        this.init();
    },
    beforeDestroy(){

    },
}
</script>
