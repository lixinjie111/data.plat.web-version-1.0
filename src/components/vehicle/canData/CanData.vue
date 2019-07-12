<template>
    <!-- 基本信息 -->
    <div class="yk-container">
        <div class="yk-container">
            <el-form :inline="true" :model="searchKey" :rules="rules" ref="searchForm" size='small' class="demo-form-inline">
                <el-form-item label="车辆编号:" prop='vehicleId'>
                    <el-input v-model.trim="searchKey.vehicleId"></el-input>
                </el-form-item>
                <el-form-item label="英文名称:">
                    <el-input v-model.trim="searchKey.enName"></el-input>
                </el-form-item>
                <el-form-item label="时间:">
                    <el-col :span="11">
                        <el-date-picker type="datetime" placeholder="开始时间" v-model.trim="searchKey.startTime" style="width: 100%;"></el-date-picker>
                    </el-col>
                    <el-col class="line" :span="1" style='width:2%;text-align:center;'>-</el-col>
                    <el-col :span="11">
                        <el-date-picker type="datetime" placeholder="结束时间" v-model.trim="searchKey.endTime" style="width: 100%;"></el-date-picker>
                    </el-col>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" :loading='loading' @click="searchClick('searchKey')">查询</el-button>
                    <el-button type="primary" @click="resetClick()">重置</el-button>
                </el-form-item>
            </el-form>
            <el-table class='c-mt-10' :data="dataList" v-loading='loading' stripe>
                <el-table-column align="center" prop="vehicleId" label="车辆编号"></el-table-column>
                <el-table-column align="center" prop="dataId" label="数据ID"></el-table-column>
                <el-table-column align="center" prop="enName" label="英文名称"></el-table-column>
                <el-table-column align="center" prop="chName" label="中文名称"></el-table-column>
                <el-table-column align="center" prop="dataValue" label="数据值"></el-table-column>
                <el-table-column align="center" prop="time" label="时间"></el-table-column>
            </el-table>
            <!-- <div>
                <div class="yk-table-box">
                    <table class="yk-table">
                        <thead>
                        <tr>
                            <th style="width:16%;">vehicleId</th>
                            <th style="width:16%;">数据ID</th>
                            <th style="width:16%;">英文名称</th>
                            <th style="width:16%;">中文名称</th>
                            <th style="width:16%;">数据值</th>
                            <th style="width:20%;">时间</th>
                        </tr>
                        </thead>
                        <tbody :style='{"height":(paging.total<=10 ? "auto" : "405px")}'>
                        <tr class="yk-table-body" v-for="(item,index) in dataList" :key="index" :class="item.css">
                            <td style="width:16%;">{{item.vehicleId}}</td>
                            <td style="width:16%;">{{item.dataId}}</td>
                            <td style="width:16%;">{{item.enName}}</td>
                            <td style="width:16%;">{{item.chName}}</td>
                            <td style="width:16%;">{{item.dataValue}}</td>
                            <td style="width:19%;">{{item.time}}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div> -->
            <paging-pre-next ref="pagingPreNext" class="yk-paging" :page-index="paging.index" :next-count="paging.nextCount" @pagingEvent="pagingFn" @PageSizeEvent="pagingSizeFn"></paging-pre-next>
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
            paging: {
                index: 1,
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
            }
        }
    },
    methods: {
        init(){
            this.initPaging();
            this.initSearch();
        },
        initPaging(){
            this.paging.index = 1;
            this.paging.size = 10;
            this.paging.nextCount = 0;
            this.paging.nextPageClick =true;
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
            this.getRealTimeList(this.paging.size,this.paging.index,currentNextStartRow,this.getDataList);
        },
        getNextCount(list){
          list != null ?this.paging.nextCount = list.length : this.paging.nextCount = 0;
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
            if(_this.paging.nextPageClick) {//点击下一页查询
                _this.searchKey.nextStartRowMap.set(_this.paging.index,rowKey);
                //设置下一页的记录数
                _this.paging.nextCount = 0;
                if(rowKey != "" && this.paging.nextPageClick){
                     _this.getRealTimeList(_this.paging.size,_this.paging.index + 1,rowKey,_this.getNextCount);
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
                        this.paging.total = response.data.list.length;
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
        },
        pagingFn(value){
            var currentIndex = this.paging.index;
            this.paging.index = value;

            if(currentIndex < value){ //点击下一页
                this.paging.nextPageClick=true;
                if(value <= 1){//第一页
                    this.initData();
                }else{
                    this.initData(this.searchKey.nextStartRowMap.get(currentIndex));
                }
            }
            else if(currentIndex > value){ //点击上一页
                this.paging.nextPageClick=false;
                if(value <= 1){
                    this.initData();
                }else{
                    this.initData(this.searchKey.nextStartRowMap.get(currentIndex-2));
                }
                this.paging.nextCount= 100;//点击上一页肯定下一页可用
            }
        },
        pagingSizeFn(value){
            this.paging.index =1;
            this.paging.size = value;
            this.paging.total = 0;
            this.paging.nextPageClick =true;//初始化
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
