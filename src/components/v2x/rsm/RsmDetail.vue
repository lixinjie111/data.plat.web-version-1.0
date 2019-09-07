<template>
<div class="c-view-dialog" v-cloak>
        <div class="c-scroll-wrap">
            <div class="c-scroll-inner">
                <div class="c-title-fixed">
                    <h3 class="c-title">
                        rsm数据<i class='el-icon-arrow-right'></i>rsm详情
                        <el-page-header @back="backClick" class="c-return-btn"></el-page-header>
                    </h3>
                </div>
                <div class="c-wrapper-20">
                    <el-table 
                        ref="table"
                        :data="dataList" 
                        stripe
                        border
                        max-height="724"
                        >
                        <el-table-column salign="center" label="参与者类型" prop="pctType"></el-table-column>
                        <el-table-column prop="sourceType" label="检测类型"></el-table-column>
                        <el-table-column prop="plateNo" label="车牌号"></el-table-column>
                        <el-table-column prop="vehicleClass" label="车辆类型"></el-table-column>
                        <el-table-column label="时间">
                            <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.time)}}</template>
                        </el-table-column>
                        <el-table-column label="经度">
                            <template slot-scope="scope">{{scope.row.longitude.toFixed(8)}}</template>
                        </el-table-column>
                        <el-table-column label="纬度">
                            <template slot-scope="scope">{{scope.row.latitude.toFixed(8)}}</template>
                        </el-table-column>
                        <el-table-column prop='elevation' label="高程"></el-table-column>
                        <el-table-column prop='transmission' label="档位"></el-table-column>
                        <el-table-column prop='speed' label="速度"></el-table-column>
                        <el-table-column prop='heading' label="方向"></el-table-column>
                        <el-table-column prop='angle' label="方向盘转角"></el-table-column>
                        <el-table-column prop='lonAccel' label="纵向加速度"></el-table-column>
                        <el-table-column prop='latAccel' label="横向加速度"></el-table-column>
                        <el-table-column prop='vertAccel' label="垂直加速度"></el-table-column>
                        <el-table-column prop='yawRate' label="横摆加速度"></el-table-column>
                        <el-table-column prop='length' label="目标长"></el-table-column>
                        <el-table-column prop='width' label="目标宽"></el-table-column>
                        <el-table-column prop='height' label="目标高"></el-table-column>
                    </el-table>
                </div>
            </div>
        </div>
</div>
</template>
<script>
    export default {
        name: 'rsmDetail',    
        props: ['title','type','data'],
        data: function(){
          return {
              msgCnt:'',
              rsuId:'',
              time:'',
              lonRsm:'',
              latRsm:'',
              elevRsm:'',
              num:'',
              dataInfo:null,
              dataList: []
          }
        },
        methods: {
            init:function(data){
                this.dataInfo = data;
                this.dataList = data.phases;
                this.$refs.table.bodyWrapper.scrollTop = 0;
            },
            backClick(){
                this.$emit('goBack');
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
            }
        },
        mounted(){
        }       
    }
</script>
<style>
.bold{
    font-weight:700;
}
</style>