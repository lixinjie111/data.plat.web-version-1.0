<template>
<!-- 基本信息 -->
<div class="c-wrapper-20" v-cloak>
    <div v-show="!panel.show">
        <el-form ref="searchForm" :inline="true" :model="searchKey" size="small">
            <el-form-item label="摄像头编号" prop='deviceId'>
                <el-select
                    v-model.trim="searchKey.deviceId"
                    clearable
                    filterable
                    remote
                    reserve-keyword
                    placeholder="请输入关键词"
                    :remote-method="rsCamCodeRemoteMethod"
                    @clear="$searchFilter.clearFunc(rsCamCodeOption)"
                    @focus="$searchFilter.remoteMethodClick(rsCamCodeOption, searchKey, 'deviceId', cameraUrl)"
                    @blur="$searchFilter.remoteMethodBlur(searchKey, 'deviceId')" 
                    :loading="rsCamCodeOption.loading">
                    <el-option
                        v-for="item in rsCamCodeOption.filterOption"
                        :key="item"
                        :label="item"
                        :value="item">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="道路名称" prop='rspRoadName'>
                <el-select
                    v-model.trim="searchKey.rspRoadName"
                    clearable
                    filterable
                    remote
                    reserve-keyword
                    placeholder="请输入关键词"
                    :remote-method="rsRoadNameRemoteMethod"
                    @clear="$searchFilter.clearFunc(rsRoadNameOption)"
                    @focus="$searchFilter.remoteMethodClick(rsRoadNameOption, searchKey, 'rspRoadName', roadUrl)"
                    @blur="$searchFilter.remoteMethodBlur(searchKey, 'rspRoadName')" 
                    :loading="rsRoadNameOption.loading">
                    <el-option
                        v-for="item in rsRoadNameOption.filterOption"
                        :key="item"
                        :label="item"
                        :value="item">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="路侧点名称" prop='rsPtName'>
                <el-select
                    v-model.trim="searchKey.rsPtName"
                    clearable
                    filterable
                    remote
                    reserve-keyword
                    placeholder="请输入关键词"
                    :remote-method="rsPointNameRemoteMethod"
                    @clear="$searchFilter.clearFunc(rsPointNameOption)"
                    @focus="$searchFilter.remoteMethodClick(rsPointNameOption, searchKey, 'rsPtName', roadUrl)"
                    @blur="$searchFilter.remoteMethodBlur(searchKey, 'rsPtName')" 
                    :loading="rsPointNameOption.loading">
                    <el-option
                        v-for="item in rsPointNameOption.filterOption"
                        :key="item"
                        :label="item"
                        :value="item">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="视频来源" prop='source'>
                <el-select v-model="searchKey.source">
                    <el-option
                        v-for="item in sourceList"
                        :key="item.val"
                        :label="item.name"
                        :value="item.val"
                    ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="下载状态" prop='taskStatus'>
                <el-select v-model="searchKey.taskStatus">
                    <el-option
                        v-for="item in statusList"
                        :key="item.val"
                        :label="item.name"
                        :value="item.val"
                    ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="开始时间" prop='startTime'>
                <el-date-picker
                    v-model.trim="searchKey.startTime"
                    type="datetimerange"
                    :picker-options="timeOption"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期">
                </el-date-picker>
            </el-form-item>
            <el-form-item label="结束时间" prop='endTime'>
                <el-date-picker
                    v-model.trim="searchKey.endTime"
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
            <el-button size="mini" plain icon="el-icon-plus" @click="addTask">新建任务</el-button>
        </div>

        <el-table 
            :data="dataList" 
            v-loading='loading' 
            stripe  
            border
            class="c-mb-70"
            max-height="724">
            <el-table-column type="index" label="序号" :index='indexMethod'></el-table-column>
            <el-table-column prop="fileName" min-width="18%" label="文件名称"></el-table-column>
            <el-table-column prop="camCode" min-width="6%" label="摄像头编号"></el-table-column>
            <el-table-column prop="roadName" min-width="8%" label="道路名称"></el-table-column>
            <el-table-column prop="roadPointName" min-width="9%" label="路侧点名称"></el-table-column>
            <el-table-column label="创建时间" min-width="10%">
                <template slot-scope="scope">{{scope.row.createDate}}</template>
            </el-table-column>
            <el-table-column label="开始时间" min-width="10%">
                <template slot-scope="scope">{{scope.row.startTime}}</template>
            </el-table-column>
            <el-table-column label="结束时间" min-width="10%">
                <template slot-scope="scope">{{scope.row.endTime}}</template>
            </el-table-column>
            <el-table-column prop="plateNo" min-width="6%" label="下载状态">
                <template slot-scope="scope">
                    <span v-if='scope.row.taskStatus == "0"'>未下载</span>
                    <span v-if='scope.row.taskStatus == "1"'>下载中</span>
                    <span v-if='scope.row.taskStatus == "2"'>下载完成</span>
                    <span v-if='scope.row.taskStatus == "3"'>下载失败</span>
                </template>
            </el-table-column>
            <el-table-column prop="note" label="失败原因" min-width="9%"></el-table-column>
            <el-table-column min-width="7%" label="视频来源">
                <template slot-scope="scope">
                    <template v-if="scope.row.source == 1">直播</template>
                    <template v-if="scope.row.source == 2">手动获取</template>
                    <template v-if="scope.row.source == ''"></template>
                </template>
            </el-table-column>
            <el-table-column label="操作" min-width="5%">
                <template slot-scope="scope">
                    <el-button size="small" 
                    icon="el-icon-download" 
                    circle type="warning" 
                    plain 
                    v-if='scope.row.taskStatus == "3"'
                    :loading="scope.row.downLoading" 
                    @click="reloadClick(scope.row)"></el-button>
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
    <addload v-if="dialogOption.show"  @backDownPage="backFn"></addload>
