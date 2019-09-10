<template>
    <!-- 基本信息 -->
    <div class="c-wrapper-20" v-cloak>
        <div v-show="!panel.show">
            <el-form :inline="true" :model="searchKey" ref="searchForm" size='small'>
                <el-form-item label="摄像头编号" prop='deviceId'>
                    <!-- <el-input v-model.trim="searchKey.camCode"></el-input> -->
                    <el-select
                        v-model.trim="searchKey.deviceId"
                        clearable
                        filterable
                        remote
                        reserve-keyword
                        placeholder="请输入关键词"
                        :remote-method="rsCamRemoteMethod"
                        @clear="$searchFilter.clearFunc(rsCamOption)"
                        @focus="$searchFilter.remoteMethodClick(rsCamOption, searchKey, 'deviceId', cameraUrl)"
                        @blur="$searchFilter.remoteMethodBlur(searchKey, 'deviceId')"
                        :loading="rsCamOption.loading">
                        <el-option
                            v-for="item in rsCamOption.filterOption"
                            :key="item"
                            :label="item"
                            :value="item">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="车牌号" prop='plateNo'>
                    <el-select
                        v-model.trim="searchKey.plateNo"
                        clearable
                        filterable
                        remote
                        reserve-keyword
                        placeholder="请输入关键词"
                        :remote-method="rsPlateNoRemoteMethod"
                        @clear="$searchFilter.clearFunc(rsPlateNoOption)"
                        @focus="$searchFilter.remoteMethodClick(rsPlateNoOption, searchKey, 'plateNo', searchUrl)"
                        @blur="$searchFilter.remoteMethodBlur(searchKey, 'plateNo')"
                        :loading="rsPlateNoOption.loading">
                        <el-option
                            v-for="item in rsPlateNoOption.filterOption"
                            :key="item"
                            :label="item"
                            :value="item">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="车辆编号" prop='vehicleId'>
                    <el-select
                        v-model.trim="searchKey.vehicleId"
                        clearable
                        filterable
                        remote
                        reserve-keyword
                        placeholder="请输入关键词"
                        :remote-method="rsVehicleRemoteMethod"
                        @clear="$searchFilter.clearFunc(rsVehicleOption)"
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
                <el-form-item label="下载状态" prop="taskStatus">
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
                ref="table"
                :data="dataList" 
                v-loading='loading'
                stripe
                border
                class="c-mb-70"
                max-height="724">
                <el-table-column label="序号" type="index" :index="indexMethod"></el-table-column>
                <el-table-column min-width="18%" label="文件名称" prop="fileName"></el-table-column>
                <el-table-column min-width="11%" label="车辆编号" prop="vehicleId"></el-table-column>
                <el-table-column min-width="11%" label="车牌号" prop="plateNo"></el-table-column>
                <el-table-column min-width="14%" label="摄像头编号" prop="camCode"></el-table-column>
                <el-table-column min-width="12%" label="开始时间" prop="startTime"></el-table-column>
                <el-table-column min-width="12%" label="结束时间" prop="endTime"></el-table-column>
                <el-table-column min-width="8%" label="视频来源">
                    <template slot-scope="scope">
                        <template v-if="scope.row.source == 1">直播</template>
                        <template v-if="scope.row.source == 2">手动获取</template>
                        <template v-if="scope.row.source == ''"></template>
                    </template>
                </el-table-column>
                <el-table-column min-width="8%" label="下载状态">
                    <template slot-scope="scope">
                        <template v-if="scope.row.taskStatus == 0">未下载</template>
                        <template v-if="scope.row.taskStatus == 1">下载中</template>
                        <template v-if="scope.row.taskStatus == 2">下载完成</template>
                        <template v-if="scope.row.taskStatus == 3">下载失败</template>
                    </template>
                </el-table-column>
                <el-table-column min-width="5%" label="操作">
                    <template slot-scope="scope">
                        <el-button size="small" icon="el-icon-download" circle type="warning" v-if="scope.row.taskStatus == 3" plain :loading="scope.row.downLoading" @click="reloadClick(scope.row)"></el-button>
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
        <addload ref='addload' v-if="dialogOption.show" @backDownPage='backFn'></addload>
    </div>
</template>
<script>

