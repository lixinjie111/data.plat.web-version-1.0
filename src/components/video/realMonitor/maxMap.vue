<template>
<!--高德地图-->
<div id='map-container' class="map-container">
    <ul>
      <li><p class='speed'>车速:{{vehicleInfo.speed ? (vehicleInfo.speed+'km/h') : ' -- '}}</p></li>
      <li><p class='angle'>航向角:{{vehicleInfo.courseAngle ? (vehicleInfo.courseAngle+'度') : ' -- '}}</p></li>
      <li><p class='lonlat'>经纬度:{{vehicleInfo.lon ? vehicleInfo.lon : ' -- '}},{{vehicleInfo.lat ? vehicleInfo.lat : ' -- '}}</p></li>
      <li><p class='time'>时间:{{vehicleInfo.gpsTime ? vehicleInfo.gpsTime : ' -- '}}</p></li>
    </ul>
</div>
</template>
<script>
  import {gpsInfo} from '@/api/video';
  import TusvnMap from "@/common/view/TusvnMap/TusvnMap.vue";
  import Map3D from "@/common/view/map3D/map3D.vue";
  import ConvertCoord from'@/common/utils/coordConvert.js';
  export default {
    name: 'MaxMap',
    components: {
      TusvnMap, Map3D
    },
    data() {
      return {
        distanceMap:{},//创建地图对象
        vehicleInfo:{
            speed: '',
            courseAngle: '',
            lon: '',
            lat: '',
            gpsTime: ''
        },
        zoom:11,
        markers:{
          maskCar:null,
          polyline:[]
        },
        pointList:[],
        lastPoint: []
      }
    },
    methods: {
      initMap(){
        this.distanceMap = new AMap.Map('map-container', {
            resizeEnable: true, //是否监控地图容器尺寸变化
            zoom: this.zoom, //初始化地图层级
            rotateEnable: true,
            mapStyle:'amap://styles/3312a5b0f7d3e828edc4b2f523ba76d8',
        });
      },
      getGps(vehicleId, time, deviceType) {
          gpsInfo({
            'vehicleId': vehicleId, 'type': deviceType, 'time': time,
            }).then(res => {
              if(res.status == '200'){
                    let _this = this;
                    this.vehicleInfo.speed = Number(res.data.speed).toFixed(2);//获取速度
                    this.vehicleInfo.courseAngle = Number(res.data.courseAngle).toFixed(4);//获取航向角
                    this.vehicleInfo.lon = Number(res.data.lon).toFixed(8);//获取经度
                    this.vehicleInfo.lat = Number(res.data.lat).toFixed(8);//获取纬度
                    this.vehicleInfo.gpsTime = res.data.gpsTime;//获取时间
                    let _position = ConvertCoord.wgs84togcj02(res.data.lon,res.data.lat);
                    
                    if(this.lastPoint.length) {
                      this.pointList = [this.lastPoint, _position];
                    }else {
                      this.pointList = [_position];
                    }
                    this.lastPoint = _position;
                    this.distanceMap.setCenter(_position);
                    this.distanceMap.setRotation(-res.data.courseAngle);
                    if(!this.markers.maskCar) {
                      this.markers.maskCar = new AMap.Marker({
                        position:  _position,   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
                        angle: res.data.courseAngle,
                        icon:'static/images/vehicle/car-white.png',
                      });
                      this.distanceMap.add(this.markers.maskCar);
                      this.distanceMap.setZoom(16);
                    }else {
                      this.markers.maskCar.setPosition(_position);
                      this.markers.maskCar.setAngle(res.data.courseAngle);
                    }
                    this.distanceMapLine();
              }
            })
        
      },
      distanceMapLine(){
          let polyline = new AMap.Polyline({
                  map: this.distanceMap,
                  path: this.pointList,
                  strokeColor: "#F49308",
                  strokeWeight: 2,
                  // 折线样式还支持 'dashed'
                  strokeStyle: "solid",
                  /* // strokeStyle是dashed时有效
                    strokeDasharray: [10, 5],*/
                  lineJoin: 'round',
                  lineCap: 'round'
          });
          this.markers.polyline.push(polyline);
      },
      removeMasks(){//清除图层
        if(this.markers.maskCar) {
          this.distanceMap.remove(this.markers.maskCar);
          this.markers.maskCar = null;
        }
        if(this.markers.polyline.length) {
          this.distanceMap.remove(this.markers.polyline);
          this.markers.polyline = [];
        }
        this.pointList = [];
        this.lastPoint = [];
      },
      clearVehicleInfo(){
        this.vehicleInfo.speed = '';
        this.vehicleInfo.courseAngle = '';
        this.vehicleInfo.lon = '';
        this.vehicleInfo.lat = '';
        this.vehicleInfo.gpsTime = '';
      }
    },
    mounted() {
        this.initMap();
    },
    beforeDestroy() {
    },
  }
</script>
<style scoped lang="scss">
@import "@/assets/scss/theme.scss";
.max-map-warpper{
  height: 100%;
  ul{
    width:180px;
    position: absolute;
    top:10px;
    right:10px;
    padding:5px 10px 2px;
    border:1px solid #999;
    background:rgba(255,255,225,.5);
    li{
      height:28px;
      font-size:12px;
      line-height:28px;
      span {
        display: inline-block;
        vertical-align: middle;
      }
      @include lineClampOne();
    }
  }
  .zoom-btn{
    position: absolute;
    right:5px;
    bottom:8px;
    text-indent: -999px;
    width:40px;
    height:40px;
    cursor:pointer;
    overflow: hidden;
    background-size: 30px 30px;
    background-repeat: no-repeat;
    &.fd{
      background-image:url('../../../assets/images/maxMap/ico-max.png');
    }
    &.sx{
      background-image:url('../../../assets/images/maxMap/ico-min.png');
    }
  }
  .icon{
    display: inline-block;
    width:25px;
    height:100%;
    vertical-align: middle;
    &.speed{
        background:url('../../../assets/images/maxMap/ico-wheel.png') left center no-repeat;
    }
    &.angle{
        background:url('../../../assets/images/maxMap/ico-angle.png') left center no-repeat;
    }
    &.position{
        background:url('../../../assets/images/maxMap/icon-position.png') left center no-repeat;
    }
    &.time{
        background:url('../../../assets/images/maxMap/ico-time.png') left center no-repeat;
    }
  }
}
</style>
