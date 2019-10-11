<template>
    <!-- 基本信息 -->
    <div class="c-view-dialog" v-cloak>
        <div class="c-title-fixed">
            <h3 class="c-title c-border-bottom">视频管理<i class='el-icon-arrow-right'></i>回放<el-page-header @back="backClick" class="c-return-btn"></el-page-header></h3>
        </div>
        <div class="c-wrapper-20 c-detail-box c-padding-20">
            <div class="c-detail-lable-list clearfix">
                <p class="c-detail-lable">
                    <span class="name">车牌号:</span>
                    <span class="value">{{plateNo ? plateNo : '--'}}</span>
                </p>
                <p class="c-detail-lable">
                    <span class="name">车辆编号:</span>
                    <span class="value">{{vehicleId ? vehicleId : '--'}}</span>
                </p>
                <p class="c-detail-lable">
                    <span class="name">摄像头编号:</span>
                    <span class="value">{{serialNum ? serialNum : '--'}}</span>
                </p>
                <p class="c-detail-lable">
                    <span class="name">摄像头朝向:</span>
                    <span class="value">{{position ? position : '--'}}</span>
                </p>
                <p class="c-detail-lable">
                    <span class="name">状态:</span>
                    <span class="value">{{camStatus ? camStatus : '--'}}</span>
                </p>
            </div>
            <!-- 地图视频模块 -->
            <div class="c-map-video-wrapper c-mt-20">
                <div class="c-video-wrapper">
                    <div class="c-video">
                        <video-player 
                            :requestVideoUrl="videoPath"
                            :autoplay="false"
                            @videoLoadCompleted="videoLoadCompleted"
                            @videoTimeupdate="videoProcess">
                        </video-player>
                        <!-- <video id="my-video" class="video-js vjs-big-play-centered" ref='myVideo' :src="videoPath" controls preload="auto" @timeupdate="videoProcess">
                            <source :src="videoPath" type="video/mp4">
                        </video> -->
                    </div>
                </div>
                <div class="c-map-wrapper" :class='{"c-map-change-max":changeSize}'>
                    <div class='c-map-btn c-map-btn-left' @click='mapChangeMax' v-if="!changeSize"></div>
                    <div class='c-map-btn c-map-btn-right' @click='mapChangeMin' v-else></div>
                    <history-map ref='historyMap'></history-map>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
// 视频插件
import VideoPlayer from '@/common/videoPlayer/template'
import HistoryMap from './historyMap.vue';
import {queryDeviceType,historyGpsInfo} from '@/api/video';
export default {
    name: 'RealMonitor',
    props: ['title','type','data'],
    components: {
        HistoryMap,
        VideoPlayer
    },
    data(){
        return {
            changeSize:false,
            myPlayer:'',
            curTime:'',
            deviceType:'',
            vehicleId:'',
            position:'',
            plateNo:'',
            serialNum:'',
            camStatus:'',
            speed:'',
            courseAngle:'',
            lot:'',
            lat:'',
            gpsTime:'',
            getGpsTimer:null,
            videoPath:'',
            historyStartTimes:'',
            historyEndTimes:'',
            gpsArr:[]
        }
    },
    methods: {
        init(){
            let historyInfo = JSON.parse(localStorage.getItem('playHistoryInfo'));
            this.videoPath = historyInfo.destPath+'.mp4';
            this.vehicleId = historyInfo.vehicleId;
            this.plateNo = historyInfo.plateNo;
            this.serialNum = historyInfo.camCode;
            this.position = historyInfo.camDirection;
            this.camStatus = historyInfo.camStatus;
            console.log(this.videoPath);
            queryDeviceType({//获取设备id
                'vehicleId':this.vehicleId
            }).then(res => {
                if(res.status == '200'){
                    this.deviceType =  res.data.type;
                    this.historyStartTimes = this.$dateUtil.dateToMs(historyInfo.startTime);//以秒为时间单位
                    this.historyEndTimes = this.$dateUtil.dateToMs(historyInfo.endTime);//以秒为时间单位
                    this.getGps(this.vehicleId,this.historyStartTimes,this.historyEndTimes,this.deviceType);
                }
            })
            
        },
        getGps(vehicleId,startTime,endTime,deviceType){
            historyGpsInfo({
                'vehicleId':vehicleId,'type':deviceType,'beginTime':startTime,'endTime':endTime
            }).then(res => {
                if(res.status == '200'){
                    this.gpsArr = res.data;
                }
            })
        },
        videoProcess(player){
            // let myVideo = document.getElementById('my-video');
            // this.curTime = myVideo.currentTime;//获取视频实时时间
            this.curTime = player.currentTime();//获取视频实时时间
            let i = 0;
            if(this.gpsArr.length > 0){
                this.$refs.historyMap.getGps(this.gpsArr,'0',this.curTime);
                if(this.curTime > 0){
                    i = i + 1;
                };
            }else{
                return false;
            }
        },
        myFunction(){
            let myVideo = document.getElementById('my-video');
            this.curTime = myVideo.currentTime;//获取视频实时时间

            if(this.deviceType == '-1'){//deviceType:-1为未知
                return;
            }else{
                this.videoProcess();
            }

        },
        addEvent(){
            let _this = this;
            this.$refs.myVideo.addEventListener('timeupdate',function(){
                _this.curTime = _this.$refs.myVideo.currentTime;
                if(_this.curTime > 0){
                    i = parseInt(_this.curTime);
                    _this.$refs.historyMap.getGps(_this.gpsArr[i],'0',_this.curTime,i);
                };
            },false);
        },
        videoLoadCompleted() {
            console.log("视频加载完成");
        },
        backClick(){
            this.$emit('backVideoManage');
        },
        mapChangeMax(){
            this.changeSize = true;
        },
        mapChangeMin(){
            this.changeSize = false;
        },
    },
    mounted(){
        // let _this = this;
        // let myVideo = document.getElementById('my-video');
        // let myPlayer = videojs('my-video');
        this.init();
        // myPlayer.on('pause', function () {
        //     let _this = this;
        //     clearInterval(_this.getGpsTimer);//清除GPS
        // });
        // myPlayer.on('end', function () {
        //     let _this = this;
        //     clearInterval(_this.getGpsTimer);//清除GPS
        // });
        // this.addEvent();
    },
    beforeDestroy(){
        clearInterval(this.getGpsTimer);//清除GPS
    },

}
</script>
<style>
.video-js{
    width:100% !important;
    height:100% !important;
}
</style>