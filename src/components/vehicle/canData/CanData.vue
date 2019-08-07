<template>
    <!-- 基本信息 -->
    <div class="c-wrapper-20" v-cloak>
        <el-form :inline="true" :model="searchKey" :rules="rules" ref="searchForm" size='small'>
            <el-form-item label="车辆编号:" prop='vehicleId'>
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
                        :key="item.vehicleId"
                        :label="item.vehicleId"
                        :value="item.vehicleId">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="英文名称:" prop='enName'>
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
            <el-form-item>
                <el-button type="warning" icon="el-icon-search" :loading='searchLoading' @click="searchClick">查询</el-button>
                <el-button type="warning" plain icon="el-icon-setting" @click="resetClick">重置</el-button>
            </el-form-item>
        </el-form>
        <el-table
            :data="dataList" 
            v-loading='loading'
            stripe
            border
            class="c-mb-70"
            max-height="724">
            <el-table-column prop="vehicleId" label="车辆编号"></el-table-column>
            <el-table-column prop="dataId" label="数据编号"></el-table-column>
            <el-table-column prop="enName" label="英文名称"></el-table-column>
            <el-table-column prop="chName" label="中文名称"></el-table-column>
            <el-table-column prop="dataValue" label="数据值"></el-table-column>
            <el-table-column label="时间">
                <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.time)}}</template>
            </el-table-column>
        </el-table>

        <div class="c-page clearfix">
            <el-pagination
                background
                @current-change="changePageCurrent" 
                :current-page="pageOption.page" 
                :total="pageOption.total"
                @size-change="changePageSize"
                :page-sizes="[100]" 
                :page-size="pageOption.size"
                layout="total, sizes, prev, pager, next">
            </el-pagination>
        </div>

    </div>
</template>
<script>
import TList from '@/common/utils/list.js'
import {queryList} from '@/api/vehicle';
import {requestqueryVehicleList} from '@/api/search';
export default {
    name: 'BaseMessage',
    components: {
        TList
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
            searchLoading:false,
            searchKey: {
                vehicleId: '',
                enName: '',
                startTime: '',
                endTime: ''
            },
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
                startTime:[
                    { required: true, message: "开始时间不能为空!", trigger: 'change' }
                ],
                endTime:[
                    { required: true, message: "结束时间不能为空!", trigger: 'change' }
                ],
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
        getQueryList(){
            queryList({
                page: {
                    'pageSize': this.pageOption.size,
                    'pageIndex': this.pageOption.page-1
                },
                vehicleId:this.searchKey.vehicleId,
                enName:this.searchKey.enName,
                startTime:this.searchKey.startTime ? this.$dateUtil.dateToMs(this.searchKey.startTime) : '',
                endTime:this.searchKey.endTime ? this.$dateUtil.dateToMs(this.searchKey.endTime) : ''
            }).then(res => {
                if(res.status == '200'){
                    this.pageOption.total = res.data.list.length;
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
                    this.initPaging();
                    this.getQueryList();
                } else {
                    return false;
                }
            });
        },
        resetClick(){
            this.$refs.searchForm.resetFields();
            this.searchKey = '';
            this.rsVehicleOption.filterOption = [];
        },
        changePageSize(value) {//每页显示条数变更
            this.initPageOption();
            this.pageOption.size = value;
            this.getQueryList();
        },
        changePageCurrent(value) {//页码变更
            this.pageOption.page = value;
            this.getQueryList();
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
        this.searchKey.vehicleId = 'B21E-00-022';
        this.searchKey.startTime = this.$dateUtil.GetDateStr(31);
        this.searchKey.endTime = this.$dateUtil.GetDateStr(2);
        this.getQueryList();
    },
}
</script>
<style>
#bread-crumb li{ display:inline}
</style>
