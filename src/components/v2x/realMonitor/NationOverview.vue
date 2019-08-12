<template>
  <div>
    <!-- 查询实时概况 -->
    <div
      v-if="bar.showOverview"
      class="overview-bar side-bar"
      @click="showOverviewPanel();"
    >
      {{panel.showOverview ? '关闭概况' : '显示概况'}}
    </div>

    <div
      v-if="panel.showOverview"
      class="nation-overview"
      :class="panel.overviewPanelCss"
    >
      <div class="overview-title">
        <label>实时概况</label>

          <input style='margin-left:10px;line-height:22px;'
              name="selfCar" placeholder="vid或车牌号"  v-model="searchKey.id" />
          <span
              class="ser-btn"
              @click="searchReal();"
            >查询车辆</span>

      </div>
      <div class="overview-body">
        <div class="overview-body-div">
              <ul>
                <li>
                  <div class="overview-body-online">在线车辆</div>
                  <span>{{onLineVehicleTotal}}</span>
                </li>
                <li>
                  <div class="overview-body-event">实时事件</div>
                  <span>{{eventTotal}}</span>
                </li>
              </ul>
        </div>
        <div id="echart_event" class="overview-body-div-right" >
        </div>
      </div>
      <!-- </div> -->
   </div>
  </div>
</template>
<script>
import cityJson from '../../../assets/provCity.json';
export default {
  name: "nation-overview", // 实时概况
  props:{"onLineVehicleTotal":Number,"eventTotal":Number,
    'mapEventInfoList':{type:Array,default:()=>[]},
    'mapCityInfoList':{type:Array,default:()=>[]}
  },
  data() {
    return {
      selfCarId: "",
      searchKey: {
        id: "" // 1111111
      },
      bar: {
        showOverview: true
      },
      panel: {
        showOverview: true,
        overviewPanelCss: ""
      },
      mapCityList:[]
    };
  },
  methods: {
    init(val){
      this.bar.showOverview=true;
      this.panel.showOverview=true;
      this.bar.showOverview=true;
      this.panel.overviewPanelCss=true;
      this.getCityInfos();
    },
    hide(){
      this.bar.showOverview=false;
      this.panel.showOverview=false;
      this.bar.showOverview=false;
      this.panel.overviewPanelCss=false;
    },
    showOverviewPanel() {
      this.panel.showOverview = !this.panel.showOverview;
      this.panel.overviewPanelCss = this.panel.showOverview ? "show-overview" : "";
    },
    searchReal() {
      if(this.searchKey.id != ""){
        this.bar.showOverview=false;
        this.panel.showOverview=false;
        this.$emit("showCityMonitor",this.searchKey.id);//调用父组件事件名称
      }
    },
    drawCharts(){

      var nameArry=[],valueArray=[];

      this.mapEventInfoList.map(function(value,index){
          valueArray.push(value.count);
          nameArry.push(value.typeName);
      });
        // 基于准备好的dom，初始化echarts实例
        let myChart = this.$echarts.init(document.getElementById('echart_event'))
        // 绘制图表
        myChart.setOption({
            title: { text: '                  实时事件分布' },
            tooltip: {},
            grid:{
                x:20,
                y:50,
                x2:20,
                y2:60,
                borderWidth:4,
                containLabel: true,
                formatter:function(val){  
                  return val.split("").join("\n");  
                }  
            },
            yAxis: {
              axisLable:{
                width:'30%',
              },
                data: nameArry,
            },
            xAxis: {
            },
            series: [{
                name: '事件数量',
                type: 'bar',
                data: valueArray,
                fontSize:12
            }]
        });
    },
    getCityInfos(){
      let maps;
      for(let i=0;i<cityJson.length;i++){

        cityJson[i].onLineVehicleCount = 0;
        cityJson[i].eventCount = 0;
        let tempCity = this.mapCityInfoList.find(function(value){
          return value.city == cityJson[i].city;
        });
        if(tempCity != undefined){
          cityJson[i].onLineVehicleCount = tempCity.onLineVehicleCount;
          cityJson[i].eventCount = tempCity.eventCount;
        }
      }
      this.$parent.addCityInfo(cityJson);
    }
  },
   created() {
      this.searchKey.id = "";

      this.selfCarId = "";
    },
    watch:{
        mapEventInfoList(value){
          if(this.bar.showOverview && this.panel.showOverview){
            this.drawCharts();
          }
        }
    },
    mounted() {
      // debugger
     // this.drawLine();
      this.searchKey.id = "";
    },
    destroy() {
      this.searchKey.id = "";
    }
}
</script>
<style scoped>
.show-overview {
  animation: am-show-overview 1s ease-in;
  -webkit-animation: am-show-overview 0.2s ease-in;
}
@keyframes am-show-overview {
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

.show-overview-panel {
  animation: am-show-overview 1s;
  -webkit-animation: am-show-overview 1s;
}
.hide-overview-panel {
    animation: am-hide-overview 1s;
    -webkit-animation: am-hide-overview 1s;
}

/* 查询车辆 */
.overview-bar {
  right: 0;
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

.nation-overview {
  right: 26px;
  bottom:50px;
  position: absolute;
  background: #ffffff;
  width: 580px;
  height: 400px;
  display: inline-block;
  overflow: hidden;
}
.overview-title {
  padding-left: 20px;
  height: 50px;
  width: 100%;
  border-bottom: 1px solid #dedede;
  text-align: left;
}
.overview-title label {
  height: 50px;
  line-height: 50px;
  font-family: "MicrosoftYaHei";
  font-size: 16px;
  color: #4c4a4a;
}

.overview-body {
  margin-top: 50px;
  margin-left:20px;
  width: 100%;
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
  /* padding-right: 10px; */
  width:25%;
}
.overview-body-div-right{
  float: left;
  padding-left: 30px;
  padding-right: 10px;
  border-left:1px dashed #dedede;
  width:62%;
  height: 230px;
}
.overview-body ul{
 list-style-type:none
}
.overview-body ul li{
 padding-bottom:70px;
}
.overview-body ul li span{
  display: block;
}
.overview-body-online{
  background: url(../../../../static/images/vehicle/car.png) left no-repeat;
  line-height: 40px;
  padding-left:15px;
}
.overview-body-event{
    background: url(../../../../static/images/vehicle/event.png) left no-repeat;
    line-height: 40px;
    padding-left:15px;
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
  line-height: 29px;
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
</style>
