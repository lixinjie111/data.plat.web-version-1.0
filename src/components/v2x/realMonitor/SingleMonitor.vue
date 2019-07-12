<template>
  <div>
    <div v-if="bar.showMsg" >
        <span class="back-ico-btn" @click="backClick();">返回</span>
    </div>

    <!-- 车辆信息 -->
    <div
      v-if="bar.showMsg"
      class="car-msg-bar side-bar"
      @click="showMsgPanel();"
    >
      {{panel.showSelfMsg ? '关闭车辆信息' : '查看车辆信息'}}
    </div>

    <div
      v-if="panel.showSelfMsg"
      class="car-msg"
    >
      <div class="msg-title">
        <label>车辆信息</label>
        <!-- <span>车距：10米</span> -->
      </div>
      <div class="msg-body">
        <ul>
          <li>
            <div class="msg-left">
              <img src="static/images/vehicle/ico-self.png">
              自车ID：
            </div>
            <div class="msg-right">
              {{selfCar.vid}}
            </div>
          </li>
          <li>
            <div class="msg-left">速度：</div>
            <div class="msg-right">{{ selfCar.speed ? (selfCar.speed + ' 公里/小时') : '' }} </div>
          </li>
          <li>
            <div class="msg-left">航向角：</div>
            <div class="msg-right">{{ selfCar.heading ? (selfCar.heading + ' 度') : '' }}</div>
          </li>
          <li>
            <div class="msg-left">方向盘转角：</div>
            <div class="msg-right">{{ selfCar.angle ? (selfCar.angle + ' 度') : '' }}</div>
          </li>
          <li>
            <div class="msg-left">纵向加速度：</div>
            <div class="msg-right">
              {{ selfCar.lonAccel ? (selfCar.lonAccel + ' m/s^2') : ''}}
            </div>
          </li>
          <li>
            <div class="msg-left">横向加速度：</div>
            <div class="msg-right">
              {{ selfCar.latAccel ? (selfCar.latAccel + ' m/s^2') : ''}}
            </div>
          </li>
          <li>
            <div class="msg-left">是否刹车：</div>
            <div
              v-if="selfCar.brakePedal == 'on' || selfCar.brakePedal == 'ON'"
              class="msg-right"
            >是</div>
            <div
              v-if="selfCar.brakePedal == 'off' || selfCar.brakePedal == 'OFF'"
              class="msg-right"
            >否</div>
            <div
              v-if="selfCar.brakePedal == 'unavailable' || selfCar.brakePedal == 'UNAVAILABLE'"
              class="msg-right"
            >不支持</div>
          </li>
          <li>
            <div class="msg-left">时间：</div>
            <div class="msg-right">{{ selfCar.gpstime ? formatTime(selfCar.gpstime) : ''}}</div>
          </li>
        </ul>
        <div
          v-if="panel.showRemoteMsg"
          class="divide-line"
        ></div>
        <ul v-if="panel.showRemoteMsg">
          <li>
            <div class="msg-left">
              <img src="static/images/vehicle/ico-other.png">
              远车ID：
            </div>
            <div class="msg-right">{{ remoteCar.vid }}</div>
          </li>
          <li>
            <div class="msg-left">速度：</div>
            <div class="msg-right">{{ remoteCar.speed ? ( remoteCar.speed + ' 公里/小时' ) : '' }} </div>
          </li>
          <li>
            <div class="msg-left">航向角：</div>
            <div class="msg-right">{{ remoteCar.heading ? ( remoteCar.heading + ' 度' ) : '' }}</div>
          </li>
          <li>
            <div class="msg-left">方向盘转角：</div>
            <div class="msg-right">{{ remoteCar.angle ? (remoteCar.angle + ' 度') : '' }}</div>
          </li>
          <li>
            <div class="msg-left">纵向加速度：</div>
            <div class="msg-right">
              {{ remoteCar.lonAccel ? ( remoteCar.lonAccel + ' m/s^2' ) : '' }}
            </div>
          </li>
          <li>
            <div class="msg-left">横向加速度：</div>
            <div class="msg-right">
              {{ remoteCar.latAccel ? ( remoteCar.latAccel + ' m/s^2') : '' }}
            </div>
          </li>
          <li>
            <div class="msg-left">是否刹车：</div>
            <div
              v-if="remoteCar.brakePedal == 'on' || remoteCar.brakePedal == 'ON'"
              class="msg-right"
            >是</div>
            <div
              v-if="remoteCar.brakePedal == 'off' || remoteCar.brakePedal == 'OFF'"
              class="msg-right"
            >否</div>
            <div
              v-if="remoteCar.brakePedal == 'unavailable' || remoteCar.brakePedal == 'UNAVAILABLE'"
              class="msg-right"
            >不支持</div>
          </li>
          <li>
            <div class="msg-left">时间：</div>
            <div class="msg-right">{{ remoteCar.gpstime ? formatTime(remoteCar.gpstime) : ''}}</div>
          </li>
        </ul>
      </div>
    </div>

    <!-- 查询车辆事件信息 -->
    <div
      v-if="bar.showEventList"
      class="singleVehicle-bar side-bar"
      @click="showEventListPanel();"
    >
      {{panel.showEventList ? '关闭事件列表' : '显示事件列表'}}
    </div>

    <div
      v-if="panel.showEventList"
      class="singleVehicle-monitor"
      :class="panel.singleVehicleCss"
    >
      <div class="singleVehicle-body">
        <table class="table table-bordered">
          <tr class="ts-table-head">
            <th style="width: 180px;">预警时间</th>
            <th style="width: 200px;">自车vid</th>
            <th style="width: 200px;">远车vid</th>
            <th style="width: 40px;">预警类型</th>
            <th style="width: 40px;">预警级别</th>
            <th style="width: 40px;">预警距离</th>
          </tr>

          <!-- @click="rowClick(item);"  -->
          <tr
            class="ts-table-tr"
            scope="row"
            v-for="(item,index) in hostEventVoList"
            :key="index"
            :class="item.css"
          >
          <td style="width: 180px;line-height:22px;">{{ formatTime(item.gpstime) }}</td>
            <td style="width: 132px;">{{ item.hvid }}</td>
            <td style="width: 132px;">{{ item.rvid }}</td>
            <td style="width: 190px;">{{ item.eventName }}</td>
             <td style="width: 190px;">{{ item.alarmLvl }}</td>
              <td style="width: 190px;">{{ item.relativePos }}</td>
          </tr>
        </table>
      </div>
      <!-- </div> -->
   </div>
  </div>
