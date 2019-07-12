<template>
    <div>
        <el-page-header @back="backClick" class="c-mt-30"></el-page-header>
        <!-- <div class="yk-btn-box yk-right yk-b-10">
            <span class="yk-btn-back" @click="backClick();">返回</span>
        </div> -->
        <div v-show="isShow && !isAddData" class="c-mt-30">
            <el-form :inline="true" :model="searchKey" ref="searchForm" :rules="rules" size='small' class="demo-form-inline">
                <el-form-item label="车辆编号:" prop='vehicleId'>
                    <el-input v-model.trim="searchKey.vehicleId"></el-input>
                </el-form-item>
                <el-form-item label="数据采集时间: ">
                    <el-date-picker
                        v-model.trim="searchKey.startTime"
                        type="datetime"
                        placeholder="开始时间"
                        :editable="false"
                        :clearable="false"
                        :picker-options="pickerOptionsStart"
                        format='yyyy-MM-dd HH:mm:ss'>
                    </el-date-picker>
                    -
                    <el-date-picker
                        v-model.trim="searchKey.endTime"
                        type="datetime"
                        placeholder="结束时间"
                        :editable="false"
                        :clearable="false"
                        :picker-options="pickerOptionsEnd"
                        format='yyyy-MM-dd HH:mm:ss'>
                    </el-date-picker>
                </el-form-item>

            </el-form>
                <!-- <div class="yk-search-box">
                     <div class="yk-search-block">
                        <label class="yk-w-90">vehicleId：</label>
                        <input class="yk-input " v-model.trim="condition.vehicleId" v-on:keyup="validateSearch">
                         <label title="vehicleId不能为空" class="yk-form-tip">*</label>
                         <span class="yk-tip" id="vehicleIdTip" v-show='isTipsShow'>vehicleId不能为空 ！</span>
                    </div>
                   
                    <div class="yk-search-block">
                    <label class="yk-w-90">数据采集时间: </label>
                    <date-picker class=" data-control-css yk-input" lang="zh" type="datetime" format="YYYY-MM-DD HH:mm:ss"
                         placeholder="选择开始时间" :editable="false" :not-after="condition.endTime"
                         v-model="condition.startTime"></date-picker>
                    <span> - </span>
                    <date-picker class="data-control-css yk-input" lang="zh" type="datetime" format="YYYY-MM-DD HH:mm:ss"
                         placeholder="选择结束时间" :editable="false" :not-before="condition.startTime"
                         v-model="condition.endTime"></date-picker>
                    <label title="开始结束时间都不能为空" class="yk-form-tip">*</label>
                    <span class="yk-tip" v-show='isTimeTipShow' id="timeTip">开始结束时间都不能为空 ！</span>
                </div>       
            </div>-->
            <div class="c-text-right">
                <el-button type="primary" @click="addDataSet();" size='small'>获取数据集</el-button>
            </div>
            <el-table class='c-mt-10' :data="dataList" v-loading='loading' stripe>
                <el-table-column align="center" prop="sid" label="SID"></el-table-column>
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

            <!-- <div class="yk-gap">
                <div class="yk-btn-box yk-left">
                    <span class="title">获取数据集</span>
                    <img class="yk-img-btn" src="static/icon/add.png" title="获取数据集" alt="获取数据集" @click="addDataSet();">
                </div>
                <div class="yk-table-box" id="localDataTable" style="max-height:360px;">
                    <table class="yk-table">
                        <thead>
                        <tr>
                            <th style="width:6%;">SID</th>
                            <th>英文名称</th>
                            <th>中文名称</th>
                            <th>类型</th>
                            <th>描述</th>
                            <th style="width:7%;">操作</th>
                        </tr>
                        </thead>
                        <tbody :style='{"height":(paging.total<=10 ? "auto" : "405px")}'>
                         <tr class="yk-table-body" v-for="(item,index) in pageData" :key="index" :class="item.css">
                            <td style="width:6%;">{{item.sid}}</td>                        
                            <td>{{item.name}}</td>
                            <td>{{item.longidentifier}}</td>
                            <td>{{item.datType}}</td>
                            <td>{{item.description}}</td>
                            <td style="width:6%;"><span title="删除" alt="删除" class="yk-btn" @click='deleteClick(item)'>删除</span></td>                     
                        </tr>
                        </tbody>
                    </table>
                </div>
                <div class="pages">
                    <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="paging.index + 1" :page-sizes="[10,20,50,100,200,500]" :page-size="paging.size" layout="total, sizes, prev, pager, next" :total="paging.total"></el-pagination>
                </div>
            </div> -->
            <!-- <el-form-item>
                <el-button type="primary" @click="okClick">确定</el-button>
                <el-button type="primary" @click="cancelClick">取消</el-button>
            </el-form-item> -->
            <div class="c-text-center c-mt-30">
                <el-button type="primary" @click="okClick">确定</el-button>
                <el-button type="primary" @click="cancelClick">取消</el-button>
            </div>
            <!-- <div class="yk-btn-box yk-center yk-b-30">
                <span class="yk-btn yk-r-30" @click="okClick();">确定</span>
                <span class="yk-btn" @click="cancelClick();">取消</span>
            </div> -->
        </div>
        <add-data-panel @loadData="loadData" @init="init" v-show="isAddData" ref="addDataPanel" class="c-mt-30"></add-data-panel>
    </div>
    