</div>
</template>
<script>
import Addload from './roadAddLoad.vue'
import {requestqueryRoadList,requestRSCamList} from '@/api/search';
import {queryRoadTaskList,redoVideoTask} from '@/api/roadSide'
export default {
    name: 'VideoDownload',
    components: {
        Addload
    },
    data(){
        let _this = this;
        return {
            searchLoading:false,
            loading:false,
            manageShow:true,
            playbackShow:false,
            // startTime:'',
            endTime:'',
            dialogOption: {
                loading: false,
                show: false,
                data: {}
            },
            currentDatas: [
                {vId:'1222',plateNo:'京N-9932',vin:'2342',serialNumber:'3242',workStatusName:'2',directionName:'前',isBindName:'未绑定',camTypeName:'sdfs',manuName:'2423',bindDate:'2019-03-05'},
                {vId:'1222',plateNo:'京N-9932',vin:'2342',serialNumber:'3242',workStatusName:'2',directionName:'前',isBindName:'未绑定',camTypeName:'sdfs',manuName:'2423',bindDate:'2019-03-05'},
                {vId:'1222',plateNo:'京N-9932',vin:'2342',serialNumber:'3242',workStatusName:'2',directionName:'前',isBindName:'未绑定',camTypeName:'sdfs',manuName:'2423',bindDate:'2019-03-05'},
                {vId:'1222',plateNo:'京N-9932',vin:'2342',serialNumber:'3242',workStatusName:'2',directionName:'前',isBindName:'未绑定',camTypeName:'sdfs',manuName:'2423',bindDate:'2019-03-05'},
            ],
            searchKey: {
                fileName: '',
                deviceId: '',
                rspRoadName: '',
                rsPtName: '',
                source: '',
                taskStatus: '',
                startTime:[],
                endTime:[]
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
                data: '',
                show: false
            },
            current: {
                top: 0,
                accessPlatform: null,
            },
            sourceList:[
                {name:'全部',val:''},
                {name:'直播',val:'1'},
                {name:'手动获取',val:'2'},
            ],
            statusList:[
                {name:'全部',val:''},
                {name:'未下载',val:'0'},
                {name:'下载中',val:'1'},
                {name:'下载完成',val:'2'},
                {name:'下载失败',val:'3'},
            ],
            timeOption: {
                disabledDate: time => {
                    let _time = time.getTime(),
                        _newTime = new Date().getTime();
                    return _time > _newTime;
                }
            },
            rsCamCodeOption: {
                loading: false,
                timer: null,
                filterOption: [],
                defaultOption: [],
                defaultFlag: false
            },
            rsRoadNameOption: {
                loading: false,
                timer: null,
                filterOption: [],
                defaultOption: [],
                defaultFlag: false
            },
            rsPointNameOption: {
                loading: false,
                timer: null,
                filterOption: [],
                defaultOption: [],
                defaultFlag: false
            },
            cameraUrl: requestRSCamList,
            roadUrl:requestqueryRoadList
        }
    },
    methods: {
        initPageOption() {
            this.dataList = [];
            this.pageOption.total = 0;
            this.pageOption.page = 1;
        },
        init(){
            this.manageShow = true;
            this.playbackShow = false;
            this.initPaging();
            this.initData();
        },
        initPaging(){
            this.pageOption.page = 1;
            this.pageOption.total = 0;
            this.pageOption.size = 10;
        },
        initData(){
            this.dataList = [];
            this.loading = true;
            queryRoadTaskList({
                page: {
                    'pageSize': this.pageOption.size,
                    'pageIndex': this.pageOption.page-1
                },
                'fileName':this.searchKey.fileName,
                'camCode':this.searchKey.deviceId,
                'roadName':this.searchKey.rspRoadName,
                'roadPointName':this.searchKey.rsPtName,
                'source':this.searchKey.source,
                'taskStatus':this.searchKey.taskStatus,
                'startBeginTime': this.searchKey.startTime ? this.$dateUtil.dateToMs(this.searchKey.startTime[0]) : '',
                'startEndTime': this.searchKey.startTime ? this.$dateUtil.dateToMs(this.searchKey.startTime[1]) : '',
                'stopBeginTime': this.searchKey.endTime ? this.$dateUtil.dateToMs(this.searchKey.endTime[0]) : '',
                'stopEndTime': this.searchKey.endTime ? this.$dateUtil.dateToMs(this.searchKey.endTime[1]) : '',
                'protocal': JSON.parse(localStorage.getItem('protocal')) || '',
            }).then(res => {
                if(res.status == '200'){
                    this.dataList = res.data.list;
                    this.pageOption.total = res.data.totalCount;
                }
                this.searchLoading = false;
                this.loading = false;
            }).catch(err => {
                this.searchLoading = false;
                this.loading = false;
            })
        },
        searchClick(){
            this.$refs.searchForm.validate((valid) => {
                if (valid) {
                    this.searchLoading = true;
                    this.initPaging();
                    this.initData();
                } else {
                    return false;
                }
            });
        },
        resetClick(){
            this.$refs.searchForm.resetFields();
            this.rsCamCodeOption.filterOption = this.rsCamCodeOption.defaultOption;
            this.rsRoadNameOption.filterOption = this.rsRoadNameOption.defaultOption;
            this.rsPointNameOption.filterOption = this.rsPointNameOption.defaultOption;
        },
        rsCamCodeRemoteMethod(query) {
            this.$searchFilter.publicRemoteMethod({
                query: query,
                searchOption: this.rsCamCodeOption,
                searchObj: this.searchKey,
                key: 'deviceId',
                request: this.cameraUrl
            });
        },
        rsRoadNameRemoteMethod(query) {
            this.$searchFilter.publicRemoteMethod({
                query: query,
                searchOption: this.rsRoadNameOption,
                searchObj: this.searchKey,
                key: 'rspRoadName',
                request: this.roadUrl
            });
        },
        rsPointNameRemoteMethod(query) {
            this.$searchFilter.publicRemoteMethod({
                query: query,
                searchOption: this.rsPointNameOption,
                searchObj: this.searchKey,
                key: 'rsPtName',
                request: this.roadUrl
            });
        },
        addTask(item){
            this.dialogOption.show = true;
        },
        reloadClick(item){
            this.$confirm('是否再次下载视频 ?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                redoVideoTask({
                    fileId:item.fileName
                }).then(res => {
                    if(res.status == '200'){
                        this.$message.success(res.message);
                    }
                })
            })
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
        indexMethod(index){
            return index + this.pageOption.size * (this.pageOption.page-1) + 1;
        },
        backFn(type){
            if(type == 'add'){
                this.searchKey.startTime = [this.$dateUtil.GetDateStr(7), this.$dateUtil.getNowFormatDate()];
                this.searchKey.endTime = [this.$dateUtil.GetDateStr(7), this.$dateUtil.getNowFormatDate()];
                this.init();
            }
            this.dialogOption.show = false;
        }
    },
    mounted(){
        this.searchKey.startTime = [this.$dateUtil.GetDateStr(7), this.$dateUtil.getNowFormatDate()];
        this.searchKey.endTime = [this.$dateUtil.GetDateStr(7), this.$dateUtil.getNowFormatDate()];
        this.init();
    },
    beforeDestroy(){

    },
}
</script>
