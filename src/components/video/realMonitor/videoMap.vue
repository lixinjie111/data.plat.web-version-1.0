<template>
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
  import { setInterval } from 'timers';
  import ConvertCoord from'@/common/utils/coordConvert.js';
  export default {
    name: 'VideoMap',
    components: {
      
    },
    data() {
      return {
        distanceMap:{},
        vehicleInfo:{
          speed: '',
          courseAngle: '',
          lon: '',
          lat: '',
          gpsTime: '',
        },
        timer:null
      }
    },
    methods: {
        getGps(vehicleId, time, deviceType) {
            gpsInfo({
              'vehicleId': vehicleId, 'type': deviceType, 'time': time,
              }).then(res => {
                if(res.status == '200'){
                      this.vehicleInfo.speed = Number(res.data.speed).toFixed(2);//获取速度
                      this.vehicleInfo.courseAngle = Number(res.data.courseAngle).toFixed(4);//获取航向角
                      this.vehicleInfo.lon = Number(res.data.lon).toFixed(8);//获取经度
                      this.vehicleInfo.lat = Number(res.data.lat).toFixed(8);//获取纬度
                      this.vehicleInfo.gpsTime = res.data.gpsTime;//获取时间
                      let _position = ConvertCoord.wgs84togcj02(res.data.lon,res.data.lat);
                      this.distanceMap.setCenter(_position);
                }
              })
          
        },
    },
    mounted() {
      this.distanceMap = new AMap.Map('map-container', {
          resizeEnable: true, //是否监控地图容器尺寸变化
          zoom:11, //初始化地图层级
          center: [121.262939,31.245149], //初始化地图中心点
          mapStyle:'amap://styles/3312a5b0f7d3e828edc4b2f523ba76d8',
      });
      setTimeout(()=>{
          this.distanceMap.setMapStyle(window.defaultMapOption.mapStyle);
      },0);
      this.getGps('B21E-00-017',1563866127715,2);
    },
    beforeDestroy() {
    },
  }
</script>
