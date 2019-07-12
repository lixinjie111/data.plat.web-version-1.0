<template>
    <!-- 基本信息 -->
    <div class="yk-container">
        <div v-show="!panel.show && !panel.cfgShow">
            <el-form ref="searchForm" :inline="true" class="demo-form-inline" size="small">
                <el-form-item label="文件名: ">
                    <el-input v-model.trim="searchKey.fileName"></el-input>
                </el-form-item>
                <el-form-item label="摄像头编号: ">
                    <el-input v-model.trim="searchKey.camCode"></el-input>
                </el-form-item>
                <el-form-item label="车牌号: ">
                    <el-input v-model.trim="searchKey.plateNo"></el-input>
                </el-form-item>
                <el-form-item label="车辆编号: ">
                    <el-input v-model.trim="searchKey.vehicleId"></el-input>
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
                        placeholder="结束时间"
                        :editable="false"
                        :clearable="false"
                        :picker-options="startEndTimeOption">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="结束时间: ">
                    <el-date-picker
                        v-model.trim="searchKey.stopBeginTime"
                        type="datetime"
                        placeholder="开始时间"
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
            <div class="c-text-right">
                <el-button size="small" type="primary" @click="addTask">新建任务</el-button>
            </div>
            <el-table stripe class="c-mt-10"
                :data="dataList"
                v-loading="loading">
                <el-table-column align="center" min-width="5%" label="序号" type="index" :index="indexMethod"></el-table-column>
                <el-table-column align="center" min-width="20%" label="文件名称" prop="fileName"></el-table-column>
                <el-table-column align="center" min-width="8%" label="车辆编号" prop="vehicleId"></el-table-column>
                <el-table-column align="center" min-width="8%" label="车牌号" prop="plateNo"></el-table-column>
                <el-table-column align="center" min-width="8%" label="摄像头编号" prop="camCode"></el-table-column>
                <el-table-column align="center" min-width="11%" label="开始时间" prop="startTime"></el-table-column>
                <el-table-column align="center" min-width="11%" label="结束时间" prop="endTime"></el-table-column>
                <el-table-column align="center" min-width="9%" label="视频来源">
                    <template slot-scope="scope">{{scope.row.source==1 ? '直播' : '手动获取'}}</template>
                </el-table-column>
                <el-table-column align="center" min-width="10%" label="下载状态">
                    <template slot-scope="scope">
                        <template v-if="scope.row.taskStatus == 0">未下载</template>
                        <template v-if="scope.row.taskStatus == 1">下载中</template>
                        <template v-if="scope.row.taskStatus == 2">下载完成</template>
                        <template v-if="scope.row.taskStatus == 3">下载失败</template>
                    </template>
                </el-table-column>
                <!-- <el-table-column align="center" label="失败原因" prop="note"></el-table-column> -->
                <el-table-column align="center" min-width="10%" label="操作">
                    <template slot-scope="scope">
                        <el-button size="mini" v-if="scope.row.taskStatus == 3 || scope.row.taskStatus == 0" type="primary" @click="reloadClick(scope.row)">再次下载</el-button>
                    </template>
                </el-table-column>
            </el-table>
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
        <addload ref='addload' v-show="panel.cfgShow && !panel.show" :title="panel.title" :type="panel.type" :data="panel.data"></addload>
    </div>
</template>
<script>
import VueDatepickerLocal from 'vue-datepicker-local'
import Paging from '@/common/view/Paging.vue'
import Addload from './AddLoad.vue'

export default {
    name: 'VideoDownload',
    components: {
        VueDatepickerLocal,
        Paging,
        Addload,
        // ReloadImport
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
                camCode: '',
                plateNo: '',
                vehicleId: '',
                source: '',
                taskStatus: '',
                startBeginTime:'',
                startEndTime:'',
                stopBeginTime:'',
                stopEndTime:''
            },
            selector: [],
            auth: {
                isUpadte: true,
                isDelete: true,
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
                data: 'this.initCarVo()',
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
                {name:'全部',val:''},
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
                plateNo: '',
                vehicleId: '',
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
                protocal: JSON.parse(localStorage.getItem('protocal')) || '',
                startBeginTime:this.$dateUtil.dateToMs(this.searchKey.startBeginTime) || '',
                startEndTime:this.$dateUtil.dateToMs(this.searchKey.startEndTime) || '',
                stopBeginTime:this.$dateUtil.dateToMs(this.searchKey.stopBeginTime) || '',
                stopEndTime:this.$dateUtil.dateToMs(this.searchKey.stopEndTime) || ''
            });
            this.$api.post('dataPlatApp/cam/queryTaskList',{
                "pageSize": this.paging.size,
                "pageIndex": this.paging.index,
                "param":params
            },response => {
                if(response.status >= 200 && response.status < 300){
                    if(response.data.list && response.data.list.length > 0) {
                        this.dataList = response.data.list || [];
                        this.paging.total = response.data.totalCount || 0;
                    }
                }else{
                    this.$message.error("获取列表失败！");
                }
                this.loading = false;
                this.searchLoading = false;
            }, error => {
                this.$message.error("获取列表error！");
                this.loading = false;
                this.searchLoading = false;
            });
        },
        indexMethod(index) {
            return (this.paging.index-1) * this.paging.size + index + 1;
        },
        searchClick(){
            this.searchLoading = true;
            this.initPaging();
            this.initData();
        },
        resetClick(){
            this.init();
        },
        cfgPanelFn(data){
            this.panel.show = false;
            this.panel.cfgShow = false;
        },
        pagingFn(value){
            this.paging.index = value;
            this.paging.total = 0;
            this.initData();
        },
        pagingSizeFn(value){
            this.paging.size = value;
            this.paging.total = 0;
            this.initData();
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
        handleSizeChange(value) {//每页显示条数变更
            this.paging.size = value;
            this.initData();
        },
        handleCurrentChange(value) {//页码变更
            this.paging.index = value;
            this.initData();
        }
    },
    mounted(){
        this.init();
    },
    beforeDestroy(){

    },
}
</script>
