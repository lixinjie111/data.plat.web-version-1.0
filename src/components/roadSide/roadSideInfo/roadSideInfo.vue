<template>
<div class='c-view-dialog'>
    <div class="c-scroll-wrap">
        <div class="c-scroll-inner">
            <div class="c-title-fixed">
                <h3 class="c-title">
                    实时监控<i class='el-icon-arrow-right'></i>查看路侧点信息
                    <el-page-header @back="backClick" class="c-return-btn"></el-page-header>
                </h3>
            </div>
            <div class="c-detail-lable-list clearfix c-detail-box c-wrapper-20 c-padding-20">
                <p class="c-detail-lable">
                    <span class="name">路侧点:</span>
                    <span class="value">{{roadPointName}}</span>
                </p>
            </div>
            <!-- 地图模块 -->
            <div class="c-wrapper-20 c-detail-box c-padding-20">
                <div class="c-map-big-wrapper" id='map-container-r' :class="isScaleMap ? 'c-map-on' : 'c-map-off'">
                    <span class="c-map-scale-btn" :class="isScaleMap ? 'c-map-scale-off' : 'c-map-scale-on'" @click="isScaleMap = !isScaleMap"></span>
                </div>
            </div>

            <!-- 设备基本信息 -->
            <vehicle-info-tag title="基本信息" :infoTagData="infoTagData"></vehicle-info-tag>  

            <div class="c-wrapper-20 c-detail-box">
                <p class='c-title'>绑定设备列表</p>
                <el-table
                    ref="table"
                    :data='deviceList'  
                    stripe  
                    border>
                    <el-table-column label="序号" type="index"></el-table-column>
                    <el-table-column min-width="25%" prop="deviceTypeName" label="设备类型"></el-table-column>
                    <el-table-column min-width="25%" prop="deviceId" label="设备编号"></el-table-column>
                    <el-table-column min-width="25%" prop="serialNum" label="设备序列号"></el-table-column>
                    <el-table-column min-width="25%" prop="direction" label="朝向"></el-table-column>
                </el-table>
            </div>
        </div>

    </div>

</div>

</template>
<script>
import vehicleInfoTag from '@/common/detail/vehicleInfoTag';
import {queryRoadPointInfo} from '@/api/roadSide';
import ConvertCoord from'@/common/utils/coordConvert.js';
export default {
    props:['roadPointId','rsPtId','roadPointName'],
    components:{
        vehicleInfoTag
    },
    data(){
        return{
            infoTagData:[],
            deviceList:[],
            markerPoint:[],
            isScaleMap: false,
            camDetail:{
                roadName:'',
                lat:'',
                lon:'',
            },
            infoWindow: new AMap.InfoWindow({
                offset: new AMap.Pixel(0, -33),
                anchor: 'bottom-center'
            })
        }
    },
    mounted(){
        this.markerPoint = [];
        setTimeout(() => {
            this.initMap();
        }, 0);
        this.getRoadPointDetail();
    },
    methods:{
        initMap(){
            let _scale = new AMap.Scale(),
                _toolbar = new AMap.ToolBar({
                    liteStyle: true,
                    position: 'LT'
                });
            // let _option = Object.assign({},this.$parent.$parent.$parent.defaultMapOption,{
            //     mapStyle: 'light'
            // });
            this.distanceMap = new AMap.Map('map-container-r',window.defaultMapOption);
            setTimeout(()=>{
                this.distanceMap.setMapStyle(window.defaultMapOption.mapStyle);
            },0);
            // this.distanceMap.setZoom();
            this.distanceMap.addControl(_scale);
            this.distanceMap.addControl(_toolbar);
        },
        drawStartMarker() {
            let _this = this;
            this.markerPoint.forEach((item, index) => {
                let _position = ConvertCoord.wgs84togcj02(item.lon, item.lat);
                let _marker = new AMap.Marker({
                    map: this.distanceMap,
                    position: new AMap.LngLat(_position[0],_position[1]),
                });
                _marker.content = `<div class="c-map-info-window">
                                    <p class="c-info-window-text">路侧点编号：${item.rsPtId}<p>
                                    <p class="c-info-window-text">路侧点名称：${item.roadPointName}<p>
                                </div>`;
                _marker.on('click', this.markerClick);
                _marker.emit('click', {target: _marker});
                this.distanceMap.setFitView();
            });
        },
        markerClick(e) {
            this.infoWindow.setContent(e.target.content);
            this.infoWindow.open(this.distanceMap, e.target.getPosition());
        },
        backClick(){
            this.$emit('roadInfoBack');
        },
        getRoadPointDetail(){
            queryRoadPointInfo({
                "roadPointId":this.roadPointId
            }).then(res => {
                if(res.status == '200'){
                    this.camDetail.lon = res.data.lon;
                    this.camDetail.lat = res.data.lat;
                    let _position = ConvertCoord.wgs84togcj02(res.data.lon,res.data.lat);
                    let roadPointInfo = Object.assign({},{roadPointName:this.roadPointName},{rsPtId:this.rsPtId},res.data);
                    this.distanceMap.setCenter(_position);
                    this.markerPoint.push(roadPointInfo);
                    this.drawStartMarker();
                    this.infoTagData = [
                        {
                            title:"",
                            list:[{
                                        name:"道路编号",
                                        value:res.data.rspRoadId,
                                    },
                                    {
                                        name:"道路名称",
                                        value:res.data.roadName,
                                    },
                                    {
                                        name:"经纬度",
                                        value:res.data.lon + ' , ' + res.data.lat,
                                    }
                            ]
                        },
                        {
                            title:"",
                            list:[{
                                        name:"所属行政区域",
                                        value:res.data.distName,
                                    },
                                    {
                                        name:"所属云",
                                        value:res.data.mecName,
                                    },
                                    {
                                        name:"绑定设备数",
                                        value:res.data.bindingDevCount,
                                    }
                            ],
                        }
                    ],
                    this.deviceList = res.data.deviceList;
                    this.$refs.table.bodyWrapper.scrollTop = 0;
                }
            })
        },

    },
    beforeRouteLeave(to, from, next) {
        // 设置下一个路由的 meta
        to.meta.keepAlive = false;
        next();
    }
}
</script>
<style lang="scss" scoped>
@import "@/assets/scss/theme.scss";
.base-info-top {
    font-size:16px;
    color:#666;
    padding: 0 30px;
    height: 54px;
    @include layoutMode(align);
    span {
        color: $black;
    }
}
.roadMapInfo{
    height:300px;
}
</style>
