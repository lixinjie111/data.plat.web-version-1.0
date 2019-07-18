<template>
    <!-- 基本信息 -->
<div class='history-map-warpper'>
    <tusvn-map ref="refRealMap2" @MapInitComplete="mapComplete" targetId="mec5" overlayContainerId="mec6" :isMasker='false' :isCircle='false'></tusvn-map>
    <span v-show='isFd' class="zoom-btn fd" @click="fd">+</span>
    <span v-show='isSx' class="zoom-btn sx" @click="sx">-</span>
    <ul>
        <li class='icon speed'>
            <span>{{speed ? (speed+'km/h') : ' -- '}}</span>
        </li>
        <li class='icon angle'>
            <span>{{courseAngle ? (courseAngle+'度') : ' -- '}}</span>
        </li>
        <li class='icon position'>
            <span>{{lon ? lon : ' - '}},{{lat ? lat : ' - '}}</span>
        </li>
        <li class='icon time'>
            <span>{{gpsTime ? gpsTime : ' -- '}}</span>
        </li>
    </ul>
</div>

</template>
<script>
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
            isFd:true,
            isSx:false,
            getGpsTime:null,
            lineArray:[],
            lineArray2:[],
        }
    },
    methods: {
        getGps(gpsArr,newArr,curTime){
            let _this = this;

            if(gpsArr == [] || gpsArr == null || gpsArr.length < 1){//判断有无返回值,否则会导致地图定位不准，显示为空白
                return;
            }
            else{
                _this.speed = Number(gpsArr.speed).toFixed(2);//获取速度
                _this.courseAngle = Number(gpsArr.courseAngle).toFixed(4);//获取航向角
                _this.lon = Number(gpsArr.lon).toFixed(8);//获取经度
                _this.lat = Number(gpsArr.lat).toFixed(8);//获取纬度
                _this.gpsTime = gpsArr.gpsTime;//获取时间
                // lon,lat,id,layerId,carImgUrl,size,rotation,rotateWithView,opacity,offset
                //  添加小车
                _this.$refs.refRealMap2.addImg(_this.lon,_this.lat,"car_01","CarLayer",'static/images/vehicle/geolocation_marker_heading.png',[24,49],(_this.courseAngle/180)*Math.PI,null,null,null);//部署路径
                // _this.$refs.refRealMap2.addImg(_this.lon,_this.lat,"car_01","CarLayer",'../../../static/images/vehicle/geolocation_marker_heading.png',[24,49],(_this.courseAngle/180)*Math.PI,null,null,null);
        
                let mapSize = _this.$refs.refRealMap2.getCurrentExtent();
                let minX = mapSize[0];
                let minY = mapSize[1];
                let maxX = mapSize[2];
                let maxY = mapSize[3];
                
                //当小车的行驶轨迹超出地图范围，就重新定位地图
                // if(_this.lon<minX || _this.lat<minY || _this.lon>maxX || _this.lat>maxY){
                //         _this.$refs.refRealMap2.centerAt(_this.lon,_this.lat);
                        
                // }
                if(newArr == '0'){//点击播放器进度条,重新绘制车辆轨迹
                    var p2 = [];
                    // _this.lineArray = [];
                    if(_this.lon && _this.lat){
                        p2.push(parseFloat(_this.lon),parseFloat(_this.lat));
                    }
                    _this.lineArray.push(p2);
                    _this.lineArray2 = [];
                    _this.lineArray = _this.lineArray.slice(0,curTime);//修改原画线的数组,只保留从0到当前时间的数据
                    _this.lineArray2 = _this.lineArray2.concat(_this.lineArray);;
                    
                    // let newLineArray = _this.lineArray.concat(_this.lineArray2);
                    _this.$refs.refRealMap2.addLineString(_this.lineArray2,'line_02','#093bbb','round','round',[5,0],0,10,5,"CarLine2");
                }else{
                    var p1 = [];
                    if(_this.lon && _this.lat){
                        p1.push(parseFloat(_this.lon),parseFloat(_this.lat));
                    }
                    _this.lineArray.push(p1);
                    // coordinates, id, color, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, width, layerId
                    _this.$refs.refRealMap2.addLineString(_this.lineArray,'line_01','#093bbb','round','round',[5,0],0,10,5,"CarLine");
                }
                
                _this.$refs.refRealMap2.centerAt(_this.lon,_this.lat);//定位小车始终在地图中间位置
                // 地图旋转
                _this.$refs.refRealMap2.rotateMap(-(_this.courseAngle/180.0)*Math.PI); 
            
                
            }
        },
        fd(){
            this.isFd = false;
            this.isSx = true;
            this.$emit('changeMax');
            this.$refs.refRealMap2.resize([990,400]);
        },
        sx(){
            this.isFd = true;
            this.isSx = false;
            this.$emit('changeMin');
            this.$refs.refRealMap2.resize([390,400]);
        },
        mapComplete(){
            //回放路线所在层
            this.$refs.refRealMap2.addVectorLayer('CarLine2');
            // 车辆所在的层
            this.$refs.refRealMap2.addVectorLayer("CarLayer");
        }
    },
    mounted(){
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
