<template>
    <div class="c-wrapper-20 c-detail-box">
        <p class="c-title c-border-bottom">{{title}}</p>
        <div class="c-wrapper-10 veh-operation-info">
            <ul class="veh-operation-info-bottom clearfix">
                <li v-for="(item,index) in statData" :key="index" class="veh-operation-info-list">
                    <p class="title">{{item.name}}</p>
                    <p class="text">{{item.value}}</p>
                </li>
            </ul>  
        </div>    
    </div>
</template>
<script>
export default {
    name: "vehicleStat",
    props: {
        title: String,
        statData: Array
    },
    data() {
        return {}
    }
}
</script>
<style lang="scss" scoped>
@import "@/assets/scss/theme.scss";

.veh-operation-info{
    font-size: 16px;
    line-height: 24px;
    color: $fontGrayColor;
    .veh-operation-info-bottom{
        text-align: center;    
        .veh-operation-info-list{
            float: left;      
            width: 20%;
            min-width: 200px;
            height: 140px;
            &:last-child {
                border-right: none;
            }
            .title {
                margin-top: 24px;
            }
            .text {
                margin-top: 24px;
                color: #000;
            }
        }
    }
}

</style>
