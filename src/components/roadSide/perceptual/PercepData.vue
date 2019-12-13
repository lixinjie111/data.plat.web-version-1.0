<template>
    <!-- 基本信息 -->
    <div class="c-wrapper-20" v-cloak>
        <el-form ref="searchForm" :inline="true" :rules="rules" :model="searchKey" size="small">
            <el-form-item label="路侧点名称:" prop='rsPtName'>
                <el-select
                    v-model.trim="searchKey.rsPtName"
                    clearable
                    filterable
                    remote
                    reserve-keyword
                    placeholder="请输入关键词"
                    value-key="rsPtName"
                    :remote-method="remoteMethod1"
                    @focus="selectRsPtNameList"
                    @change="RsPtNameSelect"
                    :loading="fuzzySearchOption1.loading">
                    <el-option
                        v-for="(item,index) in fuzzySearchOption1.filterOption"
                        :key="item.rsPtName+index"
                        :label="item.rsPtName"
                        :value="item">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="RCU编号: " prop="rcuId">
                <el-input v-model="searchKey.rcuId"></el-input>
            </el-form-item>
            <el-form-item label="设备类型" prop='type'>
                <el-select 
                v-model="searchKey.type"
                @change='deviceTypeSelect'
                >
                    <el-option
                        v-for="item in deviceTypeList"
                        :key="item.val"
                        :label="item.name"
                        :value="item.val"
                    ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="设备编号: " prop="deviceId">
                <el-select
                    v-model.trim="searchKey.deviceId"
                    clearable
                    filterable
                    remote
                    reserve-keyword
                    placeholder="请输入关键词"
                    value-key="deviceId"
                    :remote-method="remoteMethod2"
                    @focus="selectDeviceIdList"
                    @change='deviceIdSelect'
                    :loading="fuzzySearchOption2.loading">
                    <el-option
                        v-for="(item,index) in fuzzySearchOption2.filterOption"
                        :key="item.deviceId+index"
                        :label='item.deviceId'
                        :value="item.deviceId">
                    </el-option>
                </el-select>
            </el-form-item>

                <el-form-item label="设备序列号: " prop="serialNum">
                    <el-select
                        v-model.trim="searchKey.serialNum"
                        clearable
                        filterable
                        remote
                        reserve-keyword
                        placeholder="请输入关键词"
                        value-key="serialNum"
                        :remote-method="remoteMethod3"
                        @focus="selectSerialNumList"
                        @change="serialSelect"
                        :loading="fuzzySearchOption3.loading">
                        <el-option
                            v-for="(item,index) in fuzzySearchOption3.filterOption"
                            :key="item.serialNum+index"
                            :label='item.serialNum'
                            :value="item.serialNum">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="开始时间" prop='startTime'>
                    <el-date-picker
                        v-model.trim="searchKey.startTime"
                        type="date"
                        placeholder="开始时间"
                        :picker-options="startTimeOption">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="结束时间" prop='endTime'>
                    <el-date-picker
                        v-model.trim="searchKey.endTime"
                        type="date"
                        placeholder="结束时间"
                        :picker-options="endTimeOption">
                    </el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button type="warning" icon="el-icon-search" :loading='searchLoad' @click="searchClick">查询</el-button>
                    <el-button type="warning" plain icon="el-icon-setting" @click="resetClick">重置</el-button>
                </el-form-item>
            </el-form>
            <el-table 
                ref="table"
                :data="showDataList"
                v-loading="loading"  
                border
                class="c-mb-70"
                max-height="724"
                stripe>
                <el-table-column label="编号" type="index" :index="indexMethod"></el-table-column>
                <el-table-column min-width="13%" label="路侧点名称" prop="rsPtName"></el-table-column>
                <el-table-column min-width="13%" label="设备类型">
                    <template slot-scope="scope">
                        <span>{{scope.row.type | typeFileter}}</span>
                    </template>
                </el-table-column>
                <el-table-column min-width="13%" label="设备编号" prop="deviceId"></el-table-column>
                <el-table-column min-width="13%" label="设备序列号" prop="serialNum"></el-table-column>
                <el-table-column min-width="14%" label="文件名称" prop="fileName"></el-table-column>
                <el-table-column min-width="13%" label="开始时间">
                    <template slot-scope="scope">{{$dateUtil.formatTimeReal(scope.row.startTime)}}</template>
                </el-table-column>
                <el-table-column min-width="13%" label="结束时间">
                    <template slot-scope="scope">{{$dateUtil.formatTimeReal(scope.row.endTime)}}</template>
                </el-table-column>
                <el-table-column min-width="8%" label="操作">
                    <template slot-scope="scope">
                        <el-button size="small" icon="el-icon-view" circle type="warning" plain :loading="scope.row.loading" @click="goDetail(scope.row)"></el-button>
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
    </div>