</template>
<script>
export default {
  name: "single-monitor", // 单车监控
  props:{
    "vidOrPlateNo":String,
    "hostEventVoList":{type:Array,default:()=>[]},
    "bsmVoList":{type:Array,default:()=>[]}
  },
  data() {
    return {
      selfCarId: "",
      searchKey: {
        id: "" // 1111111
      },
      showCar:false,
      selfCar: {
        vid: "",
        speed: "",
        heading: "",
        angle: "",
        LongAccel: "",
        LatAccel: "",
        brakePedal:"",
        gpstime:""
      },
      remoteCar: {
        vid: "",
        speed: "",
        heading: "",
        angle: "",
        LongAccel: "",
        LatAccel: "",
        brakePedal:"",
        gpstime:""
      },
      bar: {
        showMsg: false,
        showEventList: false
      },
      panel: {
        showSelfMsg: false,
        showRemoteMsg: false,
        showEventList: false,
        singleVehicleCss: ""
      }
    };
  },
  methods: {
    init(){
        this.bar.showMsg=true;
        this.bar.showEventList=true;
        this.panel.showEventList=true;
        this.panel.showSelfMsg=true;
        this.showCar=true;
    },
     showMsgPanel() {
      this.panel.showSelfMsg = !this.panel.showSelfMsg;
      this.panel.msgCss = '';
    },
    showEventListPanel() {
      this.panel.showEventList = !this.panel.showEventList;
      this.panel.singleVehicleCss = this.panel.showEventList ? "show-singleVehicleMonitor" : "";
    },
    // 把时间戳转换为时间 yyyy-MM-dd HH:mm:ss
    formatTime(value) {
      const tDate = new Date(value);
      const year = tDate.getFullYear();
      const month = this.formatNum(tDate.getMonth() + 1);
      const day = this.formatNum(tDate.getDate());
      const hour = this.formatNum(tDate.getHours());
      const minutes = this.formatNum(tDate.getMinutes());
      const seconds = this.formatNum(tDate.getSeconds());
      const millisecond = this.formatNum(tDate.getMilliseconds());
      return (
        year +
        "-" +
        month +
        "-" +
        day +
        " " +
        hour +
        ":" +
        minutes +
        ":" +
        seconds +
        ":" +
        millisecond
      );
    },
     formatNum(value) {
      return value < 10 ? "0" + value : value;
    },
    backClick(){
      //返回按钮，关闭当前页面div，返回到全国监控
        this.bar.showMsg=false;
        this.bar.showEventList=false;
        this.panel.showEventList=false;
        this.panel.showSelfMsg=false;
        this.panel.showRemoteMsg=false;
        this.showCar=false;
        this.$parent.showNationOverview();
        this.$parent.removeAllCar();
    },
  },
  created() {

  },
  watch:{
    bsmVoList(value){
      var _this=this;
      if(!_this.showCar) return;

       if(_this.hostEventVoList.length>0) {
          _this.panel.showRemoteMsg=true;
           let hbsm = value.find(function(bsm){
                return bsm.vid == _this.hostEventVoList[0].hvid;
             });

             if(hbsm != undefined){
               _this.$parent.addSelfCar(hbsm);
                _this.selfCar =  {
                  vid: hbsm.vid,
                  speed: hbsm.speed,
                  heading: hbsm.heading,
                  angle: hbsm.angle,
                  LongAccel: hbsm.LongAccel,
                  LatAccel: hbsm.LatAccel,
                  brakePedal:hbsm.brakePedal,
                  gpstime:hbsm.gpstime
                }
             }
        }else{
            _this.panel.showRemoteMsg=false;
           _this.$parent.addSelfCar(value[0]);
            _this.selfCar =  {
              vid: value[0].vid,
              speed: value[0].speed,
              heading: value[0].heading,
              angle: value[0].angle,
              LongAccel: value[0].LongAccel,
              LatAccel: value[0].LatAccel,
              brakePedal:value[0].brakePedal,
              gpstime:value[0].gpstime
            };
        }

        //设置远车信息
        if(_this.panel.showRemoteMsg){
              let rbsm = value.find(function(bsm){
                  return bsm.vid == _this.hostEventVoList[0].rvid;
              });
              if(rbsm != undefined){
              _this.$parent.addRemoteCar(rbsm);
              _this.remoteCar =  {
                vid: rbsm.vid,
                speed: rbsm.speed,
                heading: rbsm.heading,
                angle: rbsm.angle,
                LongAccel: rbsm.LongAccel,
                LatAccel: rbsm.LatAccel,
                brakePedal:rbsm.brakePedal,
                gpstime:rbsm.gpstime
              };
            }
        }
    }
  },
  mounted() {
    this.searchKey.id = "";
  },
  destroy() {
    this.searchKey.id = "";
  }
}
</script>
<style scoped>
.back-ico-btn{
    left: 10px;
    top:10px;
    position:absolute;
    background: #2f98a2;
    width: 60px;
    height: 30px;
    line-height: 30px;
    color: #ffffff;
    font-family: 'MicrosoftYaHei';
    font-size: 16px;
    cursor: pointer;
    border-radius: 3px;
}
.back-ico-btn:hover{    
    background: #4d9ca3;    
    color: #ec5b06;    
}
.car-msg {
  top: 104px;
  right: 26px;
  position: absolute;
  background: #ffffff;
  /* width: 400px;
    height: 720px; */
  width: 310px;
}

