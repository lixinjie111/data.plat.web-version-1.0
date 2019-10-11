<template> 
    <div class="c-video-16-9">
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
            <video-player
                v-if="filterPlayerOptions.sources[0].src"
                class="c-video-player vjs-custom-skin"
                ref="videoPlayer"
                :options="filterPlayerOptions"
                :playsinline="true"
                @ready="playerReadied"
                @timeupdate="onPlayerTimeupdate"
                @play="onPlayerPlay"
                @pause="onPlayerPause"
                @ended="onPlayerEnded"
                @error="onPlayerError">
            </video-player>
        </div>
    </div>
</template>

<script>
// 视频插件
export default {
    name: 'VideoPlayerTemplate',
    props: {
        requestVideoUrl: [Function, String],  //请求视频axios封装方法/视频地址
        params: Object, //请求视频参数
        type: String,   //视频字段名
        videoType: String,   //视频类型
        liveFlag: {     //是否是直播
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
    data () {
        return {
            videoOption: {
                videoMaskFlag: true,
                playFlag: true,
                loadingFlag: false,
                playError: false,
                videoText: "暂无视频数据"
            },
            videoLoadingDelay: {
                timer: null,
                countTime: 10,
                count: 0
            },
            player: null,
            playerOptions:{
                playbackRates: [0.7, 1.0, 1.5, 2.0], //播放速度
                overNative: true,
                controls: true,
                autoplay: true, //如果true,浏览器准备好时开始回放。
                muted: true, // 默认情况下将会消除任何音频。
                loop: false, // 导致视频一结束就重新开始。
                preload: 'auto', // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
                language: 'zh-CN',
                aspectRatio: '16:9', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
                fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
                sources: [{
                    type: "video/"+this.type,
                    src: ""
                }],
                poster: "", //你的封面地址
                notSupportedMessage: '此视频暂无法播放，请稍后再试', //允许覆盖Video.js无法播放媒体源时显示的默认信息。
                controlBar: {
                    timeDivider: false,
                    durationDisplay: false,
                    currentTimeDisplay:false,
                    fullscreenToggle: true, //全屏按钮

                    remainingTimeDisplay: false,
                    captionsButton : false,
                    chaptersButton: false,
                    subtitlesButton:false,
                    liveDisplay:false,
                    playbackRateMenuButton:false
                }
            },
        }
    },
    computed: {
        filterPlayerOptions() {
            if(this.liveFlag) {
                return Object.assign({}, this.playerOptions, {
                    techOrder: ['flash'],
                    flash: { 
                        hls: { withCredentials: false }, 
                        // swf: _isProduction ? '/vueTemplate/static/media/video-js.swf' : '/static/media/video-js.swf' 
                        swf: '/static/media/video-js.swf' 
                    },
                });
            }else {
                return this.playerOptions
            }
            
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
            console.log(newVal);
        }
    },
    mounted() {
        if(this.autoplay) {
            this.requestVideo();
        }
        // setTimeout(()=>{
        //     if(this.player) {
        //         this.player.pause();
        //     }
        //     this.filterPlayerOptions.sources[0].src = "";
        //     this.player = null;
        //     this.setVideoOptionPause();
        // },5000);
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
                    this.filterPlayerOptions.sources[0].src = "";
                    this.player = null;
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
            this.filterPlayerOptions.sources[0].src = '';
            this.player = null;
        },
        setVideoOptionClose() {
            this.initVideoTimer();
            this.videoOption.videoMaskFlag = false;
            this.videoOption.playFlag = false;
            this.videoOption.loadingFlag = false;
            this.videoOption.playError = false;
        },
        // player is ready
        playerReadied(player) {
            // seek to 10s
            console.log('player ready');
            this.initVideoTimer();
            this.videoTimer();
        },
        onPlayerLoadeddata(player) {
            console.log('player Loadeddata!');
        },
        onPlayerError(player) {
            console.log("playerError", player);
            this.setVideoOptionError("此视频暂无法播放，请稍后再试");
        },
        onPlayerEnded(player) {
            console.log("ended", player);
            this.setVideoOptionPause();
        },
        onPlayerTimeupdate(player) {
            // console.log('player Timeupdate!', player.currentTime());
            this.setVideoOptionClose();
            this.$emit("videoTimeupdate",player);
        },
        onPlayerPause(player) {
            console.log("pause", player);
            this.setVideoOptionPause();
        },
        // listen event
        onPlayerPlay(player) {
            // console.log('play!', player);
            this.setVideoOptionClose();
        },
        requestVideo() {
            this.setVideoOptionLoading();
            if(!this.filterPlayerOptions.sources[0].src) {
                // 请求接口
                if(typeof this.requestVideoUrl == "function") {
                    this.requestVideoUrl(this.params).then(res => {
                        if(res.status == 200) {
                            if(res.data[this.type]) {
                                this.filterPlayerOptions.sources[0].src = res.data[this.type];
                                setTimeout(() => {
                                    this.player = this.$refs.videoPlayer.player;
                                }, 0);
                                this.$emit("videoLoadCompleted");
                            }else {
                                this.filterPlayerOptions.sources[0].src = '';
                                this.player = null;
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
                        console.log(this.requestVideoUrl);
                        this.filterPlayerOptions.sources[0].src = this.requestVideoUrl;
                        setTimeout(() => {
                            this.player = this.$refs.videoPlayer.player;
                        }, 0);
                        this.$emit("videoLoadCompleted");
                    }else {
                        this.setVideoOptionError("暂无视频数据");
                    }
                }
            }else {
                this.player.play();
            }
        },
        refreshVideo(){
            if(this.filterPlayerOptions.sources[0].src == ''){
                this.requestVideo();
            }else {
                if(this.liveFlag) {
                    this.setVideoOptionLoading();
                }
                this.videoLoadingDelay.count = 0;
                this.$emit("refreshVideo");
            }
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
@import '@/assets/scss/video-player-reset.scss';
</style>