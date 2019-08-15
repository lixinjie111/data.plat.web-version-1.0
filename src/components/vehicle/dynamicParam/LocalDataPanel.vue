<template>
    <div class="c-view-dialog">
        <div class="c-scroll-wrap">
            <div class="c-scroll-inner">
                <div class="c-title-fixed">
                    <h3 class="c-title">
                        动态参数<i class='el-icon-arrow-right'></i>{{title}}
                        <el-page-header @back="backClick" class="c-return-btn"></el-page-header>
                    </h3>
                </div>
                <div v-show="isShow && !isAddData" class="c-wrapper-20">
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
                        <el-form-item label="数据采集时间" prop='time'>
                        <el-date-picker
                            v-model.trim="searchKey.time"
                            type="datetimerange"
                            :picker-options="timeOption"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期">
                        </el-date-picker>
                    </el-form-item>
                    </el-form>
                    <div class="c-button-wrapper c-text-right">
                        <el-button size="mini" plain icon="el-icon-receiving" @click="addDataSet();">获取数据集</el-button>
                    </div>

                    <el-table
                        :data="dataList" 
                        v-loading='loading'
                        stripe
                        border>
                        <el-table-column prop="sid" label="CAN数据编号"></el-table-column>
                        <el-table-column prop="name" label="英文名称"></el-table-column>
                        <el-table-column prop="longidentifier" label="中文名称"></el-table-column>
                        <el-table-column prop="datType" label="类型"></el-table-column>
                        <el-table-column prop="description" label="描述"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button size="small" icon="el-icon-delete" circle type="warning" plain @click="deleteClick(scope.row)"></el-button>
                            </template>
                        </el-table-column>
                    </el-table>

                    <div class="c-text-center c-mt-20">
                        <el-button type="warning" size="small" @click="okClick">确定</el-button>
                        <el-button type="warning" size="small" plain @click="cancelClick">取消</el-button>
                    </div>
                    
                </div>
                <add-data-panel title="获取数据集" @loadData="loadData" @init="init" v-show="isAddData" ref="addDataPanel"></add-data-panel>
            </div>
        </div>
    </div>
    
</template>
<script>
import {submitForm} from '@/api/vehicle';
import AddDataPanel from './AddDataPanel.vue'
import TList from '@/common/utils/list.js'
import {requestqueryVehicleList} from '@/api/search';
export default {
    props: ['title','type','data'],
    components: {
        AddDataPanel,TList
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
                page: 1,
                size: 10,
                total: 0
            },
            searchKey:{
                vehicleId:'',
                startTime:'',
                endTime:'',
                time:''
            },
            dataList:[],//子组件返回的所有数据
            pageData:[],//每一页数据
            current: {
                top: 0,
                height: 100,
            },
            loading:false,
            isAddData: false,
            isShow:true,
            isTipsShow:false,
            isTimeTipShow:false,
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
        init(){
            this.isAddData=false;
            this.isShow=true;
            this.isTipsShow = false;
            this.isTimeTipShow = false;
        },
        loadData(list,pageSize){
            if(list != undefined){
                if(pageSize != undefined){
                    this.pageOption.size=pageSize;
                }else{
                    this.pageOption.size = 10;
                }
                this.pageOption.page = 0;
                this.pageOption.total = list.length;
                TList.pushNoRepeat(this.dataList,list);
                this.dataList.sort(function(a,b){
                    return parseInt(a.sid) - parseInt(b.sid);
                });
            }
            this.isAddData=false;
            this.isShow=true;
            this.showPageData();
        },
        showPageData(){
            this.pageData = this.dataList;
            this.pageOption.total = this.pageData.length;
            let start = this.pageOption.index * this.pageOption.size;
            let end = start + this.pageOption.size-1;
            this.pageData = this.pageData.slice(start,end);    
        },
        deleteClick(item){
            this.$confirm('确认删除此条数据？')
            .then(_ => {
                this.deleteDone(item);
            })
        },
        deleteDone(item){
            this.dataList.splice(this.dataList.indexOf(item),1);
            this.pageOption.size = 10;
            this.pageOption.page = 0;
            this.pageOption.total = this.dataList.length;
            this.showPageData();
        },
        backClick(){
            if(!this.isAddData){
                this.dataList = [];
                this.pageData =[];
                this.isShow=false;
                this.$emit("localDataPanelBack");
            }
            else{
                this.isShow=true;
                this.isAddData=false;
                this.isTipsShow = false;
                this.isTimeTipShow = false;
            } 
        },
        
        addDataSet(){
            this.isAddData = true;
        },

        initLocalDataPanelHeight(){
            let boxHeight = document.body.clientHeight;
            this.current.top = document.getElementById('localDataTable').offsetTop;
            this.current.height = boxHeight - this.current.top - 55 - 100 - 40;
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
        okClick(){
            if(this.dataList.length == 0) {
                this.$message.error('showPrompt','请增加数据集 ！');
                return;
            }
            let startTime = this.$dateUtil.dateToMs(this.searchKey.startTime);
            let endTime = this.$dateUtil.dateToMs(this.searchKey.endTime);

            if(endTime - startTime > 3600 * 1000){
                this.$message.error('showPrompt','数据采集开始时间和结束时间间隔不能大于1小时 ！');
                return;
            }
                
            var sIds =[];
            this.dataList.forEach(function(item){
                    sIds.push(item.sid);
            });
            submitForm({
                vehicleId: this.searchKey.vehicleId,
                startTime:this.$dateUtil.dateToMs(this.searchKey.time[0]),
                endTime:this.$dateUtil.dateToMs(this.searchKey.time[1]),
                eventTime:new Date().getTime(),
                eventName:'云端查询',
                sIds:sIds.join(',')
            }).then(res => {
                if(res.status == '200'){
                    this.$emit("localDataPanelBack");
                }
            })
        },
        cancelClick(){
            this.backClick();
        },
    },
    mounted(){
        this.init();
    }
}
</script>

