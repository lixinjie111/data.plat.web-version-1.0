<template>
<!-- 基本信息 -->
<div class="c-wrapper-20" v-cloak>
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
                @clear="rsCamCodeOption.searchFilter.clearFunc(rsCamCodeOption)"
                @focus="rsCamCodeOption.searchFilter.remoteMethodClick(rsCamCodeOption, searchKey, 'deviceId')"
                @blur="rsCamCodeOption.searchFilter.remoteMethodBlur(searchKey, 'deviceId')"
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
                @clear="rsRoadNameOption.searchFilter.clearFunc(rsRoadNameOption)"
                @focus="rsRoadNameOption.searchFilter.remoteMethodClick(rsRoadNameOption, searchKey, 'rspRoadName')"
                @blur="rsRoadNameOption.searchFilter.remoteMethodBlur(searchKey, 'rspRoadName')"
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
                @clear="rsPointNameOption.searchFilter.clearFunc(rsPointNameOption)"
                @focus="rsPointNameOption.searchFilter.remoteMethodClick(rsPointNameOption, searchKey, 'rsPtName')"
                @blur="rsPointNameOption.searchFilter.remoteMethodBlur(searchKey, 'rsPtName')"
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
            <el-button type="warning" icon="el-icon-search" @click="searchClick" :loading="searchLoading">查询</el-button>
            <el-button type="warning" plain icon="el-icon-setting" @click="resetClick">重置</el-button>
        </el-form-item>
    </el-form>

    <div class="c-button-wrapper c-text-right">
        <el-button size="mini" plain icon="el-icon-delete" @click="delClick">删除</el-button>
        <el-button size="mini" plain icon="el-icon-download" @click="downClick">下载</el-button>
    </div>

    <el-table ref="multipleTable" :data="dataList" v-loading="loading"  
        stripe  
        border
        class="c-mb-70"
        max-height="724"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection"></el-table-column>
        <el-table-column label="序号" type="index" :index='indexMethod'></el-table-column>
        <el-table-column min-width="18%" prop="fileName" label="文件名称"></el-table-column>
        <el-table-column min-width="6%" prop="camCode" label="摄像头编号"></el-table-column>
        <el-table-column min-width="16%" prop="roadPointName" label="路侧点名称"></el-table-column>
        <el-table-column min-width="10%" prop="roadName" label="道路名称"></el-table-column>
        <el-table-column min-width="10%" prop="startTime" label="开始时间"></el-table-column>
        <el-table-column min-width="10%" prop="endTime" label="结束时间"></el-table-column>
        <el-table-column min-width="8%" prop="duration" label="视频时长(Min)">
            <template slot-scope="scope">{{s_to_hs(scope.row.duration)}}</template>
        </el-table-column>
        <el-table-column min-width="8%" prop="fileSizeUnit" label="视频大小(MB)"></el-table-column>
        <el-table-column min-width="8%" label="视频来源">
            <template slot-scope="scope">
                <span>{{scope.row.source | sourceFileter}}</span>
            </template>
        </el-table-column>
        <el-table-column min-width="10%" prop="endTime" label="回放">
            <template slot-scope="scope">
                <el-button size="small" icon="el-icon-refresh-left" circle type="warning" plain @click="replay(scope.row)"></el-button>
                <!-- <el-button size="small" icon="el-icon-download" circle type="warning" plain @click="exportClick(scope.row)"></el-button> -->
                <!-- <el-button size="small" icon="el-icon-delete" circle type="warning" plain @click="delClick(scope.row)"></el-button> -->
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
    <road-video-replay v-if='isReplayShow' @backRoadManage='backFn'></road-video-replay>
