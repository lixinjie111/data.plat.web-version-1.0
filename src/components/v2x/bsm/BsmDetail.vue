<template>
          <div class="yk-container">
            <div class="yk-container">            
            <el-page-header @back="backClick" class="c-mt-30"></el-page-header>
            <!-- <div data-v-7509c65a class="yk-btn-box yk-right yk-b-10">
              <img data-v-7509c65a="" src="static/icon/back.png" title="返回" alt="返回" @click="backClick();" class="yk-img-btn"> -->

            <div style="height:260px;position:relative;overflow-y:auto;">
                <table class="table table-bordered" style="width:92%;">
                  <tr class="ts-table-head">
                    <th style='width:7%;'>名称</th>
                    <th style='width:2%;'>数值</th>
                    <th style='width:5%;'>名称</th>
                    <th style='width:7%;'>数值</th>
                  </tr>
                  <tr>
                    <td>消息编号：</td>
                    <td>{{ data.msgCnt }}</td>
                    <td>车辆id：</td>
                    <td>{{ data.vehicleId }}</td>                  
                  </tr>               
                  <tr>
                    <td>车牌号码：</td>
                    <td>{{ data.plateNo }}</td>
                    <td>gps时间：</td>
                    <td>{{ $dateUtil.formatTime(data.gpstime) }}</td>                  
                  </tr>               
                  <tr>
                    <td>经度：</td>
                    <td>{{ Number(data.longitude).toFixed(8) }}</td>
                    <td>纬度：</td>
                    <td>{{ Number(data.latitude).toFixed(8) }}</td>                  
                  </tr>               
                  <tr>
                    <td>高程：</td>
                    <td>{{ data.altitude }}</td>
                    <td>车辆速度：</td>
                    <td>{{ Number(data.speed).toFixed(1) }}</td>                  
                  </tr>               
                  <tr>
                    <td>车辆航向：</td>
                    <td>{{ data.heading }}</td>
                    <td>方向盘转角：</td>
                    <td>{{ data.angle }}</td>                  
                  </tr>               
                  <tr>
                    <td>是否刹车：</td>
                    <td>
                      <!-- {{ data.brakePedal }} -->
                      <div v-if="data.brakePedal == 'on' || data.brakePedal == 'ON'" class="msg-right">是</div>
                      <div v-if="data.brakePedal == 'off' || data.brakePedal == 'OFF'" class="msg-right">否</div>
                      <div v-if="data.brakePedal == 'unavailable' || data.brakePedal == 'UNAVAILABLE'" class="msg-right">不支持</div>
                    </td>
                    <td>档位状态：</td>
                    <td>{{ data.transmission }}</td>                  
                  </tr>               
                  <tr>
                    <td>纵向加速度：</td>
                    <td>{{ data.lonAccel }}</td>
                    <td>横向加速度：</td>
                    <td>{{ data.latAccel }}</td>                  
                  </tr>               
                  <tr>
                    <td>垂直加速度：</td>
                    <td>{{ data.vertAccel }}</td>
                    <td>横摆角速度：</td>
                    <td>{{ data.yawRate }}</td>                  
                  </tr>               
                  <tr>
                    <td>车轮刹车状态：</td>
                    <td>{{ data.wheelBrakes }}</td>
                    <td>牵引力控制系统实时状态：</td>
                    <td>{{ data.traction }}</td>                  
                  </tr>               
                  <tr>
                    <td>刹车防抱死系统（ABS）状态：</td>
                    <td>{{ data.abs }}</td>
                    <td>车辆动态稳定控制系统：</td>
                    <td>{{ data.scs }}</td>                  
                  </tr>               
                  <tr>
                    <td>刹车辅助系统的状态：</td>
                    <td>{{ data.brakeBoost }}</td>
                    <td>车辅助系统状态：</td>
                    <td>{{ data.auxBrakes }}</td>                  
                  </tr>               
                  <tr>
                    <td>车辆宽度：</td>
                    <td>{{ data.width }}</td>
                    <td>车辆长度：</td>
                    <td>{{ data.length }}</td>                  
                  </tr>               
                  <tr>
                    <td>车辆高度：</td>
                    <td>{{ data.height }}</td>
                    <td>车辆的分类：</td>
                    <td>{{ data.vehicleClass }}</td>           
                  </tr>               
                  <tr>
                    
                    <td>车辆特殊状态：</td>
                    <td>{{ data.events }}</td>   
                    <td>车灯状态：</td>
                    <td>{{ data.lights }}</td>             
                  </tr>               
                  <tr>
                    
                    <td>GNSS系统工作状态：</td>
                    <td>{{ data.gnssStatus }}</td>   
                    <td>曲率半径：</td>
                    <td>{{ data.pathPrediction }}</td>               
                  </tr>               
                            
                </table>
            </div>
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
              let _this=this;
              _this.data=data;
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