<template>
    <!-- 基本信息 -->
    <div class="c-wrapper-20">
            <el-form ref="searchForm" :inline="true" :model="searchKey" size="small">
            <el-form-item label="车辆编号" prop="vehicleId">
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
            <el-form-item label="车牌号" prop="plateNo">
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
            <el-form-item label="摄像头编号" prop='deviceId'>
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
                <el-button type="warning" icon="el-icon-search" :loading='searchLoading' @click="searchClick">查询</el-button>
                <el-button type="warning" plain icon="el-icon-setting" @click="resetClick">重置</el-button>
            </el-form-item>
        </el-form>
        <div class="c-button-wrapper c-text-right">
            <el-button size="mini" plain icon="el-icon-delete" @click="removeVideo">删除</el-button>
            <el-button size="mini" plain icon="el-icon-download" @click="downClick">下载</el-button>
        </div>
        <el-table
            :data="dataList" 
            v-loading='loading'
            stripe
            border
            class="c-mb-70"
            max-height="724" 
            @selection-change="handleSelectionChange">
            <el-table-column type="selection"></el-table-column>
            <el-table-column label="序号" type="index" :index="indexMethod"></el-table-column>
            <el-table-column min-width="20%" label="文件名称" prop="fileName"></el-table-column>
            <el-table-column min-width="8%" label="车辆编号" prop="vehicleId"></el-table-column>
            <el-table-column min-width="8%" label="车牌号" prop="plateNo"></el-table-column>
            <el-table-column min-width="8%" label="摄像头编号" prop="camCode"></el-table-column>
            <el-table-column min-width="12%" label="开始时间" prop="startTime"></el-table-column>
            <el-table-column min-width="12%" label="结束时间" prop="endTime"></el-table-column>
            <el-table-column min-width="8%" label="视频时长(Min)">
                <template slot-scope="scope">{{s_to_hs(scope.row.duration)}}</template>
            </el-table-column>
            <el-table-column min-width="8%" label="视频大小(MB)" prop="fileSizeUnit"></el-table-column>
            <el-table-column min-width="6%" label="视频来源">
                <template slot-scope="scope">{{scope.row.source==1 ? '直播' : '手动获取'}}</template>
            </el-table-column>
            <el-table-column min-width="10%" label="回放">
                <template slot-scope="scope">
                    <el-button size="small" icon="el-icon-refresh-left" circle type="warning" plain @click="replay(scope.row)"></el-button>
                    <!-- <el-button size="small" icon="el-icon-download" circle type="warning" plain @click="exportClick(scope.row)"></el-button> -->
                    <!-- <el-button size="small" icon="el-icon-delete" circle type="warning" plain @click="removeVideo(scope.row)"></el-button> -->
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
        <play-back v-if='isPlaybackShow' @backVideoManage='backFn'></play-back>
    </div>
</template>
<script>
import TList from '@/common/utils/list.js';
import {requestqueryVehicleList,requestFindCamList} from '@/api/search';
import PlayBack from '@/components/video/playVideo/playback.vue';
import {queryVideoList,removeVideo} from '@/api/video';
import axios from 'axios';
export default {
    name: 'VideoManage',
    components: {
        PlayBack
    },
    data(){
        let _this = this;
        return {
            isPlaybackShow:false,
            searchLoading:false,
            loading:false,
            sourceList:[
                {name:'全部',val:''},
                {name:'直播',val:'1'},
                {name:'手动获取',val:'2'},
            ],
            searchKey: {
                fileName: '',
                vehicleId: '',
                plateNo: '',
                deviceId: '',
                source:'',
                startTime: [],
                endTime: []
            },
            selector: [],
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
        initPageOption() {
            this.dataList = [];
            this.pageOption.total = 0;
            this.pageOption.page = 1;
        },
        replay(item){
            let manaInfo = JSON.stringify(item);
            localStorage.setItem('playHistoryInfo',manaInfo);
            this.panel.show = true;
            this.isPlaybackShow = true;
        },
        exportClick(item) {
            this.$confirm('是否导出文件?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                
                // axios.get(window.config.downloadUrl+item.fileName, {}).then();
                window.location.href = window.config.downloadUrl+item.fileName;
                // window.location.href="http://172.17.1.13:9091/dataPlatApp/cam/download/"+item.fileName;
            }).catch(() => {
                this.$message.info('已取消导出');          
            });
        },
        initPaging(){
            this.pageOption.page = 1;
            this.pageOption.total = 0;
            this.pageOption.size = 10;
        },
        initData(){
            this.dataList = [];
            this.loading = true;
            queryVideoList({
                'page': {
                    'pageSize': this.pageOption.size,
                    'pageIndex': this.pageOption.page-1
                },
                'fileName':this.searchKey.fileName,
                'vehicleId':this.searchKey.vehicleId,
                'plateNo':this.searchKey.plateNo,
                'source':this.searchKey.source,
                'camId':this.searchKey.deviceId,
                'protocal': JSON.parse(localStorage.getItem('protocal')) || '',
                'startBeginTime':this.searchKey.startTime ? this.$dateUtil.dateToMs(this.searchKey.startTime[0]) : '',
                'startEndTime':this.searchKey.startTime ? this.$dateUtil.dateToMs(this.searchKey.startTime[1]) : '',
                'stopBeginTime':this.searchKey.endTime ? this.$dateUtil.dateToMs(this.searchKey.endTime[0]) : '',
                'stopEndTime':this.searchKey.endTime ? this.$dateUtil.dateToMs(this.searchKey.endTime[1]) : ''
            }).then(res => {
                if(res.status == '200'){
                    res.data.list.forEach(item => {
                        item.delLoading = false;
                    });
                    this.dataList = res.data.list || [];
                    this.pageOption.total = res.data.totalCount || 0;
                }
                this.loading = false;
                this.searchLoading = false;
            }).catch(err => {
                this.loading = false;
                this.searchLoading = false;
            })
        },
        indexMethod(index) {
            return (this.pageOption.page-1) * this.pageOption.size + index + 1;
        },
        handleSelectionChange(val) {
            this.selector = [];
            val.forEach(item => {
                this.selector.push(item.fileName);
            });
        },
        searchClick(){
            this.searchLoading = true;
            this.initPaging();
            this.initData();
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
        vehiclePanelFn(e){
            this.panel.show = false;
            this.panel.cfgShow = false;
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
                this.$message.error('请选择要下载的文件!');
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
        removeVideo(){
            if (this.selector.length > 0) {
                this.$confirm('确定要删除此条数据吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    let fileId = [];
                    fileId = this.selector;
                    // fileId.push(item.fileName);
                    // item.delLoading = true;
                    removeVideo({  
                        "fields": fileId          
                    }).then(res => {
                        if(res.status == '200'){
                            this.$message.success(res.message);
                            this.initData();
                        }
                        // item.delLoading = false;
                    }).catch(error => {
                        // item.delLoading = false;
                        this.$message.error(error.message);          
                    });
                })
            }else{
                this.$message.error('请选择要删除的文件!');
            }
        },
        replayFn(data){
            this.panel.show = false;
            this.panel.cfgShow = false;
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
        backFn(){
            this.isPlaybackShow = false;
            this.panel.show = false;
        }
    },
    mounted(){
        this.searchKey.startTime = [this.$dateUtil.GetDateStr(31), this.$dateUtil.getNowFormatDate()];
        this.searchKey.endTime = [this.$dateUtil.GetDateStr(31), this.$dateUtil.getNowFormatDate()];
        this.initData();
    },
    beforeDestroy(){

    },
}
</script>
