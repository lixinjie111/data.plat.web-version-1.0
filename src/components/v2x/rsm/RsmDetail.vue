<template>
        <div class="yk-container">
            <div class="yk-container">
            <el-page-header @back="backClick" class="c-mt-30"></el-page-header>
            <el-table class='c-mt-10' :data="dataList" max-height='500' stripe>
                <el-table-column fixed salign="center" label="参与者类型" prop="pctType"></el-table-column>
                <el-table-column align="center" prop="sourceType" label="检测类型"></el-table-column>
                <el-table-column align="center" prop="plateNo" label="车牌号"></el-table-column>
                <el-table-column align="center" prop="vehicleClass" label="车辆类型"></el-table-column>
                <el-table-column align="center" label="时间">
                    <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.time)}}</template>
                </el-table-column>
                <el-table-column align="center" prop='longitude' label="经度"></el-table-column>
                <el-table-column align="center" prop='latitude' label="纬度"></el-table-column>
                <el-table-column align="center" prop='elevation' label="高程"></el-table-column>
                <el-table-column align="center" prop='transmission' label="档位"></el-table-column>
                <el-table-column align="center" prop='speed' label="速度"></el-table-column>
                <el-table-column align="center" prop='heading' label="方向"></el-table-column>
                <el-table-column align="center" prop='angle' label="方向盘转角"></el-table-column>
                <el-table-column align="center" prop='lonAccel' label="纵向加速度"></el-table-column>
                <el-table-column align="center" prop='latAccel' label="横向加速度"></el-table-column>
                <el-table-column align="center" prop='vertAccel' label="垂直加速度"></el-table-column>
                <el-table-column align="center" prop='yawRate' label="横摆加速度"></el-table-column>
                <el-table-column align="center" prop='length' label="目标长"></el-table-column>
                <el-table-column align="center" prop='width' label="目标宽"></el-table-column>
                <el-table-column align="center" prop='height' label="目标高"></el-table-column>
            </el-table>
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