<template>
    <!-- 基本信息 -->
    <div class="c-detail-box c-wrapper-20 c-padding-20" v-cloak>
        <el-form ref='searchForm' size="small" :inline="true" class="c-detail-lable-list c-pdb-20">
            <el-form-item label="车牌号: " class="c-detail-lable">
                <el-select
                    v-model.trim="searchKey.plateNo"
                    filterable
                    remote
                    reserve-keyword
                    placeholder="请输入关键词"
                    :remote-method="remoteMethod1"
                    value-key="plateNo"
                    @focus="selectPlateNoList"
                    @change="plateNoSelect"
                    :loading="fuzzySearchOption1.loading">
                    <el-option
                        v-for="(item,index) in fuzzySearchOption1.filterOption"
                        :key="item.serialNum+index"
                        :label='item.plateNo + " " + item.towardText + " " + item.deviceId'
                        :value="item">
                    </el-option>
                </el-select>
            </el-form-item>
            
            <el-form-item label="车辆编号: " prop='vehicleId' class="c-detail-lable">
                <el-select
                    v-model.trim="searchKey.vehicleId"
                    filterable
                    remote
                    reserve-keyword
                    placeholder="请输入关键词"
                    :remote-method="remoteMethod2"
                    value-key="vehicleId"
                    @focus="selectVehicleIdList"
                    @change="vehicleIdSelect"
                    :loading="fuzzySearchOption2.loading">
                    <el-option
                        v-for="(item,index) in fuzzySearchOption2.filterOption"
                        :key="item.vehicleId+index"
                        :label='item.vehicleId + " " + item.towardText + " " + item.deviceId'
                        :value="item">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="摄像头方向: " prop="position" class="c-detail-lable">
                {{searchKey.position ? searchKey.position : '--'}}
            </el-form-item>
            <el-form-item label="摄像头编号: " prop="deviceId" class="c-detail-lable">
                {{searchKey.deviceId ? searchKey.deviceId : '--'}}
            </el-form-item>
            <el-form-item label="摄像头状态: " prop="status" class="c-detail-lable">
                {{searchKey.status ? searchKey.status : '--'}}
            </el-form-item>
            <el-form-item class="c-pos-btn">
                <el-button type="warning" v-if="isStart" @click='endVideo'>结束监控</el-button>
                <el-button type="warning" v-else :disabled="isDisabled" @click='realMonit'>开始监控</el-button>
            </el-form-item>
            
        </el-form> 
            <!-- 地图视频模块 -->
            <div class="c-map-video-wrapper">
                <div class="c-video-wrapper sl-real-momitor-video">
                    <video-player 
                        class="c-video" 
                        ref="videoPlayer"
                        :options="playerOptions"
                        @ended="onPlayerEnded"
                    ></video-player>
                    <div class='c-video-mask' v-show='isMaskShow'></div>
                </div>
                <div class="c-map-wrapper" :class='{"c-map-change-max":changeSize}'>
                    <div class='c-map-btn c-map-btn-left' @click='mapChangeMax' v-if="!changeSize"></div>
                    <div class='c-map-btn c-map-btn-right' @click='mapChangeMin' v-else></div>
                    <max-map ref='maxMap'></max-map>
                </div>
            </div>
            <div class="c-detail-lable-list clearfix c-mt-10">
                <p class="c-detail-lable">
                    <span class="name">开始时间：</span>
                    <span class="value">{{monitStartTime ? monitStartTime : '--'}}</span>
                </p>
                <p class="c-detail-lable">
                    <span class="name">累计时长：</span>
                    <span class="value">{{totalTimeformat ? totalTimeformat : '--'}}</span>
                </p>
                <p class="c-detail-lable">
                    <span class="name">使用流量：</span>
                    <span class="value">--</span>
                </p>
            </div>      
    </div> 

