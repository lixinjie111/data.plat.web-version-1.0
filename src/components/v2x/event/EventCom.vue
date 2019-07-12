<template>
    <!-- 基本信息 -->
    <div class="yk-container">
        <div class="yk-container c-mt-10">
            <el-form :inline="true" :model="searchKey" :rules="rules" ref="searchForm" size='small' class="demo-form-inline">
                <el-form-item label="自车Id" prop='hvid'>
                    <el-input v-model="searchKey.hvid"></el-input>
                </el-form-item>
                <el-form-item label="创建时间: ">
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
                <el-form-item>
                    <el-button type="primary" :loading="loading" @click="searchClick('searchKey')">查询</el-button>
                    <el-button type="primary" @click="resetClick()">重置</el-button>
                </el-form-item>
            </el-form>
            <el-table class='c-mt-10' :data="dataList" max-height='500' stripe v-loading='loading'>
                <el-table-column align="center" type="index" label="No" :index='indexMethod'></el-table-column>
                <el-table-column align="center" prop="msgCnt" label="消息编号"></el-table-column>
                <el-table-column align="center" prop="hvid" label="自车Id"></el-table-column>
                <el-table-column align="center" prop="rvid" label="远车Id"></el-table-column>
                <el-table-column align="center" label="预警类型">
                    <template slot-scope="scope">
                        <div v-if="scope.row.event == 0">无预警/解除预警</div>
                        <div v-if="scope.row.event == 1">前向碰撞预警</div>
                        <div v-if="scope.row.event == 2">交叉路口碰撞预警</div>
                        <div v-if="scope.row.event == 3">左转辅助</div>
                        <div v-if="scope.row.event == 4">变道预警</div>
                        <div v-if="scope.row.event == 5">逆向超车预警</div>
                        <div v-if="scope.row.event == 6">紧急制动预警</div>
                        <div v-if="scope.row.event == 9">紧急车辆提醒</div>
                        <div v-if="scope.row.event == 10">盲区提醒</div>
                        <div v-if="scope.row.event == 12">路侧告警</div>
                    </template>
                </el-table-column>
                <el-table-column align="center" prop="alarmLvl" label="预警级别"></el-table-column>
                <el-table-column align="center" prop="dist" label="车距"></el-table-column>
                <el-table-column align="center" label="gps时间">
                    <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.gpstime)}}</template>
                </el-table-column>
                <el-table-column align="center" prop="hlon" label="HV经度"></el-table-column>
                <el-table-column align="center" prop="hlat" label="HV纬度"></el-table-column>
                <el-table-column align="center" prop="hheading" label="HV方向"></el-table-column>
                <el-table-column align="center" prop="rlon" label="RV经度"></el-table-column>
                <el-table-column align="center" prop="rlat" label="RV纬度"></el-table-column>
                <el-table-column align="center" prop="rheading" label="RV方向"></el-table-column>   
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
    name: 'EventCom',
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
                hvid: '',
                startTime: '',
                endTime: ''
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
                hvid:[
                    { required: true, message: '自车ID不能为空!', trigger: 'blur' },
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
                hvid: '',
                startTime: '',
                endTime: ''
            };
        },
        initData(){
            this.dataList = [];
            this.loading = true,
            // data_plat_webapp_war_exploded/v2x/findEventList
            this.$api.post('dataPlatApp/v2x/findEventList',{                 
                page: {
                    "pageSize": this.paging.size,
                    "pageIndex": this.paging.index-1
                },
                hvid : this.searchKey.hvid,
                startTime:this.$dateUtil.dateToMs(this.searchKey.startTime),
                endTime:this.$dateUtil.dateToMs(this.searchKey.endTime),
            },response => {
                if(response.data.code == '200'){
                    this.dataList = response.data.data.list;
                    this.paging.total = response.data.data.totalCount;
                    this.$message.success(response.data.message);
                    this.loading = false;
                }else{
                    this.loading = false;
                    this.$message.error(response.data.message);
                }
            },error => {
                this.loading = false;
                this.$message.error("获取列表error！");
            });
        },
        searchClick(){
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
        }
    },
    mounted(){
        this.init();
    },
}
</script>

