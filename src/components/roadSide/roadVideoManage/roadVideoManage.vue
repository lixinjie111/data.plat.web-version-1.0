<template>
<!-- 基本信息 -->
<div class="c-wrapper-20" v-cloak>
    <div v-show="!panel.show && !panel.cfgShow">
        <el-form ref="searchForm" :inline="true" :model="searchKey" :rules="rules" size="small">
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
                <el-button type="warning" icon="el-icon-search" @click="searchClick" :loading="searchloading">查询</el-button>
                <el-button type="warning" plain icon="el-icon-setting" @click="resetClick">重置</el-button>
            </el-form-item>
        </el-form>

        <div class="c-button-wrapper c-text-right">
            <el-button size="mini" plain icon="el-icon-download" @click="downClick">批量下载</el-button>
        </div>

        <el-table ref="multipleTable" :data="dataList" v-loading="loading"
            @selection-change="handleSelectionChange" class="c-mt-10">
            <el-table-column fixed align="center" min-width="2%" type="selection"></el-table-column>
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
</div>
</template>
<script>
import TList from '@/common/utils/list.js'
import VueDatepickerLocal from 'vue-datepicker-local'

export default {
    name: 'VideoDownload',
    components: {
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
                {name:'未处理',val:'0'},
                {name:'正在处理',val:'1'},
                {name:'成功',val:'2'},
                {name:'失败',val:'3'},
            ],
            rules:{
                startTime:[
                    { trigger: 'blur' }
                ],
                endTime:[ 
                    { trigger: 'blur' }
                ]

            },
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
                startBeginTime:'',
                startEndTime:'',
                stopBeginTime:'',
                stopEndTime:''
            };
        },
        initData(){
            this.dataList = [];
            this.loading = false;
            let params = Object.assign(this.searchKey, {
                camCode: this.searchKey.camCode,
                fileName: this.searchKey.fileName,
                roadName: this.searchKey.roadName,
                source: this.searchKey.source,
                taskStatus: this.searchKey.taskStatus,
                roadPointName: this.searchKey.roadPointName,
                protocal: JSON.parse(localStorage.getItem('protocal')) || '',
            });
            this.$api.post('road/queryRoadVideoList',{
                "pageSize": this.pageOption.size,
                "pageIndex": this.pageOption.page - 1,
                "param":params
                //  param:{
                //     camCode: this.searchKey.camCode,
                //     fileName: this.searchKey.fileName,
                //     roadName: this.searchKey.roadName,
                //     source: this.searchKey.source,
                //     taskStatus: this.searchKey.taskStatus,
                //     roadPointName: this.searchKey.roadPointName,
                //     protocal:protocal,
                //     startBeginTime: this.$dateUtil.dateToMs(this.searchKey.startTime[0]) || '',
                // startEndTime: this.$dateUtil.dateToMs(this.searchKey.startTime[1]) || '',
                // stopBeginTime: this.$dateUtil.dateToMs(this.searchKey.endTime[0]) || '',
                // stopEndTime: this.$dateUtil.dateToMs(this.searchKey.endTime[1]) || ''
                // },
            },response => {
                if(response.status >= 200 && response.status < 300){
                    if(response.data.data.list && response.data.data.list.length > 0){
                        this.dataList = response.data.data.list;
                        this.dataList.forEach(item => {
                            item.delLoading = false;
                        })
                        this.pageOption.total = response.data.data.totalCount;
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
        searchClick(){
            this.searchLoading = true;
            this.$refs.searchForm.validate((valid) => {
                if (valid) {
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