</template>
<script>
import MaxMap from './maxMap.vue';
import {queryCamList,startStream,queryDeviceType,sendStreamHeart} from '@/api/video';
import {requestqueryVehicleCamList} from '@/api/search';
const isProduction = process.env.NODE_ENV === 'production'
export default {
    name: 'RealMonitor',
    components: {
        MaxMap,
    },
    data(){
        return {
            timer:null,
            deviceType:'',
            protocal:'',
            monitStartTime:'',
            playTimer:null,
            old_time:null,
            totalTime:0,
            totalTimeformat:'',
            isStart:false,
            isDisabled: true,
            isMaskShow:true,
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
                deviceId:''
            },
            fuzzySearchOption1: {
                loading: false,
                timer: null,
                filterOption: [],
                defaultFilterOption:[]
            },
            fuzzySearchOption2: {
                loading: false,
                timer: null,
                filterOption: [],
                defaultFilterOption:[]
            },
            playerOptions: {
                overNative: true,
                autoplay: true,
                controls: true,
                techOrder: ['flash', 'html5'],
                sourceOrder: true,
                flash: {
                  // swf: '../../../../static/media/video-js.swf'
                    // swf: '/static/media/video-js.swf'       
                    // swf: '/static/media/video-js.swf'
                    swf: isProduction ? '/dataManage/static/media/video-js.swf' : './static/media/video-js.swf'
                },
                muted: true, // 默认情况下将会消除任何音频。
                loop: false, // 导致视频一结束就重新开始。
                preload: 'auto', // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
                language: 'zh-CN',
                aspectRatio: '16:9', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
                fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
                sources: [
                    {
                        // type: 'rtmp/mp4',
                        type: 'rtmp/flv',
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
    mounted() {
        // this.player.play();
    },
    methods: {
        getPlateNo(item){//根据车牌号查询vehicleID、序列号、朝向、状态
            this.searchKey.status = item.statusText;
            this.searchKey.serialNum = item.serialNum;
            if(this.searchKey.status != '在线'){//摄像头状态为不在线时,开始监控按钮不可点击
                this.isDisabled = true;
            }else{
                this.isDisabled = false;
            };

            clearInterval(this.playTimer);
            clearTimeout(this.timer);

            this.isStart = false;
            this.isMaskShow = true;
            this.totalTime = 0;
            this.totalTimeformat = '';
            this.monitStartTime = '';
            // console.log('因为切换车牌号,所以相应汽车的实时监控停止!');

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
                if(this.playerOptions.sources[0].src){
                    this.isStart = true;
                    this.isMaskShow = false;
                    // this.player.play();
                    //直播报活调用
                    this.repeatFn();
                    //计算视频播放时长
                    this.playTimer = setInterval(() => {
                        this.totalTime ++ ;
                        this.totalTimeformat = this.formatSeconds(this.totalTime);
                        if(this.deviceType != '-1'){
                            this.$refs.maxMap.getGps(this.searchKey.vehicleId,(new Date()).getTime());
                        }
                    },1000);
                    this.getTotalTime(this.monitStartTime);
                }else{
                    this.isStart = false;
                    this.isMaskShow = true;
                    startStream({
                            'camId':this.searchKey.serialNum,
                            'vehicleId':this.searchKey.vehicleId,
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

                                this.isStart = true;
                                setTimeout(() => {
                                    this.isMaskShow = false;
                                }, 1000);
                                //计算视频播放时长
                                this.playTimer = setInterval(() => {
                                    this.totalTime ++ ;
                                    this.totalTimeformat = this.formatSeconds(this.totalTime);
                                    if(this.deviceType != '-1'){

                                        this.$refs.maxMap.getGps(this.searchKey.vehicleId,(new Date()).getTime());
                                    }
                                },1000);
                                this.getTotalTime(this.monitStartTime);
                            }
                    });
                }
            }else{
                this.$message({
                    type: 'error',
                    duration: '1500',
                    message: '请选择车牌号!',
                    showClose: true
                });
            }
        },
        onPlayerEnded() {
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
                'camId':this.searchKey.serialNum,
                'vehicleId':this.searchKey.vehicleId,
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
        selectPlateNoList(){
            if(this.searchKey.plateNo == ''){
                this.fuzzySearchOption1.loading = true;
                clearTimeout(this.fuzzySearchOption1.timer);
                this.fuzzySearchOption1.timer = setTimeout(() => {
                    requestqueryVehicleCamList({
                        'field':'plateNo',
                        'value':''
                    }).then(res => {
                            if(res.status == '200'){
                                //接口请求后执行的操作 
                                this.fuzzySearchOption1.defaultFilterOption = this.fuzzySearchOption1.filterOption = res.data;
                            }
                            this.fuzzySearchOption1.loading = false;
                        }).catch(err => {
                            this.fuzzySearchOption1.loading = false;
                        });
                }, 500);
            }else{
                this.fuzzySearchOption1.filterOption = this.fuzzySearchOption1.defaultFilterOption;
            }
        },
        remoteMethod1(query) {
            if (query !== '') {
                this.fuzzySearchOption1.loading = true;
                clearTimeout(this.fuzzySearchOption1.timer);
                this.fuzzySearchOption1.timer = setTimeout(() => {
                    requestqueryVehicleCamList({
                        'field':'plateNo',
                        'value':query
                    }).then(res => {
                            if(res.status == '200'){
                                //接口请求后执行的操作 
                                this.fuzzySearchOption1.loading = false;
                                this.fuzzySearchOption1.filterOption = res.data.filter(item => {
                                return item.plateNo.toLowerCase()
                                    .indexOf(query.toLowerCase()) > -1;
                                });
                            }
                            this.fuzzySearchOption1.loading = false;
                        }).catch(err => {
                            this.fuzzySearchOption1.loading = false;
                        });
                }, 500);
            } else {
                this.fuzzySearchOption1.filterOption = this.fuzzySearchOption1.defaultFilterOption;
            }
        },
        selectVehicleIdList(){
            if(this.searchKey.vehicleId == ''){
                this.fuzzySearchOption2.loading = true;
                clearTimeout(this.fuzzySearchOption2.timer);
                this.fuzzySearchOption2.timer = setTimeout(() => {
                    requestqueryVehicleCamList({
                        'field':'vehicleId',
                        'value':''
                    }).then(res => {
                        if(res.status == '200'){
                            //接口请求后执行的操作 
                            this.fuzzySearchOption2.loading = false;
                            this.fuzzySearchOption2.defaultFilterOption = this.fuzzySearchOption2.filterOption = res.data;
                        }
                        this.fuzzySearchOption2.loading = false;
                    }).catch(err => {
                        this.fuzzySearchOption2.loading = false;
                    });
                }, 500); 
            }else{
                this.fuzzySearchOption2.filterOption = this.fuzzySearchOption2.defaultFilterOption;
            }
        },
        remoteMethod2(query) {
            if (query !== '') {
                this.fuzzySearchOption2.loading = true;
                clearTimeout(this.fuzzySearchOption2.timer);
                this.fuzzySearchOption2.timer = setTimeout(() => {
                    requestqueryVehicleCamList({
                        'field':'vehicleId',
                        'value':query
                    }).then(res => {
                        if(res.status == '200'){
                            //接口请求后执行的操作 
                            this.fuzzySearchOption2.loading = false;
                            this.fuzzySearchOption2.filterOption = res.data.filter(item => {
                            return item.vehicleId.toLowerCase()
                                .indexOf(query.toLowerCase()) > -1;
                            });
                        }
                        this.fuzzySearchOption2.loading = false;
                    }).catch(err => {
                        this.fuzzySearchOption2.loading = false;
                    });

                }, 500);
            } else {
                this.fuzzySearchOption2.filterOption = [];
            }
        },
        plateNoSelect(val) {
            this.fuzzySearchOption2.filterOption = [];
            this.fuzzySearchOption2.filterOption.push(val);
            this.searchKey.plateNo = val.plateNo;
            this.searchKey.vehicleId = val.vehicleId;
            this.searchKey.position = val.towardText;
            this.searchKey.serialNum = val.serialNum;
            this.searchKey.deviceId = val.deviceId;
            this.searchKey.status = val.statusText;
            this.totalTime = 0;
            this.totalTimeformat = '';
            this.monitStartTime = '';
            this.getPlateNo(val);
            // console.log('因为切换车牌号,所以相应汽车的实时监控停止!');
            this.resetVideoMap(val);
        },
        vehicleIdSelect(val) {
            this.fuzzySearchOption1.filterOption = [];
            this.fuzzySearchOption1.filterOption.push(val);
            this.searchKey.plateNo = val.plateNo;
            this.searchKey.vehicleId = val.vehicleId;
            this.searchKey.position = val.towardText;
            this.searchKey.serialNum = val.serialNum;
            this.searchKey.deviceId = val.deviceId;
            this.searchKey.status = val.statusText;
            this.getPlateNo(val);
            this.resetVideoMap(val);
        },
        resetVideoMap(val){
            this.playerOptions.sources[0].src = '';
            this.protocal = val.protocol;
            let protocal = JSON.stringify(this.protocal);
            localStorage.setItem('protocal',protocal);
            this.$refs.maxMap.clearVehicleInfo();
            this.endVideo();
        },
    },
    beforeDestroy(){
        clearInterval(this.playTimer);
        this.playTimer = null;//清空累计时长
        clearTimeout(this.timer);
        this.timer = null;//清除直播报活
    },
}
</script>
<style>
.sl-real-momitor-video .video-js.vjs-paused .vjs-big-play-button{
    display: none !important;
}
</style>
