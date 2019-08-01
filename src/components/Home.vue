<template>
    <div class="c-wrapper-20">
        <div class="index-logo-wrap">
            <img class="index-logo" src="static/images/banner.png">
            <p class="index-text">智能网联汽车数据管理平台</p>
        </div>
        <ul class="index-footer">
            <li class="index-footer-list" @click="clickFn('www');">
                <img class="index-footer-icon" src="../assets/images/index/footer/www.png">
                <span class="index-footer-title">启迪云控官网</span>
            </li>
            <li class="index-footer-list" @click="clickFn('dmc');">
                <img class="index-footer-icon" src="../assets/images/index/footer/statics.png">
                <span class="index-footer-title">云控基础平台</span>
            </li>
            <li class="index-footer-list" @click="clickFn('operate-manage');">
                <img class="index-footer-icon" src="../assets/images/index/footer/operate-manage.png">
                <span class="index-footer-title">运营管理平台</span>
            </li>
            <li class="index-footer-list" @click="clickFn('ota');">
                <img class="index-footer-icon" src="../assets/images/index/footer/ota.png">
                <span class="index-footer-title">ota管理系统</span>
            </li>
        </ul>
    </div>
</template>
<script>
export default {
    data(){
        return{

        }
    },
    methods: {
        clickFn(type){
            switch(type){
                case 'www':
                    window.open('http://www.tusvn.com/');
                    break;
                case 'dmc':
                    window.open('http://10.0.1.36:8003/dmc/');
                    break;
                case 'operate-manage':
                    window.open('http://10.0.1.36:8003/operationPlatform/');
                    break;
                case 'ota':
                    window.open('http://10.0.1.36:8003/ota/');
                    break;
            }
            
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
        bottom: 80px;
        // bottom: 20px;
        background-color: #000;
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
        background-color: #fff;
        @include layoutMode();
        color: #00C1DE;
        font-size: 14px;
        line-height: 20px;
        .index-footer-list {
            border-right: 1px solid #00C1DE;
            cursor: pointer;
            @include layoutMode();
            padding: 0 10px;
            .index-footer-icon {
                height: 18px;
                margin-right: 5px;
            }
            &:last-child {
                border-right: none;
            }
            &:hover {
                text-decoration: underline;
            }
        }
    }
}
</style>