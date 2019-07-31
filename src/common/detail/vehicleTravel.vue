<template>
    <div class="c-wrapper-20 c-detail-box">
        <p class="c-title c-border-bottom" v-if="title">{{title}}</p>
        <ul class="travel-info clearfix">
            <li class="list" v-for="(item,index) in travelData" :key="index">
                <div class="list-inner">
                    <div class="img-wrap">
                        <img :src="item.icon" class="img" />
                    </div>
                    <div class="info">
                        <p class="title">{{item.name}}</p>
                        <p class="text">{{item.value || '--'}}</p>
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>
<script>
export default {
    name: "vehicleTravel",
    props: {
        title: String,
        travelData: Array
    },
    data() {
        return {}
    }
}
</script>
<style lang="scss" scoped>
@import "@/assets/scss/theme.scss";
.travel-info{
    padding: 20px;
    line-height: 30px;
    .list{
        float: left;
        width: 20%;
        min-width: 200px;
        box-sizing: border-box;
        padding: 10px;
        .list-inner {
            height: 118px;
            border: 1px solid $borderColor;
            .img-wrap {
                float: left;
                width: 40%;
                height: 100%;
                @include layoutMode();
                .img {
                    max-width: 52px;
                    // height: 52px;
                    object-fit: none;
                }
            }
            .info {
                margin-left: 40%;
                height: 100%;
                padding-top: 22px;
                box-sizing: border-box;
                .title {
                    font-size: 20px;
                    color: $fontGrayColor;
                    @include lineClampOne();
                }
                .text {
                    margin-top: 8px;
                    font-size: 24px;
                    color: $yellow;
                    @include lineClampOne();
                }
            }
        }
    }
}
</style>
