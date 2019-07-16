<template>
    <!-- 基本信息 -->
    <div class="c-wrapper-20" v-cloak>
        <div v-show='infoIsShow'>
            <el-form :inline="true" :model="searchKey" :rules="rules" ref="searchForm" size='small' class="demo-form-inline">
                <el-form-item label="RSUId" prop='rsuId'>
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
            <el-table class='c-mt-10' :data="dataList" v-loading='loading' max-height='500' stripe>
                <el-table-column fixed align="center" type="index" label="No" :index='indexMethod'></el-table-column>
                <el-table-column align="center" prop="msgCnt" label="消息编号"></el-table-column>
                <el-table-column align="center" prop="rsuId" label="RSUId"></el-table-column>
                <el-table-column align="center" label="时间">
                    <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.time)}}</template>
                </el-table-column>
                <el-table-column align="center" label="经度">
                    <template slot-scope="scope">{{scope.row.lonRsm.toFixed(8)}}</template>
                </el-table-column>
                <el-table-column align="center" label="纬度">
                    <template slot-scope="scope">{{scope.row.latRsm.toFixed(8)}}</template>
                </el-table-column>
                <el-table-column align="center" prop="elevRsm" label="高程"></el-table-column>
                <el-table-column align="center" prop='num' label="参与者个数"></el-table-column>
                <el-table-column align="center" label="操作">
                    <template slot-scope="scope">
                        <el-button size="mini" type="warning" plain @click="detail(scope.row)">查看详情</el-button>
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
        <rsm-detail ref='rsm' v-show='rsmdIsShow' :data='panel.data' @goBack='backFn'></rsm-detail>
    </div>
</template>
<script>
import RsmDetail from '@/components/v2x/rsm/RsmDetail.vue'
export default {
    name: 'BsmCom',
    components: {
        RsmDetail,
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
            infoIsShow:true,
            rsmdIsShow:false,
            loading:false,
            searchLoad:false,
            searchKey: {
                rsuId: '',
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
                rsuId:[
                    { required: true, message: 'rsuIdID不能为空!', trigger: 'blur' },
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
            this.initData();
            // this.initPaging();
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
            this.$refs.rsm.init(item);
            this.infoIsShow = false;
            this.rsmdIsShow = true;
        },
        initPaging(){
            this.pageOption.page = 1;
            this.pageOption.total = 0;
            this.pageOption.size = 10;
        },
        initSearch(){
            this.searchKey = {
                rsuId: '',
                startTime:  '',
                endTime:  ''
            };
        },
        initData(){
            this.dataList = [];
            this.loading = true;
            // admin/v2x/findRsmPage
            this.$api.post('v2x/findRsmPage',{  
                page: {
                        "pageSize": this.pageOption.size,
                        "pageIndex": this.pageOption.page-1
                },
                rsuId: this.searchKey.rsuId,
                startTime:this.searchKey.startTime ? this.$dateUtil.dateToMs(this.searchKey.startTime) : '',
                endTime:this.searchKey.endTime ? this.$dateUtil.dateToMs(this.searchKey.endTime) : '',       
            },response => {
                if(response.data.code == '200'){
                    this.dataList = response.data.data.list;
                    this.pageOption.total = response.data.data.totalCount;
                    this.$message.success(response.data.message);
                    this.loading = false;
                    this.searchLoad = false;
                }else{
                    this.$message.error(response.data.message);
                    this.loading = false;
                    this.searchLoad = false;
                }
            },error => {
                this.$message.error("获取列表error！");
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
                    this.initData();
                } else {
                    return false;
                }
            });
        },
        resetClick(){
            this.loading = false;
            this.init();
            this.$refs.searchForm.resetFields();
        },
        getIsNan(val){
            return typeof(val) == 'number' && window.isNaN(val);
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
        backFn(){
            this.infoIsShow = true;
            this.rsmdIsShow = false;
        },
        indexMethod(index){
            return index + this.pageOption.size * (this.pageOption.page-1) + 1;
        }
    },
    mounted(){
        this.init();
    }
}
</script>
