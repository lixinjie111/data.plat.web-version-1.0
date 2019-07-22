<template>
<div class='c-view-dialog'>
    <div>

        <p class="c-title c-border-bottom">查看路侧点信息<el-page-header @back="backClick" class="c-return-btn"></el-page-header></p>
        <div class="base-info-top"><label>路侧点:</label> <span>{{roadPointName}}</span></div>
        <div class='roadMapInfo c-mt-10'>
            <tusvn-map ref="perceMap2" targetId="mec11" overlayContainerId="mec12" :isMasker='false' :isCircle='false'></tusvn-map>
        </div>
        <div class="yk-search-box">                
            <div class="yk-search-block yk-block-label">
                <label class="colGrap">基本信息</label>
            </div>          
        </div>
        <div class="yk-table-box" style="height:auto;min-height:auto;">
            <table class="yk-table">
                <thead>
                <tr>                        
                    <th scope="col" style="width:8%;">道路ID</th>
                    <th scope="col" style="width:14%;">道路名称</th>
                    <th scope="col" style="width:22%;">经纬度</th>                       
                    <th scope="col" style="width:20%;">所属行政区域</th>
                    <th scope="col" style="width:15%;">所属MEC</th>
                    <th scope="col" style="width:12%;">绑定设备数</th>
                </tr>
                </thead>
                <tbody style="height:auto;min-height:auto;">
                    <tr class="yk-table-body">
                        <!-- 道路Id -->
                        <td style="width:8%;">{{rspRoadId}}</td>
                        <!-- 道路名称 -->
                        <td style="width:14%;">{{roadName}}</td>
                        <!-- 经纬度 -->
                        <td style="width:22%;">{{lon}},{{lat}}</td>
                        <!-- 所属行政区域 -->
                        <td style="width:20%;">{{distName}}</td>
                        <!-- 所属MEC -->
                        <td style="width:14%;">{{mecName}}</td>
                        <!-- 绑定设备数 -->
                        <td style="width:10%;">{{bindingDevCount}}</td>
                    </tr>
                </tbody>
            </table>                
        </div>
        <div class="yk-search-box">                
            <div class="yk-search-block yk-block-label">
                <label class="colGrap">绑定设备列表</label>
            </div>          
        </div>
        <div class="yk-table-box">
            <table class="yk-table">
                <thead>
                <tr>                        
                    <th scope="col" style="width:5%;">序号</th>
                    <th scope="col" style="width:12%;">设备类型</th>
                    <th scope="col" style="width:8%;">设备ID</th>
                    <th scope="col" style="width:28%;">设备序列号</th>                       
                    <th scope="col" style="width:10%;">朝向</th>
                </tr>
                </thead>
                <tbody style="height:auto;min-height:auto;">
                <tr class="yk-table-body" v-for='(item,index) in deviceDataList' :key="index" style="height:auto;min-height:auto;">
                    <td style="width:7%;">{{ index + paging.size * (paging.index)+1}}</td>
                    <!--设备类型-->
                    <td style="width:20%;">{{item.deviceTypeName}}</td>
                    <!-- 设备ID-->
                    <td style="width:14%;">{{item.deviceId}}</td>
                    <!--设备序列号-->
                    <td style="width:45%;">{{item.serialNum}}</td>
                    <!-- 朝向-->
                    <td>{{item.direction}}</td>
                    </tr>
                </tbody>
            </table>                
        </div>
    </div>
</div>

</template>
<script>
import TusvnMap from "../../../common/view/TusvnMap/TusvnMap.vue";
export default {
    props:['roadPointId','roadPointName'],
    components:{
        TusvnMap
    },
    data(){
        return{
            rspRoadId:'',
            roadName:'',
            lat:'',
            lon:'',
            distName:'',
            mecName:'',
            bindingDevCount:'',
            deviceDataList:[],
            paging: {
                index: 0,
                size: 10,
                total: 0,
            },
        }
    },
    methods:{
        init(roadPId){
            this.getRoadPointInfo(roadPId);
        },
        backClick(){
            this.$emit('roadInfoBack');
        },
        getRoadPointInfo(roadPointId){
            this.$api.post('road/queryRoadPointInfo',{
                "roadPointId":roadPointId
            },response => {
                if(response.status >= 200 && response.status < 300){
                    let _this = this;
                    _this.lon = response.data.data.lon;
                    _this.lat = response.data.data.lat;
                    _this.rspRoadId = response.data.data.rspRoadId;
                    _this.distName = response.data.data.distName;
                    _this.roadName = response.data.data.roadName;
                    _this.mecName = response.data.data.mecName;
                    _this.bindingDevCount = response.data.data.bindingDevCount;
                    // _this.$refs.perceMap2.centerAt(_this.lon,_this.lat);
                    
                    let popupIntervalHandle = setInterval(() => {
                        let layHtml = `<span>路侧点:${roadPointId}</span>`;;
                        _this.$refs.perceMap2.addInfoWindow({
                            id:"0033",
                            content:layHtml,
                            lon:_this.lon,
                            lat:_this.lat
                        });
                        clearInterval(popupIntervalHandle);
                    },100);
                    let deviceList = response.data.data.deviceList;
                    if(deviceList != '' || deviceList != [] || deviceList != null){
                        _this.deviceDataList = response.data.data.deviceList;
                        _this.$message.sucess(tip.msg);
                        
                    }else{
                        this.$message.error('获取列表失败');
                    }
                }
            });
        },

    },
    mounted(){
        this.init(this.roadPointId);
    }
}
</script>
<style lang="scss" scoped>
@import "@/assets/scss/theme.scss";
.base-info-top {
    font-size:16px;
    color:#666;
    padding: 0 30px;
    height: 54px;
    @include layoutMode(align);
    span {
        color: $black;
    }
}
.roadMapInfo{
    height:300px;
}
</style>
