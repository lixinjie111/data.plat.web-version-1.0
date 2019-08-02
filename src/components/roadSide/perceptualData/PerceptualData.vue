<template>
<div class="c-wrapper-20 c-padding-20 c-detail-box" v-cloak>
    
        <!-- 信息&&地图视频模块 -->
        <div class="c-flex">
            <!-- 地图视频模块 -->
            <div class="c-gray-box road-cam-box">
                <div class='cam-title'>摄像头组织结构</div>
                <div class='carm-oragn-info c-mt-10'>
                    <el-form size="small" class="c-text-between">
                        <el-form-item>
                            <el-select 
                                v-model="searchKey.provinceSelected" 
                                value-key='code' 
                                placeholder="请选择省" 
                                :loading="provinceLoading" 
                                @change="getCityTrees">
                                <el-option
                                v-for="item in provinceData"
                                :key="item.code"
                                :label="item.label"
                                :value="item">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <el-select 
                            v-model="searchKey.municiSelected" 
                            value-key='code' 
                            placeholder="请选择市" 
                            @change="queryCountyRoadTrees">
                                <el-option
                                v-for="item in municipalData"
                                :key="item.code"
                                :label="item.label"
                                :value="item">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-form>
                    <div class="c-mt-10 c-flex">
                        <span class="c-flex-1">总数:{{camStatusNums.camTotal}}</span>
                        <span class="c-flex-1">在线:{{camStatusNums.onlineNum}}</span>
                        <span class="c-flex-1">实时监控:{{camStatusNums.monitNum}}</span>
                    </div>
                    <el-tree
                        class="c-padding-10 carm-oragn-sels"
                        :data='newData' 
                        :props="defaultProps" 
                        :load="loadNode" 
                        lazy
                        ref="tree"
                        default-expand-all
                        current-node-key="firstSerialNum"
                        @node-click="handleNodeClick" 
                        >
                        <!-- show-checkbox
                        node-key="code" -->
                        <!-- @check-change="handleCheckChange" -->
                        <span class="custom-tree-node" :class="data.icon ? 'sl-custom-tree-node' : ''" slot-scope="{ node, data }">
                            <i class="sl-video-icon" :class="data.icon" :id='data.id' v-if="data.icon"></i>
                            <span class="sl-play-text">{{ node.label }}</span>              
                        </span>
                    </el-tree>

                </div>
            </div>
            <div class="c-map-video-wrapper c-flex-1">
                 <!-- 信息模块 -->
                <div class="c-detail-lable-list clearfix c-pdl-10">
                    <p class="c-detail-lable">
                        <span class="name">摄像头编号:</span>
                        <span class="value">{{camDetail.camCode}}</span>
                    </p>
                    <p class="c-detail-lable">
                        <span class="name">摄像头序列号:</span>
                        <span class="value">{{camDetail.camId}}</span>
                    </p>
                    <p class="c-detail-lable">
                        <span class="name">道路名称:</span>
                        <span class="value">{{camDetail.roadNewName}}</span>
                    </p>
                    <p class="c-detail-lable">
                        <span class="name">路侧点: </span>
                        <span class="value c-blue c-hover-underline" ref='roadPId' style='cursor:pointer;' @click="goRoadSide">{{camDetail.roadPointName}}</span>
                    </p>
                </div>
                <div class="c-video-wrapper">
                    <div class="c-video" id="cmsplayer"></div>
                    <div class="c-video-mask" v-show='isMaskShow'></div>

                    <div class="c-map-wrapper" :class='{"c-map-change-max":changeSize}'>
                        <div class='c-map-btn c-map-btn-left' @click='mapChangeMax' v-if="!changeSize"></div>
                        <div class='c-map-btn c-map-btn-right' @click='mapChangeMin' v-else></div>
                        <div class="c-map-container" id='map-container'></div>
                    </div>
                    
                </div>
                
            </div>
        </div>
        <road-side-info v-if='roadSideShow' :roadPointId='camDetail.roadPointId' :rsPtId='camDetail.rsPtId' :roadPointName='camDetail.roadPointName' @roadInfoBack='backClick'></road-side-info>
