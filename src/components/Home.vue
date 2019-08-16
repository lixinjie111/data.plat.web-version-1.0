<template>

        <div class="index-logo-wrap">
            <img class="index-logo" src="static/images/banner.png">
            <p class="index-text">智能网联汽车数据管理平台</p>
        </div>

</template>

<script>
export default {
    name: 'Home',
    data () {
        return {
        }
    },
    methods: {
    }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/theme.scss';

    .index-logo-wrap {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background-color: $black;
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
    }
	

</style>