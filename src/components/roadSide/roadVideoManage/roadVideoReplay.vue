<template>
    <!-- 基本信息 -->
    <div v-cloak>
        <p class="c-title c-border-bottom">历史回放<el-page-header @back="backClick" class="c-return-btn"></el-page-header></p>
        <div class="yk-search-box c-mt-30">
            <div class="yk-search-block yk-block-label">
                <label>摄像头编号:</label>
                <span>{{camCode}}</span>
            </div>

            <div class="yk-search-block yk-block-label">
                <label class="yk-w-100">摄像头序列号:</label>
                <span>{{camId}}</span>
            </div>

            <div class="yk-search-block yk-block-label">
                <label class="yk-w-100">路侧点: </label>
                <span>{{roadPoint}}</span>
            </div>

            <div class="yk-search-block yk-block-label">
                <label class="yk-w-100 corl6">道路名称: </label>
                <span>{{roadName}}</span>
            </div>

            <div class="yk-search-block yk-block-label">
                <label class="yk-w-100 corl6">开始时间: </label>
                <span>{{startTime}}</span>
            </div>

            <div class="yk-search-block yk-block-label">
                <label class="endTimeW corl6">结束时间: </label>
                <span>{{endTime}}</span>
            </div>
        </div>
        <div class='roadReplay c-mt-10'>
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
    </div>
    </template>
    <script>
    import {queryRoadCameraDetailsByDeviceId} from '@/api/roadSide'
    import TusvnMap from "../../../common/view/TusvnMap/TusvnMap.vue";
    export default {
        name:'RoadVideoReplay',
        components:{
            TusvnMap
        },
        data(){
            return{
                videoPath:'',
                roadReplay:'',
                isSlideIn:false,
                isSlideOut:false,
                id:'0021',
                lon:'--',
                lat:'--',
                camId:'--',
                camCode:'--',
                roadPoint:'--',
                roadName:'--',
                startTime:'--',
                endTime:'--'
            }
        },
        methods:{
            init(){
                let videoInfo = JSON.parse(localStorage.getItem('videoInfo'));
                this.camId = videoInfo.camId;
                this.camCode = videoInfo.camCode;
                this.roadName = videoInfo.roadName;
                // this.lon = videoInfo.ptLon == undefined ? '--' : videoInfo.ptLon;
                // this.lat = videoInfo.ptLat == undefined ? '--' : videoInfo.ptLat;
                this.startTime = videoInfo.startTime;
                this.endTime = videoInfo.endTime;
                this.roadPoint = videoInfo.roadPointName;
                this.videoPath = videoInfo.destPath + '.mp4';
                this.mapDetail(videoInfo.camCode);
            },
            backClick(){
                this.$emit('backRoadManage');
            },
            showMapBar(){
                this.isSlideIn = true;
            },
            hideMapBar(){
                this.isSlideIn = false;
            },
            showMap(){
                this.isSlideIn = false;
                this.isSlideOut = true;
                this.$refs.perceMap.resize([300,500]);
                let _this = this;
                let slideTime = setInterval(() => {
                    let layHtml = `<div class='mapPop'><ul><li>摄像头:${_this.camId}</li><li>道路名称:${this.roadName}</li><li>经纬度:${this.lon},${this.lat}</li></ul></div>`;
                    _this.$refs.perceMap.addInfoWindow({
                        id:"0021",
                        content:layHtml,
                        lon:_this.lon,
                        lat:_this.lat
                    });
                    clearInterval(slideTime);
                },100);
            },
            hideMap(){
                this.isSlideOut = false;
            },
            mapDetail(deviceId){
                queryRoadCameraDetailsByDeviceId({  
                    'deviceId': deviceId          
                }).then(res => {
                    if(res.status == '200'){
                        let {ptLon,ptLat} = res.data;
                        if(ptLon == undefined){
                            this.lon = '--';
                        }else{
                            this.lon = ptLon;
                            this.lat = ptLat;
                        }
                        if(ptLat == undefined){
                            this.lat = '--';
                        }else{
                            this.lon = ptLon;
                            this.lat = ptLat;
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
    /* #my-video_html5_api{
        width:980px;
        height:500px;
    } */
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
