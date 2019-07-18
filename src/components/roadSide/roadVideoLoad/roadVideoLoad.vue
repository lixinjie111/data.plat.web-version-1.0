<template>
<!-- 基本信息 -->
<div class="c-wrapper-20" v-cloak>
    <div v-show="!panel.show">
        <el-form ref="searchForm" :inline="true" :model="searchKey" class="demo-form-inline" size="small">
            <el-form-item label="文件名: ">
                <el-input v-model.trim="searchKey.fileName"></el-input>
            </el-form-item>
            <el-form-item label="摄像头编号: ">
                <el-input v-model.trim="searchKey.camCode"></el-input>
            </el-form-item>
            <el-form-item label="道路名称: ">
                <el-input v-model.trim="searchKey.roadName"></el-input>
            </el-form-item>
            <el-form-item label="路侧点名称: ">
                <el-input v-model.trim="searchKey.roadPointName"></el-input>
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
            <el-form-item label="下载状态: ">
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
                <el-button type="warning" icon="el-icon-search" :loading='searchLoading' @click="searchClick('searchKey')">查询</el-button>
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
        max-height="499" 
        class='c-mb-70'>
            <el-table-column fixed align="center" type="index" min-width="5%" label="序号" :index='indexMethod'></el-table-column>
            <el-table-column align="center" prop="fileName" min-width="12%" label="文件名称"></el-table-column>
            <el-table-column align="center" prop="camCode" min-width="8%" label="摄像头编号"></el-table-column>
            <el-table-column align="center" prop="roadName" min-width="8%" label="道路名称"></el-table-column>
            <el-table-column align="center" prop="roadPointName" min-width="9%" label="路侧点名称"></el-table-column>
            <el-table-column align="center" label="创建时间" min-width="10%">
                <template slot-scope="scope">{{scope.row.createDate}}</template>
            </el-table-column>
            <el-table-column align="center" label="开始时间" min-width="10%">
                <template slot-scope="scope">{{scope.row.startTime}}</template>
            </el-table-column>
            <el-table-column align="center" label="结束时间" min-width="10%">
                <template slot-scope="scope">{{scope.row.endTime}}</template>
            </el-table-column>
            <el-table-column align="center" prop="plateNo" min-width="8%" label="下载状态">
                <template slot-scope="scope">
                    <span v-if='scope.row.taskStatus == "0"'>未下载</span>
                    <span v-if='scope.row.taskStatus == "1"'>下载中</span>
                    <span v-if='scope.row.taskStatus == "2"'>下载完成</span>
                    <span v-if='scope.row.taskStatus == "3"'>下载失败</span>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="note" label="失败原因" min-width="12%"></el-table-column>

            <el-table-column align="center" label="视频来源" min-width="7%">
                <template slot-scope="scope">{{scope.row == '1' ? '直播' : '手动获取'}}</template>
            </el-table-column>
            <el-table-column align="center" label="操作" min-width="10%">
                <template slot-scope="scope">
                    <el-button size="small" 
                    icon="el-icon-download" 
                    circle type="warning" 
                    plain 
                    v-if='scope.row.taskStatus == "0" || scope.row.taskStatus == "3"'
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
            startTime:'',
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
                camCode: '',
                roadName: '',
                roadPointName: '',
                source: '',
                taskStatus: '',
                startTime:'',
                endTime:''
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
                {name:'直播',val:'1'},
                {name:'手动获取',val:'2'},
            ],
            statusList:[
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
            }
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
            this.initSearch();
            this.initData();
        },
        initPaging(){
            this.pageOption.page = 1;
            this.pageOption.total = 0;
            this.pageOption.size = 10;
        },
        initSearch(){
            this.searchKey = {
                fileName: '',
                camCode: '',
                roadName: '',
                roadPointName: '',
                source: '',
                taskStatus: '',
                startBeginTime:'',
                startEndTime:'',
                stopBeginTime:'',
                stopEndTime:''
            };
        },
        initData(){
            this.dataList = [];
            this.loading = true;
            queryRoadTaskList({
                page: {
                    'pageSize': this.pageOption.size,
                    'pageIndex': this.pageOption.page-1
                },
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
            this.searchLoading = true;
            this.$refs.searchForm.validate((valid) => {
                if (valid) {
                    this.initPaging();
                    this.initData();
                } else {
                    return false;
                }
            });
        },
        resetClick(){
            this.init();
            this.$refs.searchForm.resetFields();
        },
        addTask(item){
            this.panel.show = true;
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
        addTaskFn(){
            this.panel.show = true;
            this.dialogOption.show = true;
            this.initData();
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
        backFn(){
            this.panel.show = false;
            this.dialogOption.show = false;
            this.init();
        }
    },
    mounted(){
        this.init();
    },
    beforeDestroy(){

    },
}
</script>
