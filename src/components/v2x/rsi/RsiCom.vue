<template>
    <!-- 基本信息 -->
    <div class="c-wrapper-20" v-cloak>
        <el-form :inline="true" :model="searchKey" :rules="rules" ref="searchForm" size='small'>
            <el-form-item label="RSU编号" prop='rsuId'>
                <el-input v-model="searchKey.rsuId"></el-input>
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
        <el-table class='c-mt-10 c-mb-70' :data="dataList" v-loading='loading' max-height="724" stripe>
            <el-table-column type="index" label="序号" :index='indexMethod'></el-table-column>
            <el-table-column prop="msgCnt" label="消息编号" min-width="8%"></el-table-column>
            <el-table-column prop="rsuId" label="RSU编号" min-width="8%"></el-table-column>
            <el-table-column label="时间" min-width="14%">
                <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.time)}}</template>
            </el-table-column>
            <el-table-column label="经度" min-width="10%">
                <template slot-scope="scope">{{scope.row.longitude.toFixed(8)}}</template>
            </el-table-column>
            <el-table-column label="纬度" min-width="10%">
                <template slot-scope="scope">{{scope.row.latitude.toFixed(8)}}</template>
            </el-table-column>
            <el-table-column prop="elevation" label="高程" min-width="8%"></el-table-column>
            <el-table-column prop='content' label="消息内容" min-width="10%"></el-table-column>
            <el-table-column prop='pathPtNum' label="坐标点个数" min-width="8%"></el-table-column>
            <el-table-column label="坐标点串" width='140' :show-overflow-tooltip="true" min-width="24%" class='campLine'>
                <template slot-scope="scope" class="sl-table-text">{{scope.row.alertPath.length > 0 ? scope.row.alertPath : ''}}</template>
            </el-table-column>
            <el-table-column prop='alertRadius' label="警告半径" min-width="10%"></el-table-column>
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
import {findRsiPage} from '@/api/v2x';
export default {
    name: 'RsiCom',
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
            startTime:'',
            endTime:'',
            loading:false,
            searchLoad:false,
            searchKey: {
                rsuId: '',
                startTime: '',
                endTime: '',
                rsuId: '',
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
        }
    },
    methods: {
        init(){
            let startTime = this.$dateUtil.GetDateStr(1);
            let endTime = this.$dateUtil.getNowFormatDate();
            this.searchKey.startTime = startTime;
            this.searchKey.endTime = endTime;
            this.findRsiPage();
            // this.initPaging();
        },
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
        findRsiPage(){
            this.dataList = [];
            this.loading = true;
            findRsiPage({  
                page: {
                    'pageSize': this.pageOption.size,
                    'pageIndex': this.pageOption.page-1
                },
                'rsuId' : this.searchKey.rsuId,
                'startTime':this.searchKey.startTime ? this.$dateUtil.dateToMs(this.searchKey.startTime) : '',
                'endTime':this.searchKey.endTime ? this.$dateUtil.dateToMs(this.searchKey.endTime) : '',        
            }).then(res => {
                if(res.status == '200'){
                    this.dataList = res.data.list;
                    this.pageOption.total = res.data.totalCount;
                }
                this.loading = false;
                this.searchLoad = false;
            }).catch(err => {
                this.loading = false;
                this.searchLoad = false;
            });
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
                    this.findRsiPage();
                } else {
                    return false;
                }
            });
        },
        resetClick(){
            this.$refs.searchForm.resetFields();
        },
        getIsNan(val){
            return typeof(val) == 'number' && window.isNaN(val);
        },
        changePageSize(value) {//每页显示条数变更
            this.initPageOption();
            this.pageOption.size = value;
            this.findRsiPage();
        },
        changePageCurrent(value) {//页码变更
            this.pageOption.page = value;
            this.findRsiPage();
        },
        formatTime(value){
            let tDate = value ? new Date(value) : new Date(); 
            const year = tDate.getFullYear();
            const month = this.formatNum(tDate.getMonth() + 1);
            const day = this.formatNum(tDate.getDate());
            const hour = this.formatNum(tDate.getHours());
            const minutes = this.formatNum(tDate.getMinutes());
            const seconds = this.formatNum(tDate.getSeconds());
            const millisecond = this.formatNum(tDate.getMilliseconds());
            return year + '-' + month + '-' + day + ' ' + hour + ':' + minutes + ':' + seconds + ':' + millisecond ;
        },
        formatNum(value){
            return value < 10 ? '0' + value : value;
        },
        indexMethod(index){
            return index + this.pageOption.size * (this.pageOption.page-1) + 1;
        }
    },
    mounted(){
        this.init();
    },
}
</script>
<style scoped lang="scss">
@import "@/assets/scss/theme.scss";
.el-tooltip {
    @include lineClamp(4);
}
.campLine{
    @include lineClamp(4);
}
</style>