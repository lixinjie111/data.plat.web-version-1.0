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
                    <label class="yk-w-100">开始时间:</label>
                    <vue-datepicker-local v-model="searchKey.startBeginTime" format="YYYY-MM-DD HH:mm:ss" clearable style="width:193px;"></vue-datepicker-local>
                    -
                    <vue-datepicker-local v-model="searchKey.startEndTime" format="YYYY-MM-DD HH:mm:ss" clearable style="width:193px;"></vue-datepicker-local>
                </div>
                <div class="yk-search-block">
                    <label class="yk-w-100">结束时间:</label>
                    <vue-datepicker-local v-model="searchKey.stopBeginTime" format="YYYY-MM-DD HH:mm:ss" clearable style="width:193px;"></vue-datepicker-local>
                    -
                    <vue-datepicker-local v-model="searchKey.stopEndTime" format="YYYY-MM-DD HH:mm:ss" clearable style="width:193px;"></vue-datepicker-local>
                </div>

                <div class="yk-search-block">
                    <span class="yk-btn" @click="searchClick;">查询</span>
                    <span class="yk-btn" @click="resetClick();">重置</span>
                </div>
            </div> -->
            <div class="c-text-right">
                <el-button type="primary" size='small' @click="downClick">批量下载</el-button>
            </div>
            
            <el-table ref="multipleTable" :data="dataList" v-loading="loading"
                @selection-change="handleSelectionChange" class="c-mt-10">
                <el-table-column align="center" min-width="2%" type="selection"></el-table-column>
                <el-table-column align="center" min-width="3%" label="No" type="index" :index='indexMethod'></el-table-column>
                <el-table-column align="center" min-width="15%" prop="fileName" label="文件名称"></el-table-column>
                <el-table-column align="center" min-width="10%" prop="camCode" label="摄像头编号"></el-table-column>
                <el-table-column align="center" min-width="10%" prop="roadPointName" label="路侧点名称"></el-table-column>
                <el-table-column align="center" min-width="10%" prop="roadName" label="道路名称"></el-table-column>
                <el-table-column align="center" min-width="10%" prop="startTime" label="开始时间"></el-table-column>
                <el-table-column align="center" min-width="10%" prop="endTime" label="结束时间"></el-table-column>
                <el-table-column align="center" min-width="10%" prop="duration" label="视频时长(Min)">
                    <template slot-scope="scope">{{s_to_hs(scope.row.duration)}}</template>
                </el-table-column>
                <el-table-column align="center" min-width="10%" prop="fileSizeUnit" label="视频大小(MB)"></el-table-column>
                <el-table-column align="center" min-width="8%" prop="endTime" label="视频来源">
                    <template slot-scope="scope">{{scope.row.source == '1' ? '直播' : '手动获取'}}</template>
                </el-table-column>
                <el-table-column align="center" min-width="20%" prop="endTime" label="操作">
                    <template slot-scope="scope">
                        <el-button class="el-button--small" type="primary" :loading="scope.row.loading" @click="replay(scope.row)">回放</el-button>
                        <el-button class="el-button--small export" type="primary" :loading="scope.row.loading" @click="exportClick(scope.row)">
                            导出
                        </el-button>
                        <el-button class="el-button--small" type="primary" :loading="scope.row.delLoading" @click="delClick(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- <div class="yk-table-box">
                <table class="yk-table">
                    <thead>
                        <tr>
                            <th scope="col" style='width:4%;'>
                                <input type="checkbox" v-model="selector.isAll" @click="selectAll();">
                            </th>
                            <th style="width:4%;">序号</th>
                            <th style="width:16%;">文件名称</th>
                            <th style="width:9%;">摄像头编号</th>
                            <th style="width:9%;">路侧点名称</th>
                            <th style="width:9%;">道路名称</th>
                            <th>开始时间</th>
                            <th>结束时间</th>
                            <th style="width:8%;">视频时长(Min)</th>
                            <th style="width:8%;">视频大小(MB)</th>
                            <th style="width:8%;">视频来源</th>
                            <th style="width:11%;">操作</th>
                        </tr>
                    </thead>
                    <tbody :style='{"height":(paging.total<=10 ? "auto" : "405px")}'>
                        <tr class="yk-table-body" v-for='(item,index) in dataList' :key="index">
                          <td style='width:4%;'>
                            <input type="checkbox" v-model="item.isCheck" @click="selectRow(item);">
                          </td>
                          <td style="width:4%;">{{ index + paging.size * (paging.index-1) + 1}}</td>
              
                          <td style="width:16%;">{{item.fileName}}</td>
                
                          <td style="width:9%;">{{item.camCode}}</td>
 
                          <td style="width:9%;">{{item.roadPointName}}</td>

                          <td style="width:9.5%;text-indent:4px;">{{item.roadName}}</td>

                          <td>{{item.startTime}}</td>
                        
                          <td>{{item.endTime}}</td>
                
                          <td style="width:8%;">{{s_to_hs(item.duration)}}</td>
                
                            <td style="width:8%;">{{item.fileSizeUnit}}</td>
                         
                            <td style="width:8%;text-indent:4px;">{{item.source == '1' ? '直播' : '手动获取'}}</td>
                            <td style="width:10%;">
                                <img class="yk-img-btn-min" src="static/icon/play.png" title="回放" alt="回放" @click="replay(item)">
                                <a :href='"http://172.17.1.13:9091/dataPlatApp/road/download/" + item.fileName'>
                                    <img class="yk-img-btn-min" src="static/icon/export3.png" title="导出" alt="导出">
                                </a>
                                <img class="yk-img-btn-min" src="static/icon/del.png" title="删除" alt="删除" width='12px' height="20px" @click="delClick(item)">    
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
</div>
</template>
<script>
import TList from '@/common/utils/list.js'
import VueDatepickerLocal from 'vue-datepicker-local'
import Paging from '@/common/view/Paging.vue'