.car-msg-bar {
  top: 160px;
  right: 0px;
  position: absolute;
  width: 24px;
  height: 140px;
  padding-top: 6px;
}

/* 车辆信息 */
.msg-title {
  text-align: left;
  padding-left: 30px;
  height: 50px;
  line-height: 50px;
  border-bottom: 1px solid #dedede;
}
.msg-title label,
span {
  height: 54px;
  line-height: 54px;
  font-family: "MicrosoftYaHei";
  color: #4c4a4a;
}
.msg-title label {
  font-size: 18px;
  margin-right: 20px;
}
.msg-title span {
  font-size: 18px;
}
.msg-body ul {
  list-style: none;
  margin: 0px;
  padding: 0px;
  /* margin: 25px; */
  /* padding: 0 25px; */
  padding: 10px;
  background: #ffffff;
}
.msg-body ul li {
  height: 24px;
  font-size:12px;
  line-height: 24px;
}

.msg-left {
  width: 50%;
  height: 100%;
  display: block;
  float: left;
  text-align: right;
}
.msg-left img {
  display: block;
  float: left;
}
.msg-right {
  width: 50%;
  height: 100%;
  display: block;
  float: left;
  text-align: left;
}
.divide-line {
  height: 5px;
  background: #f2f2f2;
}
.show-singleVehicleMonitor {
  animation: am-show-singleVehicleMonitor 1s ease-in;
  -webkit-animation: am-show-singleVehicleMonitor 0.2s ease-in;
}
@keyframes am-show-singleVehicleMonitor {
  from {
    width: 0;
  }
  to {
    width: 340px;
  }
}
@keyframes am-hide-overview {
  from {
    width: 340;
  }
  to {
    width: 0px;
  }
}

