
<template>
    <!-- 进度条组件 -->
    <div>
        <div class="yk-mask"></div>
        <div class="yk-box">
            <div class="yk-middle-box">
                <div class="yk-middle">
                    <div class="loadEffect">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        props:['isShow']
    }
</script>
<style scoped>
    h3{
        color: #ff0000;
    }

    
.yk-mask{
    width:100%;
    height: 100%;
    left:0;
    top:0;
    position: absolute;
    z-index:100;
    background-color: rgba(0,0,0,0.2);
}
.yk-box{
    left:0;
    right:0;
    top:0;
    bottom:0;
    position: absolute;
    z-index: 101;
}
/* .yk-middle-box{
    width:100%;
    height:100%;
    position: relative;
}
.yk-middle{
    top: 40%;
    transform: translateY(-40%);
    position: absolute!important;
    width: 100%;
    text-align: center;
} */
.loadEffect{
    width: 100px;
    height: 100px;
    position: relative;
    margin: 0 auto;
    margin-top:100px;
}
.loadEffect span{
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #066CAC;
    position: absolute;
    animation: load 1.04s ease infinite;
    -webkit-animation: load 1.04s ease infinite;
    -moz-animation: load 1.04s ease infinite;
    -o-animation: load 1.04s ease infinite;    
}
@keyframes load{
    0%{
        transform: scale(1.2);
        -webkit-transform: scale(1.2);
        -moz-transform: scale(1.2);
        -o-transform: scale(1.2);
        opacity: 1;
    }
    100%{
        transform: scale(.3);
        -webkit-transform: scale(.3);
        -o-transform: scale(.3);
        -moz-transform: scale(.3);
        opacity: 0.5;
    }
}
@-webkit-keyframes load{
    0%{
        transform: scale(1.2);
        -webkit-transform: scale(1.2);
        -moz-transform: scale(1.2);
        -o-transform: scale(1.2);
        opacity: 1;
    }
    100%{
        transform: scale(.3);
        -webkit-transform: scale(.3);
        -moz-transform: scale(.3);
        -o-transform: scale(.3);
        opacity: 0.5;
    }
}
@-moz-keyframes load{
    0%{
        transform: scale(1.2);
        -webkit-transform: scale(1.2);
        -moz-transform: scale(1.2);
        -o-transform: scale(1.2);
        opacity: 1;
    }
    100%{
        transform: scale(.3);
        -webkit-transform: scale(.3);
        -moz-transform: scale(.3);
        -o-transform: scale(.3);
        opacity: 0.5;
    }
}
@-o-keyframes load{
    0%{
        transform: scale(1.2);
        -webkit-transform: scale(1.2);
        -moz-transform: scale(1.2);
        -o-transform: scale(1.2);
        opacity: 1;
    }
    100%{
        transform: scale(.3);
        -webkit-transform: scale(.3);
        -moz-transform: scale(.3);
        -o-transform: scale(.3);
        opacity: 0.5;
    }
}
.loadEffect span:nth-child(1){
    left: 0;
    top: 50%;
    margin-top:-10px;
    animation-delay:0.13s;
    -webkit-animation-delay:0.13s;
    -o-animation-delay:0.13s;
    -moz-animation-delay: 0.13s;
}
.loadEffect span:nth-child(2){
    left: 14px;
    top: 14px;
    animation-delay:0.26s;
    -webkit-animation-delay:0.26s;
    -moz-animation-delay:0.26s;
    -o-animation-delay:0.26s;
}
.loadEffect span:nth-child(3){
    left: 50%;
    top: 0;
    margin-left: -10px;
    animation-delay:0.39s;
    -webkit-animation-delay:0.39s;
    -moz-animation-delay:0.39s;
    -o-animation-delay:0.39s;
}
.loadEffect span:nth-child(4){
    top: 14px;
    right:14px;
    animation-delay:0.52s;
    -webkit-animation-delay:0.52s;
    -moz-animation-delay:0.52s;
    -o-animation-delay:0.52s;
}
.loadEffect span:nth-child(5){
    right: 0;
    top: 50%;
    margin-top:-10px;
    animation-delay:0.65s;
    -webkit-animation-delay:0.65s;
    -moz-animation-delay:0.65s;
    -o-animation-delay:0.65s;
}
.loadEffect span:nth-child(6){
    right: 14px;
    bottom:14px;
    animation-delay:0.78s;
    -webkit-animation-delay:0.78s;
    -moz-animation-delay:0.78s;
    -o-animation-delay:0.78s;
}
.loadEffect span:nth-child(7){
    bottom: 0;
    left: 50%;
    margin-left: -10px;
    animation-delay:0.91s;
    -webkit-animation-delay:0.91s;
    -moz-animation-delay:0.91s;
    -o-animation-delay:0.91s;
}
.loadEffect span:nth-child(8){
    bottom: 14px;
    left: 14px;
    animation-delay:1.04s;
    -webkit-animation-delay:1.04s;
    -moz-animation-delay:1.04s;
    -o-animation-delay:1.04s;
}
</style>