<template>
    <!-- 基本信息 -->
    <div class="yk-container sl-percepDetail-container">
        <el-page-header @back="$router.go(-1);" content="路侧摄像头视频及感知数据" class="c-mt-30"></el-page-header>
        <div class='percep-con clearfix'>
            <div class='percep-video'>
                <p class="percep-title">路侧摄像头视频数据</p>
                <video-player class="video-player vjs-custom-skin sl-video-player"
                    ref="videoPlayer"
                    :playsinline="true"
                    :options="playerOptions" 
                    @loadeddata="onPlayerLoadedData"
                    @timeupdate="onPlayerTimeupdate"
                    @error="playerError"
                ></video-player>                
            </div>
            <div class='sl-btn-box clearfix'>
                <el-button class="sl-btn" type="primary" icon="el-icon-arrow-left" @click="reduceTime"></el-button>
                <div class='time-input'>
                    <el-date-picker
                        v-model="curTime"
                        type="datetime"
                        format='yyyy-MM-dd HH:mm:ss'
                        @change='changeDate'
                        :picker-options="pickerOptions">
                        placeholder="选择日期时间">
                    </el-date-picker>
                    <span class='time-point'>.</span>
                    <div class='time-ms'>
                        <el-input 
                            type='text' 
                            readonly
                            v-model="currentMillisecond">
                        </el-input>
                    </div>
                </div>
                <el-button class="sl-btn" type="primary" icon="el-icon-arrow-right" @click="addTime"></el-button>
            </div>
            <div class="percep-data">
                <p class="percep-title">融合感知数据</p>
                <div class="percep-wrap" v-loading="tusvnOption.loading" >
                    <tusvn-map 
                        target-id="tusvnMap" 
                        ref="tusvnMap" 
                        @mapcomplete="mapcomplete"
                        v-show="tusvnOption.show">
                    </tusvn-map>
                </div>
            </div>
        </div>
        <el-table 
            class="c-mt-30" 
            ref="percepDetailTable" 
            :data="dataList" 
            stripe 
            v-loading="loading" 
            highlight-current-row
            @current-change="showDetail"
            :cell-style="{
                cursor: 'pointer'
            }">
            <!-- 关于分页 -->
            <!-- <el-table-column align="center" min-width="5%" label="编号" type="index" :index="indexMethod"></el-table-column> -->
            <el-table-column fixed align="center" min-width="5%" label="编号" type="index"></el-table-column>
            <el-table-column align="center" min-width="15%" label="时间">
                <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.timestamp, 'yy-mm-dd hh:mm:ss:ms')}}</template>
            </el-table-column>
            <el-table-column align="center" min-width="25%" label="感知目标数据">
                <template slot-scope="scope">
                    <el-popover placement="top" width="388" trigger="hover" popper-class="sl-table-popover">
                        <div class="popover-content" v-html="scope.row.field"></div>
                        <p class="sl-table-text" slot="reference" v-html='scope.row.field'></p>
                    </el-popover>
                </template>
            </el-table-column>
            <el-table-column align="center" min-width="45%" label="原始感知数据">
                <template slot-scope="scope">
                    <el-popover placement="top" width="715" trigger="hover" popper-class="sl-table-popover" >
                        <div class="popover-content" v-html="scope.row.data"></div>
                        <p class="sl-table-text" slot="reference" v-html='scope.row.data'></p>
                    </el-popover>
                </template>
            </el-table-column>
            <el-table-column align="center" min-width="12%" label="操作">
                <template slot-scope="scope">
                    <!-- <el-button class="el-button--small" type="primary" :loading="scope.row.loading" @click="showDetail(scope.row)">查看</el-button> -->
                    <el-button size="mini" type="primary" :loading="scope.row.loading">查看</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>
