<template>
          <div class="yk-container">
            <div class="yk-container">            
            <el-page-header @back="backClick" class="c-mt-30"></el-page-header>
            <!-- <div data-v-7509c65a class="yk-btn-box yk-right yk-b-10">
              <img data-v-7509c65a="" src="static/icon/back.png" title="返回" alt="返回" @click="backClick();" class="yk-img-btn"> -->

            <el-table ref="multipleTable" :data='data' class='c-mb-70'>
              <el-table-column align="center" prop="msgCnt" label="消息编号"></el-table-column>
              <el-table-column align="center" prop="vehicleId" label="车辆id"></el-table-column>
              <el-table-column align="center" prop="plateNo" label="车牌号码"></el-table-column>
              <el-table-column align="center" label="gps时间">
                <template slot-scope="scope">{{$dateUtil.formatTime(gpstime)}}</template>
              </el-table-column>
              <el-table-column align="center" label="经度">
                <template slot-scope="scope">{{Number(longitude).toFixed(8)}}</template>
              </el-table-column>
              <el-table-column align="center" label="纬度">
                <template slot-scope="scope">{{Number(latitude).toFixed(8)}}</template>
              </el-table-column>
              <el-table-column align="center" prop="altitude" label="高程"></el-table-column>
              <el-table-column align="center" label="车辆速度">
                  <template slot-scope="scope">{{Number(speed).toFixed(1)}}</template>
              </el-table-column>
              <el-table-column align="center" prop="angle" label="车辆航向"></el-table-column>
              <el-table-column align="center" prop="angle" label="方向盘转角"></el-table-column>
              <el-table-column align="center" label="是否刹车">
                  <template slot-scope="scope">
                      <div v-if="brakePedal == 'on' || brakePedal == 'ON'" class="msg-right">是</div>
                      <div v-if="brakePedal == 'off' || brakePedal == 'OFF'" class="msg-right">否</div>
                      <div v-if="brakePedal == 'unavailable' || brakePedal == 'UNAVAILABLE'" class="msg-right">不支持</div>
                  </template>
              </el-table-column>
              <el-table-column align="center" min-width="8%" prop="transmission" label="档位状态"></el-table-column>
              <el-table-column align="center" min-width="8%" prop="lonAccel" label="纵向加速度"></el-table-column>
              <el-table-column align="center" min-width="8%" prop="latAccel" label="横向加速度"></el-table-column>
              <el-table-column align="center" min-width="8%" prop="vertAccel" label="垂直加速度"></el-table-column>
              <el-table-column align="center" min-width="8%" prop="yawRate" label="横摆角速度"></el-table-column>
              <el-table-column align="center" min-width="8%" prop="wheelBrakes" label="车轮刹车状态"></el-table-column>
              <el-table-column align="center" min-width="8%" prop="traction" label="牵引力控制系统实时状态："></el-table-column>
              <el-table-column align="center" min-width="8%" prop="abs" label="刹车防抱死系统（ABS）状态"></el-table-column>
              <el-table-column align="center" min-width="8%" prop="scs" label="车辆动态稳定控制系统"></el-table-column>
              <el-table-column align="center" min-width="8%" prop="brakeBoost" label="刹车辅助系统的状态"></el-table-column>
              <el-table-column align="center" min-width="8%" prop="auxBrakes" label="车辅助系统状态"></el-table-column>
              <el-table-column align="center" min-width="8%" prop="width" label="车辆宽度"></el-table-column>
              <el-table-column align="center" min-width="8%" prop="length" label="车辆长度"></el-table-column>
              <el-table-column align="center" min-width="8%" prop="height" label="车辆高度"></el-table-column>
              <el-table-column align="center" min-width="8%" prop="vehicleClass" label="车辆的分类"></el-table-column>
              <el-table-column align="center" min-width="8%" prop="events" label="车辆特殊状态"></el-table-column>
              <el-table-column align="center" min-width="8%" prop="lights" label="车灯状态"></el-table-column>
              <el-table-column align="center" min-width="8%" prop="gnssStatus" label="GNSS系统工作状态"></el-table-column>
              <el-table-column align="center" min-width="8%" prop="pathPrediction" label="曲率半径"></el-table-column>
          </el-table>

          </div>
      </div>
</template>
<script>
    export default {
        name: 'BsmDetail',    
        props: ['title','type','data'],
        data: function(){
          return {
          }
        },
        methods: {
          init:function(data){
              this.data=data;
              console.log(data)
          },
          backClick(){
            this.$emit('backClick');
          },
        },
        mounted(){
        }
        
    }
</script>
<style>

</style>