</template>
<script>
import Paging from '@/common/view/Paging.vue'
import AddDataPanel from './AddDataPanel.vue'
import DatePicker from 'vue2-datepicker'
import TList from '@/common/utils/list.js'
export default {
    props: ['title','type','data'],
    components: {
        Paging, AddDataPanel,DatePicker,TList
    },
    data(){
        let _this = this;
        return {
            paging: {
                index: 0,
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
                vehicleId:[
                    { required: true, message: 'VehicleID不能为空!', trigger: 'blur' },
                ],
            },
            pickerOptionsStart: {
                editable: false,
                clearable: false,
                disabledDate(time) {
                    let endTimeTimestamp = new Date(_this.searchKey.endTime).getTime() || new Date().getTime();
                    return time.getTime() > endTimeTimestamp || time.getTime() > new Date().getTime();
                }
            },
            pickerOptionsEnd: {
                editable: false,
                clearable: false,
                disabledDate(time) {
                    let startTimeTimestamp = new Date(_this.searchKey.startTime).getTime() || new Date().getTime();
                    return time.getTime() < new Date(_this.searchKey.startTime).getTime() || time.getTime() > new Date().getTime();
                }
            },
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
                    this.paging.size=pageSize;
                }else{
                    this.paging.size = 10;
                }
                this.paging.index = 0;
                this.paging.total = list.length;
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
            this.paging.total = this.pageData.length;
            let start = this.paging.index * this.paging.size;
            let end = start + this.paging.size-1;
            this.pageData = this.pageData.slice(start,end);    
        },
        deleteClick(item){
            this.dataList.splice(this.dataList.indexOf(item),1);
            this.paging.size = 10;
            this.paging.index = 0;
            this.paging.total = this.dataList.length;
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
            // if(!_this.validateSearch('isOk')) return;
            if(this.dataList.length == 0) {
                this.$store.dispatch('showPrompt','请增加数据集 ！');
                return;
            }
            let startTime = _this.$dateUtil.dateToMs(_this.searchKey.startTime);
            let endTime = _this.$dateUtil.dateToMs(_this.searchKey.endTime);

            // if(startTime >= endTime){
            //     this.$store.dispatch('showPrompt','数据采集开始时间不能大于等于结束时间 ！');
            //     return 
            // }
            if(endTime - startTime > 3600 * 1000){
                this.$store.dispatch('showPrompt','数据采集开始时间和结束时间间隔不能大于1小时 ！');
                return;
            }
                
            var sIds =[];
            this.dataList.forEach(function(item){
                    sIds.push(item.sid);
            });
            
            this.$api.post("dataPlatApp/dynamic/vehicle/condition/submit", {
                    vehicleId: _this.searchKey.vehicleId,
                    startTime:_this.$dateUtil.dateToMs(_this.searchKey.startTime),
                    endTime:_this.$dateUtil.dateToMs(_this.searchKey.endTime),
                    eventTime:new Date().getTime(),
                    eventName:'云端查询',
                    sIds:sIds.join(',')
                }, response => {
                    if(response.data.code == 200){
                        this.$message.sucess("事件条件下发成功!");
                        // this.$store.dispatch('showPrompt','事件条件下发成功 ！');
                        this.$emit("localDataPanelBack");
                    }else{
                        this.$message.error("事件条件下发失败!");
                        // this.$store.dispatch('showPrompt','事件条件下发失败 ！');
                    }
                    
                });
        },
        cancelClick(){
           this.backClick();
        },
        //  validateSearch(o){
        //     var validatePass=true;
        //     var _this =this;
        //     let vehicleIdTip = document.getElementById("vehicleIdTip");
        //     let timeTip = document.getElementById("timeTip");
        //         if(_this.condition.vehicleId != ""){
        //             _this.isTipsShow = false;
        //         }else{
        //             if(o == "isOk"){
        //                 _this.isTipsShow = true;
        //             }
        //             validatePass=false;
        //         }

        //         if((_this.condition.startTime == null || _this.condition.startTime == "")
        //         || (_this.condition.endTime == null || _this.condition.endTime == "")){
        //              if(o == "isOk"){
        //                  this.isTimeTipShow = true;
        //              }
        //             validatePass=false;
        //         }else{
        //             this.isTimeTipShow = false;
        //         }

        //    return validatePass;
        // },
        // handleSizeChange(value) {//每页显示条数变更
        //     this.paging.size = value;
        //     this.loadData(this.dataList,value);
        // },
        // handleCurrentChange(value) {//页码变更
        //     this.paging.index = value-1;
        //     this.loadData();
        // }
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

