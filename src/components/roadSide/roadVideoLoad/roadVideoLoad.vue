<template>
<!-- 基本信息 -->
<div class="c-wrapper-20" v-cloak>
    <div v-show="!panel.show && !panel.cfgShow">
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
        max-height="620" 
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
                :page-sizes="[10,20,50,100,200,500]" 
                :page-size="pageOption.size"
                layout="total, sizes, prev, pager, next">
            </el-pagination>
        </div>
    </div>
    <el-dialog
        title="重新下载"
        :visible="dialogOption.show"
        width="30%"
        :before-close="handleClose">
        <span>是否重新下载？</span>
        <span slot="footer" class="dialog-footer">
        <el-button @click="dialogOption.show = false">取 消</el-button>
        <el-button :loading="dialogOption.loading" type="primary" @click="sureFunc">确 定</el-button>
        </span>
    </el-dialog>
    <addload v-show="panel.cfgShow && !panel.show" :title="panel.title" :type="panel.type" :data="panel.data" @addTask="addTaskFn"></addload>
</div>
</template>
<script>
import VueDatepickerLocal from 'vue-datepicker-local'
import Addload from './roadAddLoad.vue'

export default {
    name: 'VideoDownload',
    components: {
        Addload,
        VueDatepickerLocal
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
                startBeginTime:'',
                startEndTime:'',
                stopBeginTime:'',
                stopEndTime:''
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
                show: false,
                cfgShow: false,
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
        },
        initPaging(){
            this.pageOption.index = 1;
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
            let params = Object.assign(this.searchKey, {
                camCode: this.searchKey.camCode,
                fileName: this.searchKey.fileName,
                roadName: this.searchKey.roadName,
                source: this.searchKey.source,
                taskStatus: this.searchKey.taskStatus,
                roadPointName: this.searchKey.roadPointName,
                protocal: JSON.parse(localStorage.getItem('protocal')) || '',
            });
            
            this.$api.post('dataPlatApp/road/queryRoadTaskList',{
                "pageSize": this.pageOption.size,
                "pageIndex": this.pageOption.page - 1,
                 'param':params
            },response => {
                if(response.status >= 200 && response.status < 300){
                    if(response.data.data.list && response.data.data.list.length > 0){
                        this.dataList = response.data.data.list;
                        this.pageOption.total = response.data.data.totalCount;
                    }
                    this.searchLoading = false;
                    this.loading = false;
                }
            }, error => {
                this.$message.error("获取列表error！");
                this.loading = false;
                this.searchLoading = false;
            });
        },
        searchClick(){
            this.$refs.searchForm.validate((valid) => {
                if (valid) {
                    console.log(this.searchKey.startTime[0]);
                    let _params = {
                        startBeginTime: this.$dateUtil.dateToMs(this.searchKey.startTime[0]),
                        startEndTime: this.$dateUtil.dateToMs(this.searchKey.startTime[1]),
                        stopBeginTime: this.$dateUtil.dateToMs(this.searchKey.endTime[0]),
                        stopEndTime: this.$dateUtil.dateToMs(this.searchKey.endTime[1])
                    }
                    this.initPaging();
                    this.initData(_params);
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
            this.panel.title = '新建下载任务';
            this.panel.type = 'reload';
            this.panel.data = item;
            this.panel.show = false;
            this.panel.cfgShow = true;
        },
        reloadClick(item){
            this.dialogOption.show = true;
            this.dialogOption.data = {
                fileId: item.fileName
            };
        },
        reloadFn(val){
            this.$api.post('dataPlatApp/cam/redoVideoTask',{
                fileId:val
            },response => {
                if(response.data.code == '200'){
                    const tip = {
                        isShow: true,
                        type: 'success',
                        msg: '重置视频任务成功!'
                    };
                    this.$store.dispatch('showPrompt',tip.msg);
                }else{
                    this.$store.dispatch('showPrompt','重置视频任务失败!');
                }
            });
        },
        addTaskFn(){
            this.panel.show = false;
            this.panel.cfgShow = false;
            window.location.reload();
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
        sureFunc(){
            this.dialogOption.loading = true;
            this.$api.post('dataPlatApp/cam/redoVideoTask',this.dialogOption.data,response => {
                if(response.data.code == '200'){
                    this.$message.success('再次下载视频任务成功!');
                }else{
                    this.$message.error("再次下载视频任务失败！");
                }
                this.initDialogData();
            },error => {
                this.$message.error("再次下载视频任务error！");
                this.initDialogData();
            });
        },
        initDialogData() {
            this.dialogOption.loading = false;
            this.dialogOption.show = false;
            this.dialogOption.data = {};
        },
        handleClose(done) {
            this.initDialogData();
        },
    },
    mounted(){
        this.init();
    },
    beforeDestroy(){

    },
}
</script>
