<template>
<div class="c-wrapper-20" v-cloak>
    
        <!-- 信息&&地图视频模块 -->
        <div class="c-flex">
            <!-- 地图视频模块 -->
            <div class="c-gray-box road-cam-box c-mr-10">
                <div class='cam-title'>摄像头组织结构</div>
                <div class='carm-oragn-info c-mt-10'>
                    <el-form size="small" class="c-text-between">
                        <el-form-item>
                            <el-select 
                                v-model="searchKey.provinceValue" 
                                value-key='code' 
                                placeholder="请选择省" 
                                :loading="provinceLoading" 
                                @change="getCityTrees">
                                <el-option
                                v-for="item in provinceOptions"
                                :key="item.code"
                                :label="item.label"
                                :value="item">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <el-select 
                            v-model="searchKey.cityValue" 
                            value-key='code' 
                            placeholder="请选择市" 
                            @change="queryCountyRoadTrees">
                                <el-option
                                v-for="item in cityOptions"
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
                        :data='treeData' 
                        :props="defaultProps" 
                        :load="loadNode"
                        lazy
                        node-key="code"
                        ref="tree"
                        default-expand-all
                        highlight-current
                        :default-expanded-keys="defaultArr"
                        @node-click="handleNodeClick" 
                        >
                        <!-- show-checkbox
                        node-key="code" -->
                        <!-- @check-change="handleCheckChange" -->
                        <span class="custom-tree-node" :class="data.icon ? 'sl-custom-tree-node' : ''" slot-scope="{ node, data }">
                            <i class="sl-video-icon" :class="data.icon" :id='data.label' v-if="data.icon"></i>
                            <span class="sl-play-text">{{ node.label }}</span>              
                        </span>
                    </el-tree>

                </div>
            </div>
            <div class="c-map-video-wrapper c-flex-1">
                <!-- 信息模块 -->
                <div class="c-detail-lable-list clearfix c-pdl-10 c-detail-box">
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
                        <span class="value">{{camDetail.roadName}}</span>
                    </p>
                    <p class="c-detail-lable">
                        <span class="name">路侧点: </span>
                        <span class="value" v-if="!camDetail.roadPointName || camDetail.roadPointName == '--'">{{camDetail.roadPointName}}</span>
                        <span class="value c-blue c-hover-underline" v-else ref='roadPId' style='cursor:pointer;' @click="goRoadSide">{{camDetail.roadPointName}}</span>
                    </p>
                </div>
                <div class="c-video-wrapper c-mt-10">
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
import {queryRoadRegionTree,queryProvinceCityTree,queryCountyRoadTree,queryRoadCamList,startStreamRoad,getCityCameraStatics,stopStream} from '@/api/roadSide'
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
            isFirst:true,//第一次展开
            treeData:[],
            treeList:[],
            provinceOptions:[],
            cityOptions:[],
            regionList:[],
            roadSideInfo:null,
            camInfo:'',
            roadPointName:'--',
            camInfoNum:'',
            camDetail:{
                camCode:'--',
                camId:'--',
                roadName:'--',
                roadPointName:'--',
                lon:'--',
                lat:'--',
                roadPointId:'--',
                rsPtId:'',
            },
            searchKey:{
                provinceValue:'',
                cityValue:'',
            },
            defaultProps: {
                code:'code',
                children: 'children',
                label: 'label',
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
            defaultArr:['N-NJ-0006','N-NJ-0005','N-NJ-0004'],
            timer: null,

            firstSerialNum: []
            // currentVideoOption: null
        }
    },
    mounted(){
        this.getSideTree();//获取树结构数据

        // this.queryProvinceCityTrees();
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
            console.log('masker',this.markerPoint);
            this.markerPoint.forEach((item, index) => {
                console.log('item',item,index);
                let _position = ConvertCoord.wgs84togcj02(item.ptLon, item.ptLat);
                let _marker = new AMap.Marker({
                    map: this.distanceMap,
                    position: new AMap.LngLat(_position[0],_position[1]),
                });
                _marker.content = `<div class="c-map-info-window">
                                    <p class="c-info-window-text">摄像头编号：${item.label}<p>
                                    <p class="c-info-window-text">道路名称：${item.roadName}<p>
                                    <p class="c-info-window-text">经纬度：${item.ptLon},${item.ptLat}<p>
                                </div>`;
                _marker.on('click', this.markerClick);
                _marker.emit('click', {target: _marker});
                this.distanceMap.setFitView();
            });
        },
        removeMarkers(){
            this.markerPoint = [];
            this.distanceMap.remove(this.markerPoint);
        },
        markerClick(e) {
            this.infoWindow.setContent(e.target.content);
            this.infoWindow.open(this.distanceMap, e.target.getPosition());
        },
        getSideTree(){
            queryRoadRegionTree().then(res => {
                this.treeList = res.data;
                this.provinceOptions = [];
                if(this.treeList.length > 0){
                    this.treeList.forEach(item => {
                        var obj = {};
                        obj.label = item.name;
                        obj.code = item.code;
                        console.log(item);
                        this.provinceOptions.push(obj);
                    })
                }
                if(this.isFirst){
                    var provinceCode = this.provinceOptions[0].code;
                    this.searchKey.provinceValue = this.provinceOptions[0];
                    this.getCitys(provinceCode);
                    var cityCode = this.cityOptions[0].code;
                    this.searchKey.cityValue = this.cityOptions[0];
                    this.getRegion(cityCode);
                }
            })
        },
        getCitys(code){
            this.searchKey.cityValue = '';
            this.cityOptions = [];
            this.treeList.forEach(item => {
                if(item.code == code){
                    var cityList = item.dataList;
                    cityList.forEach(e => {
                        var obj = {};
                        obj.label = e.name;
                        obj.code = e.code;
                        this.cityOptions.push(obj);
                    })
                }
            })
        },
        getRegion(code){
            this.treeList.forEach( item => {
                var cityList = item.dataList;
                if(cityList[0].code == code){
                    this.regionList = cityList[0].dataList;
                    this.regionList.forEach( e => {
                        var obj = {};
                        obj.label = e.name;
                        obj.code = e.code;
                        obj.type = 1;
                        this.treeData.push(obj);
                    })
                }
            })
        },
        loadNode(node,resolve){
            console.log(node.data.code);
            //懒加载路
            if(node.level == 1){
                var children = [];
                console.log(this.regionList);
                this.regionList.forEach(item => {
                    console.log(item);
                    console.log(node.data.code);
                    if(item.code == node.data.code){
                        var list = item.dataList;
                        list.forEach( e => {
                            var obj = {};
                            obj.label = e.name;
                            obj.code = e.code;
                            obj.type = 2;
                            children.push(obj);
                        })
                    }
                })
                console.log(children);
                resolve(children);
                return;
            }
            if (node.level > 2) return resolve([]);
            if(node.level == 2){
                queryRoadCamList({
                    roadCode:node.data.code
                }).then(res => {
                    if(res.status == '200') {
                        // var roadCode = this.newData[0].children;
                        if(res.data.length) {
                            var protocal = JSON.stringify(res.data[0].protocol);
                            localStorage.setItem('protocal',protocal);
                        }
                        var camDetail = res.data;
                        console.log(camDetail);
                        var children = [];
                        if(camDetail.length > 0){
                            //默认选中样式
                            camDetail.forEach(item => {
                                var obj = {};
                                console.log(item);
                                obj.label = item.deviceId;
                                obj.code = item.deviceId;
                                obj.serialNum = item.serialNum;
                                obj.roadName = item.rspRoadName;
                                obj.rsPtName = item.rsPtName;
                                obj.rsPtId = item.rsPtId;
                                obj.ptLon = item.ptLon;
                                obj.ptLat = item.ptLat;
                                obj.isOn = true;
                                obj.cameraRunStatus = item.cameraRunStatus;
                                obj.icon = "sl-pause-icon";
                                obj.type = 3;
                                obj.leaf = true;
                                children.push(obj);
                            })
                        }
                        console.log(children);
                        resolve(children);
                        this.$refs.tree.setCurrentKey(this.defaultArr[2]);
                        let protocal = JSON.parse(localStorage.getItem('protocal'));
                        //默认打开摄像头编号为N-NJ-0004的视频
                        startStreamRoad({
                            camId:camDetail[2].serialNum,protocal:protocal
                        }).then(res =>{
                            if(res.status == '200') {
                                var camerData = res.data;
                                this.camDetail.camId = children[2].serialNum;
                                this.camDetail.camCode = children[2].label;
                                this.camDetail.roadName = children[2].roadName;
                                this.camDetail.roadPointName = children[2].rsPtName;
                                this.camDetail.roadPointId = children[2].rsPtId;
                                this.camDetail.rsPtId = children[2].rsPtId;
                                this.camDetail.lon = Number(children[2].ptLon).toFixed(8);
                                this.camDetail.lat = Number(children[2].ptLat).toFixed(8);
                                this.isMaskShow = false;
                                let videoUrl = res.data.rtmp;
                                this.embedFlash(videoUrl);

                                var _position = ConvertCoord.wgs84togcj02(children[2].ptLon,children[2].ptLat);
                                var _marker = new AMap.Marker({
                                    map: this.distanceMap,
                                    position: new AMap.LngLat(_position[0],_position[1]),
                                });
                                _marker.content = `<div class="c-map-info-window">
                                                    <p class="c-info-window-text">摄像头编号：${children[2].label}<p>
                                                    <p class="c-info-window-text">道路名称：${children[2].roadName}<p>
                                                    <p class="c-info-window-text">经纬度：${children[2].ptLon},${children[2].ptLat}<p>
                                                </div>`;
                                _marker.on('click', this.markerClick);
                                _marker.emit('click', {target: _marker});
                                this.distanceMap.setFitView();
                                        // camerData.icon = "sl-pause-icon";
                                    }
                                });
                        return;
                    }
                })
            }
        },
        handleNodeClick(data){
            console.log(data);
            this.roadNewName = this.roadName;
            this.markerPoint = [];
            let camStatus = data.cameraRunStatus;
            this.changeSize = false;
            this.removeMarkers();
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
                console.log('456645',this.markerPoint);
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
                    this.treeData = res.data;
                    console.log(this.treeData);
                }
            })
            
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
    border: 10px solid #fff;
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

