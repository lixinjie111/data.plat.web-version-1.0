<template>
    <div>
        <el-page-header @back="backClick" class="c-mt-30"></el-page-header>
        <div v-show="isShow && !isAddData" class="c-mt-30">
            <el-form :inline="true" :model="searchKey" ref="searchForm" :rules="rules" size='small' class="demo-form-inline">
                <el-form-item label="车辆编号" prop='vehicleId'>
                    <el-input v-model.trim="searchKey.vehicleId"></el-input>
                </el-form-item>
                <el-form-item label="开始时间" prop='startTime'>
                    <el-date-picker
                        v-model.trim="searchKey.startTime"
                        type="datetime"
                        placeholder="开始时间"
                        :picker-options="startTimeOption">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="结束时间" prop='endTime'>
                    <el-date-picker
                        v-model.trim="searchKey.endTime"
                        type="datetime"
                        placeholder="结束时间"
                        :picker-options="endTimeOption">
                    </el-date-picker>
                </el-form-item>
            </el-form>
            <div class="c-button-wrapper c-text-right">
                <el-button size="mini" plain icon="el-icon-receiving" @click="addDataSet();">获取数据集</el-button>
            </div>

            <el-table class='c-mt-10' :data="dataList" v-loading='loading' stripe>
                <el-table-column fixed align="center" prop="sid" label="SID"></el-table-column>
                <el-table-column align="center" prop="name" label="英文名称"></el-table-column>
                <el-table-column align="center" prop="longidentifier" label="中文名称"></el-table-column>
                <el-table-column align="center" prop="datType" label="类型"></el-table-column>
                <el-table-column align="center" prop="description" label="描述"></el-table-column>
                <el-table-column align="center" label="操作">
                    <template slot-scope="scope">
                        <el-button size='mini' type="primary" :loading="scope.row.loading" @click='deleteClick(scope.row)'>删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="c-text-center c-mt-30">
                <el-button type="warning" size="small" @click="okClick">确定</el-button>
                <el-button type="warning" size="small" @click="cancelClick">取消</el-button>
            </div>
            
        </div>
        <add-data-panel @loadData="loadData" @init="init" v-show="isAddData" ref="addDataPanel" class="c-mt-30"></add-data-panel>
    </div>
    
