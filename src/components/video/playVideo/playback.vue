<template>
    <!-- 基本信息 -->
    <div class="c-detail-box c-wrapper-20 c-view-dialog-54" v-cloak>
        <h3 class="c-title c-border-bottom">视频管理 > 回放<el-page-header @back="backClick" class="c-return-btn"></el-page-header></h3>
        <div class="c-wrapper-20">
            <el-form ref="form" size="small" :inline="true" class='c-mt-20'>
                <el-form-item label="车牌号：">
                    {{plateNo ? plateNo : '--'}}
                </el-form-item>
                <el-form-item label="车辆编号：">
                    {{vehicleId ? vehicleId : '--'}}
                </el-form-item>
                <el-form-item label="序列号: ">
                    {{serialNum ? serialNum : '--'}}
                </el-form-item>
                <el-form-item label="摄像头朝向: ">
                    {{position ? position : '--'}}
                </el-form-item>
                <el-form-item label="状态: ">
                    {{camStatus ? camStatus : '--'}}
                </el-form-item>
            </el-form>
            <!-- 地图视频模块 -->
            <div class="c-map-video-wrapper">
                <div class="c-video-wrapper">
                    <div class="c-video">
                        <video id="my-video" class="video-js video-js vjs-big-play-centered" ref='myVideo' :src="videoPath" controls preload="auto" @seeking="videoProcess">
                            <source :src="videoPath" type="video/mp4">
                        </video>
                    </div>
                </div>
                <div class="c-map-wrapper" :class='{"map-change-max":changeSize}'>
                    <div class='c-map-btn-left' @click='mapChangeMax'></div>
                    <div class='c-map-btn-right' @click='mapChangeMin'></div>
                    <history-map ref='historyMap'></history-map>
                </div>
            </div>
            <!-- <div class="video c-mt-10">
                <input type='hidden' v-model='curTime' />
                <div class='video-box'>
                    <video id="my-video" class="video-js video-js vjs-big-play-centered" ref='myVideo' :src="videoPath" controls preload="auto" @seeking="videoProcess">
                        <source :src="videoPath" type="video/mp4">
                    </video>
                </div>
            </div>
            <div class="Gps c-mt-10">
                <div :class="{ hmax:changeRed == true}" style="border:1px solid #666;position:relative;width:390px;height:400px;float:right;">
                    <history-map ref='historyMap' @changeMax='changeMaxFn' @changeMin='changeMinFn'></history-map>
                </div>
            </div> -->
        </div>
    </div>