</template>
<script>
import {defaultRoadInfo} from '../../../../static/config/defaultConfig.js';
import {findVideoRecords} from '@/api/roadSide';
import TList from '@/common/utils/list.js'
import VueDatepickerLocal from 'vue-datepicker-local'
import {queryRoadCamListSearch,queryRoadPointList,requestqueryRoadList,requestRSCamList,queryRoadSideDevList} from '@/api/search';
export default {
    name: 'PercepData',
    components: {
        VueDatepickerLocal
    },
    filters:{
        typeFileter(type){
            const typeMap = {
                '1':'摄像头',
                '2':'雷达'
            }
            return typeMap[type];
        }
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
            pageOption: {
                size: 10,
                total: 0,
                page: 1
            },
            defaultSelectOptions:[],
            searchLoad:false,
            loading: false,
            rsPtIdList:[],
            cameraIdList:[],
            serialNumList:[],
            deviceIdList:[],
            inputFlag: true,
            requestData: {},
            searchKey: {
                rsPtId:'',
                // rcuId:'U-DH-0001',
                rsPtName:'',
                // cameraId:'',
                type:1,
                serialNum:'',
                deviceId:'',
                startTime:'' ,
                endTime: ''
            },
            historySearchKey: {},
            deviceTypeList:[
                {name:'摄像头',val:1},
                {name:'雷达',val:2}
            ],
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
            panel: {
                title: '提示',
                type: '',
                msg: '',
                data: '',
                show: false,
                cfgShow: false,
            },
            rules:{
                rsPtName:[
                    { required: true, message: '路侧点名称不能为空', trigger: 'blur' },
                ],
                deviceId:[
                    { required: true, message: '摄像头编号不能为空', trigger: 'blur' },
                ],
                serialNum:[
                    { required: true, message: '摄像头序列号不能为空', trigger: 'blur' },
                ],
                startTime:[
                    { required: true, message: "开始时间不能为空!", trigger: 'change' }
                ],
                endTime:[
                    { required: true, message: "结束时间不能为空!", trigger: 'change' }
                ],
            },
            dataList: [],
            showDataList: [],
            fuzzySearchOption1: {
                loading: false,
                timer: null,
                filterOption: [],
                defaultFilterOption:[]
            },
            fuzzySearchOption2: {
                loading: false,
                timer: null,
                filterOption: [],
                defaultFilterOption:[]
            },
            fuzzySearchOption3: {
                loading: false,
                timer: null,
                filterOption: [],
                defaultFilterOption:[]
            },
        }
    },
    beforeRouteLeave(to, from, next) {
        if (to.name == "PercepDetail") {
            this.$parent.keepAliveArr = ["PercepData"];
        }else {
            this.$parent.keepAliveArr = [];
        }
        next();
    },
    mounted(){
        //望京 默认参数
        this.searchKey.rsPtName = defaultRoadInfo.rsPtName;
        this.searchKey.rsPtId = defaultRoadInfo.rsPtId;
        this.searchKey.deviceId = defaultRoadInfo.deviceId;
        this.searchKey.serialNum = defaultRoadInfo.serialNum;

        this.searchKey.startTime = this.$dateUtil.GetDateStr(7);
        this.searchKey.endTime = this.$dateUtil.getNowFormatDate();

        this.historySearchKey = Object.assign({}, this.searchKey, {
            startTime: this.searchKey.startTime ? this.$dateUtil.dateToMs(this.searchKey.startTime) : '',
            endTime: this.searchKey.endTime ? this.$dateUtil.dateToMs(this.searchKey.endTime) : ''
        });
        this.initData();
        this.selectRsPtNameList();
        this.selectDeviceIdList();
        this.selectSerialNumList();
    },
    methods: {
        initPageOption() {
            this.dataList = [];
            this.pageOption.total = 0;
            this.pageOption.page = 1;
        },
        goDetail(row){
            localStorage.setItem('roadCamerInfo',JSON.stringify(row));
            this.$router.push('/percepDetail/'+row.serialNum+'/'+row.startTime+'/'+row.endTime);
        },
        initSearch(){
            this.rsPtIdList = [];
            this.cameraIdList = [];
            this.serialNumList = [];
            this.deviceIdList = [];
        },
        initData(){
            this.loading = true;
            let _params = {
                ... this.historySearchKey
            }
            findVideoRecords(_params).then(res => {
                if(res.status == '200'){
                    res.data.forEach((item) => {
                        item.loading = false;
                    });
                    this.dataList = res.data;
                    this.showDataList = this.dataList;
                    this.pageOption.total = res.data.length;
                    this.$refs.table.bodyWrapper.scrollTop = 0;
                    if(this.pageOption.total > this.pageOption.size) {
                        this.initShowData();
                    }else {
                        this.showDataList = this.dataList;
                    }
                }
                this.searchLoad = false;
                this.loading = false;
            }).catch(err => {
                this.loading = false;
                this.searchLoad = false;
            })
        },
        initPaging() {
            this.dataList = [];
            this.showDataList = [];
            this.pageOption.total = 0;
            this.pageOption.page = 1;
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
        initShowData() {
            let _index = this.pageOption.page-1;
            let _handleList = Object.assign([], this.dataList);
            this.showDataList = _handleList.splice(_index*this.pageOption.size, this.pageOption.size);
        },
        indexMethod(index) {
            return (this.pageOption.page-1) * this.pageOption.size + index + 1;
        },
        searchClick(){
            this.$refs.searchForm.validate((valid) => {
                if (valid) {
                    this.searchLoad = true;
                    if(this.searchKey.rsPtName && this.searchKey.rsPtId){
                        this.historySearchKey.rsPtId = this.searchKey.rsPtId;
                        this.historySearchKey.rsPtName = this.searchKey.rsPtName;
                    }else{
                        this.historySearchKey.rsPtId = this.searchKey.rsPtName.rsPtId;
                        this.historySearchKey.rsPtName = this.searchKey.rsPtName.rsPtName;
                    }
                    this.historySearchKey.deviceId = this.searchKey.deviceId;
                    this.historySearchKey.serialNum = this.searchKey.serialNum;
                    this.historySearchKey.type = this.searchKey.type;
                    this.historySearchKey.startTime = this.searchKey.startTime ? this.$dateUtil.dateToMs(this.searchKey.startTime) : '';
                    this.historySearchKey.endTime = this.searchKey.endTime ? this.$dateUtil.dateToMs(this.searchKey.endTime) : '';
                    this.initPaging();
                    this.initData();
                } else {
                    return false;
                }
            });
        },
        getCarmSerial(){
            let serialNum = this.searchKey.serialNum;
            this.getCameraIds('',serialNum,'','');
        },
        resetClick(){
            this.$refs.searchForm.resetFields();
            this.fuzzySearchOption1.defaultOption = this.fuzzySearchOption1.filterOption;
            // this.fuzzySearchOption2.defaultOption = this.fuzzySearchOption2.filterOption;
            // this.fuzzySearchOption3.defaultOption = this.fuzzySearchOption3.filterOption;
        },
        remoteMethod1(query) { 
            if (query !== '') {
                this.fuzzySearchOption1.loading = true;
                clearTimeout(this.fuzzySearchOption1.timer);
                this.fuzzySearchOption1.timer = setTimeout(() => {
                    queryRoadPointList({
                        'field':'rsPtName',
                        'value':query
                    }).then(res => {
                            if(res.status == '200'){
                                //接口请求后执行的操作 
                                this.fuzzySearchOption1.loading = false;
                                this.fuzzySearchOption1.filterOption = res.data.filter(item => {
                                return item.rsPtName.toLowerCase()
                                    .indexOf(query.toLowerCase()) > -1;
                                });
                            }
                            this.fuzzySearchOption1.loading = false;
                        }).catch(err => {
                            this.fuzzySearchOption1.loading = false;
                        });
                }, 500);
            } else {
                this.fuzzySearchOption1.filterOption = this.fuzzySearchOption1.defaultFilterOption;
            }
        },
        selectRsPtNameList(){
                this.fuzzySearchOption1.loading = true;
                clearTimeout(this.fuzzySearchOption1.timer);
                this.fuzzySearchOption1.timer = setTimeout(() => {
                    queryRoadPointList({
                        'field':'rsPtName',
                        'value':''
                    }).then(res => {
                            if(res.status == '200'){
                                //接口请求后执行的操作 
                                this.fuzzySearchOption1.filterOption = res.data;
                            }
                            this.fuzzySearchOption1.loading = false;
                        }).catch(err => {
                            this.fuzzySearchOption1.loading = false;
                        });
                }, 500);
        },
        RsPtNameSelect(val){
            this.searchKey.rsPtId = val.rsPtId;
            queryRoadSideDevList({
                'rsPtId':val.rsPtId ? val.rsPtId : ''
            }).then(res => {
                if(res.status == '200'){
                    let data = res.data;
                    this.rcuIds = data.rcu;
                    this.searchKey.rcuId = this.rcuIds[0].deviceId;
                    if(this.searchKey.type === 1){
                        
                        if(data.camera.length > 0){
                            this.fuzzySearchOption3.filterOption = this.fuzzySearchOption2.filterOption = data.camera;
                            this.searchKey.deviceId = this.fuzzySearchOption2.filterOption[0].deviceId;
                            this.searchKey.serialNum = this.fuzzySearchOption3.filterOption[0].serialNum;
                        }else{
                            this.fuzzySearchOption3.filterOption = this.fuzzySearchOption2.filterOption = [];
                            this.searchKey.deviceId = '无数据';
                            this.searchKey.serialNum = '无数据';
                        }
                    }else{
                        if(data.radar.length > 0){
                            this.fuzzySearchOption3.filterOption = this.fuzzySearchOption2.filterOption = data.radar;
                            this.searchKey.deviceId = this.fuzzySearchOption2.filterOption[0].deviceId;
                            this.searchKey.serialNum = this.fuzzySearchOption3.filterOption[0].serialNum;
                        }else{
                            this.fuzzySearchOption3.filterOption = this.fuzzySearchOption2.filterOption = [];
                            this.searchKey.deviceId = '无数据';
                            this.searchKey.serialNum = '无数据';
                        }
                    }
                    
                }
            }).catch(err => {

            })
        },
        selectDeviceIdList(){
            if(this.searchKey.deviceId === '无数据'){
                return false;
            }else if(this.searchKey.deviceId === 'N-CI0007'){
                this.fuzzySearchOption2.loading = true;
                clearTimeout(this.fuzzySearchOption2.timer);
                this.fuzzySearchOption2.timer = setTimeout(() => {
                    queryRoadCamListSearch({ 
                        'field':'deviceId',
                        'value':'',
                        'type':this.searchKey.type
                    }).then(res => {
                            if(res.status == '200'){
                                //接口请求后执行的操作 
                                this.fuzzySearchOption2.filterOption = res.data;
                            }
                            this.fuzzySearchOption2.loading = false;
                        }).catch(err => {
                            this.fuzzySearchOption2.loading = false;
                        });
                }, 500);
            }
            if(this.fuzzySearchOption2.filterOption.length > 0){
                if(this.searchKey.deviceId === this.fuzzySearchOption2.filterOption[0].deviceId){
                    this.fuzzySearchOption2.filterOption = this.fuzzySearchOption2.filterOption;
                };
            }
        },
        remoteMethod2(query) {
            if (query !== '') {
                this.fuzzySearchOption2.loading = true;
                clearTimeout(this.fuzzySearchOption2.timer);
                this.fuzzySearchOption2.timer = setTimeout(() => {
                    queryRoadCamListSearch({
                        'field':'deviceId',
                        'value':query,
                        'type':this.searchKey.type
                    }).then(res => {
                            if(res.status == '200'){
                                //接口请求后执行的操作 
                                this.fuzzySearchOption2.loading = false;
                                this.fuzzySearchOption2.filterOption = res.data.filter(item => {
                                return item.deviceId.toLowerCase()
                                    .indexOf(query.toLowerCase()) > -1;
                                });
                            }
                            this.fuzzySearchOption2.loading = false;
                        }).catch(err => {
                            this.fuzzySearchOption2.loading = false;
                        });
                }, 500);
            } else {
                this.fuzzySearchOption2.filterOption = this.fuzzySearchOption2.defaultFilterOption;
            }
        },
        remoteMethod3(query) {
            if (query !== '') {
                this.fuzzySearchOption3.loading = true;
                clearTimeout(this.fuzzySearchOption3.timer);
                this.fuzzySearchOption3.timer = setTimeout(() => {
                    queryRoadCamListSearch({
                        'field':'serialNum',
                        'value':query,
                        'type':this.searchKey.type
                    }).then(res => {
                        if(res.status == '200'){
                            //接口请求后执行的操作 
                            this.fuzzySearchOption3.loading = false;
                            this.fuzzySearchOption3.filterOption = res.data.filter(item => {
                            return item.serialNum.toLowerCase()
                                .indexOf(query.toLowerCase()) > -1;
                            });
                        }
                        this.fuzzySearchOption3.loading = false;
                    }).catch(err => {
                        this.fuzzySearchOption3.loading = false;
                    });

                }, 500);
            } else {
                this.fuzzySearchOption3.defaultFilterOption = this.fuzzySearchOption3.filterOption;
            }
        },
        selectSerialNumList(){
            if(this.searchKey.serialNum === '无数据'){
                return false;
            }else if(this.searchKey.serialNum === '3402000000132000000101'){
                this.fuzzySearchOption3.loading = true;
                clearTimeout(this.fuzzySearchOption3.timer);
                this.fuzzySearchOption3.timer = setTimeout(() => {
                    queryRoadCamListSearch({
                        'field':'serialNum',
                        'value':'',
                        'type':this.searchKey.type
                    }).then(res => {
                        if(res.status == '200'){
                            //接口请求后执行的操作 
                            this.fuzzySearchOption3.loading = false;
                            this.fuzzySearchOption3.defaultFilterOption = this.fuzzySearchOption3.filterOption = res.data;
                        }
                        this.fuzzySearchOption3.loading = false;
                    }).catch(err => {
                        this.fuzzySearchOption3.loading = false;
                    });
                }, 500); 
            };
            if(this.fuzzySearchOption3.filterOption.length > 0){
                if(this.searchKey.serialNum === this.fuzzySearchOption3.filterOption[0].serialNum){
                    this.fuzzySearchOption3.filterOption = this.fuzzySearchOption3.filterOption;
                }
            }
        },
        deviceTypeSelect(typeVal){
            this.searchKey.type = typeVal;
        },
        deviceIdSelect(val){
            let data = this.fuzzySearchOption2.filterOption.filter(item => item.deviceId === val);
            this.searchKey.rcuId = data[0].rcu[0].deviceId;
            this.searchKey.rsPtName = data[0].rsPtName;
            this.searchKey.rsPtId = data[0].rsPtId;
            this.searchKey.serialNum = data[0].serialNum;
        },
        serialSelect(val){
            let data = this.fuzzySearchOption2.filterOption.filter(item => item.serialNum === val);
            this.searchKey.rcuId = data[0].rcu[0].deviceId;
            this.searchKey.rsPtName = data[0].rsPtName;
            this.searchKey.rsPtId = data[0].rsPtId;
            this.searchKey.deviceId = data[0].deviceId;
        }
    },
}
</script>