.show-singleVehicleMonitor-panel {
  animation: am-show-singleVehicleMonitor 1s;
  -webkit-animation: am-show-singleVehicleMonitor 1s;
}
.hide-singleVehicle-panel {
    animation: am-hide-overview 1s;
    -webkit-animation: am-hide-overview 1s;
}

/* 查询车辆 */
.singleVehicle-bar {
  left: 0;
  bottom: 200px;
  position: absolute;
  width: 24px;
  height: 120px;
  padding-bottom: 13px;
  padding-top: 35px;
}
.side-bar {
  background: #2f98a2;
  color: #ffffff !important;
  text-align: center;
  border: 1px solid #2f98a2;
  /* border-right: 1px solid #2f98a2;
    border-top: 1px solid #2f98a2;
    border-bottom: 1px solid #2f98a2; */
  font-family: "MicrosoftYaHei";
  font-size: 14px;
  cursor: pointer;
}

.side-bar:hover {
  background: #4d9ca3;
}

.singleVehicle-monitor {
  left: 26px;
  bottom:50px;
  position: absolute;
  background: #ffffff;
  width: 600px;
  height: 400px;
  display: inline-block;
  overflow: hidden;
}
.singleVehicle-body {
  margin: 5px auto 0;
  width: 98%;
}
.singleVehicle-body label {
  margin-left: 22px;
  margin-right: 10px;
  font-family: "MicrosoftYaHei";
  /* font-size: 18px; */
  color: #4c4a4a;
}
.singleVehicle-body input {
  padding: 0 2px;
  width: 200px;
  height: 24px;
  line-height: 24px;
  display: inline-block;
  vertical-align: top;
}
.singleVehicle-body-div{
  float: left;
  padding-left: 10px;
  padding-right: 10px;
  width:30%;
}
.singleVehicle-body-div-right{
  float: left;
  padding-left: 10px;
  padding-right: 10px;
  border-left:1px dashed #000;
  width:60%;
  height: 230px;
}
.singleVehicle-body ul{
 list-style-type:none
}
.singleVehicle-body ul li{
 line-height: 50px;
}
.singleVehicle-body-online{
  background: url(../../../../static/images/vehicle/car.png) left no-repeat;
  padding-left:50px;
}
.singleVehicle-body-event{
    background: url(../../../../static/images/vehicle/event.png) left no-repeat;
    padding-left:50px;
}
.ser-btn-box {
  margin-top: 20px;
  padding-right: 50px;
  text-align: right !important;
}
.ser-btn {
  display: inline-block;
  width: 100px;
  height: 32px;
  line-height: 32px;
  color: #ffffff;
  background: #3dbdec;
  border-radius: 3px;
  text-align: center;
  cursor: pointer;
}
.ser-btn:hover {
  color: #f1ecec;
  background: #67cff8;
}
.table-bordered{
  font-size:12px;
}
.table-bordered,.table-bordered th,.table-bordered td{
  border-collapse: collapse;
  line-height: 35px;
}

.table-bordered th,.table-bordered td{
  border:1px solid #ccc;
}
.table-bordered th{
  font-weight: 700;
}
</style>
