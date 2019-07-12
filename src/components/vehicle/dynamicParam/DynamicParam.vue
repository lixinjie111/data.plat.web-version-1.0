<template>
    <!-- 基本信息 -->
    <div class="yk-container">
        <div v-show="!panel.detailShow && !panel.localDataShow">
            <el-form :inline="true" :model="searchKey" :rules="rules" ref="searchForm" size='small' class="demo-form-inline">
                <el-form-item label="车辆编号:" prop='vehicleId'>
                    <el-input v-model.trim="searchKey.vehicleId"></el-input>
                </el-form-item>
                <el-form-item label="事件名称:">
                    <el-input v-model.trim="searchKey.eventName"></el-input>
                </el-form-item>
                <el-form-item label="事件编号:">
                    <el-input v-model.trim="searchKey.eventNo"></el-input>
                </el-form-item>
                <el-form-item label="事件触发时间: ">
                    <el-date-picker
                        v-model.trim="searchKey.startTime"
                        type="datetime"
                        placeholder="开始时间"
                        :editable="false"
                        :clearable="false"
                        :picker-options="pickerOptionsStart"
                        format='yyyy-MM-dd HH:mm:ss'>
                    </el-date-picker>
                    -
                    <el-date-picker
                        v-model.trim="searchKey.endTime"
                        type="datetime"
                        placeholder="结束时间"
                        :editable="false"
                        :clearable="false"
                        :picker-options="pickerOptionsEnd"
                        format='yyyy-MM-dd HH:mm:ss'>
                    </el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" :loading="loading" @click="searchClick('searchKey')">查询</el-button>
                    <el-button type="primary" @click="resetClick()">重置</el-button>
                </el-form-item>
            </el-form>

            <!-- <div class="yk-search-box">

                <div class="yk-search-block">
                    <label class="yk-w-90">车辆Id:</label>
                    <input class="yk-input" v-on:keyup="validateSearch"  v-model.trim="searchKey.vehicleId">
                    <span class="yk-tip" v-show='isVehicleShow' id="vehicleIdTip">vehicleId不能为空 ！</span>
                </div>

                <div class="yk-search-block">
                    <label class="yk-w-90">事件名称:</label>
                    <input class="yk-input" v-model.trim="searchKey.eventName">
                </div>

                <div class="yk-search-block">
                    <label class="yk-w-90">事件编号:</label>
                    <input class="yk-input  " v-model.trim="searchKey.eventNo">
                </div>
                <div class="yk-search-block">
                    <label class="yk-w-90">事件触发时间:</label>
                    <date-picker class=" data-control-css yk-input" lang="zh" type="datetime" format="YYYY-MM-DD HH:mm:ss"
                         placeholder="选择开始时间" :editable="false" :not-after="searchKey.endTime"
                         v-model="searchKey.startTime"></date-picker>
                    
                     <span class="yk-tip" id="timeTip" v-show='isTimeShow'>开始时间不能为空 ！</span>
                   
                    <date-picker class="data-control-css yk-input" lang="zh" type="datetime" format="YYYY-MM-DD HH:mm:ss"
                         placeholder="选择结束时间" :editable="false" :not-before="searchKey.startTime"
                         v-model="searchKey.endTime"></date-picker>
                    
                     <span class="yk-tip" id="timeTip" v-show='isTimeShow'>结束时间不能为空 ！</span>
                </div>

                <div class="yk-search-block">
                    <span class="yk-btn yk-btn-gap" @click="searchClick();">查询</span>
                    <span class="yk-btn" @click="resetClick();">重置</span>
                </div>
                &nbsp;&nbsp;&nbsp;&nbsp; <span class="yk-block yk-btn" title="获取本地数据" alt="获取本地数据" @click="localClick();">获取本地数据</span>
            </div> -->
            <div class="c-text-right">
                <el-button type="primary" @click="localClick();" size='small'>获取本地数据</el-button>
            </div>
            <el-table :data="dataList" v-loading='loading' class='c-mt-10' stripe>
                <el-table-column align="center" prop="eventName" label="事件名称"></el-table-column>
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
            <!-- <div class="yk-table-box" id="idTable">
                <table class="yk-table">
                    <thead>
                        <tr>
                            <th style="width:7%;">事件名称</th>
                            <th>事件编号</th>
                            <th style="width:10%;">车辆Id</th>
                            <th>事件触发时间</th>
                            <th>数据采集开始时间</th>
                            <th>数据采集结束时间</th>
                            <th style="width:8%;">采集状态</th>
                            <th style="width:6%;">操作</th>
                        </tr>
                    </thead>
                    <tbody :style='{"height":(paging.total<=10 ? "auto" : "405px")}'>
                    <tr class="yk-table-body" v-for="(item,index) in dataList" :key="index" :class="item.css">
                        <td style="width:7%;">{{item.eventName}}</td>
                        <td>{{item.eventNo}}</td>
                        <td style="width:10%;">{{item.vehicleId}}</td>
                        <td>{{$dateUtil.formatTime(item.eventTime,'yy-mm-dd hh:mm:ss:ms')}}</td>
                        <td>{{$dateUtil.formatTime(item.beginTime,'yy-mm-dd hh:mm:ss:ms')}}</td>
                        <td>{{$dateUtil.formatTime(item.endTime,'yy-mm-dd hh:mm:ss:ms')}}</td>
                        <td style="width:8%;">{{item.status}}</td>
                        <td style="width:5%;">
                            <template slot-scope="scope">
                                <el-button class="el-button--small" type="primary" :loading="scope.row.loading" @click="detail(scope.row.queryId)">操作</el-button>
                            </template>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div> -->
            
            <div class="pages">
                <el-pagination
                    background
                    @current-change="handleCurrentChange" 
                    :current-page="paging.index"
                    :total="paging.total" 
                    @size-change="handleSizeChange"
                    :page-sizes="[10,20,50,100,200,500]" 
                    :page-size="paging.size"
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
import Paging from '@/common/view/Paging.vue'
import DatePicker from 'vue2-datepicker'
import LocalDataPanel from '@/components/vehicle/dynamicParam/LocalDataPanel.vue'
import DetailPanel from './DetailPanel.vue'

