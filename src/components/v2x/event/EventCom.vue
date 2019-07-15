<template>
    <!-- 基本信息 -->
    <div class="c-wrapper-20" v-cloak>
        <el-form :inline="true" :model="searchKey" :rules="rules" ref="searchForm" size='small' class="demo-form-inline">
            <el-form-item label="自车Id" prop='hvid'>
                <el-input v-model="searchKey.hvid"></el-input>
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
        <el-table class='c-mt-10' :data="dataList" max-height='500' stripe v-loading='loading'>
            <el-table-column fixed align="center" type="index" label="No" :index='indexMethod'></el-table-column>
            <el-table-column align="center" prop="msgCnt" label="消息编号"></el-table-column>
            <el-table-column align="center" prop="hvid" label="自车Id"></el-table-column>
            <el-table-column align="center" prop="rvid" label="远车Id"></el-table-column>
            <el-table-column align="center" label="预警类型">
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
            <el-table-column align="center" prop="alarmLvl" label="预警级别"></el-table-column>
            <el-table-column align="center" prop="dist" label="车距"></el-table-column>
            <el-table-column align="center" label="gps时间">
                <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.gpstime)}}</template>
            </el-table-column>
            <el-table-column align="center" prop="hlon" label="HV经度"></el-table-column>
            <el-table-column align="center" prop="hlat" label="HV纬度"></el-table-column>
            <el-table-column align="center" prop="hheading" label="HV方向"></el-table-column>
            <el-table-column align="center" prop="rlon" label="RV经度"></el-table-column>
            <el-table-column align="center" prop="rlat" label="RV纬度"></el-table-column>
            <el-table-column align="center" prop="rheading" label="RV方向"></el-table-column>   
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
</template>
<script>
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
            startTime:'',
            endTime:'',
            loading:false,
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
                hvid:[
                    { required: true, message: '自车ID不能为空!', trigger: 'blur' },
                ],
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
        initSearch(){
            this.searchKey = {
                hvid: '',
                startTime: '',
                endTime: ''
            };
        },
        initData(){
            this.dataList = [];
            this.loading = true,
            // data_plat_webapp_war_exploded/v2x/findEventList
            this.$api.post('dataPlatApp/v2x/findEventList',{                 
                page: {
                    "pageSize": this.pageOption.size,
                    "pageIndex": this.pageOption.page-1
                },
                hvid : this.searchKey.hvid,
                startTime:this.$dateUtil.dateToMs(this.searchKey.startTime),
                endTime:this.$dateUtil.dateToMs(this.searchKey.endTime),
            },response => {
                if(response.data.code == '200'){
                    this.dataList = response.data.data.list;
                    this.paging.total = response.data.data.totalCount;
                    this.$message.success(response.data.message);
                    this.loading = false;
                }else{
                    this.loading = false;
                    this.$message.error(response.data.message);
                }
            },error => {
                this.loading = false;
                this.$message.error("获取列表error！");
            });
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
        changePageSize(value) {//每页显示条数变更
            this.initPageOption();
            this.pageOption.size = value;
            this.initData();
        },
        changePageCurrent(value) {//页码变更
            this.pageOption.page = value;
            this.initData();
        },
        indexMethod(index){
            return (this.pageOption.page-1) * this.pageOption.size + index + 1;
        }
    },
    mounted(){
        this.init();
    },
}
</script>

