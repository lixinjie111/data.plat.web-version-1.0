<template>
    <!-- 基本信息 -->
<div>
    <div class="c-wrapper-20" v-cloak v-show="!panel.show">
        <el-form ref="searchForm" :inline="true" class="demo-form-inline" size="small">
            <el-form-item label="文件名: ">
                <el-input v-model.trim="searchKey.fileName"></el-input>
            </el-form-item>
            <el-form-item label="车辆编号: ">
                <el-input v-model.trim="searchKey.VehicleId"></el-input>
            </el-form-item>
            <el-form-item label="车牌号: ">
                <el-input v-model.trim="searchKey.plateNo"></el-input>
            </el-form-item>
            <el-form-item label="摄像头序列号: ">
                <el-input v-model.trim="searchKey.camId"></el-input>
            </el-form-item>
            <el-form-item label="视频来源: ">
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
                <el-button type="warning" icon="el-icon-search" :loading='searchLoading' @click="searchClick('searchKey')">查询</el-button>
                <el-button type="warning" plain icon="el-icon-setting" @click="resetClick">重置</el-button>
            </el-form-item>
        </el-form>
        <div class="c-button-wrapper c-text-right">
            <el-button size="mini" plain icon="el-icon-download" @click="downLoadZipFile">批量下载</el-button>
        </div>
        <el-table stripe max-height="620"
            :data="dataList"
            v-loading="loading"
            @selection-change="handleSelectionChange">
            <el-table-column align="center" fixed min-width="1%" type="selection"></el-table-column>
            <el-table-column align="center" min-width="2%" label="序号" type="index" :index="indexMethod"></el-table-column>
            <el-table-column align="center" min-width="12%" label="文件名称" prop="fileName"></el-table-column>
            <el-table-column align="center" min-width="8%" label="车辆编号" prop="vehicleId"></el-table-column>
            <el-table-column align="center" min-width="7%" label="车牌号" prop="plateNo"></el-table-column>
            <el-table-column align="center" min-width="12%" label="摄像头序列号" prop="camId"></el-table-column>
            <el-table-column align="center" min-width="10%" label="开始时间" prop="startTime"></el-table-column>
            <el-table-column align="center" min-width="10%" label="结束时间" prop="endTime"></el-table-column>
            <el-table-column align="center" min-width="6%" label="视频时长(Min)">
                <template slot-scope="scope">{{s_to_hs(scope.row.duration)}}</template>
            </el-table-column>
            <el-table-column align="center" min-width="6%" label="视频大小(MB)" prop="fileSizeUnit"></el-table-column>
            <el-table-column align="center" min-width="8%" label="视频来源">
                <template slot-scope="scope">{{scope.row.source==1 ? '直播' : '手动获取'}}</template>
            </el-table-column>
            <el-table-column align="center" min-width="18%" label="操作">
                <template slot-scope="scope">
                    <el-button size="mini" type="warning" plain @click="replay(scope.row)">回放</el-button>
                    <el-button size="mini" type="warning" plain @click="exportClick(scope.row)">导出</el-button>
                    <el-button size="mini" type="warning" plain @click="removeVideo(scope.row)">删除</el-button>
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
    <play-back v-if='isPlaybackShow' @backVideoManage='backFn'></play-back>
</div>
</template>
<script>
import TList from '@/common/utils/list.js'
import VueDatepickerLocal from 'vue-datepicker-local'
import PlayBack from '@/components/video/playVideo/playback.vue'
import {queryVideoList,downLoadZipFile,removeVideo} from '@/api/video'
export default {
    name: 'VideoManage',
    components: {
        VueDatepickerLocal,
        PlayBack
    },
    data(){
        let _this = this;
        return {
            isPlaybackShow:false,
            searchLoading:false,
            loading:false,
            sourceList:[
                {name:'直播',val:'1'},
                {name:'手动获取',val:'2'},
            ],
            searchKey: {
                fileName: '',
                VehicleId: '',
                plateNo: '',
                camId: '',
                source:'',
                startTime: '',
                endTime: '',
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
        }
    },
    methods: {
        init(){
            this.initPaging();
            this.initSearch();
            this.initData();
        },
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
            // this.$router.push({name:'PlayBack'});
        },
        exportClick(item) {
            this.$confirm('是否导出文件?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                window.location.href="http://172.17.1.13:9091/dataPlatApp/cam/download/"+item.fileName;
            }).catch(() => {
                this.$message.info('已取消导出');          
            });
        },
        initPaging(){
            this.pageOption.page = 1;
            this.pageOption.total = 0;
            this.pageOption.size = 10;
        },
        initSearch(){
            this.searchKey = {
                fileName: '',
                VehicleId: '',
                plateNo: '',
                camId: '',
                source:'',
                startTime:'',
                endTime:''
            };
        },
        initData(){
            this.dataList = [];
            this.loading = true;
            queryVideoList({
                'page': {
                    'pageSize': this.pageOption.size,
                    'pageIndex': this.pageOption.page-1
                },
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
                }else{
                    this.$message.error(res.message); 
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
            this.init();
        },
        vehiclePanelFn(e){
            this.panel.show = false;
            this.panel.cfgShow = false;
        },
        cfgPanelFn(data){
            this.panel.show = false;
            this.panel.cfgShow = false;
        },
        downLoadZipFile(item){
            if(this.selector.length > 0) {
                downLoadZipFile({
                    'fileIds':this.selector
                }).then(res => {
                    if(res.status == '200'){
                        this.$message.success(res.message);
                    }else{
                        this.$message.error(res.message);
                    }
                })
            }else{
                this.$message.error('请选择要下载的文件!');
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
        removeVideo(item){
            this.$confirm('确定要删除此条数据吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let fileId = [];
                fileId.push(item.fileName);
                item.delLoading = true;
                removeVideo({  
                        "fields": fileId          
                }).then(res => {
                    if(res.status == '200'){
                        this.$message.success(res.message);
                        this.initData();
                    }else{
                        this.$message.error(res.message);
                    }
                    item.delLoading = false;
                }).catch(error => {
                    item.delLoading = false;
                    this.$message.error(error.message);          
                });
            })
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
        this.init();
    },
    beforeDestroy(){

    },
}
</script>
