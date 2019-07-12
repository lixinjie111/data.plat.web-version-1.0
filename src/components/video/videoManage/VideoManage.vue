<template>
    <!-- 基本信息 -->
    <div class="yk-container" v-show="!panel.show && !panel.cfgShow">
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
            <el-button size="small" type="primary" @click="downClick">批量下载</el-button>
        </div>
        <el-table stripe class="c-mt-10"
            :data="dataList"
            v-loading="loading"
            @selection-change="handleSelectionChange">
            <el-table-column align="center" min-width="1%" type="selection"></el-table-column>
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
                    <el-button size="mini" type="primary" @click="replay(scope.row)">回放</el-button>
                    <el-button size="mini" type="primary" @click="exportClick(scope.row)">导出</el-button>
                    <el-button size="mini" type="primary" :loading="scope.row.delLoading" @click="delClick(scope.row)">删除</el-button>
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
</template>
<script>
import TList from '@/common/utils/list.js'
import VueDatepickerLocal from 'vue-datepicker-local'
import Paging from '@/common/view/Paging.vue'
export default {
    name: 'VideoManage',
    components: {
        Paging,VueDatepickerLocal
    },
    data(){
        let _this = this;
        return {
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
            this.initPaging();
            this.initSearch();
            this.initData();
        },
        replay(item){
            let manaInfo = JSON.stringify(item);
            localStorage.setItem('playHistoryInfo',manaInfo);
            this.$router.push({name:'PlayBack'});
        },
        exportClick(item) {
            window.location.href="http://172.17.1.13:9091/dataPlatApp/cam/download/"+item.fileName;
        },
        initPaging(){
            this.paging.index = 1;
            this.paging.total = 0;
            this.paging.size = 10;
        },
        initSearch(){
            this.searchKey = {
                fileName: '',
                VehicleId: '',
                plateNo: '',
                camId: '',
                source:'',
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
            this.$api.post('dataPlatApp/cam/queryVideoList',{
                "pageSize": this.paging.size,
                "pageIndex": this.paging.index,
                "param": params,
            },response => {
                if(response.status >= 200 && response.status < 300){
                    if(response.data.list && response.data.list.length > 0) {
                        response.data.list.forEach(item => {
                            item.delLoading = false;
                        });
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
                fileId.push(item.fileName);
                item.delLoading = true;
                this.$api.post('dataPlatApp/cam/removeVideo',{  
                        "fields": fileId          
                },response => {
                    if(response.status >= 200 && response.status < 300){
                        let {code,message} = response.data;
                        if(code == 200){
                            this.$message.success("删除"+message);
                            this.initData();
                        }else{
                            this.$message.error("删除"+message);
                        }
                        item.delLoading = false;
                    }
                }, error => {
                    this.$message.error("删除error！");
                    item.delLoading = false;
                });
            }
        },
        replayFn(data){
            this.panel.show = false;
            this.panel.cfgShow = false;
        },
        handleSizeChange(value) {//每页显示条数变更
            this.initPaging();
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
