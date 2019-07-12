<template>
<!-- 基本信息 -->
<div>
    <div class="yk-container">

        <div v-show="!panel.show && !panel.cfgShow" class="yk-container">
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
                <el-form-item label="开始时间: ">
                    <el-date-picker
                        v-model.trim="searchKey.startBeginTime"
                        type="datetime"
                        placeholder="开始时间"
                        :editable="false"
                        :clearable="false"
                        :picker-options="startBeginTimeOption">
                    </el-date-picker>
                    -
                    <el-date-picker
                        v-model.trim="searchKey.startEndTime"
                        type="datetime"
                        placeholder="开始时间"
                        :editable="false"
                        :clearable="false"
                        :picker-options="startEndTimeOption">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="结束时间: ">
                    <el-date-picker
                        v-model.trim="searchKey.stopBeginTime"
                        type="datetime"
                        placeholder="结束时间"
                        :editable="false"
                        :clearable="false"
                        :picker-options="stopBeginTimeOption">
                    </el-date-picker>
                    -
                    <el-date-picker
                        v-model.trim="searchKey.stopEndTime"
                        type="datetime"
                        placeholder="结束时间"
                        :editable="false"
                        :clearable="false"
                        :picker-options="stopEndTimeOption">
                    </el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="searchClick" :loading="searchLoading">查询</el-button>
                    <el-button type="primary" @click="resetClick">重置</el-button>
                </el-form-item>
            </el-form>
            <!-- <div class="yk-search-box">

                <div class="yk-search-block">
                    <label class="yk-w-100">文件名: </label>
                    <input class="yk-input  " v-model.trim="searchKey.fileName">
                </div>

                <div class="yk-search-block">
                    <label class="yk-w-100">摄像头编号: </label>
                    <input class="yk-input" v-model.trim="searchKey.camCode">
                </div>

                <div class="yk-search-block">
                    <label class="yk-w-100">道路名称: </label>
                    <input class="yk-input  " v-model.trim="searchKey.roadName">
                </div>

                <div class="yk-search-block">
                    <label class="yk-w-100">路侧点名称: </label>
                    <input class="yk-input" v-model.trim="searchKey.roadPointName">
                </div>

                <div class="yk-search-block">
                    <label class="yk-w-100">视频来源: </label>
                    <select class="yk-select" v-model="searchKey.source">
                        <option v-for="(item,index) in sourceList" :key="index" :value="item">{{item.name}}</option>
                    </select>
                </div>

                <div class="yk-search-block">
                    <label class="yk-w-100">下载状态: </label>
                    <select class="yk-select" v-model="searchKey.taskStatus">
                        <option v-for="(item,index) in statusList" :key="index" :value="item">{{item.name}}</option>
                    </select>
                </div>
                <div class="yk-search-block">
                    <label class="yk-w-100" style="width:102px;">开始时间:</label>
                    <vue-datepicker-local v-model="searchKey.startBeginTime" format="YYYY-MM-DD HH:mm:ss" clearable style="width:193px;"></vue-datepicker-local>
                    -
                    <vue-datepicker-local v-model="searchKey.startEndTime" format="YYYY-MM-DD HH:mm:ss" clearable style="width:193px;"></vue-datepicker-local>
                </div>
                <br />
                <div class="yk-search-block">
                    <label class="yk-w-100">结束时间:</label>
                    <vue-datepicker-local v-model="searchKey.stopBeginTime" format="YYYY-MM-DD HH:mm:ss" clearable style="width:193px;"></vue-datepicker-local>
                    -
                    <vue-datepicker-local v-model="searchKey.stopEndTime" format="YYYY-MM-DD HH:mm:ss" clearable style="width:193px;"></vue-datepicker-local>
                </div>

                <div class="yk-search-block">
                    <span class="yk-btn" @click="searchClick();">查询</span>
                    <span class="yk-btn" @click="resetClick();">重置</span>
                </div>
            </div> -->
            <div class="c-text-right">
                <el-button type="primary" size='small' @click="addTask">新建任务</el-button>
            </div>
            <!-- <div class="yk-btn-box yk-right yk-b-10">
                <span class="yk-btn" @click="addTask">新建任务</span>
            </div> -->
            <el-table :data="dataList" v-loading='loading' stripe class='c-mt-10'>
                <el-table-column align="center" type="index" min-width="5%" label="序号" :index='indexMethod'></el-table-column>
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
                        <el-button size="mini" type="primary" v-if='scope.row.taskStatus == "0" || scope.row.taskStatus == "3"' :loading="scope.row.loading" @click="reloadClick(scope.row)">再次下载</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- <div class="yk-table-box">
                <table class="yk-table">
                    <thead>
                    <tr>
                        <th style="width:4%">序号</th>
                        <th style="width:16%;">文件名称</th>
                        <th style="width:14.7%;">摄像头编号</th>
                        <th>道路名称</th>
                        <th>路侧点名称</th>
                        <th>创建时间</th>
                        <th>开始时间</th>
                        <th>结束时间</th>
                        <th style="width:8%;">下载状态</th>
                        <th style="width:8%;">失败原因</th>
                        <th style="width:8%;">视频来源</th>
                        <th style="width:6%;">操作</th>
                    </tr>
                    </thead>
                    <tbody :style='{"height":(paging.total<=10 ? "auto" : "405px")}'>
                        <tr class="yk-table-body" v-for='(item,index) in dataList' :key="index">
                            <td style="width:4%">{{ index + paging.size * (paging.index-1) + 1}}</td>
                         
                            <td style="width:16%;">{{item.fileName}}</td>
                        
                            <td style="width:15%;">{{item.camCode}}</td>
                        
                            <td>{{item.roadName}}</td>
                           
                            <td>{{item.roadPointName}}</td>
                            
                            <td>{{item.createDate}}</td>
                     
                            <td>{{item.startTime}}</td>
                   
                            <td>{{item.endTime}}</td>
                           
                            <td style="width:8%;" v-show='item.taskStatus == "0"'>未下载</td>
                            <td style="width:8%;" v-show='item.taskStatus == "1"'>下载中</td>
                            <td style="width:8%;" v-show='item.taskStatus == "2"'>下载完成</td>
                            <td style="width:8%;" v-show='item.taskStatus == "3"'>下载失败</td>
                            <td>{{item.note}}</td>
   
                            <td style="width:8%;">{{item.source == '1' ? '直播' : '手动获取'}}</td>

                            <td style="width:5%;">
                                <img class="yk-img-btn-min" v-show='item.taskStatus == "3"' src="static/icon/download3.png" title="再次下载" alt="再次下载" @click="reloadClick(item)">
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div> -->
            
            <div class="pages">
                <el-pagination
                    background
                    @current-change="handleCurrentChange" 
                    :current-page="paging.index"
                    :total="paging.total" 
                    @size-change="handleSizeChange"
                    :page-sizes="[10,20,50,100,200,500]" 
                    :page-size="paging.size"
                    layout="total, sizes, prev, pager, next">
                </el-pagination>
            </div>
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
import Paging from '@/common/view/Paging.vue'
import Addload from './roadAddLoad.vue'

