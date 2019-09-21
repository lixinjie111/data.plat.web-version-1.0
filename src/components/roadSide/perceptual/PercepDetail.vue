<template>
    <!-- 基本信息 -->
    <div class="c-view-dialog" v-cloak>
        <div class="c-scroll-wrap">
            <div class="c-scroll-inner">
                <div class="c-title-fixed">
                    <h3 class="c-title">
                        感知数据<i class='el-icon-arrow-right'></i>路侧摄像头视频数据
                        <el-page-header @back="$router.go(-1);" class="c-return-btn"></el-page-header>
                    </h3>
                </div>
                <!-- <div class="sl-percepDetail-container c-wrapper-20" v-loading="boxLoading"> -->
                <div class="sl-percepDetail-container c-wrapper-20">
                    <div class='sl-btn-box clearfix'>
                        <el-button class="sl-btn" type="warning" icon="el-icon-arrow-left" @click="reduceTime"></el-button>
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
                        <el-button class="sl-btn" type="warning" icon="el-icon-arrow-right" @click="addTime"></el-button>
                    </div>
                    <div class="sl-percepDetail-content c-mt-20">
                        <div class="sl-table c-padding-20 c-detail-box">
                            <el-table
                                ref="percepDetailTable" 
                                :data="dataList" 
                                stripe 
                                border
                                v-loading="loading" 
                                highlight-current-row
                                @current-change="showDetail"
                                :row-class-name="rowClassName"
                                max-height="763"
                                :cell-style="{
                                    cursor: 'pointer'
                                }">
                                <!-- 关于分页 -->
                                <!-- <el-table-column min-width="5%" label="编号" type="index" :index="indexMethod"></el-table-column> -->
                                <!-- <el-table-column label="编号" type="index" :class="item.currentFlag ? 'is-active' : ''"></el-table-column> -->
                                <!-- <el-table-column label="编号" type="index"> -->
                                <el-table-column label="编号" type="index"></el-table-column>
                                <el-table-column min-width="20%" label="时间">
                                    <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.timestamp, 'yy-mm-dd hh:mm:ss:ms')}}</template>
                                </el-table-column>
                                <!-- <el-table-column min-width="30%" label="感知目标数据">
                                    <template slot-scope="scope">
                                        <el-popover placement="top" width="350" trigger="hover" popper-class="c-table-popover" :open-delay="2000">
                                            <div class="c-table-popover-content" v-html="scope.row.field"></div>
                                            <p class="c-table-popover-text" slot="reference" v-html='scope.row.field'></p>
                                        </el-popover>
                                    </template>
                                </el-table-column> -->
                                <el-table-column min-width="10%" label="时间差">
                                    <template slot-scope="scope">
                                        <p>{{scope.row.timeDiffer}}</p>
                                    </template>
                                </el-table-column>
                                <el-table-column min-width="10%" label="车的数量">
                                    <template slot-scope="scope">
                                        <p>{{scope.row.carNum}}</p>
                                    </template>
                                </el-table-column>
                                <el-table-column min-width="10%" label="行人数量">
                                    <template slot-scope="scope">
                                        <p>{{scope.row.personNum}}</p>
                                    </template>
                                </el-table-column>
                                <el-table-column min-width="10%" label="出现车辆">
                                    <template slot-scope="scope">
                                        <el-popover placement="top" width="350" trigger="click" popper-class="c-table-popover">
                                            <div class="c-table-popover-content" v-html="scope.row.addCar"></div>
                                            <p class="c-table-popover-text" slot="reference" v-html='scope.row.addCar'></p>
                                        </el-popover>
                                    </template>
                                </el-table-column>
                                <el-table-column min-width="10%" label="消失车辆">
                                    <template slot-scope="scope">
                                        <el-popover placement="top" width="350" trigger="click" popper-class="c-table-popover">
                                            <div class="c-table-popover-content" v-html="scope.row.disappearCar"></div>
                                            <p class="c-table-popover-text" slot="reference" v-html='scope.row.disappearCar'></p>
                                        </el-popover>
                                    </template>
                                </el-table-column>
                                <el-table-column min-width="50%" label="原始感知数据">
                                    <template slot-scope="scope">
                                        <el-popover placement="top" width="600" trigger="hover" popper-class="c-table-popover" :open-delay="2000">
                                            <div class="c-table-popover-content" v-html="scope.row.data"></div>
                                            <p class="c-table-popover-text" slot="reference" v-html='scope.row.data'></p>
                                        </el-popover>
                                    </template>
                                </el-table-column>
                                <!-- <el-table-column min-width="7%" label="操作">
                                    <template slot-scope="scope"><el-button size="small" icon="el-icon-view" circle type="warning" plain :loading="scope.row.loading"></el-button>
                                    </template>
                                </el-table-column> -->
                            </el-table>
                        </div>
                        <div class='percep-con c-padding-20 c-detail-box clearfix'>
                            <div class='percep-video'>
                                <p class="c-title percep-title">路侧摄像头视频数据</p>
                                <video-player class="video-player vjs-custom-skin sl-video-player"
                                    ref="videoPlayer"
                                    :playsinline="true"
                                    :options="playerOptions" 
                                    @loadeddata="onPlayerLoadedData"
                                    @timeupdate="onPlayerTimeupdate"
                                    @error="playerError"
                                    @play="playFunc"
                                ></video-player>                
                            </div>
                            <div class="percep-data">
                                <p class="c-title percep-title">融合感知数据</p>
                                <div class="percep-wrap" v-loading="tusvnOption.loading" >
                                    <tusvn-map 
                                        class="sl-tusvn-map"
                                        target-id="tusvnMap" 
                                        ref="tusvnMap" 
                                        v-show="tusvnOption.show"
                                        @mapcomplete="mapcomplete">
                                    </tusvn-map>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import TList from '@/common/utils/list.js'
