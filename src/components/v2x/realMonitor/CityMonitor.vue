<template>
  <div>

    <!-- 查询事件列表 -->
    <div
      v-if="bar.showEventList"
      class="cityMonitor-bar side-bar"
      @click="showEventListPanel();"
    >
      {{panel.showEventList ? '关闭事件列表' : '显示事件列表'}}
    </div>

    <div
      v-if="panel.showEventList"
      class="city-monitor"
      :class="panel.cityMonitorCss"
    >
      <div class="overview-title">
        <label>车辆事件监控  共{{vehicleCounts}}辆车</label>

          <input style='margin-left:10px;line-height:22px;'
              name="selfCar" placeholder="vid或车牌号"  v-model="searchKey.id" />
          <span
              class="ser-btn"
              @click="searchReal();"
            >查询车辆</span>

      </div>
      <div class="overview-body">
        <table cellspacing="0" cellpadding="0" class="table table-bordered">
          <tr class="ts-table-head">
            <th style="width: 160px;">自车vid</th>
            <th style="width: 130px;">自车车牌号</th>
            <th style="width: 130px;">远车vid</th>
            <th style="width: 190px;">远车车牌号</th>
            <th style="width: 110px;">事件预警类型</th>
          </tr>
          <tr
            class="ts-table-tr"
            scope="row"
            v-for="(item,index) in hostEventVoLists"
            :key="index"
            :class="item.css"
            @dblclick="rowDblClick(item)"
            style="cursor:pointer"
          >
            <td style="width: 132px;">{{ item.hvid }}</td>
            <td style="width: 132px;">{{ item.hPlateNo }}</td>
            <td style="width: 132px;">{{ item.rvid }}</td>
            <td style="width: 132px;">{{ item.rPlateNo }}</td>
            <td style="width: 190px;">{{ item.eventName }}</td>
          </tr>
        </table>
      </div>
      <!-- </div> -->
   </div>
  </div>
</template>
<script>
export default {
  name: "city-monitor", // 省市级监控
  props:{"vehicleCount":Number,
    "bsmVoList":{type:Array,default:()=>[]},
    "hostEventVoList":{type:Array,default:()=>[]}
  },
  data() {
    return {
      selfCarId: "",
      vehicleCounts:0,
      showCar:false,
      isClickOn:false,
      searchKey: {
        id: "" // 1111111
      },
      bar: {
        showEventList: false
      },
      panel: {
        showEventList: false,
        cityMonitorCss: ""
      },
      hostEventVoLists:this.hostEventVoList
    };
  },
  methods: {
    init(){
      this.bar.showEventList=true;
      this.panel.showEventList=true;
      this.panel.cityMonitorCss=true;
      this.showCar=true;
    },
    hide(){
      this.bar.showEventList=false;
      this.panel.showEventList=false;
      this.panel.cityMonitorCss=false;
    },
    showEventListPanel() {
      this.panel.showEventList = !this.panel.showEventList;
      this.panel.cityMonitorCss = this.panel.showEventList ? "show-cityMonitor" : "";
    },
    searchReal() {
      this.isClickOn = true;
    },
    rowDblClick(item){
      this.hide();
      this.$parent.removeAllCar();
      this.showCar=false;
      this.$emit("showSingleMonitor",item);//调用父组件事件名称
    }
  },
  watch:{
    bsmVoList(value){
      var _this = this;
      if(!_this.showCar) return;
      //多车多条数据，分组，100ms绘制一次
        value.map(function(item){
          //判断是否是主车
          let hvo = _this.hostEventVoList.find(function(vo){
            return vo.hvid == item.vid;
          });
          if(_this.hostEventVoList.length >0 && hvo == undefined){
         
            _this.$parent.addRemoteCar(item);
          }else{
            _this.$parent.addSelfCar(item);
          }
          _this.hostEventVoLists = _this.hostEventVoList;
          _this.vehicleCounts = _this.hostEventVoList.length;
          let searchCode = _this.searchKey.id;
          if(_this.isClickOn == true && searchCode != ""){
            _this.hostEventVoLists = _this.hostEventVoList.filter( item => {
              if(item.hvid.includes(searchCode) || item.hPlateNo.includes(searchCode) || item.rvid.includes(searchCode) || item.rPlateNo.includes(searchCode)){
                _this.isClickOn = false;
                return item;
              }
            })
            _this.vehicleCounts = _this.hostEventVoLists.length;
          }
        });
    }
  },
   created() {
      this.searchKey.id = "";
      this.selfCarId = "";
       
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

.show-cityMonitor {
  animation: am-show-cityMonitor 1s ease-in;
  -webkit-animation: am-show-cityMonitor 0.2s ease-in;
}
@keyframes am-show-cityMonitor {
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

.show-cityMonitor-panel {
  animation: am-show-cityMonitor 1s;
  -webkit-animation: am-show-cityMonitor 1s;
}
.hide-overview-panel {
    animation: am-hide-overview 1s;
    -webkit-animation: am-hide-overview 1s;
}

/* 查询车辆 */
.cityMonitor-bar {
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

.city-monitor {
  left: 24px;
  bottom:50px;
  position: absolute;
  background: #ffffff;
  width: 600px;
  height: 400px;
  display: inline-block;
  overflow: hidden;
}
.overview-title {
  padding-left: 20px;
  height: 60px;
  width: 100%;
  border-bottom: 1px solid #dedede;
  text-align: left;
}
.overview-title label {
  height: 64px;
  line-height: 64px;
  font-family: "MicrosoftYaHei";
  font-size: 16px;
  color: #4c4a4a;
}

.overview-body {
  width: 98%;
  margin:5px auto 0;
}
.overview-body label {
  margin-left: 22px;
  margin-right: 10px;
  font-family: "MicrosoftYaHei";
  /* font-size: 18px; */
  color: #4c4a4a;
}
.overview-body input {
  padding: 0 2px;
  width: 200px;
  height: 24px;
  line-height: 24px;
  display: inline-block;
  vertical-align: top;
}
.overview-body-div{
  float: left;
  padding-left: 10px;
  padding-right: 10px;
  width:30%;
}
.overview-body-div-right{
  float: left;
  padding-left: 10px;
  padding-right: 10px;
  border-left:1px dashed #000;
  width:60%;
  height: 230px;
}
.overview-body ul{
 list-style-type:none
}
.overview-body ul li{
 line-height: 50px;
}
.overview-body-online{
  background: url(../../../../static/images/vehicle/car.png) left no-repeat;
  padding-left:50px;
}
.overview-body-event{
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
  height: 29px;
  font-size:16px;
  line-height: 29px;
  margin-top:3px;
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
