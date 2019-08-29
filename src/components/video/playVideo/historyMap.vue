<template>
<div class="c-map-container" id='map-container'>
    <div class="c-video-mask" v-if='isMaskShow'>无轨迹数据</div>
    <ul class="c-map-info clearfix c-icon-map-info">
        <li class='c-map-info-list speed'>车速:{{vehicleInfo.speed ? (vehicleInfo.speed+'km/h') : ' -- '}}</li>
        <li class='c-map-info-list angle'>航向角:{{vehicleInfo.courseAngle ? (vehicleInfo.courseAngle+'度') : ' -- '}}</li>
        <li class='c-map-info-list lonlat'>经纬度:{{vehicleInfo.lon ? vehicleInfo.lon : ' -- '}},{{vehicleInfo.lat ? vehicleInfo.lat : ' -- '}}</li>
        <li class='c-map-info-list time'>时间:{{vehicleInfo.gpsTime ? vehicleInfo.gpsTime : ' -- '}}</li>
    </ul>
</div>
</template>
<script>
import ConvertCoord from'@/common/utils/coordConvert.js';
export default {
    name: 'MapMap',
    components: {
    },
    data(){
        return {
            isMaskShow:false,
            getGpsTime:null,
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
            this.distanceMap = new AMap.Map('map-container', window.defaultMapOption);
            this.distanceMapLine();
        },
        getGps(gpsArr,newArr,curTime){
            if(gpsArr == undefined){
                let oBtn = document.querySelector('.c-map-btn-left');
                oBtn.style.display = 'none';
                this.isMaskShow = true;
            }else{
                let _this = this;
                let oBtn = document.querySelector('.c-map-btn-left');
                oBtn.style.display = 'block';
                if(gpsArr == [] || gpsArr == null || gpsArr.length < 1){//判断有无返回值,否则会导致地图定位不准，显示为空白
                    return;
                }
                else{
                    let _position = ConvertCoord.wgs84togcj02(gpsArr.lon,gpsArr.lat);
                    if(!this.markers.maskCar) {
                        this.markers.maskCar = new AMap.Marker({
                            angle: gpsArr.courseAngle,
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
                    this.distanceMap.setCenter(_position);//定位地图中心点
                    this.distanceMap.setRotation(-gpsArr.courseAngle);//地图旋转
                    this.markers.maskCar.setPosition(_position);
                    this.markers.maskCar.setAngle(gpsArr.courseAngle);
                    this.pointList.push(_position);
                    this.distanceMapLine();
                }
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