</div>
</template>
<script>
import ConvertCoord from'@/common/utils/coordConvert.js';
import RoadSideInfo from "../roadSideInfo/roadSideInfo.vue";
import { setInterval, clearInterval, setTimeout } from 'timers';
import {queryProvinceCityTree,queryCountyRoadTree,queryRoadCamList,startStreamRoad,getCityCameraStatics,stopStream} from '@/api/roadSide'
export default {
    name:'PerceptualData',
    components:{
        RoadSideInfo,
    },
    data(){
        return{
            roadSideShow:false,
            provinceLoading:false,
            changeSize:false,
            isMaskShow:false,
            newData:[],
            provinceData:[],
            municipalData:[],
            roadSideInfo:null,
            camInfo:'',
            roadPointName:'--',
            camInfoNum:'',
            camDetail:{
                camCode:'--',
                camId:'--',
                roadNewName:'--',
                roadPointName:'--',
                lon:'--',
                lat:'--',
                roadPointId:'--',
                rsPtId:'',
            },
            searchKey:{
                provinceSelected:'',
                municiSelected:'',
            },
            defaultProps: {
                children: 'children',
                label: 'label',
                node:'',
                isLeaf: 'leaf'
            },
            camStatusNums:{
                camTotal:0,
                onlineNum:0,
                monitNum:0,
            },
            markerPoint: [],
            infoWindow: new AMap.InfoWindow({
                offset: new AMap.Pixel(0, -33),
                anchor: 'bottom-center'
            }),
            provinceData:[],//省市
            municipalData:[],//辖区

            timer: null,

            firstSerialNum: '',
            // currentVideoOption: null
        }
    },
    mounted(){
        this.queryProvinceCityTrees();
        this.wsRequest();
        this.initMap();
    },
    methods:{
        wsRequest(){
            //5s刷一次实时状态
            clearInterval(this.timer);
            this.timer = setInterval(()=>{
                this.computCamNum();
            },5000);
        },
        initMap(){
            this.distanceMap = new AMap.Map('map-container', this.$parent.$parent.$parent.defaultMapOption);
        },
        drawStartMarker() {
            let _this = this;
            this.markerPoint.forEach((item, index) => {
                let _position = ConvertCoord.wgs84togcj02(item.ptLon, item.ptLat);
                let _marker = new AMap.Marker({
                    map: this.distanceMap,
                    position: new AMap.LngLat(_position[0],_position[1]),
                });
                _marker.content = `<div class="c-map-info-window">
                <p class="c-info-window-text">摄像头编号:${item.label}<p>
                <p class="c-info-window-text">道路名称:${item.roadName}<p>
                <p class="c-info-window-text">经纬度:${item.ptLon},${item.ptLat}<p></div>`;
                _marker.on('click', this.markerClick);
                _marker.emit('click', {target: _marker});
                this.distanceMap.setFitView();
            });
        },
        markerClick(e) {
            this.infoWindow.setContent(e.target.content);
            this.infoWindow.open(this.distanceMap, e.target.getPosition());
        },
        queryProvinceCityTrees(){
            this.provinceLoading = true;
            queryProvinceCityTree({
                'type':'N'
            }).then(res => {
                if(res.status == '200') {
                    this.provinceData = res.data;
                    if(this.provinceData.length) {
                        this.searchKey.provinceSelected = this.provinceData[0];
                        this.initCityDefault();
                    }
                }
                this.provinceLoading = false;
            }).catch(err => {
                this.provinceLoading = false;
            });
        },
        initCityDefault() {
            this.municipalData = this.searchKey.provinceSelected.children;
            if(this.municipalData.length) {
                this.searchKey.municiSelected = this.municipalData[0];
                this.queryCountyRoadTrees(this.searchKey.municiSelected);
            }
        },
        getCityTrees(item){//获区市辖数据
            this.newData = [];
            this.endPlay();
            this.firstSerialNum = '';
            this.searchKey.municiSelected = '';
            this.municipalData = item.children;
        },
        queryCountyRoadTrees(item){
            this.newData = []; 
            this.endPlay();
            queryCountyRoadTree({
                'cityCode':item.code,
                'type':'N'
            }).then(res => {
                if(res.status == '200') {
                    this.newData = res.data;
                }
            })
            
        },
        loadNode(node, resolve) {//懒加载摄像头列表
            var hasChild = true;
            if(node.level == 1) {
                let data = [];
                if (hasChild) {
                    var areaArray = this.newData[0].children;
                    for(var i=0;i<areaArray.length;i++){
                        var obj = {};
                        obj.label = areaArray[i].label;
                        obj.code = areaArray[i].code;
                        obj.road = true;
                        // obj.isLeaf = 'leaf';
                        // obj.leaf = true;
                        data.push(obj);
                    }
                    this.roadName = data[0].label;
                } else {
                    data = [];
                }
                resolve(data);
            }
            if(node.level == 2) {
                let data = [];
                queryRoadCamList({
                    roadCode:node.data.code
                }).then(res => {
                    if(res.status == '200') {
                        var roadCode = this.newData[0].children;
                        if(res.data.length) {
                            var protocal = JSON.stringify(res.data[0].protocol);
                            localStorage.setItem('protocal',protocal);
                        }
                        var camDetail = res.data;
                        for(var i=0;i<camDetail.length;i++){
                            var obj = {};
                            obj.label = camDetail[i].deviceId;
                            obj.code = camDetail[i].serialNum;
                            obj.serialNum = camDetail[i].serialNum;
                            obj.rsPtName = camDetail[i].rsPtName;
                            obj.rsPtId = camDetail[i].rsPtId;
                            obj.ptLon = camDetail[i].ptLon;
                            obj.ptLat = camDetail[i].ptLat;
                            obj.isOn = true;
                            obj.cameraRunStatus = camDetail[i].cameraRunStatus;
                            obj.icon = "sl-play-icon";
                            obj.leaf = true;
                            if(!this.firstSerialNum) {
                                this.firstSerialNum = camDetail[i].serialNum
                            }
                            data.push(obj);
                        }
                        
                        // this.$refs.tree.setCheckedKeys([this.firstSerialNum]);

                        resolve(data);
                    }
                })
            }
            if(node.level == 3) {
                resolve([]);
            }
        },
        // handleCheckChange(data, checked, indeterminate) {
        //     console.log("-----------------");
        //     console.log(data);
        //     console.log(checked);
        //     console.log(indeterminate);
        //     // this.handleNodeClick(data);
        // },
        handleNodeClick(data){
            this.roadNewName = this.roadName;
            let camStatus = data.cameraRunStatus;
            // console.log(camStatus);
            if(camStatus == 1){//在线
                // console.log(data.isOn);
                if(data.isOn) {
                    data.isOn = false;
                    this.startPlay(data);
                }else {
                    data.isOn = true;
                    this.endPlay();
                    data.icon = "sl-play-icon";
                }
                let roadCamInfo = Object.assign({},{roadName:this.roadName},data);
                this.camDetail.rsPtId = roadCamInfo.rsPtId;
                this.markerPoint.push(roadCamInfo);
                // let _position = ConvertCoord.wgs84togcj02(obj.ptLon, obj.ptLat);
                // this.distanceMap.setCenter(_position);
                this.drawStartMarker();
            }else {
                if(camStatus == '0'){//未知
                    this.$message.error('未知摄像头!');
                }else if(camStatus == '2'){//离线
                    this.$message.error('摄像头为离线状态!');
                }else if(camStatus == '3'){//未注册
                    this.$message.error('摄像头未注册!');
                }
                this.endPlay();
            }
        },
        embedFlash(rtmpSource){//部署用此段
            var flashVars = "&src=";
            flashVars += rtmpSource; //视频文件
            flashVars += "&autoHideControlBar=true";
            flashVars += "&streamType=";
            flashVars += "live";// vod点播 live直播直播
            flashVars += "&autoPlay=true";
            flashVars += "&verbose=true";

            var embedCode =  '<object id="flashPlayer" name="flashPlayer" width="100%" height="100%" type="application/x-shockwave-flash"> ';
            embedCode += '<param name="movie" value="static/swf/StrobeMediaPlayback.swf"></param>';
            embedCode += '<param name="flashvars" value="' + flashVars + '"></param>';
            embedCode += '<param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param>';
            embedCode += '<param name="wmode" value="opaque"></param>';
            embedCode += '<embed  id="flashPlayer" name="flashPlayer" src="static/swf/StrobeMediaPlayback.swf" type="application/x-shockwave-flash"';
            embedCode += ' allowscriptaccess="always" allowfullscreen="true" ';
            embedCode += ' wmode="opaque" ';
            embedCode += ' width="100%" height="100%" ';
            embedCode += 'flashvars="' + flashVars + '">';
            embedCode += '</embed></object>';
            document.getElementById("cmsplayer").innerHTML = embedCode;
        },
        startPlay(camerData){
            let camList = this.camInfo;
            let camLen = camList.length;
            let protocal = JSON.parse(localStorage.getItem('protocal'));
            // this.currentVideoOption = camerData;
            startStreamRoad({
                camId:camerData.serialNum,protocal:protocal
            }).then(res =>{
                if(res.status == '200') {
                    this.camDetail.camId = camerData.serialNum;
                    this.camDetail.camCode = camerData.label;
                    this.camDetail.roadNewName = this.roadName;
                    this.camDetail.roadPointName = camerData.rsPtName;
                    this.camDetail.roadPointId = camerData.rsPtId;
                    this.camDetail.lon = Number(camerData.ptLon).toFixed(8);
                    this.camDetail.lat = Number(camerData.ptLat).toFixed(8);
                    this.isMaskShow = false;
                    let videoUrl = res.data.rtmp;
                    this.embedFlash(videoUrl);
                    camerData.icon = "sl-pause-icon";
                    // this.$refs.tree.setCheckedKeys([camerData.serialNum]);
                }
            });
        },
        endPlay(){
            this.isMaskShow = true;
            this.camId = '--';
            this.camCode = '--';
            this.roadNewName = '--';
            this.roadPointName = '--';
            this.roadPointId = '--';
            let nodeSel = document.querySelectorAll('.el-tree-node .el-tree-node__content .el-tree-node__expand-icon');
            let nodeSelArray = Array.from(nodeSel);
            for(let i=0;i<nodeSelArray.length;i++){
                nodeSelArray[i].classList.remove('pause');
            }
            // if(this.currentVideoOption) {
            //     this.currentVideoOption.isOn = true;
            // }
            let protocal = JSON.parse(localStorage.getItem('protocal'));
            stopStream({
                "camId":this.camDetail.camCode,"protocal":protocal
            }).then(res => {
            })
        },
        goRoadSide(){
            clearInterval(this.timer);
            this.isMaskShow = false;
            this.roadSideShow = true;
            this.changeSize = false;
        },
        backClick(){
            this.wsRequest();
            // this.isMaskShow = true;
            this.roadSideShow = false;
        },
        mapChangeMax(){
            this.changeSize = true;
            setTimeout(() => {
                this.distanceMap.setFitView();
            },300)
        },
        mapChangeMin(){
            this.changeSize = false;
        },
        computCamNum(){
            if(this.searchKey.municiSelected != undefined && this.searchKey.municiSelected != ''){
                //查询总数。在线数，实时监控数
                getCityCameraStatics({
                    cityCode: this.searchKey.municiSelected.code
                }).then(res =>{
                    if(res.status == '200'){
                        this.camStatusNums.camTotal = res.data.count;
                        this.camStatusNums.monitNum = res.data.monitorCount;
                        this.camStatusNums.onlineNum = res.data.onlineCount;
                    }
                });   
            }else {
                this.camStatusNums.camTotal = 0;
                this.camStatusNums.monitNum = 0;
                this.camStatusNums.onlineNum = 0;
            }
        }
    },
    destroyed() {
        clearInterval(this.timer);
    }
}
</script>
<style lang="scss" scoped>
.road-cam-box{
    position: relative;
    width:290px;
    padding:10px;
    box-sizing: border-box;
    line-height: 20px;
    .cam-title{
        font-size:14px;
        text-align: left;
        font-weight: 700;
        padding-top:4px;
    }
}
.custom-tree-node {
    &.sl-custom-tree-node {
        margin-left: -16px;
    }
    .sl-video-icon {
        display: inline-block;
        width: 10px;
        height: 10px;
        background:url(../../../../static/icon/btn-play.png) center center no-repeat;
        background-size: 10px 10px;
        vertical-align: middle;
    }
    .sl-play-text {
        vertical-align: middle;
    }
}
</style>
<style lang="scss">
@import '@/assets/scss/theme.scss';
.carm-oragn-sels {
    &.el-tree{
        position: absolute;
        top: 106px;
        left: 10px;
        right: 10px;
        bottom: 0;
        overflow-y: auto;
        .el-tree__empty-block {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            top: 0;
        }
    }    
    .is-current.is-expanded .sl-play-icon {
        background-image:url(../../../../static/icon/btn-play.png);
    }
    .is-current .sl-pause-icon {
        background-image:url(../../../../static/icon/btn-pause.png);
    }
}
.carm-oragn-info {
    .el-form.el-form--inline .el-input__inner {
        width: 130px !important;
    }
    .el-form-item {
        margin: 0 !important;
    }
}
.c-map-info{
    &.c-icon-map-info{
        .c-map-info-list{
            width:55%;
        }
    }
}
.video-js.vjs-ended .vjs-big-play-button, .video-js.vjs-paused .vjs-big-play-button, .vjs-paused.vjs-has-started.vjs-custom-skin>.video-js .vjs-big-play-button{
    display:none;
}
</style>

