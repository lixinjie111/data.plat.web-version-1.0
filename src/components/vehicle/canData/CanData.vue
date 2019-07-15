<template>
    <!-- 基本信息 -->
    <div class="c-wrapper-20" v-cloak>
        <el-form :inline="true" :model="searchKey" :rules="rules" ref="searchForm" size='small' class="demo-form-inline">
            <el-form-item label="车辆编号" prop='vehicleId'>
                <el-input v-model.trim="searchKey.vehicleId"></el-input>
            </el-form-item>
            <el-form-item label="英文名称">
                <el-input v-model.trim="searchKey.enName"></el-input>
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

            <!-- <el-form-item label="时间" prop='startTime'>
                <el-date-picker
                    v-model.trim="searchKey.startTime"
                    type="datetime"
                    placeholder="开始时间"
                    :editable="false"
                    :clearable="false"
                    :picker-options="startTimeOption"
                    format='yyyy-MM-dd HH:mm:ss'>
                </el-date-picker>
                -
                <el-date-picker
                    v-model.trim="searchKey.endTime"
                    type="datetime"
                    placeholder="结束时间"
                    :editable="false"
                    :clearable="false"
                    :picker-options="endTimeOption"
                    format='yyyy-MM-dd HH:mm:ss'>
                </el-date-picker>
            </el-form-item> -->
            <el-form-item>
                    <el-button type="warning" icon="el-icon-search" :loading='loading' @click="searchClick('searchKey')">查询</el-button>
                    <el-button type="warning" plain icon="el-icon-setting" @click="resetClick">重置</el-button>
                </el-form-item>
            </el-form>
            <el-table border max-height="620" class='c-mb-70' :data="dataList" v-loading='loading' stripe>
                <el-table-column align="center" prop="vehicleId" label="车辆编号"></el-table-column>
                <el-table-column align="center" prop="dataId" label="数据ID"></el-table-column>
                <el-table-column align="center" prop="enName" label="英文名称"></el-table-column>
                <el-table-column align="center" prop="chName" label="中文名称"></el-table-column>
                <el-table-column align="center" prop="dataValue" label="数据值"></el-table-column>
                <el-table-column align="center" prop="time" label="时间"></el-table-column>
            </el-table>
            <div class="c-page clearfix">
                <paging-pre-next ref="pagingPreNext" class="yk-paging" :page-index="pageOption.page" :next-count="pageOption.nextCount" @pagingEvent="pagingFn" @PageSizeEvent="pagingSizeFn"></paging-pre-next>
            </div>
    </div>
</template>
<script>
import TList from '@/common/utils/list.js'
import DatePicker from 'vue2-datepicker'
import PagingPreNext from '@/common/view/PagingPreNext.vue'

