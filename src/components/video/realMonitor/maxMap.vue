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
  import {setInterval, clearInterval} from 'timers';
  import ConvertCoord from'@/common/utils/coordConvert.js';
  export default {
    name: 'MaxMap',
    components: {
      TusvnMap, Map3D
    },
    data() {
      return {
        vehicleId: '',
        position: '',
        status: '',
        timer: null,
        monitTime: '',
        monitStartTime: '',
        speed: '',
        courseAngle: '',
        lon: '',
        lat: '',
        gpsTime: '',
        isFd: true,
        isSx: false,
        getGpsTime: null,
        lineArray: [],
        dataList: [],
        map3dShow: false,
        mapExtent: null,
        mapLevel: null,
        map3dConvert:false,
        btnStartStatus:'',
        btnEndStatus:'',
        isEnd:true,
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
        pointList:[]
      }
    },
    methods: {
      initMap(){
        this.distanceMap = new AMap.Map('map-container', {
            resizeEnable: true, //是否监控地图容器尺寸变化
            zoom: this.zoom, //初始化地图层级
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
                    this.pointList.push(_position);

                    this.distanceMap.setCenter(_position);
                    if(!this.markers.maskCar) {
                      this.markers.maskCar = new AMap.Marker({
                        position:  _position,   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
                        icon:'static/images/vehicle/car-white.png',
                      });
                      this.distanceMap.add(this.markers.maskCar);
                      this.distanceMap.setZoom(14);
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
      removeMasks(){
        this.distanceMap.remove(this.markers.maskCar);
        this.distanceMap.remove(this.markers.polyline);
        this.markers.maskCar = null;
        this.markers.polyline = [];
      }
      // getGps(vehicleId, time, deviceType) {
      //   gpsInfo({
      //     'vehicleId': vehicleId, 'type': deviceType, 'time': time,
      //   }).then(res => {
      //     if(res.status == '200'){
      //         if (res.data != '') {
      //           this.speed = Number(res.data.speed).toFixed(2);//获取速度
      //           this.courseAngle = Number(res.data.courseAngle).toFixed(4);//获取航向角
      //           this.lon = Number(res.data.lon).toFixed(8);//获取经度
      //           this.lat = Number(res.data.lat).toFixed(8);//获取纬度
      //           this.gpsTime = res.data.gpsTime;//获取时间

      //           let mapSize = this.$refs.refRealMap.getCurrentExtent();//获取地图的范围
      //           let minX = mapSize[0];
      //           let minY = mapSize[1];
      //           let maxX = mapSize[2];
      //           let maxY = mapSize[3];
      //           //路线所在层
      //           // this.$refs.refRealMap.addVectorLayer('CarLine');
      //           // 车辆所在的层
      //           // this.$refs.refRealMap.addVectorLayer("CarLayer");
      //           //当小车的行驶轨迹超出地图范围，就重新定位地图
      //           // if(!this.$refs.refRealMap2.isInDivPolygon(this.lon,this.lat))
      //           // {
      //           //     this.$refs.refRealMap2.centerAt(this.lon,this.lat);
      //           // }

      //           this.$refs.refRealMap.centerAt(this.lon, this.lat);//定位小车始终在地图中间位置
      //           // 画车的行驶路线
      //           var p1 = [];

      //           if (this.lon && this.lat) {
      //             p1.push(parseFloat(this.lon), parseFloat(this.lat));
      //           }
      //           this.lineArray.push(p1);
      //           // coordinates, id, color, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, width, layerId
                
      //           this.$refs.refRealMap.addLineString(this.lineArray, 'line_01', '#093bbb', 'round', 'round', [5, 0], 0, 10, 5, "CarLine");
      //           // lon,lat,id,layerId,carImgUrl,size,rotation,rotateWithView,opacity,offset
      //           //  添加小车
      //           this.$refs.refRealMap.addImg(this.lon, this.lat, "car_01", "CarLayer", 'static/images/vehicle/geolocation_marker_heading.png', [24, 49], (this.courseAngle / 180) * Math.PI, null, null, null);//部署路径
      //           // this.$refs.refRealMap.addImg(this.lon,this.lat,"car_01","CarLayer",'../../../static/images/vehicle/geolocation_marker_heading.png',[24,49],(this.courseAngle/180)*Math.PI,null,null,null);

      //           // 地图旋转
      //           this.$refs.refRealMap.rotateMap(-(this.courseAngle / 180.0) * Math.PI);
      //         } else {
      //           this.speed = '--';//获取速度
      //           this.courseAngle = '--';//获取航向角
      //           this.lon = '--';//获取经度
      //           this.lat = '--';//获取纬度
      //           this.gpsTime = '--';//获取时间

      //           this.timer = setInterval(function () {
      //             this.$message.error('暂无GPS数据!');
      //             return;
      //           }, 1000);
      //           clearInterval(this.timer);
      //           this.timer = null;
      //         }
      //     }
      //   })
      // },
    },
    mounted() {
        this.initMap();
    },
    beforeDestroy() {
      let _this = this;
      clearTimeout(_this.timer);

      clearInterval(_this.monitTime);

      clearInterval(_this.getGpsTime);
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
