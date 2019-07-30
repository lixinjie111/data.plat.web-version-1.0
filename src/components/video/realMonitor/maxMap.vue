<template>
<!--高德地图-->
<div class="c-map-container" id='map-container'>
    <ul class="c-map-info clearfix c-icon-map-info">
        <li class='c-map-info-list speed'>车速:{{vehicleInfo.speed ? (vehicleInfo.speed+'km/h') : ' -- '}}</li>
        <li class='c-map-info-list angle'>航向角:{{vehicleInfo.courseAngle ? (vehicleInfo.courseAngle+'度') : ' -- '}}</li>
        <li class='c-map-info-list lonlat'>经纬度:{{vehicleInfo.lon ? vehicleInfo.lon : ' -- '}},{{vehicleInfo.lat ? vehicleInfo.lat : ' -- '}}</li>
        <li class='c-map-info-list time'>时间:{{vehicleInfo.gpsTime ? vehicleInfo.gpsTime : ' -- '}}</li>
    </ul>
</div>
</template>
<script>
  import {gpsInfo} from '@/api/video';
  import ConvertCoord from'@/common/utils/coordConvert.js';
  export default {
    name: 'MaxMap',
    components: {},
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
        changeSize:false,
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
