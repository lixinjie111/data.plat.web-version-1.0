<template>
    <!-- 基本信息 -->
    <div class="yk-container">
        <div class="yk-container c-mt-10">
            <el-form :inline="true" :model="searchKey" :rules="rules" ref="searchForm" size='small' class="demo-form-inline">
                <el-form-item label="RSUId" prop='rsuId'>
                    <el-input v-model="searchKey.rsuId"></el-input>
                </el-form-item>
                <el-form-item label="创建时间: ">
                    <el-date-picker
                        v-model.trim="searchKey.startTime"
                        type="datetime"
                        placeholder="开始时间"
                        :editable="false"
                        :clearable="false"
                        format='yyyy-MM-dd HH:mm:ss'>
                    </el-date-picker>
                    -
                    <el-date-picker
                        v-model.trim="searchKey.endTime"
                        type="datetime"
                        placeholder="结束时间"
                        :editable="false"
                        :clearable="false"
                        format='yyyy-MM-dd HH:mm:ss'>
                    </el-date-picker>
                </el-form-item>               
                <el-form-item>
                    <el-button type="primary" :loading="loading" @click="searchClick('searchForm')">查询</el-button>
                    <el-button type="primary" @click="resetClick()">重置</el-button>
                </el-form-item>
            </el-form>
            <el-table class='c-mt-10' :data="dataList" v-loading='loading' max-height='500' stripe>
                <el-table-column align="center" type="index" label="No" :index='indexMethod'></el-table-column>
                <el-table-column align="center" prop="msgCnt" label="消息编号"></el-table-column>
                <el-table-column align="center" prop="targetRsuIds" label="RSUId"></el-table-column>
                <el-table-column align="center" label="时间">
                    <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.time)}}</template>
                </el-table-column>
                <el-table-column align="center" label="经度">
                    <template slot-scope="scope">{{scope.row.longitude.toFixed(8)}}</template>
                </el-table-column>
                <el-table-column align="center" label="纬度">
                    <template slot-scope="scope">{{scope.row.latitude.toFixed(8)}}</template>
                </el-table-column>
                <el-table-column align="center" prop="elevation" label="高程"></el-table-column>
                <el-table-column align="center" prop='content' label="消息内容"></el-table-column>
                <el-table-column align="center" prop='pathPtNum' label="坐标点个数"></el-table-column>
                <el-table-column align="center" label="坐标点串" width='140' :show-overflow-tooltip="true">
                    <template slot-scope="scope" class="sl-table-text">{{scope.row.alertPath.length > 0 ? scope.row.alertPath : ''}}</template>
                </el-table-column>
                <el-table-column align="center" prop='alertRadius' label="警告半径"></el-table-column>
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
    </div>
</template>
<script>
import Paging from '@/common/view/Paging.vue'
export default {
    name: 'RsiCom',
    components: {
        Paging,
    },
    data(){
        let _this = this;
        return {
            startTime:'',
            endTime:'',
            loading:false,
            searchKey: {
                rsuId: '',
                startTime: '',
                endTime: '',
                rsuId: '',
            },
            paging: {
                index: 1,
                size: 10,
                total: 0,
            },
            dataList: [],   
            current: {
                top: 0,
                accessPlatform: null,
            },
            rules:{
                rsuId:[
                    { required: true, message: 'rsuIdID不能为空!', trigger: 'blur' },
                ],
                startTime:[
                    { required: true, message: '开始时间不能为空!',trigger: 'blur' },
                ],
                endTime:[
                    { required: true, message: '结束时间不能为空!',trigger: 'blur' },
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
            this.initPaging();
            this.initSearch();
        },
        initPaging(){
            this.paging.index = 1;
            this.paging.total = 0;
            this.paging.size = 10;
        },
        initSearch(){
            this.searchKey = {
                rsuId: '',
                startTime:  '',
                endTime:  ''
            };
        },
        initData(){
            this.dataList = [];
            this.loading = true;
            // admin/v2x/findRsiPage
            this.$api.post('dataPlatApp/v2x/findRsiPage',{  
                page: {
                    "pageSize": this.paging.size,
                    "pageIndex": this.paging.index-1
                },
                rsuId : this.searchKey.rsuId,
                startTime:this.$dateUtil.dateToMs(this.searchKey.startTime),
                endTime:this.$dateUtil.dateToMs(this.searchKey.endTime),        
            },response => {
                if(response.data.code == '200'){
                    this.dataList = response.data.data.list;
                    this.paging.total = response.data.data.totalCount;
                    this.$message.success(response.data.message);
                    this.loading = false;
                }else{
                    this.$message.error(response.data.message);
                    this.loading = false;
                }
            },error => {
                this.$message.error("获取列表error！");
                this.loading = false;
            });
        },
        searchClick(){
            let startTime = new Date(this.searchKey.startTime).getTime();
            let endTime = new Date(this.searchKey.endTime).getTime();
            if(this.getIsNan(startTime) == false && this.getIsNan(endTime) == false){
                if(startTime > endTime){
                    this.$message.error("结束时间不能小于开始时间！");
                    return;
                }
            }
            this.$refs.searchForm.validate((valid) => {
                if (valid) {
                   this.initData();
                } else {
                    return false;
                }
            });
        },
        resetClick(){
            this.init();
        },
        getIsNan(val){
            return typeof(val) == 'number' && window.isNaN(val);
        },
        handleSizeChange(value) {//每页显示条数变更
            this.paging.size = value;
            this.initData();
        },
        handleCurrentChange(value) {//页码变更
            this.paging.index = value;
            this.initData();
        },
        formatTime(value){
            let tDate = value ? new Date(value) : new Date(); 
            const year = tDate.getFullYear();
            const month = this.formatNum(tDate.getMonth() + 1);
            const day = this.formatNum(tDate.getDate());
            const hour = this.formatNum(tDate.getHours());
            const minutes = this.formatNum(tDate.getMinutes());
            const seconds = this.formatNum(tDate.getSeconds());
            const millisecond = this.formatNum(tDate.getMilliseconds());
            return year + '-' + month + '-' + day + ' ' + hour + ':' + minutes + ':' + seconds + ':' + millisecond ;
        },
        formatNum(value){
            return value < 10 ? '0' + value : value;
        },
        indexMethod(index){
            return index + this.paging.size * (this.paging.index-1) + 1;
        }
    },
    mounted(){
        this.init();
    },
}
</script>
<style scoped lang="scss">
@import "@/assets/scss/theme.scss";
.el-tooltip {
    @include lineClamp(4);
}
</style>