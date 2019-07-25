<template>
    <!-- 基本信息 -->
    <div class="c-wrapper-20" v-cloak>
        <el-form ref='searchForm' size="small" :inline="true">
            <el-form-item label="车牌号: ">
                <el-select
                    v-model="searchKey.plateNo"
                    filterable
                    remote
                    value-key="plateNo"
                    placeholder="请输入关键词"
                    :remote-method="searchPlateNo"
                    @change="getCamareInfo"
                    @click.native="getPlateNoList"
                    :loading="plateNoLoading">
                    <el-option
                        v-for="(item,index) in plateNoList"
                        :key="index"
                        :label="item.plateNo"
                        :value="item">
                    </el-option>
                </el-select>
            </el-form-item>
            
            <el-form-item label="车辆编号: " prop='vehicleId'>
                <el-select
                    v-model="searchKey.vehicleId"
                    filterable
                    remote
                    value-key="vehicleId"
                    placeholder="请输入关键词"
                    :remote-method="searchVehicleId"
                    @change="getCamareInfo"
                    @click.native="getVehicleIds"
                    :loading="vehicleIdLoading">
                    <el-option
                        v-for="(item,index) in vehicleIdList"
                        :key="index"
                        :label="item.vehicleId"
                        :value="item">
                    </el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="摄像头序列号: " prop="serialNum">
                {{searchKey.serialNum ? searchKey.serialNum : '--'}}
            </el-form-item>
            <el-form-item label="摄像头朝向: " prop="position">
                {{searchKey.position ? searchKey.position : '--'}}
            </el-form-item>
            <el-form-item label="摄像头状态: " prop="status">
                <template v-if='searchKey.status=="0"'>未知</template>
                <template v-if='searchKey.status=="1"'>在线</template>
                <template v-if='searchKey.status=="2"'>离线</template>
                <template v-if='searchKey.status=="3"'>未注册</template>
            </el-form-item>
            <el-form-item>
                <el-button type="warning" size="small" v-if="isStart" @click='endVideo'>结束监控</el-button>
                <el-button type="warning" size="small" v-else :disabled="isDisabled ? true : false" @click='realMonit'>开始监控</el-button>
            </el-form-item>
        </el-form> 
        <!-- <video id='myvideo' width=960 height=540 class="video-js vjs-default-skin" controls> --> 
                <!-- RTMP直播源地址-->
                <!-- <source src="rtmp://live.hkstv.hk.lxdns.com/live/hks1">    
            </video> -->
            <!-- 地图视频模块 -->
            <div class="c-map-video-wrapper">
                <div class="c-video-wrapper">
                     <video-player id='video' class="c-video" 
                    ref="videoPlayer"
                    :options="playerOptions"
                    controls
                    @ended="onPlayerEnded"
                ></video-player>
                <div class='video-mask' v-show='isMaskShow'></div>
                    <video class="c-video"></video>
                </div>
                <div class="c-map-wrapper" :class='{"map-change-max":changeSize}'>
                    <div class='c-map-btn-left' @click='mapChangeMax'></div>
                    <div class='c-map-btn-right' @click='mapChangeMin'></div>
                    <max-map ref='maxMap'></max-map>
                </div>
            </div>
            <div class='monit-detail'>
                    <ul class="clearfix">
                        <li>
                            <span>开始时间:</span> {{monitStartTime ? monitStartTime : '--'}}
                        </li>
                        <li>
                            <span style="margin-left:14px;">累计时长: </span>{{totalTimeformat ? totalTimeformat : '--'}}
                        </li>
                        <li>
                            <span>使用流量: </span>--
                        </li>
                    </ul>
            </div>
         <!-- <div class="video-wrapper">
            <div class='video-left'>
                <video-player id='video' class="vjs-custom-skin" 
                    ref="videoPlayer"
                    :options="playerOptions"
                    controls
                    @ended="onPlayerEnded"
                ></video-player>
                <div class='video-mask' v-show='isMaskShow'></div>
            </div>
            <div class="video-right" :class='{"map-change-max":changeSize}'>
                <div class='c-map-btn-left' @click='mapChangeMax'></div>
                <div class='c-map-btn-right' @click='mapChangeMin'></div>
                <max-map ref='maxMap'></max-map>
            </div>
        </div> -->
      
    </div> 

