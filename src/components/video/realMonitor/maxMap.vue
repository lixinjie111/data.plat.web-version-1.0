<template>
  <!-- 基本信息 -->
  <div class="max-map-warpper">
    <template v-show="!map3dShow">
      <tusvn-map @MapInitComplete="mapComplete"
                 @ViewLevelChange=ViewLevelChange
                 @ExtentChange=ExtentChange
                 ref="refRealMap" targetId="mec3" overlayContainerId="mec4" :isMasker='false'
                 :isCircle='false'></tusvn-map>
      <span v-show='isFd' class="zoom-btn fd" @click="fd">+</span>
      <span v-show='isSx' class="zoom-btn sx" @click="sx">-</span>
      <ul>
        <li>
          <i class='icon speed'></i>
          <span>{{speed ? (speed+'km/h') : ' -- '}}</span>
        </li>
        <li>
          <i class='icon angle'></i>
          <span>{{courseAngle ? (courseAngle+'度') : ' -- '}}</span>
        </li>
        <li>
          <i class='icon position'></i>
          <span>{{lon ? lon : ' -- '}},{{lat ? lat : ' -- '}}</span>
        </li>
        <li>
          <i class='icon time'></i>
          <span>{{gpsTime ? gpsTime : ' -- '}}</span>
        </li>
      </ul>
    </template>
    <div v-show="map3dShow">
      <!-- <map3-d ref="map3d" @back2D=back2D></map3-d> -->
    </div>

  </div>