export default {
    name: 'VideoDownload',
    components: {
        Paging,
        VueDatepickerLocal
    },
    data(){
        let _this = this;
        return {
            manageShow:true,
            playbackShow:false,
            startTime:'',
            endTime:'',
            searchLoading:false,
            loading:false,
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
                {name:'未处理',val:'0'},
                {name:'正在处理',val:'1'},
                {name:'成功',val:'2'},
                {name:'失败',val:'3'},
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
                startBeginTime:'',
                startEndTime:'',
                stopBeginTime:'',
                stopEndTime:''
            };
        },
        initData(){
            this.dataList = [];
            this.loading = false;
            let protocal = JSON.parse(localStorage.getItem('protocal'));
            this.$api.post('dataPlatApp/road/queryRoadVideoList',{
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
                    stopBeginTime:this.$dateUtil.dateToMs(this.searchKey.stopBeginTime),
                    stopEndTime:this.$dateUtil.dateToMs(this.searchKey.stopEndTime)
                },
            },response => {
                if(response.status >= 200 && response.status < 300){
                    if(response.data.list && response.data.list.length > 0){
                        this.dataList = response.data.list;
                        this.dataList.forEach(item => {
                            item.delLoading = false;
                        })
                        this.paging.total = response.data.totalCount;
                    }
                }
                this.searchLoading = false;
                this.loading = false;
            },error => {
                this.$message.error("获取列表error！");
                this.loading = false;
                this.searchLoading = false;
            });
        },
        handleSelectionChange(val) {
            this.selector = [];
            val.forEach(item => {
                this.selector.push(item.fileName);
            });
        },
        // selectAll(){
        //     this.selector.isAll = !this.selector.isAll;
        //     TList.setListProp(this.dataList,'isCheck',this.selector.isAll);
        //     this.selector.list = this.selector.isAll ? TList.copyList(this.dataList) : [];
        //     this.selector.item = null;
        // },
        // selectRow(item){
        //     item.isCheck = !item.isCheck;
        //     let bool = TList.getItemById(this.selector.list, item.fileName);
        //     if(item.isCheck && !bool){
        //         this.selector.list.push(item);
        //         this.selector.item = item;
        //     }else{
        //         TList.deleteItemByFileName(this.selector.list, item.fileName);
        //         this.selector.item = this.selector.list.length == 1 ? this.selector.list[0] : null;
        //     }
        //     this.selector.isAll = this.selector.list.length == this.dataList.length;
        // },
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
        downClick(item){
            if(this.selector.length > 0) {
                this.$api.download('dataPlatApp/cam/downLoadZipFile',{'fileIds':this.selector},
                    response => {
                        if (response.status >= 200 && response.status < 300) {
                            this.$message.success("下载视频成功 ！");
                        } else {
                            this.$message.error("下载视频失败 ！");
                        }
                    }, error => {
                        this.$message.error("下载error！");
                    }
                );
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
        delClick(item){
            let config = window.confirm('确定要删除此条数据吗?');
            if(config == true){
                let fileId = [];
                item.delLoading = true;
                fileId.push(item.fileName);
                this.$api.post('dataPlatApp/cam/removeVideo',{  
                        "fields": fileId          
                },response => {
                    if(response.status >= 200 && response.status < 300){
                        let {code,message} = response.data;
                        if(code == 200){
                            this.$message.sucess('删除'+ message);
                            this.initData();
                        }else{
                            this.$message.error('删除'+ message);
                        }
                        item.delLoading = false;
                    }
                }, error => {
                    this.$message.error("删除error！");
                    item.delLoading = false;
                });
            }
        },
        replay(item){
            let videoInfo = JSON.stringify(item);
            localStorage.setItem('videoInfo',videoInfo);
            this.$router.push({name:'RoadVideoReplay',params:{data:item}});
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
            return (this.paging.index-1) * this.paging.size + index + 1;
        },
        exportClick(item) {
            window.location.href="http://172.17.1.13:9091/dataPlatApp/road/download/"+item.fileName;
        }
    },
    mounted(){
        this.init();
    },
    beforeDestroy(){

    },
}
</script>
<style>
.export a{
    text-decoration: none;
    color:#fff;
}
</style>

