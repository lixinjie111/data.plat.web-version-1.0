<template>
    <!-- 基本信息 -->
    <div class="c-view-dialog" v-cloak>
        <h3 class="c-title c-border-bottom">视频管理 > 回放<el-page-header @back="backClick" class="c-return-btn"></el-page-header></h3>
        <div class="c-wrapper-20 c-detail-box c-padding-20">
            <el-form ref="form" size="small" :inline="true">
                <el-form-item label="摄像头编号:">
                    {{camDetail.camCode ? camDetail.camCode : '--'}}
                </el-form-item>
                <el-form-item label="摄像头序列号:">
                    {{camDetail.camId ? camDetail.camId : '--'}}
                </el-form-item>
                <el-form-item label="路侧点: ">
                    {{camDetail.roadPoint ? camDetail.roadPoint : '--'}}
                </el-form-item>
                <el-form-item label="道路名称: ">
                    {{camDetail.roadName ? camDetail.roadName : '--'}}
                </el-form-item>
                <el-form-item label="开始时间: ">
                    {{camDetail.startTime ? camDetail.startTime : '--'}}
                </el-form-item>
                <el-form-item label="结束时间: ">
                    {{camDetail.endTime ? camDetail.endTime : '--'}}
                </el-form-item>
            </el-form>
            <div class="c-map-video-wrapper">
                <div class="c-video-wrapper">
                    <div class="c-video">
                        <video ref='myVideo' controls preload="auto">
                            <source :src="camDetail.videoPath" type="video/mp4">
                        </video>
                    </div>
                    <div class="right-mask" v-show='isMaskShow'></div>
                </div>
                <!-- <div class="c-map-wrapper" :class='{"c-map-change-max":changeSize}'>
                    <div class='c-map-btn c-map-btn-left' @click='mapChangeMax' v-if="!changeSize"></div>
                    <div class='c-map-btn c-map-btn-right' @click='mapChangeMin' v-else></div>
                    <div class="c-map-container" id='map-container'>
                        <ul class="c-map-info clearfix c-icon-map-info">
                            <li class='c-map-info-list speed'>摄像头编号:{{camDetail.camCode ? camDetail.camCode : ' -- '}}</li>
                            <li class='c-map-info-list angle'>道路名称:{{camDetail.roadName ? camDetail.roadName : ' -- '}}</li>
                            <li class='c-map-info-list lonlat'>经纬度:{{camDetail.lon ? camDetail.lon : ' -- '}},{{camDetail.lat ? camDetail.lat : ' -- '}}</li>
                        </ul>
                    </div>
                </div> -->
            </div>
        </div>
            <!-- <div class='roadReplay c-mt-10'>
                <div class='video-box-replay'>
                    <video id="my-video" class="video-replay-js vjs-big-play-centered" ref='myVideo' controls preload="auto">
                        <source :src="videoPath" type="video/mp4">
                    </video>
                </div>
                <div class='right-replay-box'>
                    <div class='map-bar-in btn-left' @click='showMap'></div>
                    <div class='map-lay' :class='{"show-map":isSlideOut == true}'>
                        <div class='map-bar btn-right' @click='hideMap'></div>
                            <tusvn-map ref="perceMap" targetId="mec9" overlayContainerId="mec10" :isMasker='false' :isCircle='false'></tusvn-map>
                        </div>
                    </div>
                </div>
            </div> -->
    </div>
    </template>
    <script>
    import {queryRoadCamCoordinate} from '@/api/roadSide'
    import TusvnMap from "../../../common/view/TusvnMap/TusvnMap.vue";
    export default {
        name:'RoadVideoReplay',
        components:{
            TusvnMap
        },
        data(){
            return{
                changeSize:false,
                roadReplay:'',
                isSlideIn:false,
                isSlideOut:false,
                isMaskShow:false,
                id:'0021',
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
                
                
            }
        },
        methods:{
            init(){
                this.distanceMap = new AMap.Map('map-container', {
                    resizeEnable: true, //是否监控地图容器尺寸变化
                    zoom: this.zoom, //初始化地图层级
                    rotateEnable: true,
                    mapStyle:'amap://styles/3312a5b0f7d3e828edc4b2f523ba76d8',
                });
                let videoInfo = JSON.parse(localStorage.getItem('videoInfo'));
                this.camDetail.camId = videoInfo.camId;
                this.camDetail.camCode = videoInfo.camCode;
                this.camDetail.roadName = videoInfo.roadName;
                this.camDetail.startTime = videoInfo.startTime;
                this.camDetail.endTime = videoInfo.endTime;
                this.camDetail.roadPoint = videoInfo.roadPointName;
                this.camDetail.videoPath = videoInfo.destPath + '.mp4';
                this.mapDetail(videoInfo.camCode);
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
                        }
                    }
                })
            }
        },
        mounted(){
            this.init();
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
