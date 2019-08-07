<template>
    <div class="c-wrapper-20">
        <div class="index-logo-wrap">
            <img class="index-logo" src="static/images/banner.png">
            <p class="index-text">智能网联汽车数据管理平台</p>
            <div class="index-footer">
                <div class="index-footer-left">
                    <span>建议浏览器：Chrome</span>
                    <span class="c-ml-20">建议分辨率：1920x1080</span>
                </div>
                <div class="index-footer-center">
                    <a class="index-footer-list" href="javascript:;" @click="clickFn(item)" v-for="item in linkData">{{item.title}}</a>
                </div>
                <div class="index-footer-right">
                    <span>版本信息：V1.1-build20190718</span>
                    <a href="javascript:;" class="index-blue-color" @click="$router.push('/logs')">更新日志</a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Index',
    data () {
        return {
            linkData: [{
                title: "启迪云控官网",
                link: "http://www.tusvn.com/"
            }, {
                title: "运营管理平台",
                link: "http://120.133.21.14:9090/operationPlatform/#/home"
            }, {
                title: "交通信息发布平台",
                link: "http://120.133.21.14:9094/trafficInfoRelease/"
            }, {
                title: "监控管理平台",
                link: "http://120.133.21.14:9093/dataMonitor/#/dataMonitor"
            }]      
        }
    },
    methods: {
        clickFn(item) {
            window.open(item.link);
        }
    }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/theme.scss';
.c-wrapper-20 {
    .index-logo-wrap {
        position: absolute;
        left: 20px;
        right: 20px;
        top: 20px;
        bottom: 20px;
        background-color: $black;
    }
	.index-logo {
		width: 100%;
        height: 100%;
	}
    .index-text {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        @include layoutMode();
        font-size: 36px;
        color: #fff;
        letter-spacing: 5px;
    }
	.index-footer {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 60px;
        padding: 0 25px;
		@include layoutMode(all);
    	font-size: 14px;
        color: #999;
		.index-footer-list {
            position: relative;
            margin: 0 10px;
            cursor: pointer;
            padding-left: 10px;
            &:hover {
                text-decoration: underline;
            }
            &:before {
                content: "";
                position: absolute;
                left: 0;
                top: 50%;
                margin-top: -2px;
                width: 5px;
                height: 5px;
                background-color: #3293bd;
                border-radius: 50%;
            }
		}
	}
    .index-footer-center, .index-blue-color {
        color: #3293bd;
    }
    .index-blue-color {
        &:hover {
            text-decoration: underline;
        }
    }
}
</style>