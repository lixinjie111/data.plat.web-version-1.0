<template> 
    <div class="c-video-16-9" :class="isStretch ? 'c-video-fullscreen' : ''">
        <div class="c-video">
            <div class="c-video-title">
                <!-- <span class="title">路侧点：16:9</span> -->
                <slot></slot>
                <i class="el-icon-refresh" v-if="refreshFlag" @click="refreshVideo"></i>
            </div>
            <div class="c-video-mask" v-if="videoOption.videoMaskFlag">
                <i class="el-icon-video-play" v-if="videoOption.playFlag" @click="requestVideo"></i>
                <i class="el-icon-loading" v-if="videoOption.loadingFlag"></i>
                <span class="c-video-tip" v-if="videoOption.playError">{{videoOption.videoText}}</span>
                <i class="el-icon-refresh" v-if="videoOption.playError" @click="refreshVideo"></i>
            </div>
            <live-player 
                class="c-live-player" 
                ref="livePlayer" 
                :videoUrl="videoUrl" 
                autoplay
                :fluent="true" 
                :live="liveFlag"
                @message="onPlayerMessage"
                @error="onPlayerError"
                @ended="onPlayerEnded"
                @timeupdate="onPlayerTimeupdate"
                @pause="onPlayerPause"
                @play="onPlayerPlay"
                >
            </live-player>
        </div>
    </div>
</template>

