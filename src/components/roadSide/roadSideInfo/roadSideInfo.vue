<template>
<div class='c-view-dialog'>
    <div class="c-scroll-wrap">
        <div class="c-scroll-inner">
            <h3 class="c-title">
                查看路侧点信息
                <el-page-header @back="backClick" class="c-return-btn"></el-page-header>
            </h3>
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
                    <ul class="c-map-view-info">
                        <li class="list">
                            <span class="name">道路名称</span>
                            <em class="value">{{roadPointName ? roadPointName : ' -- '}}</em>
                        </li>
                        <li class="list">
                            <span class="name">经纬度</span>
                            <em class="value">{{camDetail.lon ? camDetail.lon : ' -- '}},{{camDetail.lat ? camDetail.lat : ' -- '}}</em>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- 设备基本信息 -->
            <vehicle-info-tag title="基本信息" :infoTagData="infoTagData"></vehicle-info-tag>  

            <div class="c-wrapper-20 c-detail-box">
                <p class='c-title'>绑定设备列表</p>
                <el-table
                    :data='deviceList'  
                    stripe  
                    border>
                    <el-table-column label="序号" type="index"></el-table-column>
                    <el-table-column min-width="18%" prop="deviceId" label="设备类型"></el-table-column>
                    <el-table-column min-width="6%" prop="roadName" label="设备ID"></el-table-column>
                    <el-table-column min-width="16%" prop="serialNum" label="设备序列号"></el-table-column>
                    <el-table-column min-width="10%" prop="direction" label="朝向"></el-table-column>
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
    props:['roadPointId','roadPointName'],
    components:{
        vehicleInfoTag
    },
    data(){
        return{
            infoTagData:[],
            deviceList:[],
            isScaleMap: false,
            camDetail:{
                roadName:'',
                lat:'',
                lon:'',
            }
            
        }
    },
    mounted(){
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
            this.distanceMap = new AMap.Map('map-container-r',this.$parent.$parent.$parent.defaultMapOption);
            // this.distanceMap.setZoom();
            this.distanceMap.addControl(_scale);
            this.distanceMap.addControl(_toolbar);
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
                    this.distanceMap.setCenter(_position);
                    this.infoTagData = [
                        {
                            title:"",
                            list:[{
                                        name:"道路ID",
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
                                        name:"所属MEC",
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
                }
            })
        },

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