export default {
    name: 'BaseMessage',
    components: {
        Paging, LocalDataPanel,DatePicker,DetailPanel
    },
    data(){
        let _this = this;
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
            paging: {
                index: 0,
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
                vehicleId:[
                    { required: true, message: 'vehicleId不能为空!', trigger: 'blur' }
                ],
                startTime:[
                    { required: true, message: '开始时间不能为空!',trigger: 'blur' },
                ],
                endTime:[
                    { required: true, message: '结束时间不能为空!',trigger: 'blur' },
                ],
            },
            pickerOptionsStart: {
                editable: false,
                clearable: false,
                disabledDate(time) {
                    let endTimeTimestamp = new Date(_this.searchKey.endTime).getTime() || new Date().getTime();
                    return time.getTime() > endTimeTimestamp || time.getTime() > new Date().getTime();
                }
            },
            pickerOptionsEnd: {
                editable: false,
                clearable: false,
                disabledDate(time) {
                    let startTimeTimestamp = new Date(_this.searchKey.startTime).getTime() || new Date().getTime();
                    return time.getTime() < new Date(_this.searchKey.startTime).getTime() || time.getTime() > new Date().getTime();
                }
            },
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
            this.paging.index = 1;
            this.paging.total = 0;
            this.paging.size = 10;
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
                "pageSize": this.paging.size,
                "pageIndex": this.paging.index,
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
                        _this.paging.total = response.data.totalCount;
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
            this.paging.index =0;
            this.paging.total = 0;
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
        },
        cfgPanelFn(data){
            this.panel.show = false;
            this.panel.cfgShow = false;
        },
        // validateSearch(o){
        //     var validatePass=true;
        //     var _this =this;
        //     let vehicleIdTip = document.getElementById("vehicleIdTip");
        //         let timeTip = document.getElementById("timeTip");
        //         if(_this.searchKey.vehicleId != ""){
        //             _this.isVehicleShow = false;
        //         }else{
        //             if(o == "isSearch"){
        //                 _this.isVehicleShow = true;
        //             }
        //             validatePass=false;
        //         }

        //         if((_this.searchKey.startTime == null || _this.searchKey.startTime == "")
        //         || (_this.searchKey.endTime == null || _this.searchKey.endTime == "")){
        //              if(o == "isSearch"){
        //                  _this.isTimeShow = true;
        //              }
        //             validatePass=false;
        //         }else{
        //             _this.isTimeShow = false;
        //         }

        //    return validatePass;
        // },
        handleSizeChange(value) {//每页显示条数变更
            this.paging.size = value;
            this.initData();
        },
        handleCurrentChange(value) {//页码变更
            this.paging.index = value;
            this.initData();
        }
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
