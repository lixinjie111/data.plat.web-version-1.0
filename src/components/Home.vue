<template>
    <div class="c-wrapper-20">
        <div class="index-logo-wrap">
            <img class="index-logo" src="static/images/banner.png">
            <p class="index-text">智能网联汽车数据分析中心</p>
            <div class="index-footer">
                <div class="index-footer-left">
                    <span>建议浏览器：Chrome</span>
                    <span class="c-ml-20">建议分辨率：1920x1080</span>
                </div>
                <div class="index-footer-right">
                    <span>版本信息：V{{version}}-build20191216</span>
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
            version:window.config.version
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
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
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
	}
    .index-blue-color {
        color: #3293bd;
    }
    .index-blue-color {
        &:hover {
            text-decoration: underline;
        }
    }
}
</style>