</template>
<script>
  import TusvnMap from "@/common/view/TusvnMap/TusvnMap.vue";
  import Map3D from "@/common/view/map3D/map3D.vue";
  import {setInterval, clearInterval} from 'timers';

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
        isEnd:true
      }
    },
    methods: {
      back2D(){
        this.$refs.refRealMap.zoomTo(10);
        this.map3dShow=false;
        // this.$refs.refRealMap.resize([990, 400]);
      },
      ExtentChange(obj, extent) {
        this.mapExtent = extent;
        this.mapConvert();
      },
      ViewLevelChange(obj, z) {
        this.mapLevel=z;
        this.mapConvert();
      },
      getGps(vehicleId, time, deviceType) {
        let _this = this;
        _this.$api.post('dataPlatApp/vehicle/gpsInfo', {
          'vehicleId': vehicleId, 'type': deviceType, 'time': time,
        }, response => {
          if (response.data.code == '200') {
            if (response.data.data != '') {
              _this.speed = (response.data.data.speed).toFixed(2);//获取速度
              _this.courseAngle = (response.data.data.courseAngle).toFixed(4);//获取航向角
              _this.lon = (response.data.data.lon).toFixed(8);//获取经度
              _this.lat = (response.data.data.lat).toFixed(8);//获取纬度
              _this.gpsTime = response.data.data.gpsTime;//获取时间

              let mapSize = _this.$refs.refRealMap.getCurrentExtent();//获取地图的范围
              let minX = mapSize[0];
              let minY = mapSize[1];
              let maxX = mapSize[2];
              let maxY = mapSize[3];
              //路线所在层
              // _this.$refs.refRealMap.addVectorLayer('CarLine');
              // 车辆所在的层
              // _this.$refs.refRealMap.addVectorLayer("CarLayer");
              //当小车的行驶轨迹超出地图范围，就重新定位地图
              // if(!_this.$refs.refRealMap2.isInDivPolygon(_this.lon,_this.lat))
              // {
              //     _this.$refs.refRealMap2.centerAt(_this.lon,_this.lat);
              // }

              _this.$refs.refRealMap.centerAt(_this.lon, _this.lat);//定位小车始终在地图中间位置
              // 画车的行驶路线
              var p1 = [];

              if (_this.lon && _this.lat) {
                p1.push(parseFloat(_this.lon), parseFloat(_this.lat));
              }
              _this.lineArray.push(p1);
              // coordinates, id, color, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, width, layerId
              
              _this.$refs.refRealMap.addLineString(_this.lineArray, 'line_01', '#093bbb', 'round', 'round', [5, 0], 0, 10, 5, "CarLine");
              // lon,lat,id,layerId,carImgUrl,size,rotation,rotateWithView,opacity,offset
              //  添加小车
              _this.$refs.refRealMap.addImg(_this.lon, _this.lat, "car_01", "CarLayer", 'static/images/vehicle/geolocation_marker_heading.png', [24, 49], (_this.courseAngle / 180) * Math.PI, null, null, null);//部署路径
              // _this.$refs.refRealMap.addImg(_this.lon,_this.lat,"car_01","CarLayer",'../../../static/images/vehicle/geolocation_marker_heading.png',[24,49],(_this.courseAngle/180)*Math.PI,null,null,null);

              // 地图旋转
              _this.$refs.refRealMap.rotateMap(-(_this.courseAngle / 180.0) * Math.PI);
            } else {
              this.speed = '--';//获取速度
              this.courseAngle = '--';//获取航向角
              this.lon = '--';//获取经度
              this.lat = '--';//获取纬度
              this.gpsTime = '--';//获取时间

              this.timer = setInterval(function () {
                this.$message.error('暂无GPS数据!');
                return;
              }, 1000);
              clearInterval(this.timer);
              this.timer = null;
            }
          }
        });
      },
      fd() {
        this.isFd = false;
        this.isSx = true;
        this.$emit('changeMax');
        this.$refs.refRealMap.pageResize();
        // this.$refs.refRealMap.zoomTo(17);
        // this.$refs.refRealMap.resize([990, 400]);

      },
      //判断是否进入3D地图，地图最大化，地图级别15级，地图范围
      mapConvert() {
        if (this.mapExtent == null || this.mapLevel==null){
          return;
        }
        let minX = this.mapExtent[0];
        let minY = this.mapExtent[1];
        let maxX = this.mapExtent[2];
        let maxY = this.mapExtent[3];

        //当前3D地图可视化区域
        let map_3d_minX = 120.767621;
        let map_3d_minY = 31.286300;
        let map_3d_maxX = 120.772980;
        let map_3d_maxY = 31.288593;
        // this.$refs.refRealMap.centerAt(map_3d_minX, map_3d_minY);

        //判断范围，两个矩形相交
        //获取外包矩形宽度、高度
        let width_minX = map_3d_minX > minX ? minX : map_3d_minX;
        let width_maxX = map_3d_maxX > maxX ? map_3d_maxX : maxX;
        let height_minY = map_3d_minY > minY ? minY : map_3d_minY;
        let height_maxY = map_3d_maxY > maxY ? map_3d_maxY : maxY;
        let width = width_maxX - width_minX;
        let height = height_maxY - height_minY;
        //两矩形宽度和>外包矩形宽度 且两矩形高度和>外包矩形高度，则两矩形相交
        let flag = false;

        if (width <= maxX - minX + map_3d_maxX - map_3d_minX && height <= maxY - minY + map_3d_maxY - map_3d_minY) {
          flag = true
        }
        let level = this.mapLevel;//获取当前地图级别

        if (flag == true && level > 15) {
          //进入3D地图
          this.$refs.map3d.initCamera();
          this.map3dShow=true;
        }
      },
      sx() {
        this.isFd = true;
        this.isSx = false;
        this.$emit('changeMin');
        this.$refs.refRealMap.pageResize();
        // this.$refs.refRealMap.zoomTo(17);
        // this.$refs.refRealMap.resize([390, 400]);
      },
      mapComplete: function (map) {
        this.$refs.refRealMap.zoomTo(17);
        // 路线所在层
        this.$refs.refRealMap.addVectorLayer('CarLine');
        // 车辆所在的层
        this.$refs.refRealMap.addVectorLayer("CarLayer");
      },
      removeOverLays(){
        this.$refs.refRealMap.removeFeature('line_01','CarLine');
        this.$refs.refRealMap.removeFeature('car_01',"CarLayer");
      },
      removeGpsInfo(){
        this.speed = '';
        this.courseAngle = '';
        this.lon = '';
        this.lat = '';
        this.gpsTime = '';
      },
      removeLineArray(){
        this.lineArray = [];
      }
    },
    mounted() {

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