</template>
<script>
import MaxMap from './maxMap.vue';
import DropDownList from '../../../common/view/DropDownList.vue';
import {queryCamList,startStream,queryDeviceType,sendStreamHeart} from '@/api/video';
export default {
    name: 'RealMonitor',
    components: {
        MaxMap,
        DropDownList
    },
    data(){
        return {
            timer:null,
            deviceType:'',
            protocalArr:[],
            protocal:'',
            monitStartTime:'',
            playTimer:null,
            old_time:null,
            changeRed:false,
            totalTime:0,
            totalTimeformat:'',
            dataList: [], 
            isStart:false,
            isDisabled: false,
            isMaskShow:true,
            isMapShow:false,
            // plateNoTimer: null,
            // vehicleIdTimer: null,
            
            allList: [],
            plateNoList: [],
            vehicleIdList: [], 
            plateNoLoading: false,
            vehicleIdLoading: false,

            changeSize:false,

            searchKey:{
                vehicleId:'',
                plateNo:'',
                serialNum:'',
                position:'',
                status:'',
            },
            playerOptions: {
                overNative: true,
                autoplay: true,
                controls: true,
                techOrder: ['flash', 'html5'],
                sourceOrder: true,
                flash: {
                  // swf: '../../../../static/media/video-js.swf'
                    swf: '/static/media/video-js.swf'
                },
                muted: true, // 默认情况下将会消除任何音频。
                loop: false, // 导致视频一结束就重新开始。
                preload: 'auto', // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
                language: 'zh-CN',
                aspectRatio: '16:9', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
                fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
                sources: [
                    {
                        type: 'rtmp/mp4',
                        // type: 'rtmp/flv',
                        // type: 'rtmp',
                        src: ''
                    }
                ],
                // width: document.documentElement.clientWidth,
                notSupportedMessage: '此视频暂无法播放，请稍后再试', //允许覆盖Video.js无法播放媒体源时显示的默认信息。
                // controlBar: {
                //     timeDivider: false,
                //     durationDisplay: false,
                //     remainingTimeDisplay: false,
                //     fullscreenToggle: true  //全屏按钮
                // }
            }
        }
    },
    computed: {
        player() {
            return this.$refs.videoPlayer.player
        }
    },
    methods: {
        getPlateNo(item){//根据车牌号查询vehicleID、序列号、朝向、状态
            switch (item.position){
                case '0':
                    this.searchKey.position = "前向";
                    break;
                
                case '1':
                    this.searchKey.position = "后向";
                    break;
                
                case "2":
                    this.searchKey.position = "侧向";
                    break;
                
                case "3":
                    this.searchKey.position = "环视";
                    break;
                
                case "4":
                    this.searchKey.position = "车内";
                    break;
                
            }
            this.searchKey.status = item.status;
            this.searchKey.vehicleId = item.vehicleId;
            this.searchKey.plateNo = item.plateNo;
            this.searchKey.serialNum = item.serialNum;
            this.isStart = false;
            if(this.searchKey.status != '1'){//摄像头状态为不在线时,开始监控按钮不可点击
                this.isDisabled = true;
            }else{
                this.isDisabled = false;
            };
            clearInterval(this.playTimer);
            clearTimeout(this.timer);

            this.isMaskShow = true;
            this.totalTime = 0;
            this.totalTimeformat = '';
            this.monitStartTime = '';


            // this.$refs.maxMap.removeOverLays('line_01');
            // this.$refs.maxMap.removeOverLays('car_01');
            // this.$refs.maxMap.removeGpsInfo();
            console.log('因为切换车牌号,所以相应汽车的实时监控停止!');
            
            this.isStart = false;
            this.playerOptions.sources[0].src = '';
            queryDeviceType({//获取设备id
            'vehicleId':this.searchKey.vehicleId
            }).then(res => {
                if(res.status == '200'){
                    this.deviceType =  res.data.type;
                }
            })
        },
        realMonit(){
            if(this.searchKey.vehicleId != ''){
                this.isStart = true;
                this.isMaskShow = false;
                if(this.playerOptions.sources[0].src){
                    // this.player.play();
                    //直播报活调用
                    this.repeatFn();
                    //计算视频播放时长
                    this.playTimer = setInterval(() => {
                        this.totalTime ++ ;
                        this.totalTimeformat = this.formatSeconds(this.totalTime);
                        if(this.deviceType != '-1'){
                            this.$refs.maxMap.getGps(this.searchKey.vehicleId,(new Date()).getTime(),this.deviceType);
                        }
                    },1000);
                    this.getTotalTime(this.monitStartTime);
                }else{
                    startStream({
                            'camId':this.searchKey.serialNum,'vehicleId':this.searchKey.vehicleId,
                            'protocal':this.protocal
                        }).then(res => {
                            if(res.status == '200'){
                                //获取视频地址并赋值
                                let videoUrl = res.data.rtmp;
                                this.playerOptions.sources[0].src = videoUrl;
                                // this.player.load(videoUrl);
                                //直播报活调用
                                this.repeatFn();
                                this.monitStartTime = this.getCurTime();

                                //计算视频播放时长
                                this.playTimer = setInterval(() => {
                                    this.totalTime ++ ;
                                    this.totalTimeformat = this.formatSeconds(this.totalTime);
                                    if(this.deviceType != '-1'){
                                        this.$refs.maxMap.getGps(this.searchKey.vehicleId,(new Date()).getTime(),this.deviceType);
                                    }
                                },1000);

                                this.getTotalTime(this.monitStartTime);
                            }
                    });
                }
            }else{
                this.$message.error('请选择车牌号!');
            }
        },
        onPlayerEnded() {
            // console.log("playerEnded")
            this.endVideo();
        },
        repeatFn(){//每5秒直播报活一次
            let _this = this;
            _this.videoActive();
            clearTimeout(_this.timer);
            _this.timer = setTimeout(function(){
                _this.repeatFn();
            },5000)
        },
        videoActive(){//调用报活接口
            sendStreamHeart({
                'camId':this.searchKey.serialNum,'vehicleId':this.searchKey.vehicleId,
                'protocal':this.protocal
            }).then(res => {
            })
        },
        endVideo(){//停止直播
            clearInterval(this.playTimer);
            clearTimeout(this.timer);
            this.isMaskShow = true;
            this.isStart = false;
            this.player.pause();
            this.$refs.maxMap.removeMasks();
            // this.$refs.maxMap.removeOverLays('line_01');
            // this.$refs.maxMap.removeOverLays('car_01');
            // this.$refs.maxMap.removeLineArray();
        },
        getCurTime(){
            let curTime = null;
            let sysDate = new Date();
            let year = sysDate.getFullYear();
            let month = sysDate.getMonth() + 1;
            let day = sysDate.getDate();
            let hours = sysDate.getHours();
            let min = sysDate.getMinutes();
            let seconds = sysDate.getSeconds();

            month = month < 10 ? "0" + month : month;
            day = day < 10 ? "0" + day : day;
            hours = hours < 10 ? "0" + hours : hours;
            min = min < 10 ? "0" + min : min;
            seconds = seconds < 10 ? "0" + seconds : seconds;
            curTime = year + '-' + month + '-' + day + ' ' + hours + ':' + min + ':' + seconds;
            return curTime;
        },
        getTotalTime(t){
            this.old_time = this.$dateUtil.dateToMs(t);
        },
        getPlateNoList(){
            if(!this.searchKey.plateNo) {

                // clearTimeout(this.plateNoTimer);
                // this.plateNoTimer = setTimeout(() => {
                    
                    if(!this.allList.length) {
                        this.plateNoLoading = true;
                        queryCamList({}).then(res => {
                            if(res.status == '200'){
                                this.allList = res.data;
                                this.plateNoList = res.data;
                            }
                            this.plateNoLoading = false;
                        }).catch(err => {
                            this.plateNoLoading = false;
                        });
                   }
                // }, 1000);  
            }else {
                this.plateNoList = this.allList;
            }
        },
        mapChangeMax(){
            this.changeSize = true;
        },
        mapChangeMin(){
            this.changeSize = false;
        },
        formatSeconds(value) { 
            let _totalTime = '';
            var secondTime = parseInt(value);// 秒
            var minuteTime = 0;// 分
            var hourTime = 0;// 小时
            if(secondTime > 60) {//如果秒数大于60，将秒数转换成整数
                //获取分钟，除以60取整数，得到整数分钟
                minuteTime = parseInt(secondTime / 60);
                //获取秒数，秒数取佘，得到整数秒数
                secondTime = parseInt(secondTime % 60);
                //如果分钟大于60，将分钟转换成小时
                if(minuteTime > 60) {
                    //获取小时，获取分钟除以60，得到整数小时
                hourTime = parseInt(minuteTime / 60);
                    //获取小时后取佘的分，获取分钟除以60取佘的分
                    minuteTime = parseInt(minuteTime % 60);
                }
            }
            var result = "" + parseInt(secondTime) + "秒";
            _totalTime = result;

            if(minuteTime > 0) {
                result = "" + parseInt(minuteTime) + "分" + result;
                _totalTime = result;
            }
            if(hourTime > 0) {
                result = "" + parseInt(hourTime) + "小时" + result;
                _totalTime = result;
            }
            return _totalTime;
        },
        searchPlateNo(query) {
            if (query !== '') {
                // this.plateNoLoading = true;
                // clearTimeout(this.plateNoTimer);
                // this.plateNoTimer = setTimeout(() => {
                    this.plateNoList = this.allList.filter(item => {
                      return item.plateNo.toLowerCase()
                        .indexOf(query.toLowerCase()) > -1;
                    });
                // }, 1000);
            } else {
                this.plateNoList = this.allList;
            }
        },
        searchVehicleId(query) {
            if (query !== '') {
                // this.plateNoLoading = true;
                // clearTimeout(this.plateNoTimer);
                // this.plateNoTimer = setTimeout(() => {
                    this.vehicleIdList = this.allList.filter(item => {
                      return item.vehicleId.toLowerCase()
                        .indexOf(query.toLowerCase()) > -1;
                    });
                // }, 1000);
            } else {
                this.vehicleIdList = this.allList;
            }
        },
        getVehicleIds(){
            if(!this.searchKey.vehicleId) {

                // clearTimeout(this.plateNoTimer);
                // this.plateNoTimer = setTimeout(() => {
                    
                    if(!this.allList.length) {
                        this.vehicleIdLoading = true;
                        queryCamList({}).then(res => {
                            if(res.status == '200'){
                                this.allList = res.data;
                                this.vehicleIdList = res.data
                            }
                            this.vehicleIdLoading = false;
                        }).catch(err => {
                            this.vehicleIdLoading = false;
                        });
                   }
                // }, 1000);  
            }else {
                this.vehicleIdList = this.allList;
            }
        },
        getCamareInfo(item){
            
            this.plateNoList = [];
            this.plateNoList.push(item);
            this.vehicleIdList = [];
            this.vehicleIdList.push(item);

            clearInterval(this.playTimer);
            clearTimeout(this.timer);
            this.isMaskShow = true;
            this.totalTime = 0;
            this.totalTimeformat = '';
            this.monitStartTime = '';
            // this.$refs.maxMap.removeOverLays('line_01');
            // this.$refs.maxMap.removeOverLays('car_01');
            // this.$refs.maxMap.removeGpsInfo();
            console.log('因为切换车牌号,所以相应汽车的实时监控停止!');

            this.isStart = false;
            this.playerOptions.sources[0].src = '';


            this.protocal = item.protocal;
            let protocal = JSON.stringify(this.protocal);
            localStorage.setItem('protocal',protocal);
            this.getPlateNo(item);
        },
    },
    mounted(){
    },
    beforeDestroy(){
        clearInterval(this.playTimer);
        this.playTimer = null;//清空累计时长
        clearTimeout(this.timer);
        this.timer = null;//清除直播报活
    },
}
</script>
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
</style>
<style>
.amap-demo {
    height: 300px;
}
.sl-real-momitor-video .vjs-text-track-display,
.sl-real-momitor-video .video-js .vjs-big-play-button,
.sl-real-momitor-video .vjs-button,
.sl-real-momitor-video .vjs-time-control {
    display: none !important;
}
</style>
