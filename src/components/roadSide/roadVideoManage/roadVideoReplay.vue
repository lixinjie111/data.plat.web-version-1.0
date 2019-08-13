<template>
    <!-- 基本信息 -->
    <div class="c-view-dialog" v-cloak>
        <h3 class="c-title c-border-bottom">视频管理<i class='el-icon-arrow-right'></i>回放<el-page-header @back="backClick" class="c-return-btn"></el-page-header></h3>
        <div class="c-detail-box c-wrapper-20 c-padding-20">
            <div class="c-detail-lable-list clearfix">
                <p class="c-detail-lable">
                    <span class="name">摄像头编号:</span>
                    <span class="value">{{camDetail.camCode ? camDetail.camCode : '--'}}</span>
                </p>
                <p class="c-detail-lable">
                    <span class="name">摄像头序列号:</span>
                    <span class="value">{{camDetail.camId ? camDetail.camId : '--'}}</span>
                </p>
                <p class="c-detail-lable">
                    <span class="name">路侧点:</span>
                    <span class="value">{{camDetail.roadPoint ? camDetail.roadPoint : '--'}}</span>
                </p>
                <p class="c-detail-lable">
                    <span class="name">道路名称:</span>
                    <span class="value">{{camDetail.roadName ? camDetail.roadName : '--'}}</span>
                </p>
                <p class="c-detail-lable">
                    <span class="name">开始时间:</span>
                    <span class="value">{{camDetail.startTime ? camDetail.startTime : '--'}}</span>
                </p>
                <p class="c-detail-lable">
                    <span class="name">结束时间:</span>
                    <span class="value">{{camDetail.endTime ? camDetail.endTime : '--'}}</span>
                </p>  
            </div>
            <div class="c-map-video-wrapper c-mt-20">
                <div class="c-video-wrapper">
                    <video class="c-video" controls preload="auto">
                        <source :src="camDetail.videoPath" type="video/mp4">
                    </video>
                </div>
                <div class="c-map-wrapper" :class='{"c-map-change-max":changeSize}'>
                    <div class='c-map-btn c-map-btn-left' @click='mapChangeMax' v-if="!changeSize"></div>
                    <div class='c-map-btn c-map-btn-right' @click='mapChangeMin' v-else></div>
                    <div class="c-map-container" id='map-container'>
                        <!-- <ul class="c-map-info clearfix c-icon-map-info">
                            <li class='c-map-info-list speed'>路侧点名称:{{camDetail.roadName ? camDetail.roadName : ' -- '}}</li>
                            <li class='c-map-info-list lonlat'>经纬度:{{camDetail.lon ? camDetail.lon : ' -- '}},{{camDetail.lat ? camDetail.lat : ' -- '}}</li>
                        </ul> -->
                    </div>
                </div>
            </div>
        </div>
    </div>
    </template>
    <script>
    import {queryRoadCamCoordinate} from '@/api/roadSide'
    import ConvertCoord from'@/common/utils/coordConvert.js';
    export default {
        name:'RoadVideoReplay',
        components:{
        },
        data(){
            return{
                changeSize:false,
                roadReplay:'',
                isMaskShow:false,
                camDetail:{
                    lon:'--',
                    lat:'--',
                    camId:'--',
                    camCode:'--',
                    roadPoint:'--',
                    roadName:'--',
                    startTime:'--',
                    endTime:'--',
                    videoPath:'',
                },
                markerPoint:[],
                infoWindow: new AMap.InfoWindow({
                    offset: new AMap.Pixel(0, -33),
                    anchor: 'bottom-center'
                })
            }
        },
        methods:{
            init(){
                let videoInfo = JSON.parse(localStorage.getItem('videoInfo'));
                // this.camDetail = Object.assign({
                //     videoPath: videoInfo.destPath + '.mp4'
                // }, videoInfo, this.camDetail);
                this.camDetail.camId = videoInfo.camId;
                this.camDetail.camCode = videoInfo.camCode;
                this.camDetail.roadName = videoInfo.roadName;
                this.camDetail.startTime = videoInfo.startTime;
                this.camDetail.endTime = videoInfo.endTime;
                this.camDetail.roadPoint = videoInfo.roadPointName;
                this.camDetail.videoPath = videoInfo.destPath + '.mp4';
                this.mapDetail(videoInfo.camCode);
            },
            initMap(){
                this.distanceMap = new AMap.Map('map-container', this.$parent.$parent.$parent.$parent.defaultMapOption);
            },
            backClick(){
                this.$emit('backRoadManage');
            },
            mapChangeMax(){
                this.changeSize = true;
            },
            mapChangeMin(){
                this.changeSize = false;
            },
            drawStartMarker() {
                let _this = this;
                this.markerPoint.forEach((item, index) => {
                    let _position = ConvertCoord.wgs84togcj02(item.lon, item.lat);
                    let _marker = new AMap.Marker({
                        map: this.distanceMap,
                        position: new AMap.LngLat(_position[0], _position[1]),
                    });
                    _marker.content = `<div class="c-map-info-window">
                                        <p class="c-info-window-text">路侧点名称：${item.roadPoint}<p>
                                        <p class="c-info-window-text">经纬度：${item.lon},${item.lat}<p>
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
            mapDetail(deviceId){
                queryRoadCamCoordinate({  
                    'deviceId': deviceId          
                }).then(res => {
                    if(res.status == '200'){
                        let {ptLon,ptLat} = res.data;
                        if(ptLon == undefined){
                            this.camDetail.lon = '--';
                        }else{
                            this.camDetail.lon = ptLon;
                            this.camDetail.lat = ptLat;
                        }
                        if(ptLat == undefined){
                            this.camDetail.lat = '--';
                        }else{
                            this.camDetail.lon = ptLon;
                            this.camDetail.lat = ptLat;
                            let _position = ConvertCoord.wgs84togcj02(ptLon,ptLat);
                            this.distanceMap.setCenter(_position);
                            this.markerPoint.push(this.camDetail);
                            this.drawStartMarker();
                        }
                    }
                })
            },
            
        },
        mounted(){
            this.init();
            this.initMap();
        }
    }
    </script>
    <style>
    .ol-popup {
        position: absolute;
        background-color: white;
        -webkit-filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
        filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
        padding: 15px;
        border-radius: 10px;
        border: 1px solid #cccccc;
        bottom: 12px !important;
        left: 0 !important;
        min-width: 208px !important;
    }
    .show-map {
        display:block;
        animation: am-show-map 1s ease-in;
        -webkit-animation: am-show-map 0.2s ease-in;
    }
    @media screen and (min-width: 950px) and (max-width:1240px){
        .endTimeW{
           width:100px;
        }
    }

    @media screen and (max-width: 1250px){
        .endTimeW{
           width:auto;
        }
    }

    </style>
