<template>
    <!-- 基本信息 -->
    <div class="c-wrapper-20" v-cloak>
        <el-form :inline="true" :model="searchKey" :rules="rules" ref="searchForm" size='small' class="demo-form-inline">
            <el-form-item label="车辆编号:" prop='vehicleId'>
                <el-input v-model.trim="searchKey.vehicleId"></el-input>
            </el-form-item>
            <el-form-item label="英文名称:" prop='enName'>
                <el-input v-model.trim="searchKey.enName"></el-input>
            </el-form-item>
            <el-form-item label="时间" prop='time'>
                <el-date-picker
                    v-model.trim="searchKey.time"
                    type="datetimerange"
                    :picker-options="timeOption"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期">
                </el-date-picker>
            </el-form-item>
            <el-form-item>
                <el-button type="warning" icon="el-icon-search" :loading='searchLoading' @click="searchClick('searchKey')">查询</el-button>
                <el-button type="warning" plain icon="el-icon-setting" @click="resetClick('searchForm')">重置</el-button>
            </el-form-item>
        </el-form>
        <el-table class='c-mt-10' max-height="620" :data="dataList" v-loading='loading' stripe>
            <el-table-column align="center" fixed prop="vehicleId" label="车辆编号"></el-table-column>
            <el-table-column align="center" prop="dataId" label="数据ID"></el-table-column>
            <el-table-column align="center" prop="enName" label="英文名称"></el-table-column>
            <el-table-column align="center" prop="chName" label="中文名称"></el-table-column>
            <el-table-column align="center" prop="dataValue" label="数据值"></el-table-column>
            <el-table-column align="center" prop="time" label="时间"></el-table-column>
        </el-table>
        <paging-pre-next ref="pagingPreNext" class="yk-paging" :page-index="pageOption.page" :next-count="pageOption.nextCount" @pagingEvent="pagingFn" @PageSizeEvent="pagingSizeFn"></paging-pre-next>

    </div>
</template>
<script>
import TList from '@/common/utils/list.js'
import DatePicker from 'vue2-datepicker'
import PagingPreNext from '@/common/view/PagingPreNext.vue'
import {queryList} from '@/api/vehicle';
export default {
    name: 'BaseMessage',
    components: {
        PagingPreNext,DatePicker,TList
    },
    data(){
        return {
            isTimeTip:false,
            isVehicleShow:false,
            loading:false,
            searchLoading:false,
            searchKey: {
                vehicleId: '',
                enName: '',
                time:'',
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
            rules: {
                vehicleId:[
                    { required: true, message: 'vehicleId不能为空!', trigger: 'blur' },
                ],
                startTime: [
                    { type:'date',required: true, message: '开始时间不能为空!', trigger: 'change' },
                ],
                endTime: [
                    { type:'date',required: true, message: '结束时间不能为空!', trigger: 'change' },
                ],
            },
            timeOption: {
                disabledDate: time => {
                    let _time = time.getTime(),
                        _newTime = new Date().getTime();
                    return _time > _newTime;
                }
            },  
        }
    },
    methods: {
        init(){
            this.initPaging();
            this.initSearch();
            this.initData();
        },
        initPaging(){
            this.loading = true;
            this.pageOption.page = 1;
            this.pageOption.size = 10;
            this.pageOption.nextCount = 0;
            this.pageOption.nextPageClick =true;
        },
        initSearch(){
            this.searchKey = {
                vehicleId: '',
                enName: '',
                time:'',
                // startTime: '',
                // endTime: '',
                nextStartRowMap:new Map()
            };
        },
        initData(currentNextStartRow){//currentNextStartRow=null求第一页
            this.getRealTimeList(this.pageOption.size,this.pageOption.page-1,currentNextStartRow,this.getDataList);
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
            queryList({
                page: {
                    'pageSize': this.pageOption.size,
                    'pageIndex': this.pageOption.page-1
                },
                vehicleId:this.searchKey.vehicleId,
                enName:this.searchKey.enName,
                startTime:this.searchKey.time ? this.$dateUtil.dateToMs(this.searchKey.time[0]) : '',
                endTime:this.searchKey.time ? this.$dateUtil.dateToMs(this.searchKey.time[1]) : '',
                nextStartRow:currentNextStartRow == undefined ? null: currentNextStartRow
            }).then(res => {
                if(res.status == '200'){
                    this.pageOption.total = res.data.list.length;
                    callback(res.data.list); 
                }else{
                    this.$message.error(res.message);
                }
                this.loading = false;
                this.searchLoading = false;
            })
        },
        searchClick(){
            this.searchLoading = true;
            this.$refs.searchForm.validate((valid) => {
                if (valid) {
                    this.initPaging();
                    this.initData();
                } else {
                    return false;
                }
            });
        },
        resetClick(searchForm){
            this.$refs[searchForm].resetFields();
            this.dataList=[];
            this.isVehicleShow = false;
            this.isTimeTip = false;
        },
        pagingFn(value){
            var currentIndex = this.pageOption.index;
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
            this.pageOption.index =1;
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