</template>
<script>
import AddDataPanel from './AddDataPanel.vue'
import DatePicker from 'vue2-datepicker'
import TList from '@/common/utils/list.js'
export default {
    props: ['title','type','data'],
    components: {
        AddDataPanel,DatePicker,TList
    },
    data(){
        let _this = this,
            _checkStartTime = (rule, value ,callback) => {
                let _startTime = value ? this.$dateUtil.dateToMs(this.$dateUtil.formatTime(value)) : null,//标准时间转为时间戳
                    _endTime = this.searchKey.endTime ? this.$dateUtil.dateToMs(this.$dateUtil.formatTime(this.searchKey.endTime)) : null;//标准时间转为时间戳
                if(_startTime){
                    if(_endTime) {
                        if(_startTime > _endTime){
                            callback(new Error('开始时间必须小于结束时间'));
                        }else {
                            callback();
                        }
                    }else {
                        callback();
                    }
                }else {
                    callback();
                }
            },
            _checkEndTime = (rule, value ,callback) => {
                let _startTime = this.searchKey.startTime ? this.$dateUtil.dateToMs(this.$dateUtil.formatTime(this.searchKey.startTime)) : null,//标准时间转为时间戳
                    _endTime = value ? this.$dateUtil.dateToMs(this.$dateUtil.formatTime(value)) : null;//标准时间转为时间戳
                if(_endTime){
                    if(_startTime) {
                        if(_startTime > _endTime){
                            callback(new Error('开始时间必须小于结束时间'));
                        }else {
                            callback();
                        }
                    }else {
                        callback();
                    }
                }else {
                    callback();
                }
            };
        return {
            pageOption: {
                page: 1,
                size: 10,
                total: 0
            },
            searchKey:{
                vehicleId:'',
                startTime:'',
                endTime:''
            },
            dataList:[],//子组件返回的所有数据
            pageData:[],//每一页数据
            current: {
                top: 0,
                height: 100,
            },
            loading:false,
            isAddData: false,
            isShow:true,
            isTipsShow:false,
            isTimeTipShow:false,
            rules:{
                startTime:[
                    { validator: _checkStartTime, trigger: 'blur' }
                ],
                endTime:[
                    { validator: _checkEndTime, trigger: 'blur' }
                ]
            },
            startTimeOption: {
                disabledDate: time => {
                    let _time = time.getTime(),
                        _newTime = new Date().getTime(), 
                        _endDateVal = _this.searchKey.endTime ? _this.$dateUtil.dateToMs(_this.$dateUtil.formatTime(_this.searchKey.endTime, "yy-mm-dd")+' 00:00:00') : null;
                    if (_endDateVal) {
                        return _time > _endDateVal || _time > _newTime;
                    }else {
                        return _time > _newTime;
                    }
                }
            },
            endTimeOption: {
                disabledDate: time => {
                    let _time = time.getTime(),
                        _newTime = new Date().getTime(), 
                        _startDateVal = _this.searchKey.startTime ? _this.$dateUtil.dateToMs(_this.$dateUtil.formatTime(_this.searchKey.startTime, "yy-mm-dd")+' 00:00:00') : null;
                    if (_startDateVal) {
                        return  _time < _startDateVal || _time > _newTime;
                    }else {
                        return _time > _newTime;
                    }
                }
            }    
        }
    },
    methods: {
        init(){
           this.isAddData=false;
           this.isShow=true;
           this.isTipsShow = false;
           this.isTimeTipShow = false;
        },
        loadData(list,pageSize){
            if(list != undefined){
                if(pageSize != undefined){
                    this.pageOption.size=pageSize;
                }else{
                    this.pageOption.size = 10;
                }
                this.pageOption.page = 0;
                this.pageOption.total = list.length;
                TList.pushNoRepeat(this.dataList,list);
                this.dataList.sort(function(a,b){
                    return parseInt(a.sid) - parseInt(b.sid);
                });
            }
            this.isAddData=false;
            this.isShow=true;
            this.showPageData();
        },
        showPageData(){
            this.pageData = this.dataList;
            this.pageOption.total = this.pageData.length;
            let start = this.pageOption.index * this.pageOption.size;
            let end = start + this.pageOption.size-1;
            this.pageData = this.pageData.slice(start,end);    
        },
        deleteClick(item){
            this.dataList.splice(this.dataList.indexOf(item),1);
            this.pageOption.size = 10;
            this.pageOption.page = 0;
            this.pageOption.total = this.dataList.length;
            this.showPageData();
        },
        backClick(){
            if(!this.isAddData){
                this.dataList = [];
                this.pageData =[];
                this.handleCurrentChange(0);
                this.isShow=false;
              
                this.$emit("localDataPanelBack");
            }
            else{
                this.isShow=true;
                this.isAddData=false;
                this.isTipsShow = false;
                this.isTimeTipShow = false;
            } 
        },
        
        addDataSet(){
            this.isAddData = true;
            this.$refs.addDataPanel.init();
        },

        initLocalDataPanelHeight(){
            let boxHeight = document.body.clientHeight;
            this.current.top = document.getElementById('localDataTable').offsetTop;
            this.current.height = boxHeight - this.current.top - 55 - 100 - 40;
        },
        okClick(){
            let _this =this;
            if(this.dataList.length == 0) {
                this.$store.dispatch('showPrompt','请增加数据集 ！');
                return;
            }
            let startTime = _this.$dateUtil.dateToMs(_this.searchKey.startTime);
            let endTime = _this.$dateUtil.dateToMs(_this.searchKey.endTime);

            if(endTime - startTime > 3600 * 1000){
                this.$store.dispatch('showPrompt','数据采集开始时间和结束时间间隔不能大于1小时 ！');
                return;
            }
                
            var sIds =[];
            this.dataList.forEach(function(item){
                    sIds.push(item.sid);
            });
            
            this.$api.post("dynamic/vehicle/condition/submit", {
                    vehicleId: _this.searchKey.vehicleId,
                    startTime:_this.$dateUtil.dateToMs(_this.searchKey.startTime),
                    endTime:_this.$dateUtil.dateToMs(_this.searchKey.endTime),
                    eventTime:new Date().getTime(),
                    eventName:'云端查询',
                    sIds:sIds.join(',')
                }, response => {
                    if(response.data.code == 200){
                        this.$message.sucess("事件条件下发成功!");
                        this.$emit("localDataPanelBack");
                    }else{
                        this.$message.error("事件条件下发失败!");
                    }
                    
                });
        },
        cancelClick(){
           this.backClick();
        },
    },
    mounted(){
        this.init();
    }
}
</script>
<style scoped>
.yk-b-10{
    margin-bottom: 10px;
}
.yk-b-30{
    margin-bottom: 30px;
}
.yk-r-30{
    margin-right: 30px;
}
.yk-20{
    height: 20px;
}
.yk-24{
    height: 24px;
    width: 171px;
}
.yk-list{
    margin-top:5px;
    padding: 5px 10px;
    height: 120px;
    overflow-y: auto;
}
.yk-270{
    width: 320px;
    float: left;
}
.yk-input-200{
    width: 168px;
    display: inline-block;
    vertical-align: top;
    text-align: left;
}
.yk-label-65{
    display: inline-block;
    width: 65px;
    text-align: right;
    float:left;
}

.yk-gap{
    margin: 10px 0px 10px 0px;
    background: #ccd;
}

.yk-panel-box{
    position: relative; 
    overflow-y: auto;
}
</style>

