<template>
<div class="c-wrapper-20 c-padding-20 c-detail-box" v-cloak>
        <!-- 信息模块 -->
        <div class="c-detail-lable-list clearfix">
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
                <span class="value" ref='roadPId' style='cursor:pointer;' @click="goRoadSide">{{camDetail.roadPointName}}</span>
            </p>
        </div>
        <!-- 信息&&地图视频模块 -->
        <div class="c-mt-20 c-flex">
            <!-- <el-form ref="searchForm" :inline="true" size="small" class="c-detail-lable-list c-pdb-20">
                <el-form-item label="摄像头编号:" class="c-detail-lable">
                    {{camCode ? camCode : '--'}}
                </el-form-item>
                <el-form-item label="摄像头序列号:" class="c-detail-lable">
                    {{camId ? camId : '--'}}
                </el-form-item>
                <el-form-item label="道路名称:" class="c-detail-lable">{{roadNewName ? roadNewName : "--"}}</el-form-item>
                <el-form-item label="路侧点:" class="c-detail-lable" @click="goRoadSide">{{roadPointName ? roadPointName : "--"}}</el-form-item>
            </el-form> -->
            <!-- 地图视频模块 -->
            <div class="c-gray-box road-cam-box">
                <div class='cam-title'>摄像头组织结构</div>
                <div class='carm-oragn-info c-mt-10'>
                    <el-form size="small" class="c-text-between">
                        <el-form-item>
                            <el-select v-model="searchKey.provinceSelected" value-key='code' placeholder="请选择省" :loading="provinceLoading" @change="getCityTrees">
                                <el-option
                                v-for="item in provinceData"
                                :key="item.code"
                                :label="item.label"
                                :value="item">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <el-select v-model="searchKey.municiSelected" value-key='code' placeholder="请选择市" @change="queryCountyRoadTrees">
                                <el-option
                                v-for="item in municipalData"
                                :key="item.code"
                                :label="item.label"
                                :value="item">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-form>
                    <div class="carm-oragn-sels">
                        <div class='carm-info'>
                            <span>总数:{{camStatusNums.camTotal}}</span>
                            <span>在线:{{camStatusNums.onlineNum}}</span>
                            <span>实时监控:{{camStatusNums.monitNum}}</span>
                        </div>
                        <el-tree
                            class="c-mt-10"
                            :data='newData' 
                            :props="defaultProps" 
                            :load="loadNode" 
                            lazy 
                            @node-click="handleNodeClick" 
                            >
                            <span class="custom-tree-node" :class="data.icon ? 'sl-custom-tree-node' : ''" slot-scope="{ node, data }">
                                <i class="sl-video-icon" :class="data.icon" :id='data.id' v-if="data.icon"></i>
                                <span class="sl-play-text">{{ node.label }}</span>              
                            </span>
                        </el-tree>
                    </div>

                </div>
            </div>
            <div class="c-map-video-wrapper c-flex-1">
                <div class="c-video-wrapper">
                    <div class="c-video" id="cmsplayer"></div>
                    <div class="right-mask" v-show='isMaskShow'></div>
                </div>
                <div class="c-map-wrapper" :class='{"c-map-change-max":changeSize}'>
                    <div class='c-map-btn c-map-btn-left' @click='mapChangeMax' v-if="!changeSize"></div>
                    <div class='c-map-btn c-map-btn-right' @click='mapChangeMin' v-else></div>
                    <div class="c-map-container" id='map-container'>
                        <ul class="c-map-info clearfix c-icon-map-info">
                            <li class='c-map-info-list speed'>摄像头编号:{{camDetail.camId ? camDetail.camId : ' -- '}}</li>
                            <li class='c-map-info-list angle'>道路名称:{{camDetail.roadNewName ? camDetail.roadNewName : ' -- '}}</li>
                            <li class='c-map-info-list lonlat'>经纬度:{{camDetail.lon ? camDetail.lon : ' -- '}},{{camDetail.lat ? camDetail.lat : ' -- '}}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