export default {
    name: 'BaseMessage',
    components: {
        PagingPreNext,DatePicker,TList
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
            isTimeTip:false,
            isVehicleShow:false,
            loading:false,
            searchKey: {
                vehicleId: '',
                enName: '',
                startTime: '',
                endTime: '',
                nextStartRowMap:new Map(),//下一页用到的rowkey数组
            },
            pageOption: {
                page: 1,
                size: 10,
                total:0,
                nextCount: 0,
                nextPageClick:true//默认点击下一页
            },
            dataList: [],
            current: {
                top: 0
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
        init(){
            this.initPaging();
            this.initSearch();
        },
        initPaging(){
            this.pageOption.page = 1;
            this.pageOption.size = 10;
            this.pageOption.nextCount = 0;
            this.pageOption.nextPageClick =true;
        },
        initSearch(){
            this.searchKey = {
                vehicleId: '',
                enName: '',
                startTime: '',
                endTime: '',
                nextStartRowMap:new Map()
            };
        },
        initData(currentNextStartRow){//currentNextStartRow=null求第一页
            this.getRealTimeList(this.pageOption.size,this.pageOption.page,currentNextStartRow,this.getDataList);
        },
        getNextCount(list){
          list != null ?this.pageOption.nextCount = list.length : this.pageOption.nextCount = 0;
        },
        getDataList(list){
            let _this =this;
            _this.dataList =list;
             var rowKey = "";
            if( _this.dataList != null){
                _this.dataList = _this.dataList.filter(function(item){
                    if(item.enName == "ROWKEY"){
                        rowKey= item.dataValue;//赋值当前页最后一条rowkey记录值
                    }
                    item.time = _this.$dateUtil.formatTime(item.time,'yy-mm-dd hh:mm:ss:ms');
                    return item.enName != "ROWKEY";
                });
            }
            if(_this.pageOption.nextPageClick) {//点击下一页查询
                _this.searchKey.nextStartRowMap.set(_this.pageOption.page,rowKey);
                //设置下一页的记录数
                _this.pageOption.nextCount = 0;
                if(rowKey != "" && this.pageOption.nextPageClick){
                     _this.getRealTimeList(_this.pageOption.size,_this.pageOption.page + 1,rowKey,_this.getNextCount);
                }
            }
        },
        getRealTimeList(pageSize,pageIndex,currentNextStartRow,callback){
            this.loading = true;
            this.$api.post('dataPlatApp/dynamic/realTime/list',{
                "pageSize": pageSize,
                "pageIndex": pageIndex,
                "param":{
                   vehicleId:this.searchKey.vehicleId,
                   enName:this.searchKey.enName,
                   startTime:this.$dateUtil.dateToMs(this.searchKey.startTime),
                   endTime:this.$dateUtil.dateToMs(this.searchKey.endTime),
                   nextStartRow:currentNextStartRow == undefined ? null: currentNextStartRow
                }
            },response => {
                if(response.status == 200){
                    if(response.data.list && response.data.list.length > 0){
                        this.pageOption.total = response.data.list.length;
                        callback(response.data.list);
                    }
                    this.loading = false;
                }else{
                    this.$message.error("获取列表失败！");
                }
            }, error => {
                this.$message.error("获取列表error！");
                this.loading = false;
            });
        },
        searchClick(){
            this.$refs.searchForm.validate((valid) => {
                if (valid) {
                    this.initPaging();
                    this.initData();
                } else {
                    return false;
                }
            });
        },
        resetClick(){
            this.initPaging();
            this.initSearch();
            this.dataList=[];
            this.isVehicleShow = false;
            this.isTimeTip = false;
            this.$refs.searchForm.resetFields();
        },
        pagingFn(value){
            var currentIndex = this.pageOption.page;
            this.pageOption.page = value;

            if(currentIndex < value){ //点击下一页
                this.pageOption.nextPageClick=true;
                if(value <= 1){//第一页
                    this.initData();
                }else{
                    this.initData(this.searchKey.nextStartRowMap.get(currentIndex));
                }
            }
            else if(currentIndex > value){ //点击上一页
                this.pageOption.nextPageClick=false;
                if(value <= 1){
                    this.initData();
                }else{
                    this.initData(this.searchKey.nextStartRowMap.get(currentIndex-2));
                }
                this.pageOption.nextCount= 100;//点击上一页肯定下一页可用
            }
        },
        pagingSizeFn(value){
            this.pageOption.page =1;
            this.pageOption.size = value;
            this.pageOption.total = 0;
            this.pageOption.nextPageClick =true;//初始化
            this.searchKey.nextStartRow =[];
            this.initData();
        },
        validateSearch(o){
            var validatePass=true;
            var _this =this;
            let vehicleIdTip = document.getElementById("vehicleIdTip");
                let timeTip = document.getElementById("timeTip");
                if(_this.searchKey.vehicleId != ""){
                    _this.isVehicleShow = false;
                }else{
                    if(o == "isSearch"){
                        _this.isVehicleShow = true;
                    }
                    validatePass=false;
                }

                if((_this.searchKey.startTime == null || _this.searchKey.startTime == "")
                || (_this.searchKey.endTime == null || _this.searchKey.endTime == "")){
                     if(o == "isSearch"){
                         _this.isTimeTip = true;
                     }
                    validatePass=false;
                }else{
                    _this.isTimeTip = false;
                }

           return validatePass;
        }
    },
    mounted(){
        this.init();
    },
}
</script>
<style>
#bread-crumb li{ display:inline}
</style>
