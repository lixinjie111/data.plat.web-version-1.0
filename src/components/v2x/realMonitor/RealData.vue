<template>
  <div>
    <tusvn-map ref="tusvnMap"
      :targetId="map.id"
      :overlayContainerId="map.layerId"
      :isMasker='false'
      :isCircle='false'
      @ViewLevelChange=ViewLevelChange
      @MapInitComplete = mapInitComplete
      ></tusvn-map>

    <nation-overview  ref="nationOverview"
     @showCityMonitor="showCityMonitor"
    :onLineVehicleTotal=onLineVehicleTotal
    :eventTotal=eventTotal
    :mapEventInfoList=mapEventInfoList
    :mapCityInfoList=mapCityInfoList
    ></nation-overview>

    <city-monitor ref="cityMonitor"
     @showSingleMonitor="showSingleMonitor"
    :vehicleCount=vehicleCount
    :hostEventVoList=hostEventVoList
    :bsmVoList=bsmVoList
    ></city-monitor>

    <single-monitor ref="singleMonitor"
    :vidOrPlateNo=vidOrPlateNo
    :hostEventVoList=hostEventVoList
    :bsmVoList=bsmVoList
    ></single-monitor>

  </div>
</template>
<script>
import cityData from '../../../assets/provCity.json';
import TusvnMap from "../../../common/view/TusvnMap/TusvnMap.vue";
import NationOverview from '@/components/v2x/realMonitor/NationOverview.vue'
import CityMonitor from '@/components/v2x/realMonitor/CityMonitor.vue'
import SingleMonitor from '@/components/v2x/realMonitor/SingleMonitor.vue'
export default {
  name: "real-data", // 实时数据
  components: {
    TusvnMap,
    NationOverview,
    CityMonitor,
    SingleMonitor
  },
  data() {
    return {
      map: {
              id: 'v2x',
              layerId: 'v2xLayer',
              width: 100,
              height: 600
      },
      onLineVehicleTotal:0,
      eventTotal:0,
      mapEventInfoList:[],
      mapCityInfoList:[],
      vehicleCount:0,
      hostEventVoList:[],
      bsmVoList:[],
      vidOrPlateNo:'',
      type:1,//监控类型1全国监控 2省市监控 3单车监控,
      mapInitOk: false
    }
  },
  methods: {
    showSingleMonitor(item){
      var msg = '{\"type\":3,\"vidOrPlateNo\":\"'+ item.hvid +'\",\"rvid\":\"'+ item.rvid +'\",\"event\":'+ item.event +'}';
      console.log("=============="+ msg);
      this.sendMsg(msg);
      this.$refs.singleMonitor.init();
      this.vidOrPlateNo= item.hvid;
      this.type=3;//单车监控
    },
    showCityMonitor(vidOrPlateNo){
      var msg;
      this.type=2;//省市监控
      if(vidOrPlateNo == undefined){
        var extent = this.$refs.tusvnMap.getCurrentExtent();
        msg = '{\"type\":2,\"mapRange\":{"\minLon\":'+ extent[0] +',\"maxLon\":'+ extent[2] +',\"minLat\":'+ extent[1] +',\"maxLat\":'+ extent[3]+'}}';
      }else{
        this.vidOrPlateNo = vidOrPlateNo;
        msg = '{\"type\":2,\"vidOrPlateNo\":\"'+ vidOrPlateNo +'\"}';
      }
       this.sendMsg(msg);
       this.$refs.cityMonitor.init();

    },
    showNationOverview(){
       var msg = '{\"type\":1}';
       this.sendMsg(msg);
       this.$refs.nationOverview.init();
       if(this.type == 3){
         this.$refs.tusvnMap.zoomTo(8);//单车监控返回回来，地图级别改成默认级别
       }
      
       this.vidOrPlateNo="";//全国监控vidOrPlateNo置空
       this.type=1;//全国监控
    },
    initWebSocket(){
      let _this=this;
      if ('WebSocket' in window) {
        _this.webSocket = new WebSocket(window.config.websocketUrl);  //获得WebSocket对象
      }
  　  _this.webSocket.onmessage = _this.onmessage;
      _this.webSocket.onclose = _this.onclose;
      _this.webSocket.onopen = _this.onopen;
    },
    onmessage(mesasge){
      let _this=this;
      var json = JSON.parse(mesasge.data);
      switch(json.type){
        case 1:{//全国数据
          _this.onLineVehicleTotal = json.data.onLineVehicleTotal;
          _this.eventTotal=json.data.eventTotal;
          _this.mapEventInfoList= json.data.mapEventInfoList;
          _this.mapCityInfoList=json.data.mapCityInfoList;
          break;
        }
        case 2:{//bsm数据
            _this.bsmVoList=json.data;

          break;
        }
        case 3:{//event数据
          _this.hostEventVoList=json.data.hostEventVoList;
          _this.vehicleCount=json.data.vehicleCount;
          break;
        }
      }

    },
    onclose(data){
      // console.log("结束连接");
    },
    onopen(data){
      // console.log("建立连接,,,,,,");
     var msg = '{\"type\":1}';//建立连接时默认全国监控
     this.sendMsg(msg);
    },
    sendMsg(msg) {
      let _this=this;
        if(window.WebSocket){
            if(_this.webSocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                _this.webSocket.send(msg); //send()发送消息
                // console.log("已发送消息:"+ msg);
            }
        }else{
            return;
        }
    },
    ViewLevelChange(obj,z){
      var _this =this;
        if(_this.type !=1 && _this.vidOrPlateNo != ""){
          _this.vidOrPlateNo ="";
          return;
       }
       if(_this.type == 3) return;
      if(z >=10){//省市级
        _this.$refs.nationOverview.hide();
        _this.showCityMonitor();
        _this.$refs.tusvnMap.removeAllFeature("vectorLayer_01");//移除文字图层
      }else{//全国级
        _this.$refs.cityMonitor.hide();
        _this.showNationOverview();
      }
      _this.removeAllCar();
    },
    changeMapLevel(lon,lat){
        this.$refs.tusvnMap.zoomTo(18);
        this.$refs.tusvnMap.centerAt(lon,lat);
    },
    // 添加自车
    addSelfCar(value) {
      if(!this.mapInitOk) return;
      const carId = value.vid;
      this.removeCar(carId);//先删除
      const carIco = "../../../../static/images/vehicle/car-red.png";
      this.$refs.tusvnMap.addImg(
        value.longitude,
        value.latitude,
        carId,
        'CarLayer_v2x',
        carIco,
        [50,50],
        value.heading,
        null,
        null,
        null
      );

      this.$refs.tusvnMap.addText(
          value.longitude,
          value.latitude,
          carId,
          "vectorLayer_02",
          value.plateNo,
          null,
          "point",
          0,
          -40,
          "black",
          null,
          "rgba(255,255,255,.4)",
          null,
          [3,5,2,5],
          false,
          null,
          null,
          null
      );
    },
     // 添加远车
    addRemoteCar(value) {
      if(!this.mapInitOk) return;
      const carId = value.vid;
      this.removeCar(carId);//先删除
      const carIco = "../../../../static/images/vehicle/car-white.png";
      const text = value.plateNo;
      this.$refs.tusvnMap.addImg(
        value.longitude,
        value.latitude,
        carId,
        'CarLayer_v2x',
        carIco,
        [50,50],
        value.heading,
        null,
        null,
        null
      );
      this.$refs.tusvnMap.addText(
          value.longitude,
          value.latitude,
          carId,
          "vectorLayer_02",
          value.plateNo,
          null,
          "point",
          0,
          -40,
          "black",
          null,
          "rgba(255,255,255,.4)",
          null,
          [3,5,2,5],
          false,
          null,
          null,
          null
        );

    },
    mapInitComplete(e){
      let _this = this;
       //测试用
      //this.$refs.tusvnMap.addWms("Provice","http://113.208.118.62:8080/geoserver/shanghai_qcc/wms","shanghai_qcc:province_polygon","",1,true,null);
      this.$refs.tusvnMap.addWms("Provice",window.config.dlWmsUrl+"geoserver/shanghai_qcc/wms","shanghai_qcc:province_polygon","",1,true,null);
      this.$refs.tusvnMap.addVectorLayer("vectorLayer_01");//文字层
      this.$refs.tusvnMap.addVectorLayer("vectorLayer_02");//车牌层
      // 车辆所在的层
      this.$refs.tusvnMap.addVectorLayer("CarLayer_v2x");

      _this.mapInitOk = true;
      if(this.type == 1){
        this.addCityInfo(cityData);
        this.$refs.tusvnMap.zoomTo(4);
      }
    },
    addCityInfo(cityData){
      let _this = this;
        if(!this.mapInitOk) return;
      // lon,lat,id,layerId,text, font, placement, textOffsetX, textOffsetY, fillColor, stroke, backgroundFillColor, backgroundStroke, padding,imgUrl,imgSize,imgOffset
      for(let i=0;i<cityData.length;i++){
        let id = "cityText" + i;
        let text = cityData[i].city + ' \n 在线车辆:' + cityData[i].onLineVehicleCount + ' \n 实时事件:' + cityData[i].eventCount;
        _this.$refs.tusvnMap.addText(
          cityData[i].lon,
          cityData[i].lat,
          id,
          "vectorLayer_01",
          text,
          null,
          "point",
          0,
          -25,
          "black",
          null,
          "rgba(255,255,255,.4)",
          null,
          [3,5,2,5],
          false,
          null,
          null,
          null
        );
      }
    },
    removeCar(id){
      if(!this.mapInitOk) return;
      this.$refs.tusvnMap.removeFeature(id,'CarLayer_v2x');
      this.$refs.tusvnMap.removeFeature(id,'vectorLayer_02');
    },
    removeAllCar(){
      if(!this.mapInitOk) return;
      this.$refs.tusvnMap.removeAllFeature('CarLayer_v2x');
      this.$refs.tusvnMap.removeAllFeature('vectorLayer_02');
    }
  },
  created(){
    this.initWebSocket();

  },
  mounted(){

  },
  watch:{
      bsmVoList(value){
            let _this =this;
            if(_this.type !=1 && _this.vidOrPlateNo != ""){
              let temp = value.find(function(item){
                return (item.vid == _this.vidOrPlateNo || item.plateNo == _this.vid);
              });
              if(temp != undefined){
                _this.changeMapLevel(temp.longitude,temp.latitude);
              }
            }
       }
  },
  mounted(){

  },
  destroyed(){
  }
};
</script>
<style scoped>

</style>