<!-- <div class="c-wrapper-20" v-cloak>
    <div class="yk-search-box">
        <div class="yk-search-block yk-block-label">
            <label class="yk-w-90">摄像头编号:</label>
            <span>{{camCode}}</span>
        </div>

        <div class="yk-search-block yk-block-label" style="margin-left:5px;">
            <label class="yk-w-90">摄像头序列号: </label>
            <span>{{camId}}</span>
        </div>

        <div class="yk-search-block yk-block-label">
            <label class="yk-w-70 colGrap">道路名称: </label>
            <span>{{roadNewName}}</span>
        </div>

        <div class="yk-search-block yk-block-label">
            <label class="yk-w-60 colGrap">路侧点: </label>
            <span class='rspRoad' ref='roadPId' style='cursor:pointer;' @click="goRoadSide">{{roadPointName}}</span>
        </div>
    </div>
    <div class='left-box'>
        <div class='carm-oragn'>
            <span>摄像头组织结构</span>
        </div>
        <div class='carm-oragn-info'>
            <div class="carm-oragn-sels">
                <select style="width: 116px; height: 26px;" v-model="provinceSelected" @change="findMunicipal">
                    <option v-for='(item,index) in provinceData' :key='index' :value='item'>{{item.name}}</option>
                </select>
                <select style="width: 116px; height: 26px;" v-model='municiSelected' @change='findArea'>
                    <option v-for='(item,index) in municipalData' :key='index' :value="item">{{item.name}}</option>
                </select>
                <div class='carm-info'>
                    <span>总数:{{camTotal}}</span>
                    <span>在线:{{onlineNum}}</span>
                    <span>实时监控:{{monitNum}}</span>
                </div>
                <el-tree 
                    :data='newData' 
                    :props="defaultProps" 
                    :load="loadNode" 
                    lazy 
                    @node-click="handleNodeClick" 
                    @node-collapse="endPlay"
                    >
                    <span class="custom-tree-node" :class="data.icon ? 'sl-custom-tree-node' : ''" slot-scope="{ node, data }">
                        <i class="sl-video-icon" :class="data.icon" :id='data.id' v-if="data.icon"></i>
                        <span class="sl-play-text">{{ node.label }}</span>              
                    </span>
                </el-tree>
            </div>

        </div>
    </div>
    <div class='right-box'>
        <div class="right-mask" v-show='isMaskShow'></div>
        <div class="video-perce">
            <div class='video-box-perce'>
                <div id="cmsplayer" style="width:100%;height:100%"></div>
            </div>
        </div>

        <div class='map-bar-in btn-left' @click='showMap'></div>
        <div class='map-lay' :class='{"show-map":isSlideOut == true}'>
            <div class='map-bar btn-right' @click='hideMap'></div>
                <tusvn-map ref="perceMap" targetId="mec9" overlayContainerId="mec10" :isMasker='false' :isCircle='false'></tusvn-map>
            </div>
    </div>
    <component :is='roadSideInfo' :roadPointId='roadPointId' :roadPointName='roadPointName' @roadInfoBack='backClick' />
