<template>
    <!-- 基本信息 -->
    <div class="c-wrapper-20" v-cloak>
        <div v-show="!panel.detailShow && !panel.localDataShow">
            <el-form :inline="true" :model="searchKey" ref="searchForm" size='small'>
                <el-form-item label="车辆编号" prop='vehicleId'>
                    <el-select
                        v-model.trim="searchKey.vehicleId"
                        filterable
                        remote
                        reserve-keyword
                        placeholder="请输入关键词"
                        :remote-method="rsVehicleRemoteMethod"
                        @focus="$searchFilter.remoteMethodClick(rsVehicleOption, searchKey, 'vehicleId', searchUrl)"
                        @blur="$searchFilter.remoteMethodBlur(searchKey, 'vehicleId')"
                        :loading="rsVehicleOption.loading">
                        <el-option
                            v-for="item in rsVehicleOption.filterOption"
                            :key="item"
                            :label="item"
                            :value="item">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="事件名称" prop='eventName'>
                    <el-input v-model.trim="searchKey.eventName"></el-input>
                </el-form-item>
                <el-form-item label="事件编号" prop='eventNo'>
                    <el-input v-model.trim="searchKey.eventNo"></el-input>
                </el-form-item>
                <el-form-item label="事件触发时间" prop='time'>
                    <el-date-picker
                        v-model.trim="searchKey.time"
                        type="datetimerange"
                        :picker-options="timeOption"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button type="warning" icon="el-icon-search" :loading='searchLoading' @click="searchClick">查询</el-button>
                    <el-button type="warning" plain icon="el-icon-setting" @click="resetClick">重置</el-button>
                </el-form-item>
            </el-form>

            <div class="c-button-wrapper c-text-right">
                <el-button size="mini" plain icon="el-icon-edit" @click="localClick">获取本地数据</el-button>
            </div>
            
            <el-table
                :data="dataList" 
                v-loading='loading'
                stripe
                border
                class="c-mb-70"
                max-height="724">
                <el-table-column prop="eventName" min-width='8%' label="事件名称"></el-table-column>
                <el-table-column prop="eventNo" min-width='23%' label="事件编号"></el-table-column>
                <el-table-column prop="vehicleId" min-width='8%' label="车辆编号"></el-table-column>
                <el-table-column label="事件触发时间" min-width='15%'>
                    <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.eventTime)}}</template>
                </el-table-column>
                <el-table-column label="数据采集开始时间" min-width='15%'>
                    <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.beginTime)}}</template>
                </el-table-column>
                <el-table-column label="数据采集结束时间" min-width='15%'>
                    <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.endTime)}}</template>
                </el-table-column>
                <el-table-column prop="status" label="采集状态" min-width='6%'></el-table-column>
                <el-table-column prop="vehicleId" label="操作" min-width='5%'>
                    <template slot-scope="scope">
                        <el-button size="small" icon="el-icon-view" circle type="warning" plain @click="lookClick(scope.row)"></el-button>
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

        <!-- <div> -->
        <local-data-panel title="获取本地数据" ref="localDataPanel" @localDataPanelBack="init" v-show="!panel.detailShow && panel.localDataShow" :type="panel.type" :data="panel.data"></local-data-panel>
        <detail-panel ref="detailPanel" @detailPanelBack="panelBack" v-show="panel.detailShow && !panel.localDataShow" :title="panel.title" :type="panel.type" :data="panel.data"></detail-panel>
        <!-- </div> -->
    </div>
</template>
<script>
import TList from '@/common/utils/list.js'
import DatePicker from 'vue2-datepicker'
import LocalDataPanel from '@/components/vehicle/dynamicParam/LocalDataPanel.vue'
import DetailPanel from './DetailPanel.vue'
import {requestqueryVehicleList} from '@/api/search';
import {dynamicParamList} from '@/api/vehicle';
export default {
    name: 'BaseMessage',
    components: {
        LocalDataPanel,DatePicker,DetailPanel
    },
    data(){
        let _this = this;
        return {
            isTimeShow:false,
            isVehicleShow:false,
            loading:false,
            searchLoading:false,
            searchKey: {
                vehicleId: '',
                eventName: '',
                eventNo: '',
                time:[]
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
            timeOption: {
                disabledDate: time => {
                    let _time = time.getTime(),
                        _newTime = new Date().getTime();
                    return _time > _newTime;
                }
            },
            rsVehicleOption: {
                loading: false,
                timer: null,
                filterOption: [],
                defaultOption: [],
                defaultFlag: false
            },
            searchUrl: requestqueryVehicleList  
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
            this.panel.localDataShow = false;
            this.initPaging();
            this.dynamicParamList();
            this.dataList = [];
        },
        initPaging(){
            this.pageOption.page = 1;
            this.pageOption.total = 0;
            this.pageOption.size = 10;
        },
        dynamicParamList(){
            this.dataList = [];
            this.loading = true;
            dynamicParamList({
                page: {
                    'pageSize': this.pageOption.size,
                    'pageIndex': this.pageOption.page-1
                },
                'vehicleId': this.searchKey.vehicleId,
                'eventName': this.searchKey.eventName,
                'eventNo': this.searchKey.eventNo,
                'startTime': this.searchKey.time[0] ? this.$dateUtil.dateToMs(this.searchKey.time[0]) : '',
                'endTime': this.searchKey.time[1] ? this.$dateUtil.dateToMs(this.searchKey.time[1]) : ''
            }).then(res => {
                if(res.status == '200'){
                    this.dataList = res.data.list;
                    this.pageOption.total = res.data.totalCount;
                }
                this.loading = false;
                this.searchLoading = false;
            }).catch(err => {
                this.loading = false;
                this.searchLoading = false;
            });
        },
        localClick(){
            this.panel.title = '获取本地数据';
            this.panel.type = 'local';
            this.panel.detailShow = false;
            this.panel.localDataShow = true;
            this.$refs.localDataPanel.init();
        },

        lookClick(dataDetail){
            console.log(dataDetail)
            this.panel.title = '查看';
            this.panel.type = 'look';
            this.panel.detailShow = true;
            this.panel.localDataShow = false;
            this.$refs.detailPanel.init(dataDetail);
        },
        panelBack(){
            this.panel.detailShow = false;
            this.panel.localDataShow = false;
        },
        searchClick(){
            this.$refs.searchForm.validate((valid) => {
                if (valid) {
                    this.searchLoading = true;
                    this.initPaging();
                    this.dynamicParamList();
                } else {
                    return false;
                }
            });
        },
        resetClick(){
            this.$refs.searchForm.resetFields();
            this.rsVehicleOption.filterOption = [];
        },
        cfgPanelFn(data){
            this.panel.show = false;
            this.panel.cfgShow = false;
        },
        changePageSize(value) {//每页显示条数变更
            this.initPageOption();
            this.pageOption.size = value;
            this.dynamicParamList();
        },
        changePageCurrent(value) {//页码变更
            this.pageOption.page = value;
            this.dynamicParamList();
        },
        rsVehicleRemoteMethod(query) {
            this.$searchFilter.publicRemoteMethod({
                query: query,
                searchOption: this.rsVehicleOption,
                searchObj: this.searchKey,
                key: 'vehicleId',
                request: this.searchUrl
            });
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
