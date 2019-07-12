<template>
<div style='min-width:100%;height:100%;background:rgba(0,0,0,.3);position:absolute;top:0;left:50%;margin-left:-500px;'>
    <div class="yk-container cation" style='width:800px;height:420px;background:#fff;overflow:hidden;overflow-y:scroll;z-index:2000;'>
        <div class="yk-search-box" style="border-bottom:1px solid #ccc;">                
            <div class="yk-search-block yk-block-label">
                <label class="colGrap">路侧点: </label>
                <span>{{roadPointName}}</span>
            </div>          
        </div>
        <el-page-header @back="backClick" class="c-mt-30"></el-page-header>
        <!-- <div class="yk-btn-box yk-right yk-b-10">
            <span class="yk-btn-back" @click="backClick();">返回</span>
        </div> -->
        <div class='roadMapInfo'>
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
                    <th scope="col" style="width:11%;">道路ID</th>
                    <th scope="col" style="width:10%;">道路名称</th>
                    <th scope="col" style="width:20%;">经纬度</th>                       
                    <th scope="col" style="width:20%;">所属行政区域</th>
                    <th scope="col" style="width:14%;">所属MEC</th>
                    <th scope="col" style="width:12%;">绑定设备数</th>
                </tr>
                </thead>
                <tbody style="height:auto;min-height:auto;">
                    <tr class="yk-table-body">
                        <!-- 道路Id -->
                        <td style="width:11%;">{{rspRoadId}}</td>
                        <!-- 道路名称 -->
                        <td style="width:10%;">{{roadName}}</td>
                        <!-- 经纬度 -->
                        <td style="width:20%;">{{lon}},{{lat}}</td>
                        <!-- 所属行政区域 -->
                        <td style="width:20%;">{{distName}}</td>
                        <!-- 所属MEC -->
                        <td style="width:14%;">{{mecName}}</td>
                        <!-- 绑定设备数 -->
                        <td style="width:11%;">{{bindingDevCount}}</td>
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
                    <th scope="col" style="width:4%;">序号</th>
                    <th scope="col" style="width:8%;">设备类型</th>
                    <th scope="col" style="width:8%;">设备ID</th>
                    <th scope="col" style="width:28%;">设备序列号</th>                       
                    <th scope="col" style="width:10%;">朝向</th>
                </tr>
                </thead>
                <tbody style="height:auto;min-height:auto;">
                <tr class="yk-table-body" v-for='(item,index) in deviceDataList' :key="index" style="height:auto;min-height:auto;">
                    <td style="width:7%;">{{ index + paging.size * (paging.index)+1}}</td>
                    <!--设备类型-->
                    <td style="width:13%;">{{item.deviceType}}</td>
                    <!-- 设备ID-->
                    <td style="width:14%;">{{item.deviceId}}</td>
                    <!--设备序列号-->
                    <td style="width:51%;">{{item.serialNum}}</td>
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
            this.$api.post('dataPlatApp/road/queryRoadPointInfo',{
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
<style scoped>
.roadMapInfo{
    width:100%;
    height:300px;
    border:1px solid #f1f1f1;
}
.yk-table-box{
    height:246px;
    min-height:246px;
    overflow:hidden;
    overflow-y: auto;
}
.yk-container::-webkit-scrollbar-thumb{ 
   background-color:#333; 
   height:50px; 
   outline-offset:-2px; 
   outline:2px solid #fff; 
   -webkit-border-radius:4px; 
   border: 2px solid #fff; 
} 
/*---鼠标点击滚动条显示样式--*/ 
.yk-container::-webkit-scrollbar-thumb:hover{ 
   background-color:#666; 
   height:50px; 
   -webkit-border-radius:4px; 
} 
/*---滚动条大小--*/ 
.yk-container::-webkit-scrollbar{ 
   width:8px; 
   height:8px; 
} 
/*---滚动框背景样式--*/ 
.yk-container::-webkit-scrollbar-track-piece{ 
   background-color:#fff; 
   -webkit-border-radius:0; 
}
</style>
