<template>
  <div class="c-view-dialog">
      <div class="c-scroll-wrap">
          <div class="c-scroll-inner">
              <div class="c-title-fixed">
                <h3 class="c-title">
                    bsm数据<i class='el-icon-arrow-right'></i>bsm详情
                    <el-page-header @back="backClick" class="c-return-btn"></el-page-header>
                </h3>
              </div>
              <div class='c-wrapper-20 vehicle-detail'>
                  <ul><li>车辆编号: {{infoTagData.vehicleId ? infoTagData.vehicleId : '--'}}</li><li>车牌号: {{infoTagData.plateNo ? infoTagData.plateNo : '--'}}</li><li>GPS时间: {{$dateUtil.formatTime(infoTagData.gpstime)}}</li></ul>
              </div>
              <vehicle-info-tag title="" :infoTagData="infoTagDataFilter"></vehicle-info-tag>
          </div>
      </div>
</div>
</template>
<script>
import vehicleInfoTag from '@/common/detail/vehicleInfoTag';
    export default {
        name: 'BsmDetail',    
        // props: ['title','type','data'],
        props: {
          title: String,
          infoTagData: Object
        },
        components: {
          vehicleInfoTag
        },
        data: function(){
          return {

          }
        },
        computed: {
          infoTagDataFilter() {
            return [
               {
                   title:"",
                   list:[{
                            name:"消息编号",
                            value:this.infoTagData.msgCnt,
                        },
                        {
                            name:"车辆编号",
                            value:this.infoTagData.vehicleId,
                        },
                        {
                            name:"车牌号",
                            value:this.infoTagData.plateNo,
                        },
                        {
                            name:"车辆分类",
                            value:this.infoTagData.vehicleClass,
                        },
                        {
                            name:"车辆尺寸",
                            value:this.infoTagData.length?this.infoTagData.length:'--'+'/'+this.infoTagData.width?this.infoTagData.width:'--'+'/'+this.infoTagData.height?this.infoTagData.height:'--'
                        },
                        {
                            name:"GPS时间",
                            value:this.$dateUtil.formatTime(this.infoTagData.gpstime),
                        },
                        {
                            name:"经度",
                            value:this.infoTagData.longitude,
                        },
                        {
                            name:"纬度",
                            value:this.infoTagData.latitude,
                        },
                        {
                            name:"高程",
                            value:this.infoTagData.altitude,
                        },
                        {
                            name:"车辆速度",
                            value:this.infoTagData.speed,
                        }
                   ]
               },
               {
                   title:"",
                   list:[{
                            name:"车灯状态",
                            value:this.infoTagData.lights,
                        },
                        {
                            name:"刹车状态",
                            value:this.infoTagData.brakePedal,
                        },
                        {
                            name:"档位状态",
                            value:this.infoTagData.transmission,
                        },
                        {
                            name:"航向角",
                            value:this.infoTagData.heading,
                        },
                        {
                            name:"方向盘转角",
                            value:this.infoTagData.angle,
                        },
                        {
                            name:"纵向加速度",
                            value:this.infoTagData.lonAccel,
                        },
                        {
                            name:"横向加速度",
                            value:this.infoTagData.latAccel,
                        },
                        {
                            name:"垂直加速度",
                            value:this.infoTagData.vertAccel,
                        },
                        {
                            name:"横摆角速度",
                            value:this.infoTagData.yawRate,
                        }
                   ],
               },
               {
                   title:"",
                   list:[
                        {
                            name:"曲率半径",
                            value:this.infoTagData.pathPrediction,
                        },
                        {
                            name:"车轮刹车状态",
                            value:this.infoTagData.wheelBrakes,
                        },
                        {
                            name:"牵引力控制系统实时状态",
                            value:this.infoTagData.traction,
                        },
                        {
                            name:"刹车防抱死系统(ABS)状态",
                            value:this.infoTagData.abs,
                        },
                        {
                            name:"车辆动态稳定控制系统",
                            value:this.infoTagData.scs,
                        },
                        {
                            name:"刹车辅助系统的状态",
                            value:this.infoTagData.brakeBoost,
                        },
                        {
                            name:"车辅助系统状态",
                            value:this.infoTagData.auxBrakes,
                        },
                        {
                            name:"GNSS系统工作状态",
                            value:this.infoTagData.gnssStatus,
                        },
                        {
                            name:"车辆特殊状态",
                            value:this.infoTagData.events,
                        }
                   ],
               }
            ]
          }
        },
        methods: {
          // init:function(data){
          //     this.data=data;
          // },
          backClick(){
            this.$emit('backClick');
          },
        },
        mounted(){
        }
        
    }
</script>
<style scoped>
.vehicle-detail{
    overflow: hidden;
}
.vehicle-detail ul li{
    display: block;
    float:left;
    padding-right:30px;
}
</style>