import TMDate from '@/common/utils/date.js'
import VueDatepickerLocal from 'vue-datepicker-local'
import TusvnMap from "@/common/view/TusvnMap/Tusvn3DMap3.vue";
import { getMap } from '@/common/view/TusvnMap/tusvnMap3.js';
import { findRoadMonitorCameraInfo, getVideoUrlInfo, findPerceptionRecordsInfo } from '@/api/roadSide';
import { setTimeout } from 'timers';
export default {
    name: 'PercepDetail',
    components: {
        VueDatepickerLocal,
        TusvnMap
    },
    data(){
        let _this = this;
        return {
            // boxLoading: true,
            loading: false,
            params: {
                "serialNum": this.$route.params.serialNum, //设备序列号
                "startTime": this.$dateUtil.formatTimeReal(this.$route.params.startTime), //开始时间
                "endTime": this.$dateUtil.formatTimeReal(this.$route.params.endTime)    //截至时间
            },
            perceptionData: {
                "serialNum": this.$route.params.serialNum, //设备序列号
                "framesTime": '',
            },

            startTimeTimestamp: new Date(this.$dateUtil.formatTimeReal(this.$route.params.startTime)).getTime(),
            endTimeTimestamp: new Date(this.$dateUtil.formatTimeReal(this.$route.params.endTime)).getTime(),
            // currentTimeTimestamp: new Date(this.$dateUtil.formatTimeReal(this.$route.params.startTime)).getTime(),

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
                aspectRatio: '16:9', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
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
                    fullscreenToggle: true  //全屏按钮
                }
            },
            tusvnOption: {
                show: false,
                loading: false
            },
            // 阻止频繁加载数据
            stopFrequentLoad: {
                timeLimit: 2000,
                timer: null,
                bthTimer: null
            },
            initMapFlag: false,
            dataList: [],

            rowHeight: 0,
            currentIndex: -1,
            tableHeight: 0,

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
                    this.tusvnOption.show = true;
                    // console.log("初始化地图已完成");
                    if(this.dataList.length) {
                        // console.log("列表加载在初始化地图之前");
                        this.setCurrentRow();
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
                        this.tusvnOption.show = true;
                        this.tusvnOption.loading = false;
                        this.rowHeight = 0;
                        this.currentIndex = -1;
                    }
                }
            }
        },
        "perceptionData.framesTime"(newVal, oldVal) {
            console.log(newVal);
            console.log(oldVal);
            this.setTime(newVal);
            if(this.stopFrequentLoad.timer) {
                clearTimeout(this.stopFrequentLoad.timer._id);
            }
            
            this.stopFrequentLoad.timer = setTimeout(() => {
                console.log("加载数据--------------"+newVal);
                this.findPerceptionRecords();
                console.log('毫秒变化');
                console.log(this.currentMillisecond);
                this.player.currentTime(this.currentSecond+'.'+this.currentMillisecond);
            }, this.stopFrequentLoad.timeLimit);
        }
    },
    beforeRouteLeave(to, from, next) {
        if (to.name != "PercepData") {
            this.$parent.keepAliveArr = []; 
        }
        next();
    },
    mounted(){   
        let _this = this;
        this.durationTime = (this.endTimeTimestamp - this.startTimeTimestamp)/1000;
        this.durationSecond = this.durationTime.toFixed(3).split(".")[0];
        this.durationMilliSecond = this.durationTime.toFixed(3).split(".")[1];

        this.getVideoUrl();
        this.findRoadMonitorCamera();

        this.curTime = this.params.startTime;
        this.perceptionData.framesTime = this.startTimeTimestamp;
        console.log(this.curTime);

        //注册键盘事件
        document.onkeydown = function (event) {
            let e = event || window.event || arguments.callee.caller.arguments[0];
            e.preventDefault();
            if (_this.dataList && _this.dataList.length > 0 && e) {
                let _scrollTop = _this.$refs.percepDetailTable.bodyWrapper.scrollTop;
                if (e.keyCode == 38) {
                    if(_this.currentIndex > 0) {
                        _this.currentIndex --;
                        _this.$refs.percepDetailTable.setCurrentRow(_this.dataList[_this.currentIndex]);
                        if(_this.currentIndex*_this.rowHeight <= _scrollTop) {
                            _this.$refs.percepDetailTable.bodyWrapper.scrollTop = _this.currentIndex*_this.rowHeight;
                        }
                    }
                }
                if (e.keyCode == 40) {
                    if(_this.currentIndex <= _this.dataList.length) {
                        _this.currentIndex ++;
                        _this.$refs.percepDetailTable.setCurrentRow(_this.dataList[_this.currentIndex]);
                        if(_this.currentIndex*_this.rowHeight >= (_scrollTop + _this.tableHeight)) {
                            _this.$refs.percepDetailTable.bodyWrapper.scrollTop = (_this.currentIndex+1)*_this.rowHeight - _this.tableHeight;
                        }
                    }
                }
            }
        }

    },
    methods: {
        findRoadMonitorCamera() {
            findRoadMonitorCameraInfo({
                'serialNum':this.$route.params.serialNum
            }).then(res => {
                if(res.status == '200'){
                    this.cameraParam = JSON.parse(res.data[0].cameraParam);
                    // console.log("拿到摄像头角度");
                    if(this.initMapFlag) {
                        // console.log("更新视图角度");
                        this.$refs.tusvnMap.updateCameraPosition(this.cameraParam.x,this.cameraParam.y,this.cameraParam.z,this.cameraParam.radius,this.cameraParam.pitch,this.cameraParam.yaw);
                    }
                }
            }).catch(err => {
                this.tusvnOption.loading = false;
            });
        },
        setCurrentRow() {
            console.log(Number(this.currentMillisecond));
            let _curTimestamp = Number(this.$dateUtil.dateToMs(this.curTime))+Number(this.currentMillisecond);
            let _interval = 0,
                _index;
            this.dataList.forEach((item, index) => {
                let _timeInterval = Math.abs(item.timestamp-_curTimestamp);
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
            this.dataList[_index].isNearRow = true;
            if(this.$refs.percepDetailTable.bodyWrapper.children[0].children[1].children.length) {
                this.setScrollTop(_index);
            }else {
                setTimeout(() => {
                    this.setScrollTop(_index);
                }, 1000);
            }
        },
        setScrollTop(index) {
            this.currentIndex = index;
            this.$refs.percepDetailTable.setCurrentRow(this.dataList[index]);
            this.rowHeight = this.$refs.percepDetailTable.bodyWrapper.children[0].children[1].children[0].clientHeight;
            this.tableHeight = parseInt(this.$refs.percepDetailTable.bodyHeight['max-height']);
            this.$refs.percepDetailTable.bodyWrapper.scrollTop = this.rowHeight*this.currentIndex;
        },
        getVideoUrl() {
            getVideoUrlInfo(this.$route.params).then(res => {
                if(res.status == '200'){
                    let _videoUrl = res.data.url;
                    this.playerOptions.sources[0].src = _videoUrl;
                }
            }).catch(err => {
                // this.boxLoading = false;
                this.tusvnOption.loading = false;
            });
        },
        findPerceptionRecords() {
            this.loading = true;
            this.dataList = [];
            this.tusvnOption.loading = true;
            this.perceptionData.framesTime = this.$dateUtil.timeStampChange(this.perceptionData.framesTime);
            console.log(this.perceptionData.framesTime);
            findPerceptionRecordsInfo(this.perceptionData).then(res => {
                if(res.status == '200'){
                    res.data.forEach((item) => {
                        item.loading = false;
                    });
                    this.dataList = res.data;
                    this.timeDiffer(this.dataList);//计算时间差
                    this.carNum(this.dataList);//计算车的数量
                    this.personNum(this.dataList);//计算行人数量
                    this.carInfo(this.dataList);//车辆出现、消失情况
                    this.$refs.percepDetailTable.bodyWrapper.scrollTop = 0;
                }
                setTimeout(() => {
                    this.loading = false;
                    this.tusvnOption.loading = false;
                }, 100);
            }).catch(err => {
                this.loading = false;
                this.tusvnOption.loading = false;
            });
        },
        timeDiffer(arr){
            arr.map((val,index) => {
                if(index > 0){
                    let timeDiffer = parseInt(arr[index].timestamp) - parseInt(arr[index - 1].timestamp);
                    this.$set(val,'timeDiffer',timeDiffer);
                }else{
                    this.$set(val,'timeDiffer',0);
                }
            });
            return arr;
        },
        carNum(arr){
            arr.map((val,index) => {
                let typeCar = arr[index].data.targets.filter((item,i) => {
                    return item.type == 2;
                })
                this.$set(val,'carNum',typeCar.length);
            })
        },
        personNum(arr){
            arr.map((val,index) => {
                let typePerson = arr[index].data.targets.filter((item,i) => {
                    return item.type == 0;
                })
                this.$set(val,'personNum',typePerson.length);
            })
        },
        carInfo(arr){//查找消失、出现车辆
            arr.map((val,index) => {
                let lastCars = arr[index].data.targets.filter(x => x.uuid);
                let newCars = arr[index+1].data.targets.filter(item => item.uuid);
                let lastCarArry = [];
                let newCarArry = [];
                lastCars.map(item => lastCarArry.push(item.uuid));
                newCars.map(item => newCarArry.push(item.uuid));
                let disappearCars = lastCarArry.filter(val => newCarArry.indexOf(val) == -1);//查找消失车辆
                let addCars = newCarArry.filter(val => lastCarArry.indexOf(val) == -1);//查找出现车辆
                this.$set(val,'disappearCar',disappearCars);
                this.$set(val,'addCar',addCars);
            })
        },
        setTime(timestamp) {
            this.curTime = this.$dateUtil.formatTime(timestamp);
            let _time = ((timestamp-this.startTimeTimestamp)/1000).toFixed(3);
            this.currentSecond = _time.split(".")[0];
            let _timestamp = timestamp.toString();
            this.currentMillisecond = _timestamp.substr(_timestamp.length-3);
        },
        changeDate(time) {
            let _curDate = Number(time.getTime());
            if(this.currentMilliSecond != '000') {
                _curDate = Number(time.getTime())+Number(this.currentMillisecond);
            }
            if(_curDate < this.startTimeTimestamp) {
                console.log('小于最小时间');
                this.perceptionData.framesTime = this.startTimeTimestamp;
            }else if(_curDate > Number(this.endTimeTimestamp)) {
                console.log('大于最大时间');
                this.perceptionData.framesTime = this.endTimeTimestamp;

            }else {
                console.log('正常时间范围内');
                this.perceptionData.framesTime = _curDate;
            }
        },
        reduceTime() {
            if(this.perceptionData.framesTime - this.limit >= this.startTimeTimestamp) {
                this.perceptionData.framesTime -= this.limit;
            }else {
                this.perceptionData.framesTime = this.startTimeTimestamp;
            }
        },
        addTime(){
            if(this.perceptionData.framesTime + this.limit <= this.endTimeTimestamp) {
                this.perceptionData.framesTime += this.limit;
            }else {
                this.perceptionData.framesTime = this.endTimeTimestamp;
            }
        },
        onPlayerTimeupdate(e) {
            console.log(this.currentTime);
            console.log("onPlayerTimeupdate---------------");
            // console.log(e.cache_.duration);
            // console.log('currentTime', e.cache_.currentTime);
            // console.log(this.currentTime,e.cache_.currentTime,Number(e.cache_.currentTime.toFixed(1)).toFixed(3));
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
                        this.endTimeTimestamp = Number(this.startTimeTimestamp)+Number(this.durationSecond)*60*1000+Number(this.durationMilliSecond);
                    }
                }
                this.perceptionData.framesTime = this.startTimeTimestamp+Number(this.currentSecond*1000)+Number(this.currentMillisecond);
                // console.log(this.$dateUtil.formatTime(this.perceptionData.framesTime));

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
        playFunc() {
            this.player.pause();
        },
        setProgressTime(obj) {
            console.log(this.currentSecond, this.currentMillisecond);
            // this.boxLoading = false;
            let _second = this.currentSecond*1000,
                _curTime = this.startTimeTimestamp + Number(_second);
            // this.curTime = this.$dateUtil.formatTime(_curTime);
            // this.curTimeDate = this.curTime+'.'+this.currentMillisecond;
            this.curTimeDate = this.$dateUtil.formatTime(_curTime)+'.'+this.currentMillisecond;
            console.log("onPlayerTimeupdate---------------"+this.curTimeDate);
            obj.controlBar.progressControl.children_[0].children_[2].el_.setAttribute('data-current-time', this.curTimeDate);
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
            // console.log("&&&&&&&&&&&&&&&&&&&");
            // console.log(this.curTime, this.currentMillisecond);
            // if(this.stopFrequentLoad.timer) {
            //     clearTimeout(this.stopFrequentLoad.timer);
            //     this.stopFrequentLoad.timer = setTimeout(() => {
            //         this.perceptionData.framesTime = this.$dateUtil.timeConversion(this.curTime)+this.currentMillisecond;
            //         this.findPerceptionRecords();
            //     }, this.stopFrequentLoad.timeLimit);
            // }else {
            //     this.stopFrequentLoad.timer = setTimeout(() => {
            //         this.perceptionData.framesTime = this.$dateUtil.timeConversion(this.curTime)+this.currentMillisecond;
            //         this.findPerceptionRecords();
            //     }, 0);
            // }
        },
        showDetail(row) {
            if(row) {
                row.loading = true;
                this.tusvnOption.loading = true;
                setTimeout(() => {
                    this.tusvnOption.loading = false;
                    row.loading = false;
                    this.$refs.tusvnMap.updateCameraPosition(this.cameraParam.x,this.cameraParam.y,this.cameraParam.z,this.cameraParam.radius,this.cameraParam.pitch,this.cameraParam.yaw);
                    this.$refs.tusvnMap.showBData2(row);
                }, 500);
                this.currentIndex = row.index;
            }
        },
        rowClassName({row, rowIndex}) {
            //把每一行的索引放进row
            row.index = rowIndex;
            if(row.isNearRow) {
                return "is-active"
            }
        },
        mapcomplete(row) {
            this.initMapFlag = true;
            getMap(this.$refs.tusvnMap);
            if(this.cameraParam) {
                this.$refs.tusvnMap.updateCameraPosition(this.cameraParam.x,this.cameraParam.y,this.cameraParam.z,this.cameraParam.radius,this.cameraParam.pitch,this.cameraParam.yaw);
            }
        }
    },
    destroyed(){
        this.$refs.tusvnMap&&this.$refs.tusvnMap.reset3DMap();
        document.onkeydown = function (e) {
            if (e.keyCode == 38 || e.keyCode == 40) {
                e.preventDefault();
            }  
        } 
    }
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/theme.scss";
.sl-percepDetail-content {
    @include layoutMode(between);
    .sl-table {
        flex: 1;
        margin-right: 10px;
    }
    .percep-con {
        padding-top: 0;
        width: 600px;
    }
    .percep-title {
        font-size: 18px;
        padding-left: 20px;
        &:after {
            left: 0;
        }
    }
    .video-player {
        background-color: #000;
    }
    .percep-wrap {
        position: relative;
        padding-bottom: 56.25%;
        background-color: #000;
        .sl-tusvn-map {
            position: absolute;
            left: 0;
            rop: 0;
            right: 0;
            bottom: 0;
        }
    }
}

.sl-btn-box{
    .sl-btn{
        width:40px;
        height:40px;
        float:left;
        padding: 0;
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
}
</style>
<style lang="scss">
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
.sl-video-player .vjs-fullscreen-control {
    display: block !important;
    position: absolute !important;
    right: 0;
    top: 0;
    bottom: 0;
}
.sl-video-player .vjs-control-bar {
    display: block !important;
}
.sl-video-player .vjs-progress-control {
    position: absolute !important;
    top: 0;
    right: 45px;
    left: 0;
    bottom: 0;
    width: auto !important;
}
.sl-video-player .vjs-play-progress:after {
    padding: 0 5px !important;
    width: auto !important;
    white-space: nowrap !important;
    right: -80px;
}
.sl-percepDetail-container {
    .current-row {
        background: rgba(230, 162, 60, .5) !important;
    }
    .el-table td, .el-table .current-row td {
        background: transparent !important;
    }
    .is-active {
        background: rgba(141, 49, 200, .5) !important;
        // background: rgba(141, 49, 200, .5) !important;
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