</template>
<script>
import TusvnMap from "../../../common/view/TusvnMap/TusvnMap.vue";
import HistoryMap from './historyMap.vue';
import { clearTimeout } from 'timers';
import {queryDeviceType,historyGpsInfo} from '@/api/video';
export default {
    name: 'RealMonitor',
    props: ['title','type','data'],
    components: {
        TusvnMap,
        HistoryMap,
    },
    data(){
        return {
            changeSize:false,
            myPlayer:'',
            curTime:'',
            sCurTime:'',
            deviceType:'',
            vehicleId:'',
            position:'',
            status:'',
            plateNo:'',
            serialNum:'',
            camStatus:'',
            speed:'',
            courseAngle:'',
            lot:'',
            lat:'',
            gpsTime:'',
            getGpsTimer:null,
            changeRed:false,
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
            this.serialNum = historyInfo.camId;
            this.position = historyInfo.camDirection;
            this.camStatus = historyInfo.camStatus;
            queryDeviceType({//获取设备id
                'vehicleId':this.vehicleId
            }).then(res => {
                if(res.status == '200'){
                    this.deviceType =  res.data.type;
                }
            })
            this.historyStartTimes = this.$dateUtil.dateToMs(historyInfo.startTime);//以秒为时间单位
            this.historyEndTimes = this.$dateUtil.dateToMs(historyInfo.endTime);//以秒为时间单位
            this.getGps(this.vehicleId,this.historyStartTimes,this.historyEndTimes,this.deviceType);
        },
        getGps(vehicleId,startTime,endTime,deviceType){
            historyGpsInfo({
                'vehicleId':vehicleId,'type':deviceType,'beginTime':startTime,'endTime':endTime
            }).then(res => {
                if(res.status == '200'){
                    this.gpsArr = res.data;
                    // this.$refs.historyMap.getGps(this.gpsArr);
                    // this.speed = response.data.data.speed;//速度
                    // this.courseAngle = response.data.data.courseAngle;//朝向
                    // this.lon = response.data.data.lon;//经度
                    // this.lat = response.data.data.lat;//纬度
                    // this.gpsTime = response.data.data.gpsTime;//时间
                    //绘制小车
                    // this.$refs.refRealMap.addImg(this.lon,this.lat,"car_01","CarLayer",'../../../static/images/vehicle/geolocation_marker_heading.png',[24,49],this.courseAngle,null,null,null);
                    // this.$refs.refRealMap.addImg(this.lon,this.lat,"car_01","CarLayer",'static/images/vehicle/geolocation_marker_heading.png',[24,49],this.courseAngle,null,null,null);//部署
                }
            })
        },
        videoProcess(){
            let myVideo = document.getElementById('my-video');
            this.curTime = myVideo.currentTime;//获取视频实时时间
            let i = 0;
            this.$refs.historyMap.getGps(this.gpsArr,'0',this.curTime);
            if(this.curTime > 0){
                i = i + 1;
            };
            // for(let i=0;i<this.gpsArr.length;i++){
            //     console.log('1秒执行一次');
            //      console.log(i);
            //      this.$refs.historyMap.getGps(this.gpsArr[i]);
            // }
            
        },
        myFunction(){
            let myVideo = document.getElementById('my-video');
            this.curTime = myVideo.currentTime;//获取视频实时时间
            // if(this.curTime == undefined){
            //     this.curTime = 0;
            // }
            
           
            //this.$refs.historyMap.getGps(this.gpsArr[i]);
                // console.log(this.gpsArr[i].speed);
            // let startTime = this.historyStartTimes + this.curTime;//点击播放按钮,重新获取开始时间
            // let curStarTime = startTime.toFixed(3)*1000;
            if(this.deviceType == '-1'){//deviceType:-1为未知
                return;
            }else{
                this.videoProcess();
                // let i = 0;
                // let _this = this;
                
                // let timer = setTimeout(function(){
                    
                //     i = i+1;
                //     console.log(i);
                //     _this.$refs.historyMap.getGps(_this.gpsArr[i]);
                //     console.log(_this.gpsArr[i].speed);
                // },1000);

                // for(let i=0;i<this.gpsArr.length;i++){
                //     console.log('运行中');
                //     console.log(i++);
                //     console.log(this.gpsArr[i++]);
                //     this.$refs.historyMap.getGps(this.gpsArr[i++]);
                // }
                
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
        let _this = this;
        let myVideo = document.getElementById('my-video');
        let myPlayer = videojs('my-video');
        _this.init();
        // videojs("my-video").ready(function(){
        //     this.play();
        // });
        myPlayer.on('pause', function () {
            let _this = this;
            clearInterval(_this.getGpsTimer);//清除GPS
        });
        myPlayer.on('end', function () {
            let _this = this;
            clearInterval(_this.getGpsTimer);//清除GPS
        });
        this.addEvent();
    },
    beforeDestroy(){
        clearInterval(this.getGpsTimer);//清除GPS
        // localStorage.removeItem('playHistoryInfo');
    },

}

</script>
<style>
.hmax{
    border-color:rgb(102, 102, 102) !important;
    width:988px !important;
    height:400px !important;
    overflow:hidden !important;
    position:absolute !important;
    top:90px !important;
    left:0px !important;
    float:none !important;
    z-index:1000;
}
.time{
    font-size:12px;
}
.time-l{
    position: absolute;
    bottom: 1px;
    left: 1px;
}

.time-r{
    position: absolute;
    bottom: 1px;
    right: 1px;
}
.progress-bar-wrapper{
    position: absolute;
    bottom: 1px;
    left: 1px;
    width: 500px;
}

.progress-bar{
    height: 0.5rem
}
.bar-inner{
    position: relative;
    top: 0.2rem;
    height: 0.08rem;
    background: rgba(0, 0, 0, 0.3);
}
.slider-wrapper{
    width:100%;
    height:50px;
    position: absolute;
    bottom:0;
    left:0;
    background:#dea;
}
.curTime,.endTime,.slide-bar,.slide-btn{
    position:absolute;
}
.curTime,.endTime{
    font-size:14px;
    top:15px;
}
.curTime{
    left:10px;
}
.endTime{
    right:60px;
}
.slide-bar{
    width:410px;
    height:8px;
    background:#eee;
    top:20px;
    left:70px
}
.slide-scroll-bar{
    width:0%;
    height:8px;
    top:20px;
    background:#f0d;
}
.slide-btn{
    width:15px;
    height:15px;
    border-radius: 50%;
    background:#f00;
    top:-4px;
    cursor: pointer;
}
.video-js{
    width:100% !important;
    height:100% !important;
}
/* #my-video_html5_api{
    width:100%;
    height:100%;
} */
</style>
<style scoped lang="scss">
.video-wrapper{
    position: relative;
    padding-bottom: 28.125%;
    .video-left,.video-right{
        position: absolute;
        width: 50%;
        top: 0;
        bottom:0;
    }
    .video-left{
        left: 0;
        background: #000;
        .video-inner {
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        .video-mask{
            position:absolute;
            top:0;left:0;
            width:100%;
            height:100%;
            z-index:50;
            background-color: #000;
        }
        #cmsplayer{
            width:100%;
            height:100%;
        }
    }
    .video-right{
        right: 0;
        z-index:51;
        border:1px solid #666;
        &.max {
            width: 100%;
        }
    }
}    
.monit-detail {
    ul{
        overflow: hidden;
        margin-bottom:10px;
        line-height: 24px;
        li{
            float: left;
            width: 20%;
            margin-top:10px;
            span{
                color:#666;
            }
        }
    }
}
.c-view-dialog-54{
    background:#fff;
    top:-20px;
}
</style>