import Addload from './AddLoad.vue'
import {queryTaskList,redoVideoTask} from '@/api/video'
import {requestqueryVehicleList,requestFindCamList} from '@/api/search';
export default {
    name: 'VideoDownload',
    components: {
        Addload,
    },
    data(){
        let _this = this;
        return {
            searchLoading:false,
            loading:false,
            dialogOption: {
                loading: false,
                show: false,
                data: {}
            },
            manageShow:true,
            playbackShow:false,
            searchKey: {
                fileName: '',
                deviceId: '',
                plateNo: '',
                vehicleId: '',
                source: '',
                taskStatus: '',
                startTime: [],
                endTime: []
            },
            selector: [],
            auth: {
                isUpadte: true,
                isDelete: true,
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
                data: 'this.initCarVo()',
                show: false,
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
            rsVehicleOption: {
                loading: false,
                timer: null,
                filterOption: [],
                defaultOption: [],
                defaultFlag: false
            },
            rsPlateNoOption: {
                loading: false,
                timer: null,
                filterOption: [],
                defaultOption: [],
                defaultFlag: false
            },
            rsCamOption: {
                loading: false,
                timer: null,
                filterOption: [],
                defaultOption: [],
                defaultFlag: false
            },
            searchUrl: requestqueryVehicleList,
            cameraUrl:requestFindCamList,
        }
    },
    methods: {
        initCarVo(){
            return {
                "fileName":"",
                "camCode":"",
                "vehicleId":"",
                "plateNo":"",
                "source":"",
                "status":"",
                "startTime":"",
                "endTime": 0,
            };
        },
        initPageOption() {
            this.dataList = [];
            this.pageOption.total = 0;
            this.pageOption.page = 1;
        },
        init(){
            this.manageShow = true;
            this.playbackShow = false;
            this.initData();
            this.initPaging();
        },
        initPaging(){
            this.pageOption.page = 1;
            this.pageOption.total = 0;
            this.pageOption.size = 10;
        },
        initData(){
            this.dataList = [];
            this.loading = true;
            let protocal = JSON.parse(localStorage.getItem('protocal')) || '';
            queryTaskList({
                page: {
                    'pageSize': this.pageOption.size,
                    'pageIndex': this.pageOption.page-1
                },
                'fileName':this.searchKey.fileName,
                'camCode':this.searchKey.deviceId,
                'vehicleId':this.searchKey.vehicleId,
                'source':this.searchKey.source,
                'plateNo':this.searchKey.plateNo,
                'taskStatus':this.searchKey.taskStatus,
                'protocal':protocal,
                'startBeginTime': this.searchKey.startTime ? this.$dateUtil.dateToMs(this.searchKey.startTime[0]) : '',
                'startEndTime': this.searchKey.startTime ? this.$dateUtil.dateToMs(this.searchKey.startTime[1]) : '',
                'stopBeginTime': this.searchKey.endTime ? this.$dateUtil.dateToMs(this.searchKey.endTime[0]) : '',
                'stopEndTime': this.searchKey.endTime ? this.$dateUtil.dateToMs(this.searchKey.endTime[1]) : ''
            }).then(res => {
                if(res.status == '200'){
                    this.dataList = res.data.list;
                    this.pageOption.total = res.data.totalCount;
                    this.$refs.table.bodyWrapper.scrollTop = 0;
                }
                this.loading = false;
                this.searchLoading = false;
            }).catch(err => {
                this.loading = false;
                this.searchLoading = false;
            });
        },
        indexMethod(index) {
            return (this.pageOption.page-1) * this.pageOption.size + index + 1;
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
            this.rsVehicleOption.filterOption = this.rsVehicleOption.defaultOption;
            this.rsPlateNoOption.filterOption = this.rsPlateNoOption.defaultOption;
            this.rsCamOption.filterOption = this.rsCamOption.defaultOption;
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
        rsPlateNoRemoteMethod(query) {
            this.$searchFilter.publicRemoteMethod({
                query: query,
                searchOption: this.rsPlateNoOption,
                searchObj: this.searchKey,
                key: 'plateNo',
                request: this.searchUrl
            });
        },
        rsCamRemoteMethod(query) {
            this.$searchFilter.publicRemoteMethod({
                query: query,
                searchOption: this.rsCamOption,
                searchObj: this.searchKey,
                key: 'deviceId',
                request: this.cameraUrl
            });
        },
        cfgPanelFn(data){
            this.panel.show = false;
            this.panel.cfgShow = false;
        },
        addTask(item){
            this.dialogOption.show = true;
        },
        reloadClick(item){
            this.$confirm('是否下载该文件?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                redoVideoTask({
                    fileId: item.fileName
                }).then(res => {
                    if(res.status == '200'){
                        this.$message({
                            type: 'success',
                            duration: '1500',
                            message: res.message,
                            showClose: true
                        });
                    }
                    this.initDialogData();
                })
            })
        },
        initDialogData() {
            this.dialogOption.loading = false;
            this.dialogOption.show = false;
            this.dialogOption.data = {};
        },
        handleClose(done) {
            this.initDialogData();
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
        backFn(type){
            if(type == 'add'){
                this.searchKey.startTime = [this.$dateUtil.GetDateStr(7), this.$dateUtil.getNowFormatDate()];
                this.searchKey.endTime = [this.$dateUtil.GetDateStr(7), this.$dateUtil.getNowFormatDate()];
                this.initPaging();
                this.initData();
            }
            this.panel.show = false;
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
