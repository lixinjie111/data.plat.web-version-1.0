<template>
    <!-- 基本信息 -->
    <div class="c-wrapper-20" v-cloak>
        <el-form ref="searchForm" :inline="true" :rules="rules" :model="searchKey" size="small">
             <!--<el-form-item label="路侧点名称:" prop='rsPtName'>
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
            </el-form-item> -->
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
            <el-form-item label="设备编号 " prop="deviceId">
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

                <el-form-item label="设备序列号" prop="serialNum">
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
                        :loading="fuzzySearchOption3.loading"
                        class='serial'>
                        <el-option
                            v-for="(item,index) in fuzzySearchOption3.filterOption"
                            :key="item.serialNum+index"
                            :label='item.serialNum'
                            :value="item.serialNum">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="开始时间" prop='time'>
                    <el-date-picker
                        v-model.trim="searchKey.time"
                        type="datetimerange"
                        :picker-options="timeOption"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期">
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
// import {defaultRoadInfo} from '../../../../static/config/defaultConfig.js';
import {findVideoRecords} from '@/api/roadSide';
import TList from '@/common/utils/list.js'
import VueDatepickerLocal from 'vue-datepicker-local'
import {queryRoadPointList,requestqueryRoadList,requestRSCamList,queryRoadSideDevList,queryRSDeviceList} from '@/api/search';
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
                // rcuId:'',
                rsPtName:'',
                // cameraId:'',
                type:1,
                serialNum:'',
                deviceId:'',
                startTime:'' ,
                endTime: '',
                time:[]
            },
            historySearchKey: {},
            deviceTypeList:[
                {name:'摄像头',val:1},
                {name:'雷达',val:2}
            ],
            timeOption: {
                disabledDate: time => {
                    let _time = time.getTime(),
                        _newTime = new Date().getTime();
                    return _time > _newTime;
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
                // rsPtName:[
                //     { required: true, message: '路侧点名称不能为空', trigger: 'blur' },
                // ],
                deviceId:[
                    { required: true, message: '摄像头编号不能为空', trigger: 'change' },
                ],
                serialNum:[
                    { required: true, message: '摄像头序列号不能为空', trigger: 'change' },
                ],
                time: [
                    { required: true, message: '请选择时间', trigger: 'blur' }
                ]
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
        this.searchKey.time = [this.$dateUtil.GetDateStr(7), this.$dateUtil.getNowFormatDate()];
        this.historySearchKey.startTime = this.searchKey.time ? this.$dateUtil.dateToMs(this.searchKey.time[0]) : '';
        this.historySearchKey.endTime = this.searchKey.time ? this.$dateUtil.dateToMs(this.searchKey.time[1]) : '';
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
            let _params = Object.assign({},this.historySearchKey,{
                startTime:this.searchKey.time ? this.$dateUtil.dateToMs(this.searchKey.time[0]) : '',
                endTime:this.searchKey.time ? this.$dateUtil.dateToMs(this.searchKey.time[1]) : ''
            });
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
                    this.historySearchKey.type = this.searchKey.type;
                    this.historySearchKey.startTime = this.searchKey.time ? this.$dateUtil.dateToMs(this.searchKey.time[0]) : '';
                    this.historySearchKey.endTime = this.searchKey.time ? this.$dateUtil.dateToMs(this.searchKey.time[1]) : '';
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
            this.fuzzySearchOption2.loading = true;
            clearTimeout(this.fuzzySearchOption2.timer);
            this.fuzzySearchOption2.timer = setTimeout(() => {
                queryRSDeviceList({ 
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
                    queryRSDeviceList({
                        'field':'deviceId',
                        'value':query,
                        'type':this.searchKey.type
                    }).then(res => {
                            if(res.status == '200'){
                                //接口请求后执行的操作 
                                this.fuzzySearchOption2.loading = false;
                                this.fuzzySearchOption2.defaultFilterOption = this.fuzzySearchOption2.filterOption = res.data.filter(item => {
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
                    queryRSDeviceList({
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
            this.fuzzySearchOption3.loading = true;
            clearTimeout(this.fuzzySearchOption3.timer);
            this.fuzzySearchOption3.timer = setTimeout(() => {
                queryRSDeviceList({
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
            if(this.fuzzySearchOption3.filterOption.length > 0){
                if(this.searchKey.serialNum === this.fuzzySearchOption3.filterOption[0].serialNum){
                    this.fuzzySearchOption3.filterOption = this.fuzzySearchOption3.defaultFilterOption;
                }
            }
        },
        deviceTypeSelect(typeVal){
            this.searchKey.type = typeVal;
            this.searchKey.rsPtName = '';
            this.searchKey.rsPtId = '';
            this.searchKey.deviceId = '';
            this.searchKey.serialNum = '';
            this.showDataList = [];
        },
        deviceIdSelect(val){
            if(val == ''){
                this.historySearchKey.serialNum = this.searchKey.serialNum = '';
                return false;
            }
            if(this.fuzzySearchOption2.filterOption.length > 0){
                let data = this.fuzzySearchOption2.filterOption.filter(item => item.deviceId == val);
                this.historySearchKey.deviceId = this.searchKey.deviceId = val;
                this.historySearchKey.serialNum = this.searchKey.serialNum = data[0].serialNum;
                this.historySearchKey.rsPtName = this.searchKey.rsPtName = data[0].rsPtName;
                this.historySearchKey.rsPtId = this.searchKey.rsPtId = data[0].rsPtId;
            }
        },
        serialSelect(val){
            if(val == ''){
                this.historySearchKey.deviceId = this.searchKey.deviceId = '';
                return false;
            }
            if(this.fuzzySearchOption3.filterOption.length > 0){
                let data = this.fuzzySearchOption3.filterOption.filter(item => item.serialNum == val);
                this.historySearchKey.serialNum = this.searchKey.serialNum = val;
                this.historySearchKey.deviceId = this.searchKey.deviceId = data[0].deviceId;
                this.historySearchKey.rsPtName = this.searchKey.rsPtName = data[0].rsPtName;
                this.historySearchKey.rsPtId = this.searchKey.rsPtId = data[0].rsPtId;
            }
        }
    },
}
</script>
<style>
.serial .el-input__inner{
    width:220px !important;
}
</style>