<script>
// 视频插件
import LivePlayer from '@liveqing/liveplayer'
export default {
    name: 'LivePlayerTemplate',
    props: {
        isShowMask:Boolean,
        requestVideoUrl: [Function, String],  //请求视频axios封装方法/视频地址
        params: Object, //请求视频参数
        type: String,   //视频字段名
        liveFlag: {     //是否是直播
            default: true,
            type: Boolean
        },
        isStretch: {     //是否拉伸，即父级盒子不是16：9或4：3
            default: false,
            type: Boolean
        },
        refreshFlag: {     //是否显示标题栏的刷新按钮
            default: true,
            type: Boolean
        },
        autoplay: {     //是否自动加载视频，true-自动加载视频，false-手动加载视频
            default: false,
            type: Boolean
        }
    },
    components: {
        LivePlayer
    },
    data () {
        return {
            videoUrl: "",
            videoOption: {
                videoMaskFlag: true,
                playFlag: true,
                loadingFlag: false,
                playError: false,
                videoText: "暂无视频数据"
            },
            videoLoadingDelay: {
                timer: null,
                countTime: 30,
                reloadTime: 3,
                reloadCountLimit: 3,
                reloadCount: 0,
                lastTimeupdate: -1,
                count: 0
            },
            player: null
        }
    },
    watch: {
        deep: true,
        'videoOption.loadingFlag'(newVal, oldVal) {
            this.initVideoTimer();
            if(newVal) {
                this.videoTimer();
            }
        },
        // 'videoLoadingDelay.count'(newVal, oldVal) {
        //     console.log(newVal);
        // },
        'requestVideoUrl'(newVal,oldVal){
            if(newVal){
                this.videoLoadingDelay.count = 0;
                this.requestVideoUrl = newVal;
                this.videoUrl = "";
                this.requestVideo();
            }
        },
        'videoUrl'(newVal,oldVal){
            if(!newVal){
                this.videoLoadingDelay.lastTimeupdate = -1;
            }
        },
        'isShowMask'(newVal){
            this.videoOption.videoMaskFlag = newVal;
            if(newVal === true){
                this.refreshFlag = false;
                this.videoOption.playError = false;
                this.setVideoOptionError();
            } else {
                this.setVideoOptionLoading();
                this.requestVideo();
            }
            console.log(newVal);
        }
    },
    mounted() {
        this.player = this.$refs.livePlayer.player ? this.$refs.livePlayer.player : this.$refs.livePlayer;
        if(this.autoplay) {
            this.requestVideo();
        }
    },
    methods: {
        initVideoTimer() {
            if(this.videoLoadingDelay.timer) {
                clearInterval(this.videoLoadingDelay.timer);
                clearInterval(this.videoLoadingDelay.timer._id);
            }
            this.videoLoadingDelay.count = 0;
            this.videoLoadingDelay.reloadCount = 0;
        },
        videoTimer() {
            this.videoLoadingDelay.timer = setInterval(() => {
                if(this.videoLoadingDelay.count >= this.videoLoadingDelay.countTime) {
                    this.setVideoOptionError("受网络环境影响暂无法播放，请稍后再试");
                    this.videoUrl = "";
                }else {
                    this.videoLoadingDelay.count ++;
                    console.log("视频超时"+this.videoLoadingDelay.countTime,this.videoLoadingDelay.count);
                }
            }, 1000);
        },
        setVideoOptionPause() {
            this.initVideoTimer();
            this.videoOption.videoMaskFlag = true;
            this.videoOption.playFlag = true;
            this.videoOption.loadingFlag = false;
            this.videoOption.playError = false;
        },
        setVideoOptionLoading() {
            this.videoOption.videoMaskFlag = true;
            this.videoOption.playFlag = false;
            this.videoOption.loadingFlag = true;
            this.videoOption.playError = false;
        },
        setVideoOptionError(errorMsg) {
            this.initVideoTimer();
            this.videoOption.videoMaskFlag = true;
            this.videoOption.playFlag = false;
            this.videoOption.loadingFlag = false;
            // this.videoOption.playError = true;
            this.videoOption.videoText = errorMsg;
            this.videoUrl = '';
        },
        setVideoOptionClose() {
            this.initVideoTimer();
            if(this.videoOption.videoMaskFlag) {
                this.videoOption.videoMaskFlag = false;
                this.videoOption.playFlag = false;
                this.videoOption.loadingFlag = false;
                this.videoOption.playError = false;
            }
        },
        onPlayerMessage(player) {
            console.log("playerMessage", player);
        },
        onPlayerError(player) {
            console.log("playerError", player);
            this.setVideoOptionError("此视频暂无法播放，请稍后再试");
        },
        onPlayerEnded(player) {
            // console.log("ended", player);
            this.setVideoOptionPause();
        },
        onPlayerTimeupdate(player) {
            // console.log("timeupdate", player, this.videoLoadingDelay.lastTimeupdate);
            if(this.videoLoadingDelay.lastTimeupdate != player) {
                // console.log("---------更新");
                this.videoLoadingDelay.lastTimeupdate = player;
                this.setVideoOptionClose();
            }
            // setTimeout(() => {
            //     this.videoTimerReload();
            // }, 0);
            this.$emit("videoTimeupdate",player);
        },
        onPlayerPause() {
            // console.log("pause", player);
            this.setVideoOptionPause();
        },
        // listen event
        onPlayerPlay(player) {
            // console.log('play!', player);
            this.setVideoOptionClose();
        },
        requestVideo() {
            this.setVideoOptionLoading();
            if(!this.videoUrl) {
                // 请求接口
                if(typeof this.requestVideoUrl == "function") {
                    this.requestVideoUrl(this.params).then(res => {
                        if(res.status == 200) {
                            if(res.data[this.type]) {
                                this.videoUrl = res.data[this.type];
                                if(!this.liveFlag) {
                                    this.setVideoOptionClose();
                                }else {
                                    this.initVideoTimer();
                                    this.videoTimer();
                                }
                                // setTimeout(() => {
                                //     this.player.play();
                                // }, 0);
                                this.$emit("videoLoadCompleted");
                            }else {
                                this.videoUrl = '';
                                this.setVideoOptionError("暂无视频数据");
                            }
                        }else {
                            this.setVideoOptionError(res.message || "接口响应失败，请稍后再试");
                        }
                    }).catch(err => {
                        this.setVideoOptionError("接口响应失败，请稍后再试");
                    });
                }else {
                    if(this.requestVideoUrl) {
                        console.log('1111')
                        this.videoUrl = this.requestVideoUrl;
                        if(!this.liveFlag) {
                            this.setVideoOptionClose();
                        }
                        // setTimeout(() => {
                        //     this.player.play();
                        // }, 0);
                        this.$emit("videoLoadCompleted");
                    }else {
                        this.setVideoOptionError("暂无视频数据");
                    }
                }
            }else {
                if(!this.liveFlag) {
                    this.setVideoOptionClose();
                    this.player.play();
                }else {
                    let _oldUrl = this.videoUrl;
                    this.videoUrl = "";
                    setTimeout(() => {
                        this.videoUrl = _oldUrl;
                    }, 0);
                }
            }
        },
        refreshVideo(){
            this.videoUrl = '';
            this.initVideoTimer();
            this.initVideo();
            setTimeout(() => {
                this.requestVideo();
                this.$emit("refreshVideo");
            }, 0); 
        },
        initVideo() {
            // this.initVideoTimer();
            this.setVideoOptionPause();
            this.videoUrl = '';
        }
    },
    destoryed() {
        if(this.videoLoadingDelay.timer) {
            clearInterval(this.videoLoadingDelay.timer);
            clearInterval(this.videoLoadingDelay.timer._id);
        }
        if(this.player) {
            this.player.pause();
        }else {
            this.initVideoTimer();
            this.videoUrl = '';
        }
    }
}
</script>

<style lang="scss">
@import '@/assets/scss/live-player-reset.scss';
</style>