</div> -->
<component :is='roadSideInfo' :roadPointId='roadPointId' :roadPointName='roadPointName' @roadInfoBack='backClick' />
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
            provinceLoading:false,
            changeSize:false,
            isMaskShow:false,
            newData:[],
            provinceData:[],
            municipalData:[],
            roadPointId:'--',
            roadSideInfo:null,
            camInfo:'',
            roadPointName:'--',
            zoom:11,
            camInfoNum:'',
            camDetail:{
                camCode:'--',
                camId:'--',
                roadNewName:'--',
                roadPointName:'--',
                lon:'--',
                lat:'--'
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
            provinceData:[],//省市
            municipalData:[],//辖区
        }
    },
    methods:{
        init(){
            this.distanceMap = new AMap.Map('map-container', {
                resizeEnable: true, //是否监控地图容器尺寸变化
                zoom: this.zoom, //初始化地图层级
                rotateEnable: true,
                mapStyle:'amap://styles/3312a5b0f7d3e828edc4b2f523ba76d8',
            });
            this.queryProvinceCityTrees();
            console.log(this.municiSelected);
            //1分钟刷一次实时状态
            setInterval(()=>{
                if(this.municiSelected != undefined && this.municiSelected != ''){
                    this.computCamNum(this.municiSelected.code);
                }
            },5000);
        },
        queryProvinceCityTrees(){
            console.log(this.searchKey.provinceSelected);
            if(this.searchKey.provinceSelected.code != '0'){
                queryProvinceCityTree({
                'type':'N'
                }).then(res => {
                    this.provinceLoading = true;
                    if(res.status == '200') {
                        this.provinceLoading = false;
                        this.provinceData = res.data;
                    }
                })
            }else{
                this.camDetail.camCode = '--';
                this.camDetail.camId = '--';
                this.camDetail.roadPointName = '--';
                this.camDetail.lon = '--';
                this.camDetail.lat = '--';
                this.newData = [];
                this.searchKey.municiSelected = '';
                this.endPlay();
                return false;
            }
        },
        getCityTrees(){//获区市辖数据
            this.newData = [];
            this.searchKey.municiSelected = '';
            this.endPlay();
            this.municipalData = this.searchKey.provinceSelected.children;
        },
        queryCountyRoadTrees(){
            let provinceSelCode = this.searchKey.provinceSelected.code;
            let municipaSelCode = this.searchKey.municiSelected.code;
            if(provinceSelCode != '0' && municipaSelCode != '0'){
                queryCountyRoadTree({
                    'cityCode':this.searchKey.municiSelected.code,
                    'type':'N'
                }).then(res => {
                    if(res.status == '200') {
                        this.newData = res.data;
                    }
                })
            }else{
                this.newData = []; 
                this.endPlay();
                return false;
            }
            
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
                        // console.log(res);
                        if(res.data.length) {
                            var protocal = JSON.stringify(res.data[0].protocol);
                            localStorage.setItem('protocal',protocal);
                        }
                        var camDetail = res.data;
                        for(var i=0;i<camDetail.length;i++){
                            var obj = {};
                            obj.label = camDetail[i].deviceId;
                            obj.serialNum = camDetail[i].serialNum;
                            obj.rsPtName = camDetail[i].rsPtName;
                            obj.rsPtId = camDetail[i].rsPtId;
                            obj.ptLon = camDetail[i].ptLon;
                            obj.ptLat = camDetail[i].ptLat;
                            obj.cameraRunStatus = camDetail[i].cameraRunStatus;
                            obj.icon = "sl-play-icon";
                            obj.leaf = true;
                            data.push(obj);
                        }
                        resolve(data);
                    }
                })
            }
            if(node.level == 3) {
                resolve([]);
            }
        },
        handleNodeClick(data){
            console.log(data);
            if(data.road){
                this.roadName = data.label;
            }
            this.roadNewName = this.roadName;
            let camStatus = data.cameraRunStatus;
            if(camStatus == 1){//在线
                data.isOn = !data.isOn;
                if(data.isOn) {
                    this.startPlay(data);
                }else {
                    this.endPlay();
                    data.icon = "sl-play-icon";
                }
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
            console.log(camerData);
            let camList = this.camInfo;
            let camLen = camList.length;
            let protocal = JSON.parse(localStorage.getItem('protocal'));
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
            let protocal = JSON.parse(localStorage.getItem('protocal'));
            stopStream({
                "camId":this.camDetail.camCode,"protocal":protocal
            }).then(res => {

            })
        },
        goRoadSide(){
            let roadPointId = this.roadPointId;
            this.roadSideInfo = RoadSideInfo;
        },
        backClick(){
            this.roadSideInfo = null;
        },
        mapChangeMax(){
            this.changeSize = true;
        },
        mapChangeMin(){
            this.changeSize = false;
        },
        computCamNum(areaCode){
            console.log(areaCode);
            //查询总数。在线数，实时监控数
            getCityCameraStatics({
                cityCode: this.searchKey.municiSelected.code
            }).then(res =>{
                if(res.status == '200'){
                    console.log(res.data.count);
                    this.camStatusNums.camTotal = res.data.count;
                    this.camStatusNums.monitNum = res.data.monitorCount;
                    this.camStatusNums.onlineNum = res.data.onlineCount;
                    console.log(this.camStatusNums.camTotal)
                }
            });
            // if(areaCode == 0){
            //     this.camTotal=0;
            //     this.onlineNum=0;
            //     this.monitNum=0;
            // }else {
            //     getCityCameraStatics({
            //         cityCode: this.searchKey.municiSelected.code
            //     }).then(res =>{
            //         if(res.status == '200'){
            //             console.log(res.data);
            //             this.camDetail = res.data.list;
            //             this.camStatusNums.camTotal = res.data.count;
            //             this.camStatusNums.monitNum = res.data.monitorCount;
            //             this.camStatusNums.onlineNum = res.data.onlineCount;
            //         }
            //     });
            // }
        }
    },
    watch:{
        'searchKey.municiSelected'(newVal, oldVal){
            console.log(newVal);
            this.computCamNum(newVal.code)
        }
    },
    mounted(){
        this.init();
    }
}
</script>
<style lang="scss" scoped>
.road-cam-box{
    width:290px;
    padding:10px;
    box-sizing: border-box;
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
    .el-tree{
        position: relative;
        min-height: 200px;
        max-height:400px;
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
        margin: 0;
    }
}
.c-map-info{
    &.c-icon-map-info{
        .c-map-info-list{
            width:55%;
        }
    }
}
</style>

