<template>
    <!-- 基本信息 -->
    <div class="c-wrapper-20" v-cloak>
        <el-form :inline="true" :model="searchKey" :rules="rules" ref="searchForm" size='small'>
            <el-form-item label="车辆编号:" prop='vehicleId'>
                <el-select
                    v-model.trim="searchKey.vehicleId"
                    clearable
                    filterable
                    remote
                    reserve-keyword
                    placeholder="请输入关键词"
                    :remote-method="rsVehicleRemoteMethod"
                    @change="getVehicleId"
                    @clear="rsVehicleOption.searchFilter.clearFunc(rsVehicleOption)"
                    @focus="rsVehicleOption.searchFilter.remoteMethodClick(rsVehicleOption, searchKey, 'vehicleId')"
                    @blur="rsVehicleOption.searchFilter.remoteMethodBlur(searchKey, 'vehicleId')"
                    :loading="rsVehicleOption.loading">
                    <el-option
                        v-for="item in rsVehicleOption.filterOption"
                        :key="item.vehicleId"
                        :label="item.vehicleId"
                        :value="item.vehicleId"
                        >
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="车牌号" prop="plateNo">
                <el-select
                    v-model.trim="searchKey.plateNo"
                    clearable
                    filterable
                    remote
                    reserve-keyword
                    placeholder="请输入关键词"
                    :remote-method="rsPlateNoRemoteMethod"
                    @change="getPlateNo"
                    @clear="rsPlateNoOption.searchFilter.clearFunc(rsPlateNoOption)"
                    @focus="rsPlateNoOption.searchFilter.remoteMethodClick(rsPlateNoOption, searchKey, 'plateNo')"
                    @blur="rsPlateNoOption.searchFilter.remoteMethodBlur(searchKey, 'plateNo')"
                    :loading="rsPlateNoOption.loading">
                    <el-option
                        v-for="item in rsPlateNoOption.filterOption"
                        :key="item.plateNo"
                        :label="item.plateNo"
                        :value="item.plateNo">
                    </el-option>
                </el-select>
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
                <el-button type="warning" icon="el-icon-search" :loading='searchLoading' @click="searchClick">查询</el-button>
                <el-button type="warning" plain icon="el-icon-setting" @click="resetClick">重置</el-button>
            </el-form-item>
        </el-form>
        <el-table
            ref='table'
            :data="dataList" 
            v-loading='loading'
            stripe
            border
            max-height="724">
            <el-table-column prop="vehicleId" label="车辆编号" min-width="8%"></el-table-column>
            <el-table-column label="时间" min-width="13%">
                <template slot-scope="scope">{{scope.row.timestamp ? $dateUtil.formatTime(scope.row.timestamp,type='yy-mm-dd hh:mm:ss:ms') : ''}}</template>
            </el-table-column>
            <el-table-column prop="gnss_long" label="GNSS经度" min-width="8%"></el-table-column>
            <el-table-column prop="gnss_lat" label="GNSS纬度" min-width="8%"></el-table-column>
            <el-table-column prop="gnss_head" label="GNSS航向角" min-width="8%"></el-table-column>
            <el-table-column prop="gnss_spd" label="当前车速" min-width="10%"></el-table-column>
            <el-table-column min-width="45%" label="数据报文">
                <template slot-scope="scope">
                    <p>{{scope.row.data}}</p>
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
// 模糊查询封装
import SearchFilter from '@/assets/js/module/searchFilter.js'
import {queryList} from '@/api/vehicle';
import {requestqueryVehicleList} from '@/api/search';
export default {
    name: 'BaseMessage',
    components: {
    },
    data(){
        let _this = this,
            _checkStartTime = (rule  , value ,callback) => {
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
            searchLoading:false,
            searchKey: {
                vehicleId: '',
                plateNo:'',
                startTime: '',
                endTime: ''
            },
            historySearchKey: {},
            pageOption: {
                page: 1,
                size: 10,
                total: 0,
            },
            dataList: [],
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
            rules:{
                vehicleId:[
                    { required: true, message: '车辆编号不能为空', trigger: 'blur' },
                ],
                plateNo:[
                    { required: true, message: '车牌号不能为空', trigger: 'blur' }
                ],
                startTime:[
                    { required: true, message: "开始时间不能为空!", trigger: 'change' }
                ],
                endTime:[
                    { required: true, message: "结束时间不能为空!", trigger: 'change' }
                ],
            },
            rsVehicleOption: {
                loading: false,
                searchFilter:new SearchFilter(),
                timer: null,
                filterOption: [],
                defaultOption: [],
                defaultFlag: false,
                request:requestqueryVehicleList
            },
            //车牌号
            rsPlateNoOption: {
                loading: false,
                timer: null,
                searchFilter:new SearchFilter(),
                filterOption: [],
                defaultOption: [],
                defaultFlag: false,
                request:requestqueryVehicleList
            },
            scrollData:{
                dom:'',
                loading:false,
                isScroll:false
            }
        }
    },
    mounted(){
        // this.scrollData.dom = this.$refs.table.bodyWrapper;
        this.historySearchKey.vehicleId = 'B21E-00-022';
        this.searchKey.startTime = this.$dateUtil.GetDateStr(31);
        this.searchKey.endTime = this.$dateUtil.GetDateStr(0);
        this.historySearchKey.startTime = this.searchKey.startTime ? this.$dateUtil.dateToMs(this.searchKey.startTime) : '';
        this.historySearchKey.endTime = this.searchKey.endTime ? this.$dateUtil.dateToMs(this.searchKey.endTime) : '';
        // this.getQueryList();
        // this.scrollData.dom.addEventListener('scroll',this.scrollMore);
    },
    methods: {
        initPaging(){
            this.pageOption.page = 1;
            this.pageOption.total = 0;
            this.pageOption.size = 10;
        },
        getQueryList(){
            this.loading = true;
            let _params = Object.assign({},this.historySearchKey, {
                page: {
                    'pageSize': this.pageOption.size,
                    'pageIndex': this.pageOption.page-1
                }
            })
            queryList(_params).then(res => {
                if(res.status == '200'){
                    // this.$refs.table.bodyWrapper.scrollTop = 0;
                    this.pageOption.total = res.data.totalCount;
                    this.dataList = res.data.list;
                }
                this.loading = false;
                this.searchLoading = false;
            }).catch(err => {
                this.loading = false;
                this.searchLoading = false;
            })
        },
        searchClick(){
            this.$refs.searchForm.validate((valid) => {
                if (valid) {
                    this.searchLoading = true;
                    this.historySearchKey = this.searchKey;
                    this.historySearchKey.startTime = this.searchKey.startTime ? this.$dateUtil.dateToMs(this.searchKey.startTime) : '';
                    this.historySearchKey.endTime = this.searchKey.endTime ? this.$dateUtil.dateToMs(this.searchKey.endTime) : '';
                    this.dataList = [];
                    this.initPaging();
                    this.getQueryList();
                } else {
                    return false;
                }
            });
        },
        resetClick(){
            this.$refs.searchForm.resetFields();
            this.rsVehicleOption.filterOption = this.rsVehicleOption.defaultOption;
        },
        changePageSize(value) {//每页显示条数变更
            // this.initPageOption();
            this.pageOption.size = value;
            this.getQueryList();
        },
        changePageCurrent(value) {//页码变更
            this.pageOption.page = value;
            this.getQueryList();
        },
        rsVehicleRemoteMethod(query) {
            this.rsVehicleOption.searchFilter.publicRemoteMethod({
                query: query,
                searchOption: this.rsVehicleOption,
                searchObj: this.searchKey,
                key: 'vehicleId'
            });
        },
        //车牌号模糊查询
        rsPlateNoRemoteMethod(query) {
            this.rsPlateNoOption.searchFilter.publicRemoteMethod({
                query: query,
                searchOption: this.rsPlateNoOption,
                searchObj: this.searchKey,
                key: 'plateNo'
            });
        },
        getVehicleId(val){
            if(this.rsVehicleOption.filterOption.length > 0){
                let plateNos = this.rsVehicleOption.filterOption.filter(item => item.vehicleId === val);
                this.historySearchKey.plateNo = this.searchKey.plateNo = plateNos[0].plateNo;
            }
        },
        getPlateNo(val){
            if(this.rsPlateNoOption.filterOption.length > 0){
                let vehicleIds = this.rsPlateNoOption.filterOption.filter(item => item.plateNo === val);
                this.historySearchKey.vehicleId = this.searchKey.vehicleId = vehicleIds[0].vehicleId;
            }
        }
        // scrollMore(){
        //     const scrollTopHeight = this.scrollData.dom.scrollTop;//滚动高度
        //     const clientHeight = this.scrollData.dom.clientHeight;//可用区域高度
        //     const scrollHeight = this.scrollData.dom.scrollHeight;//滚动条的总高度
        //     if(scrollTopHeight + clientHeight == scrollHeight){
        //         this.pageOption.page = this.pageOption.page + 1;
        //         this.getQueryList();
        //     }
        // }
    }
}
</script>