export default {
    name: 'VideoDownload',
    components: {
        Paging,
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
            paging: {
                index: 1,
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
            startBeginTimeOption: {
                disabledDate: time => {
                    let _time = time.getTime(),
                        _newTime = new Date().getTime(),
                        _startEndTime = _this.$dateUtil.dateToMs(_this.searchKey.startEndTime),
                        _stopBeginTime = _this.$dateUtil.dateToMs(_this.searchKey.stopBeginTime),
                        _stopEndTime = _this.$dateUtil.dateToMs(_this.searchKey.stopEndTime);
                    if (_startEndTime) {
                        return _time > _startEndTime;
                    }else {
                        if(_stopBeginTime) {
                            return _time > _stopBeginTime;
                        }else {
                            if(_stopEndTime) {
                                return _time > _stopEndTime;
                            }else {
                                return _time > _newTime;
                            }
                        }
                    }
                }
            },
            startEndTimeOption: {
                disabledDate: time => {
                    let _time = time.getTime(),
                        _newTime = new Date().getTime(),
                        _startBeginTime = _this.$dateUtil.dateToMs(_this.searchKey.startBeginTime),
                        _stopBeginTime = _this.$dateUtil.dateToMs(_this.searchKey.stopBeginTime),
                        _stopEndTime = _this.$dateUtil.dateToMs(_this.searchKey.stopEndTime);
                    if (_startBeginTime) {
                        if(_stopBeginTime) {
                            return _time > _stopBeginTime || _time < _startBeginTime;
                        }else {
                            if(_stopEndTime) {
                                return _time > _stopEndTime || _time < _startBeginTime;
                            }else {
                                return  _time < _startBeginTime || _time > _newTime;
                            }
                        }
                    }else {
                        if(_stopBeginTime) {
                            return _time > _stopBeginTime;
                        }else {
                            if(_stopEndTime) {
                                return _time > _stopEndTime;
                            }else {
                                return _time > _newTime;
                            }
                        }
                    }
                }
            },
            stopBeginTimeOption: {
                disabledDate: time => {
                    let _time = time.getTime(),
                        _newTime = new Date().getTime(),
                        _startBeginTime = _this.$dateUtil.dateToMs(_this.searchKey.startBeginTime),
                        _startEndTime = _this.$dateUtil.dateToMs(_this.searchKey.startEndTime),
                        _stopEndTime = _this.$dateUtil.dateToMs(_this.searchKey.stopEndTime);
                    if(_stopEndTime) {
                        if (_startEndTime) {
                            return  _time < _startEndTime || _time > _stopEndTime;
                        }else {
                            if(_startBeginTime) {
                                return _time < _startBeginTime || _time > _stopEndTime;
                            }else {
                                return  _time > _stopEndTime;
                            }
                        }
                    }else {
                         if (_startEndTime) {
                            return _time < _startEndTime || _time > _newTime;
                        }else {
                            if(_startBeginTime) {
                                return _time < _startBeginTime || _time > _newTime;
                            }else {
                                return _time > _newTime;
                            }
                        }
                    }

                    
                }
            },
            stopEndTimeOption: {
                disabledDate: time => {
                    let _time = time.getTime(),
                        _newTime = new Date().getTime(),
                        _startBeginTime = _this.$dateUtil.dateToMs(_this.searchKey.startBeginTime),
                        _startEndTime = _this.$dateUtil.dateToMs(_this.searchKey.startEndTime),
                        _stopBeginTime = _this.$dateUtil.dateToMs(_this.searchKey.stopBeginTime);
                    if (_stopBeginTime) {
                        return  _time < _stopBeginTime || _time > _newTime;
                    }else {
                        if(_startEndTime) {
                            return _time < _startEndTime || _time > _newTime;
                        }else {
                            if(_startBeginTime) {
                                return  _time < _startBeginTime || _time > _newTime;
                            }else {
                                return _time > _newTime;
                            }
                            
                        }
                    }
                }
            }
        }
    },
    methods: {
        init(){
            this.manageShow = true;
            this.playbackShow = false;
            this.initPaging();
            this.initSearch();
            this.initData();
        },
        initPaging(){
            this.paging.index = 1;
            this.paging.total = 0;
            this.paging.size = 10;
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
            let protocal = JSON.parse(localStorage.getItem('protocal'));
            this.$api.post('dataPlatApp/road/queryRoadTaskList',{
                "pageSize": this.paging.size,
                "pageIndex": this.paging.index,
                 param:{
                    camCode: this.searchKey.camCode,
                    fileName: this.searchKey.fileName,
                    roadName: this.searchKey.roadName,
                    source: this.searchKey.source,
                    taskStatus: this.searchKey.taskStatus,
                    roadPointName: this.searchKey.roadPointName,
                    protocal:protocal,
                    startBeginTime: this.$dateUtil.dateToMs(this.searchKey.startBeginTime),
                    startEndTime: this.$dateUtil.dateToMs(this.searchKey.startEndTime),
                    stopBeginTime: this.$dateUtil.dateToMs(this.searchKey.stopBeginTime),
                    stopEndTime: this.$dateUtil.dateToMs(this.searchKey.stopEndTime),
                },
            },response => {
                if(response.status >= 200 && response.status < 300){
                    if(response.data.list && response.data.list.length > 0){
                        this.dataList = response.data.list;
                        this.paging.total = response.data.totalCount;
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
            this.initPaging();
            this.initData();
        },
        resetClick(){
            this.init();
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
        handleSizeChange(value) {//每页显示条数变更
            this.paging.size = value;
            this.initData();
        },
        handleCurrentChange(value) {//页码变更
            this.paging.index = value;
            this.initData();
        },
        indexMethod(index){
            return index + this.paging.size * (this.paging.index-1) + 1;
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
