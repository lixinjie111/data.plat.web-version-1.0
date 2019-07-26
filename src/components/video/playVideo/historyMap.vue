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
import ConvertCoord from'@/common/utils/coordConvert.js';
import TusvnMap from "../../../common/view/TusvnMap/TusvnMap.vue";

export default {
    name: 'MapMap',
    components: {
        TusvnMap
    },
    data(){
        return {
            vehicleId:'',
            monitTime:'',
            monitStartTime:'',
            speed:'',
            courseAngle:'',
            lon:'',
            lat:'',
            gpsTime:'',
            getGpsTime:null,
            zoom:11,
            markers:{
                maskCar:null,
                polyline:[]
            },
            pointList:[],
            vehicleInfo:{
                speed:'',
                courseAngle:'',
                lon:'',
                lat:'',
                gpsTime:'',
            },
        }
    },
    methods: {
        initMap(){
            this.distanceMap = new AMap.Map('map-container', {
                resizeEnable: true, //是否监控地图容器尺寸变化
                zoom:this.zoom, //初始化地图层级
                center: [121.262939,31.245149], //初始化地图中心点
                mapStyle:'amap://styles/3312a5b0f7d3e828edc4b2f523ba76d8',
            });
            this.distanceMapLine();
        },
        getGps(gpsArr,newArr,curTime){
            let _this = this;
            if(gpsArr == [] || gpsArr == null || gpsArr.length < 1){//判断有无返回值,否则会导致地图定位不准，显示为空白
                return;
            }
            else{
                let _position = ConvertCoord.wgs84togcj02(gpsArr.lon,gpsArr.lat);
                if(!this.markers.maskCar) {
                    this.markers.maskCar = new AMap.Marker({
                        position:  _position,   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
                        icon:'static/images/vehicle/car-white.png',
                    });
                    this.distanceMap.add(this.markers.maskCar);
                    this.distanceMap.setZoom(14);
                }else {
                    this.markers.maskCar.setPosition(_position);
                    this.markers.maskCar.setAngle(gpsArr.courseAngle);
                }
                
                this.vehicleInfo.speed = Number(gpsArr.speed).toFixed(2);//获取速度
                this.vehicleInfo.courseAngle = Number(gpsArr.courseAngle).toFixed(4);//获取航向角
                this.vehicleInfo.lon = Number(gpsArr.lon).toFixed(8);//获取经度
                this.vehicleInfo.lat = Number(gpsArr.lat).toFixed(8);//获取纬度
                this.vehicleInfo.gpsTime = gpsArr.gpsTime;//获取时间
                this.distanceMap.setCenter(_position);
                this.markers.maskCar.setPosition(_position);
                this.markers.maskCar.setAngle(gpsArr.courseAngle);
                this.pointList.push(_position);
                this.distanceMapLine();
            }
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
    },
    mounted(){
        this.initMap();
    },
    beforeDestroy(){
        let _this = this;
        clearInterval(_this.getGpsTime);
    },
}
</script>

<style>
.colGrap{
    color:#666;
}
.yk-search-block.ml5{
  margin-left:8px;
}
.yk-search-block span.yellow{
    background:rgb(255,255,25);
    padding:5px;
}
.yk-btn.yk-btn2{
    width:70px;
    height:28px;
    line-height:28px;
}
</style>
<style scoped lang="scss">
@import "@/assets/scss/theme.scss";
.history-map-warpper{
  width: 100%;
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
        padding-left:28px;
            span {
                display: inline-block;
                vertical-align: middle;
            }
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
</style>