<script>
import TList from '@/common/utils/list.js'
import TMDate from '@/common/utils/date.js'
import VueDatepickerLocal from 'vue-datepicker-local'
import TusvnMap from "@/common/view/TusvnMap/Tusvn3DMap2.vue";
import {findRoadMonitorCameraInfo,getVideoUrlInfo,findPerceptionRecordsInfo} from '@/api/roadSide';
export default {
    name: 'PercepDetail',
    components: {
        VueDatepickerLocal,
        TusvnMap
    },
    data(){
        let _this = this;
        return {
            loading: false,
            params: {
                "serialNum": this.$route.params.serialNum, //设备序列号
                "startTime": this.$dateUtil.formatTimeReal(this.$route.params.startTime), //开始时间
                "endTime": this.$dateUtil.formatTimeReal(this.$route.params.endTime)    //截至时间
            },
            perceptionData: {
                "serialNum": this.$route.params.serialNum, //设备序列号
                "framesTime":""
            },

            startTimeTimestamp: new Date(this.$dateUtil.formatTimeReal(this.$route.params.startTime)).getTime(),
            endTimeTimestamp: new Date(this.$dateUtil.formatTimeReal(this.$route.params.endTime)).getTime(),

            limit: 100,
            curTime: 0,   //视频当前绝对时间(s) 
            curTimeDate: 0,   //视频当前绝对时间(ms)
            currentTime: 0,   //视频当前相对时间(ms)
            currentSecond: 0,   //视频当前秒(s)
            currentMillisecond: '000',   //视频当前毫秒(ms)
            durationTime: 0,   //视频总时长(ms)
            durationSecond: 0,   //视频总时长的秒数(s)
            durationMilliSecond: 0,   //视频总时长的毫秒数(ms)

            pickerOptions: {
                editable: false,
                clearable: false,
                disabledDate(time) {
                    return time.getTime() > _this.endTimeTimestamp || time.getTime() < _this.startTimeTimestamp;
                }
            },
            playerOptions: {
                playbackRates: [0.7, 1.0, 1.5, 2.0], //播放速度
                autoplay: false, //如果true,浏览器准备好时开始回放。
                muted: false, // 默认情况下将会消除任何音频。
                loop: false, // 导致视频一结束就重新开始。
                preload: 'auto', // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
                language: 'zh-CN',
                aspectRatio: '4:3', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
                fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
                sources: [{
                    type: "video/mp4",
                    src: ""
                }],
                // width: document.documentElement.clientWidth,
                notSupportedMessage: '此视频暂无法播放，请稍后再试', //允许覆盖Video.js无法播放媒体源时显示的默认信息。
                controlBar: {
                    timeDivider: false,
                    durationDisplay: false,
                    remainingTimeDisplay: false,
                    fullscreenToggle: false  //全屏按钮
                }
            },
            tusvnOption: {
                show: false,
                loading: false
            },
            // 阻止频繁加载数据
            stopFrequentLoad: {
                timeLimit: 1500,
                timer: null
            },
            initMapFlag: false,
            dataList: [],

            cameraParam: null
        }
    },
    computed: {
        player() {
            return this.$refs.videoPlayer.player
        }
    },
    watch: {
        deep: true,
        initMapFlag: {
            handler(newVal, oldVal) {
                if(newVal) {
                    console.log("初始化地图已完成");
                    if(this.dataList.length) {
                        console.log("列表加载在初始化地图之前");
                        this.setCurrentRow();
                    // }else {
                    //     console.log("列表加载在初始化地图之后-------测试数据");
                    //     this.testDataFunc();
                    }
                }
            }
        },
        dataList: {
            handler(newVal, oldVal) {
                if(this.initMapFlag) {
                    console.log("列表第一条地图已完成");
                    if(newVal.length) {
                        this.setCurrentRow();
                    }else {
                        this.tusvnOption.show = false;
                        this.tusvnOption.loading = false;
                    }
                }
            }
        }
    },
    created(){
    // mounted(){
        this.durationTime = (this.endTimeTimestamp - this.startTimeTimestamp)/1000;
        this.durationSecond = this.durationTime.toFixed(3).split(".")[0];
        this.durationMilliSecond = this.durationTime.toFixed(3).split(".")[1];
        this.getVideoUrl();
        this.findRoadMonitorCamera();
    },
    methods: {
        findRoadMonitorCamera() {
            findRoadMonitorCameraInfo({
                'serialNum':this.$route.params.serialNum
            }).then(res => {
                if(res.status == '200'){
                    this.cameraParam = JSON.parse(res.data[0].cameraParam);
                }
            })
        },
        setCurrentRow() {
            let _curTimestamp = Number(this.$dateUtil.dateToMs(this.curTime))+Number(this.currentMillisecond);
            let _interval = 0,
                _index;
            this.dataList.forEach((item, index) => {
                let _timeInterval = Math.abs(item.timestamp-_curTimestamp);
                // console.log(index, item.timestamp, this.$dateUtil.formatTime(item.timestamp, 'yy-mm-dd hh:mm:ss:ms'), _timeInterval);
                if(index == 0) {
                    _interval = _timeInterval;
                    _index = index;
                }else {
                    if(_interval > _timeInterval) {
                        _interval = _timeInterval;
                        _index = index;
                    }
                }
            });
            // console.log(_index, _interval);
            this.$refs.percepDetailTable.setCurrentRow(this.dataList[_index]);
        },
        getVideoUrl() {
            getVideoUrlInfo(this.$route.params).then(res => {
                if(res.status == '200'){
                    let _videoUrl = res.data.url;
                    this.playerOptions.sources[0].src = _videoUrl;
                }
            })
        },
        findPerceptionRecords() {
            this.loading = true;
            this.dataList = [];
            this.tusvnOption.show = false;
            this.tusvnOption.loading = true;
            findPerceptionRecordsInfo(this.perceptionData).then(res => {
                if(res.status == '200'){
                    res.data.forEach((item) => {
                        item.loading = false;
                    });
                    this.dataList = res.data;
                }
                this.loading = false;
            });
        },
        changeDate(time) {
            let _curDate = Number(time.getTime());
            if(_curDate < this.startTimeTimestamp) {
                console.log('小于最小时间');
                this.curTime = this.params.startTime;
                this.currentSecond = 0;
                this.currentMillisecond = '000';
            }else if((_curDate+Number(this.currentMilliSecond)) > (Number(this.endTimeTimestamp)+Number(this.durationMilliSecond))) {
                console.log('大于最大时间');
                this.curTime = this.params.endTime;
                this.currentSecond = this.durationSecond;
                this.currentMillisecond = this.durationMilliSecond;
            }else {
                console.log('正常时间范围内');
                this.currentSecond = (_curDate-this.startTimeTimestamp)/1000;
            }
            this.player.currentTime(this.currentSecond+'.'+this.currentMillisecond);
        },
        reduceTime() {
            if(this.currentMillisecond >= this.limit) {
                this.currentMillisecond = (Number(this.currentMillisecond) - this.limit) == 0 ? '000' : Number(this.currentMillisecond) - this.limit;
                this.player.currentTime(this.currentSecond+'.'+this.currentMillisecond);
            }else {
                if(this.currentSecond > 0) {
                    this.currentMillisecond = 1000-this.limit;         //减秒操作
                    this.currentSecond --;
                    this.player.currentTime(this.currentSecond+'.'+this.currentMillisecond);
                }
            }
            // console.log(this.currentMillisecond);
        },
        addTime(){
            if(Number(this.currentSecond) < Number(this.durationSecond)) {
                if(this.currentMillisecond < 1000-this.limit) {
                    this.currentMillisecond = Number(this.currentMillisecond) + this.limit; 
                }else {
                    this.currentMillisecond = '000';         //加秒操作
                    this.currentSecond ++;
                }
                this.player.currentTime(this.currentSecond+'.'+this.currentMillisecond);
            }else {
                if(this.currentMillisecond < this.durationMilliSecond - this.limit) {
                    this.currentMillisecond = Number(this.currentMillisecond) + this.limit;
                    this.player.currentTime(this.currentSecond+'.'+this.currentMillisecond);
                }
            }
            // console.log(this.currentMillisecond);
        },
        onPlayerTimeupdate(e) {
            console.log("onPlayerTimeupdate");
            // console.log(e.cache_.duration);
            // console.log('currentTime', e.cache_.currentTime);
            // if(this.currentTime != Number(e.cache_.currentTime.toFixed(1)).toFixed(3)) {
                this.currentTime = Number(e.cache_.currentTime.toFixed(1)).toFixed(3);
                if(this.currentTime.split('.')[0] != this.currentSecond) {
                    this.currentSecond = this.currentTime.split('.')[0];
                }
                if(this.currentTime.split('.')[1] != this.currentMillisecond) {
                    this.currentMillisecond = this.currentTime.split('.')[1];
                }
                if(e.cache_.duration) {
                    if(this.durationTime != e.cache_.duration) {
                        this.durationTime = e.cache_.duration;
                        this.durationSecond = this.durationTime.toFixed(3).split(".")[0];
                        this.durationMilliSecond = this.durationTime.toFixed(3).split(".")[1];
                    }
                }
                this.setProgressTime(e);
            // }
        },
        onPlayerLoadedData(e) {
            console.log("onPlayerLoadedData");
            if(this.playerOptions.sources[0].src != '') {
                // console.log("准备就绪----------");
                this.player.currentTime('0.001');
            }
        },
        playerError(e) {
            console.log("playerError");
            if(this.playerOptions.sources[0].src != '') {
                let _videoUrl = this.playerOptions.sources[0].src;
                this.playerOptions.sources[0].src = '';
                setTimeout(() => {
                    this.playerOptions.sources[0].src = _videoUrl;
                    this.player.currentTime('0.001');
                }, 2000);
            }
        },
        setProgressTime(obj) {
            let _second = this.currentSecond*1000,
                _curTime = this.startTimeTimestamp + Number(_second);
            this.curTime = this.$dateUtil.formatTime(_curTime);
            this.curTimeDate = this.curTime+'.'+this.currentMillisecond;
            // console.log('开始时间startTime：'+this.params.startTime);
            // console.log('结束时间endTime：'+this.params.endTime);
            // console.log('开始时间时间戳startTimeTimestamp：'+this.startTimeTimestamp);
            // console.log('结束时间时间戳endTimeTimestamp：'+this.endTimeTimestamp);
            // console.log('视频当前绝对时间(s)curTime：'+this.curTime);
            // console.log('视频当前绝对时间(ms)curTimeDate：'+this.curTimeDate);
            // console.log('视频当前相对时间(ms)currentTime：'+this.currentTime);
            // console.log('视频当前秒currentSecond：'+this.currentSecond);
            // console.log('视频当前毫秒currentMillisecond：'+this.currentMillisecond);
            // console.log('视频总时长(s.ms)durationTime：'+this.durationTime);
            // console.log('视频总时长秒数(s)durationSecond：'+this.durationSecond);
            // console.log('视频总时长的毫秒数(ms)durationMilliSecond：'+this.durationMilliSecond);

            // console.log(obj.controlBar.currentTimeDisplay.contentEl_);
            // obj.controlBar.currentTimeDisplay.contentEl_.innerHTML = this.curTimeDate;
            obj.controlBar.progressControl.children_[0].children_[2].el_.setAttribute('data-current-time', this.curTimeDate);
            // console.log("&&&&&&&&&&&&&&&&&&&");
            // console.log(this.curTime, this.currentMillisecond);
            if(this.stopFrequentLoad.timer) {
                clearTimeout(this.stopFrequentLoad.timer);
                this.stopFrequentLoad.timer = setTimeout(() => {
                    this.perceptionData.framesTime = this.$dateUtil.timeConversion(this.curTime)+this.currentMillisecond;
                    this.findPerceptionRecords();
                }, this.stopFrequentLoad.timeLimit);
            }else {
                this.stopFrequentLoad.timer = setTimeout(() => {
                    this.perceptionData.framesTime = this.$dateUtil.timeConversion(this.curTime)+this.currentMillisecond;
                    this.findPerceptionRecords();
                }, 0);
            }
        },
        showDetail(row) {
            if(row) {
                // console.log("进入列表-----------");
                // console.log(row);
                row.loading = true;
                this.tusvnOption.show = false;
                this.tusvnOption.loading = true;
                setTimeout(() => {
                    this.tusvnOption.show = true;
                    this.tusvnOption.loading = false;
                    row.loading = false;
                    // this.$refs.tusvnMap.updateCameraPosition(442481.5124901131,4427254.14590794,27.173398250989216,26.86058551360609,-0.6171498919343764,-0.43315502055389093);
                    this.$refs.tusvnMap.updateCameraPosition(this.cameraParam.x,this.cameraParam.y,this.cameraParam.z,this.cameraParam.radius,this.cameraParam.pitch,this.cameraParam.yaw);
                    this.$refs.tusvnMap.showBData2(row);
                }, 500);
            }
        },
        testDataFunc() {
            let _testData = {
                "field": [{
                    "latitude": 39.993361246927414,
                    "longitude": 116.3259240143911
                }],
                "data": {
                    "deviceType": 30634,
                    "rcuId": "2046A1037E1F",
                    "_id": "2046A1037E1F_30634_3402000000132000001601__1561015100278",
                    "deviceId": "3402000000132000001601",
                    "targets": [{
                        "boxY": 0,
                        "boxX": 868,
                        "relativeY": 14430,
                        "relativeX": 3680,
                        "latitude": 39.993361246927414,
                        "weight": 123,
                        "type": 2,
                        "boxHeight": 232,
                        "uuid": "F183C1D23404447FB5C46068F722BABF",
                        "speed": 0,
                        "len": 346,
                        "location": {
                            "coordinates": [116.3259240143911, 39.993361246927414],
                            "type": "Point"
                        },
                        "state": 0,
                        "boxWidth": 297,
                        "lane": 0,
                        "longitude": 116.3259240143911,
                        "height": 99
                    }],
                    "timestampStr": "2019-06-20 15:18:20.000278",
                    "timestamp": 1561015100278
                },
                "deviceId": "3402000000132000001601",
                "timestamp": 1561015100278
            };

            this.tusvnOption.show = false;
            this.tusvnOption.loading = true;
            setTimeout(() => {
                this.tusvnOption.show = true;
                this.tusvnOption.loading = false;
                console.log("haha-----------------");
                // this.$refs.tusvnMap.updateCameraPosition(442481.5124901131,4427254.14590794,27.173398250989216,26.86058551360609,-0.6171498919343764,-0.43315502055389093);
                this.$refs.tusvnMap.updateCameraPosition(this.cameraParam.x,this.cameraParam.y,this.cameraParam.z,this.cameraParam.radius,this.cameraParam.pitch,this.cameraParam.yaw);
                this.$refs.tusvnMap.showBData2(_testData);
            }, 500);
        },
        mapcomplete(row) {
            // setTimeout(() => {
                console.log("初始化地图已完成-----------");
                this.initMapFlag = true;
                // this.$refs.tusvnMap.updateCameraPosition(442481.5124901131,4427254.14590794,27.173398250989216,26.86058551360609,-0.6171498919343764,-0.43315502055389093);
                this.$refs.tusvnMap.updateCameraPosition(this.cameraParam.x,this.cameraParam.y,this.cameraParam.z,this.cameraParam.radius,this.cameraParam.pitch,this.cameraParam.yaw);
            // }, 3000);
        }
    }
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/theme.scss";
.sl-btn-box{
    margin: 200px 15px 0;
    float:left;
}
.sl-btn{
    width:40px;
    height:40px;
    float:left;
    font-size: 30px;
    padding: 0;
}
.percep-con {
    margin: 10px 40px;
    text-align: center;
}
.percep-title {
    font-size: 18px;
    color: #409EFF;
    text-align: left;
}
.percep-video{
    width: 520px;
    float:left;
}
.video-player {
    width: 520px;
    background-color: #000;
}
.percep-data{
    width:520px;
    float:left;
}
.time-input{
    float:left;
    position:relative;
}
.time-ms {
    position: absolute;
    right: 0;
    top: 1px;
    bottom: 1px;
    width: 43px;
}
.time-point{
    font-size:24px;
    position:absolute;
    top:0;
    bottom:0;
    right:46px;
    z-index:10;
    line-height: 34px;
    color: #606266;
}
.yk-table-box{
    min-height:100px;
    position:static;
    clear:both;
    overflow-y:auto;
}
.sl-table thead tr {
    text-align: center;
}
.sl-table tbody {
    height: auto;
    overflow-y: hidden;
}
.sl-table tbody tr {
    text-align: center;
}
.percep-wrap {
    width: 100%;
    height: 390px;
    background-color: #000;
}
.sl-table-text {
    @include lineClamp(4);
}
</style>
<style lang="scss">
.sl-table-popover {
    .el-popover__title {
        font-size: 14px;
        line-height: 18px;
    }
    .popover-content {
        padding-right: 5px;
        max-height: 300px;
        overflow-y: auto;
    }

}
.sl-video-player {
    position: relative;
}
.sl-video-player:after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 42px;
    z-index: 2;
}
.sl-video-player .vjs-text-track-display,
.sl-video-player .video-js .vjs-big-play-button,
.sl-video-player .vjs-button,
.sl-video-player .vjs-time-control {
    display: none !important;
}
.sl-video-player .vjs-control-bar {
    display: block !important;
}
.sl-video-player .vjs-progress-control {
    width: 100% !important;
}
.sl-video-player .vjs-play-progress:after {
    padding: 0 5px !important;
    width: auto !important;
    white-space: nowrap !important;
    right: -80px;
}
.sl-percepDetail-container {
    .current-row td {
        background: rgba(230, 162, 60, .5) !important;
    }
    .el-input__inner {
        font-size: 16px !important;
    }
    .el-date-editor.el-input, .el-date-editor.el-input__inner {
        width: 235px !important;
    }
    .time-ms .el-input__inner {
        padding: 0 !important;
        border: none !important;
        height: 38px !important;
    }
}
</style>
