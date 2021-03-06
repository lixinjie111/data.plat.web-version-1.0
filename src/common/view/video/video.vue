<template> 
    <div :class="isStretch ? 'c-video-fullscreen' : ''">
        <div class="c-video">
            <div class="c-video-mask" v-if="videoOption.videoMaskFlag">
                <i class="el-icon-video-play" v-if="videoOption.playFlag" @click="requestVideo"></i>
                <i class="el-icon-loading" v-if="videoOption.loadingFlag"></i>
                <span class="c-video-tip" v-if="videoOption.playError">{{videoOption.videoText}}</span>
                <i class="el-icon-refresh" v-if="videoOption.playError" @click="refreshVideo"></i>
            </div>
            <video 
                class="c-video"
                ref="histroyVideo" 
                autoplay
                controls
                preload="auto"
                :fluent="true" 
                :live="liveFlag"
                @message="onPlayerMessage"
                @error="onPlayerError"
                @ended="onPlayerEnded"
                @timeupdate="onPlayerTimeupdate"
                @pause="onPlayerPause"
                @play="onPlayerPlay"
                >
                <source :src='videoUrl' type='video/mp4' />
            </video>
        </div>
    </div>
</template>

<script>
// 视频插件
export default {
    name: 'videoPlay',
    props: {
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
                countTime: 15,
                count: 0
            }
        }
    },
    computed: {
        player() {
            return this.$refs.histroyVideo
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
        'videoLoadingDelay.count'(newVal, oldVal) {
            // console.log(newVal);
        }
    },
    mounted() {
        this.autoplay = true;
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
        },
        videoTimer() {
            this.videoLoadingDelay.timer = setInterval(() => {
                if(this.videoLoadingDelay.count >= this.videoLoadingDelay.countTime) {
                    this.setVideoOptionError("此视频暂无法播放，请稍后再试");
                    this.videoUrl = "";
                }else {
                    this.videoLoadingDelay.count ++;
                }
            }, 1000);
        },
        setVideoOptionPause() {
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
            this.videoOption.videoMaskFlag = true;
            this.videoOption.playFlag = false;
            this.videoOption.loadingFlag = false;
            this.videoOption.playError = true;
            this.videoOption.videoText = errorMsg;
            this.videoUrl = '';
        },
        setVideoOptionClose() {
            this.initVideoTimer();
            this.videoOption.videoMaskFlag = false;
            this.videoOption.playFlag = false;
            this.videoOption.loadingFlag = false;
            this.videoOption.playError = false;
        },
        onPlayerMessage(player) {
            console.log("playerMessage", player);
        },
        onPlayerError(player) {
            console.log("playerError", player);
            this.setVideoOptionError("此视频暂无法播放，请稍后再试");
        },
        onPlayerEnded(player) {
            console.log("ended", player);
            this.setVideoOptionPause();
            this.$emit('videoTimeEnd');
        },
        onPlayerTimeupdate(player) {
            let currentTime = this.player.currentTime;
            this.setVideoOptionClose();
            this.$emit("videoTimeupdate",currentTime);
        },
        onPlayerPause() {
            // console.log("pause", player);
            this.setVideoOptionPause();
            this.$emit('videoTimePause');
        },
        // listen event
        onPlayerPlay(player) {
            this.autoplay = true;
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
                }
                this.player.play();
            }
        },
        refreshVideo(){
            if(this.videoUrl == ''){
                this.requestVideo();
            }else {
                if(this.liveFlag) {
                    this.setVideoOptionLoading();
                }
                this.videoLoadingDelay.count = 0;
                this.$emit("refreshVideo");
                // this.$refs.histroyVideo && this.player.pause();
                // setTimeout(() => {
                //     this.setVideoOptionLoading();
                //     setTimeout(() => {
                //         this.player.play();
                //     }, 500);
                // }, 0);
            }
        },
        initVideo() {
            this.initVideoTimer();
            this.setVideoOptionPause();
            this.videoUrl = '';
        }
    },
    destoryed() {
        if(this.player) {
            this.player.pause();
        }
    }
}
</script>

<style lang="scss">
</style>