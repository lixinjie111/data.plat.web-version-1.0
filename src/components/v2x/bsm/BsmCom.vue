<template>
    <!-- 基本信息 -->
    <div class="yk-container">
        <div v-show="!panel.show && !panel.cfgShow" class="yk-container c-mt-10">
            <el-form :inline="true" :model="searchKey" :rules="rules" ref="searchForm" size='small' class="demo-form-inline">
                <el-form-item label="车辆编号:" prop='vehicleId'>
                    <el-input v-model="searchKey.vehicleId"></el-input>
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
                    <el-button type="primary" @click="searchClick('searchKey')" :loading='loading'>查询</el-button>
                    <el-button type="primary" @click="resetClick">重置</el-button>
                </el-form-item>
            </el-form>
            <el-table :data="dataList" v-loading='loading' max-height='500' class='c-mt-10' stripe>
                <el-table-column align="center" type="index" label="No" :index='indexMethod'></el-table-column>
                <el-table-column align="center" prop="msgCnt" label="消息编号"></el-table-column>
                <el-table-column align="center" prop="vehicleId" label="车辆编号"></el-table-column>
                <el-table-column align="center" prop="plateNo" label="车牌号码"></el-table-column>
                <el-table-column align="center" label="时间">
                    <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.gpstime)}}</template>
                </el-table-column>
                <el-table-column align="center" label="经度">
                    <template slot-scope="scope">{{Number(scope.row.longitude).toFixed(8)}}</template>
                </el-table-column>
                <el-table-column align="center" label="纬度">
                    <template slot-scope="scope">{{Number(scope.row.latitude).toFixed(8)}}</template>
                </el-table-column>
                <el-table-column align="center" prop="altitude" label="高程"></el-table-column>
                <el-table-column align="center" label="车速">
                    <template slot-scope="scope">{{Number(scope.row.speed).toFixed(1)}}</template>
                </el-table-column>
                <el-table-column align="center" label="航向">
                    <template slot-scope="scope">{{Number(scope.row.heading).toFixed(1)}}</template>
                </el-table-column>
                <el-table-column align="center" prop="angle" label="方向盘转角"></el-table-column>
                <el-table-column align="center" label="刹车踏板">
                    <template slot-scope="scope">
                            <div v-if="scope.row.brakePedal == 'on' || scope.row.brakePedal == 'ON'" class="msg-right">是</div>
                            <div v-if="scope.row.brakePedal == 'off' || scope.row.brakePedal == 'OFF'" class="msg-right">否</div>
                            <div v-if="scope.row.brakePedal == 'unavailable' || scope.row.brakePedal == 'UNAVAILABLE'" class="msg-right">不支持</div>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="操作">
                    <template slot-scope="scope">
                        <el-button class="el-button--small" type="primary" :loading="scope.row.loading" @click="detail(scope.row)">明细</el-button>
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
        <bsm-detail ref='bsmDetail' v-show='panel.cfgShow' :data='panel.data' @backClick='backFn'></bsm-detail>
    </div>
</template>
<script>
import Paging from '@/common/view/Paging.vue'
import BsmDetail from '@/components/v2x/bsm/BsmDetail.vue'
export default {
    name: 'BsmCom',
    components: {
        Paging,
        BsmDetail
    },
    data(){
        let _this = this;
        return {
            loading:false,
            startTime:'',
            endTime:'',
            searchKey: {
               vehicleId: '',
               startTime: '',
               endTime: ''
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
                data: [],
                show: false,
                cfgShow: false,
            },  
            current: {
                top: 0,
                accessPlatform: null,
            },
            rules:{
                vehicleId:[
                    { required: true, message: 'VehicleID不能为空!', trigger: 'blur' },
                    { validator: function(rule, value, callback){
                         var VehicleIdRegex =  /[A-Z][\d]{2}[A-Z| \d]-[\d]{2}-[\d]{3}/;
                         if (!VehicleIdRegex.test(value)) {
                                callback(new Error('车辆编码格式不正确！'))
                            } else {
                                callback();
                        }
                    }, trigger: 'blur' }
                ],
                startTime:[
                    { type: 'date', required: true, message: '开始时间不能为空', trigger: 'change' }
                ],
                endTime:[
                    { type: 'date', required: true, message: '结束时间不能为空', trigger: 'change' }
                ],

            },
            // pickerOptionsStart: {
            //     disabledDate:time => {
            //         let _time = time,
            //             _newTime = new Date().getTime(),
            //             _startTime = _this.$dateUtil.dateToMs(_this.searchKey.startTime);
            //             return _time < _startTime || _time > _newTime;
            //     }
            // },
            // pickerOptionsEnd: {
            //     disabledDate:time => {
            //         let _time = time,
            //             _newTime = new Date().getTime(),
            //             _endTime = _this.$dateUtil.dateToMs(_this.searchKey.endTime);
            //             return _time < _endTime || _time > _newTime;
            //     }
            // },
        }
    },
    methods: {
        init(){
            this.initPaging();
            this.initSearch();
        },
        detail(item){
            this.panel.title = '明细';
            this.panel.type = 'detail';
            this.panel.data = item;
            this.panel.show = false;
            this.panel.cfgShow = true;
            this.$refs.bsmDetail.init(item);
        },
        initPaging(){
            this.paging.index = 1;
            this.paging.total = 0;
            this.paging.size = 10;
        },
        initSearch(){
            this.searchKey = {
                vid: '',
                startTime: '',
                endTime: ''
            };
        },
        initData(){
            this.dataList = [];
            this.loading = true;
            this.$api.post('dataPlatApp/v2x/findBSMList',{                   
                    vehicleId : this.searchKey.vehicleId,
                    startTime:this.$dateUtil.dateToMs(this.searchKey.startTime),
                    endTime:this.$dateUtil.dateToMs(this.searchKey.endTime),
                    page: {
                        "pageSize": this.paging.size,
                        "pageIndex": this.paging.index-1
                    },       
            },response => {
                if(response.status == 200){
                    if(response.data.list && response.data.list.length > 0){
                        response.data.list.forEach((item) => {
                            item.loading = false;
                        });
                        this.dataList = response.data.list;
                        this.paging.total = response.data.totalCount;
                        this.$message.sucess("获取列表成功！");
                    }else{
                        this.$message.error("未查询到任何信息!");
                    }
                }
                this.loading = false;
            }, error => {
                this.$message.error("获取列表error!");
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
            this.$refs.searchForm.resetFields();
            this.init();
        },
        getIsNan(val){
            return typeof(val) == 'number' && window.isNaN(val);
        },
        handleSizeChange(value) {//每页显示条数变更
            this.paging.index = 1;
            this.paging.size = value;
            this.initData();
        },
        handleCurrentChange(value) {//页码变更
            this.paging.index = value;
            this.initData();
        },
        backFn(){
            this.panel.show = false;
            this.panel.cfgShow = false;
        },
        indexMethod(index){
            return (this.paging.index-1) * this.paging.size + index + 1;
        }
    },
    mounted(){
        this.init();
    },
    beforeDestroy(){

    },
}
</script>