</div>
</template>
<script>
// 模糊查询封装
import SearchFilter from '@/assets/js/module/searchFilter.js'
import TList from '@/common/utils/list.js';
import VueDatepickerLocal from 'vue-datepicker-local';
import RoadVideoReplay from './roadVideoReplay.vue';
import {requestqueryRoadList,requestRSCamList} from '@/api/search';
import {queryRoadVideoList,removeVideo} from '@/api/roadSide';
import axios from 'axios'
export default {
    name: 'VideoDownload',
    components: {
        VueDatepickerLocal,
        RoadVideoReplay
    },
    filters:{
        sourceFileter(source){
            const sourceMap = {
                '1':'直播',
                '2':'手动',
                '':''
            }
            return sourceMap[source];
        }
    },
    data(){
        let _this = this;
        return {
            isReplayShow:false,
            manageShow:true,
            playbackShow:false,
            endTime:'',
            searchLoading:false,
            loading:false,
            fileName:'',
            // currentDatas: [
            //     {vId:'1222',plateNo:'京N-9932',vin:'2342',serialNumber:'3242',workStatusName:'2',directionName:'前',isBindName:'未绑定',camTypeName:'sdfs',manuName:'2423',bindDate:'2019-03-05'},
            //     {vId:'1222',plateNo:'京N-9932',vin:'2342',serialNumber:'3242',workStatusName:'2',directionName:'前',isBindName:'未绑定',camTypeName:'sdfs',manuName:'2423',bindDate:'2019-03-05'},
            //     {vId:'1222',plateNo:'京N-9932',vin:'2342',serialNumber:'3242',workStatusName:'2',directionName:'前',isBindName:'未绑定',camTypeName:'sdfs',manuName:'2423',bindDate:'2019-03-05'},
            //     {vId:'1222',plateNo:'京N-9932',vin:'2342',serialNumber:'3242',workStatusName:'2',directionName:'前',isBindName:'未绑定',camTypeName:'sdfs',manuName:'2423',bindDate:'2019-03-05'},
            // ],
            searchKey: {
                fileName: '',
                deviceId: '',
                rspRoadName: '',
                rsPtName: '',
                source: '',
                startTime: [],
                endTime: []
            },
            historySearchKey: {},
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
                {name:'未处理',val:'0'},
                {name:'正在处理',val:'1'},
                {name:'成功',val:'2'},
                {name:'失败',val:'3'},
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
                searchFilter:new SearchFilter(),
                filterOption: [],
                defaultOption: [],
                defaultFlag: false,
                request:requestRSCamList
            },
            rsRoadNameOption: {
                loading: false,
                timer: null,
                searchFilter:new SearchFilter(),
                filterOption: [],
                defaultOption: [],
                defaultFlag: false,
                request:requestqueryRoadList
            },
            rsPointNameOption: {
                loading: false,
                timer: null,
                searchFilter:new SearchFilter(),
                filterOption: [],
                defaultOption: [],
                defaultFlag: false,
                request:requestqueryRoadList
            },

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
            this.historySearchKey.startBeginTime = this.searchKey.startTime ? this.$dateUtil.dateToMs(this.searchKey.startTime[0]) : '';
            this.historySearchKey.startEndTime = this.searchKey.startTime ? this.$dateUtil.dateToMs(this.searchKey.startTime[1]) : '';
            this.historySearchKey.stopBeginTime = this.searchKey.endTime ? this.$dateUtil.dateToMs(this.searchKey.endTime[0]) : '';
            this.historySearchKey.stopEndTime = this.searchKey.endTime ? this.$dateUtil.dateToMs(this.searchKey.endTime[1]) : '';
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
            let protocal = JSON.parse(localStorage.getItem('protocal')) || '';
            this.historySearchKey.protocal = protocal;
            let _params = {
                page: {
                    'pageSize': this.pageOption.size,
                    'pageIndex': this.pageOption.page-1
                },
                ...this.historySearchKey
            }
            queryRoadVideoList(_params).then(res => {
                if(res.status == '200'){
                    this.dataList = res.data.list;
                    this.dataList.forEach(item => {
                        item.delLoading = false;
                    })
                    this.pageOption.total = res.data.totalCount;
                    this.searchLoading = false;
                    this.loading = false;
                    this.$refs.multipleTable.bodyWrapper.scrollTop = 0;
                }
            }).catch(err => {
                this.searchLoading = false;
                this.loading = false;
            });
        },
        handleSelectionChange(val) {
            this.selector = [];
            val.forEach(item => {
                this.selector.push(item.fileName);
            });
        },
        searchClick(){
            this.$refs.searchForm.validate((valid) => {
                if (valid) {
                    this.searchLoading = true;
                    this.historySearchKey = this.searchKey;
                    this.historySearchKey.startBeginTime = this.searchKey.startTime ? this.$dateUtil.dateToMs(this.searchKey.startTime[0]) : '';
                    this.historySearchKey.startEndTime = this.searchKey.startTime ? this.$dateUtil.dateToMs(this.searchKey.startTime[1]) : '';
                    this.historySearchKey.stopBeginTime = this.searchKey.endTime ? this.$dateUtil.dateToMs(this.searchKey.endTime[0]) : '';
                    this.historySearchKey.stopEndTime = this.searchKey.endTime ? this.$dateUtil.dateToMs(this.searchKey.endTime[1]) : '';
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
        rsRoadNameRemoteMethod(query) {
            this.rsRoadNameOption.searchFilter.publicRemoteMethod({
                query: query,
                searchOption: this.rsRoadNameOption,
                searchObj: this.searchKey,
                key: 'rspRoadName'
            });
        },
        rsCamCodeRemoteMethod(query) {
            this.rsCamCodeOption.searchFilter.publicRemoteMethod({
                query: query,
                searchOption: this.rsCamCodeOption,
                searchObj: this.searchKey,
                key: 'deviceId'
            });
        },
        rsPointNameRemoteMethod(query) {
            this.rsPointNameOption.searchFilter.publicRemoteMethod({
                query: query,
                searchOption: this.rsPointNameOption,
                searchObj: this.searchKey,
                key: 'rsPtName'
            });
        },
        cfgPanelFn(data){
            this.panel.show = false;
            this.panel.cfgShow = false;
        },
        downClick(item){
            if (this.selector.length > 0) {
                axios({
                    url: `${window.config.url}cam/downLoadZipFile`,
                    method: 'post',
                    responseType: 'blob',
                    data: {
                        'fileIds': this.selector
                    }
                }).then(res => {
                    this.downloadFile(res);
                }).catch(err => {
                    console.log('err', err);
                });
            } else {
                this.$message({
                    type: 'error',
                    duration: '1500',
                    message: '请选择要下载的文件!',
                    showClose: true
                });
            }
        },
        downloadFile(res){
            if (res.data) {
                if ('msSaveBlob' in navigator) { // 对IE和Edge的兼容
                    window.navigator.msSaveBlob(res.data, decodeURI(res.headers['content-disposition'].split('filename=')[1]))
                } else {
                    let blob = res.data;
                    let a = document.createElement('a');
                    a.setAttribute('id','exportLog');
                    a.style.display = 'none';
                    let url = window.URL.createObjectURL(new Blob([res.data]),{type: "application/zip"});
                    let filename = decodeURI(res.headers['content-disposition'].split('filename=')[1]);
                    var evt = document.createEvent('HTMLEvents') // 对firefox的兼容
                    evt.initEvent('click', false, false) // 对firefox的兼容
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.dispatchEvent(evt); // 对firefox的兼容
                    a.click();
                    window.URL.revokeObjectURL(url);
                }
            }
        },
        s_to_hs(s){
            //计算分钟
            //算法：将秒数除以60，然后下舍入，既得到分钟数
            var h;
            h  =   Math.floor(s/60);
            //计算秒
            //算法：取得秒%60的余数，既得到秒数
            s  =   s%60;
            //将变量转换为字符串
            h    +=    '';
            s    +=    '';
            //如果只有一位数，前面增加一个0
            h  =   (h.length==1)?'0'+h:h;
            s  =   (s.length==1)?'0'+s:s;
            return h+':'+s;
        },
        delClick(){
            if (this.selector.length > 0) {
                this.$confirm('确定要删除此条数据吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    let fileId = [];
                    fileId = this.selector;
                    // item.delLoading = true;
                    removeVideo({  
                        "fields": fileId          
                    }).then(res => {
                        if(res.status == '200'){
                            this.$message({
                                type: 'success',
                                duration: '1500',
                                message: res.message,
                                showClose: true
                            });
                            window.location.reload();
                        }
                        // item.delLoading = false;
                    })
                })
            }else{
                this.$message({
                    type: 'error',
                    duration: '1500',
                    message: '请选择要删除的文件!',
                    showClose: true
                });
            }
        },
        replay(item){
            let videoInfo = JSON.stringify(item);
            localStorage.setItem('videoInfo',videoInfo);
            this.isReplayShow = true;
            this.panel.show = true;
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
            return (this.pageOption.page-1) * this.pageOption.size + index + 1;
        },
        exportClick(item) {
            this.$confirm('是否导出文件?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                window.location.href = window.config.downloadUrl + item.fileName;
                // axios.get(window.config.downloadUrl+item.fileName, {}).then();
            }).catch(() => {
                this.$message({
                    type: 'info',
                    duration: '1500',
                    message: '已取消导出',
                    showClose: true
                });  
            });
        },
        backFn(){
            this.isReplayShow = false;
            this.panel.show = false; 
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
<style>
/* .export a{
    text-decoration: none;
    color:#fff;
} */
</style>

