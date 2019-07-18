<template>
<div class="c-wrapper-20" v-cloak>
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
                        <i class="sl-video-icon" :class="data.icon" v-if="data.icon"></i>
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
</div>
</template>
<script>

import TusvnMap from "../../../common/view/TusvnMap/TusvnMap.vue";
import RoadSideInfo from "../roadSideInfo/roadSideInfo.vue";
import { setInterval, clearInterval, setTimeout } from 'timers';
import {queryRoadRegionTree,queryRoadCamList,startStreamRoad,getRoadSideCameraStaticsAndListByDist,stopStream} from '@/api/roadSide'
export default {
    name:'PerceptualData',
    components:{
        TusvnMap,
        RoadSideInfo,
    },
    data(){
        return{
            provinceData:[{name:'请选择',code:'0'}],//省市
            municipalData:[{name:'请选择',code:'0'}],//辖区
            camInfo:'',
            camDetail:'',
            roadNewName:'--',
            camId:'--',
            camCode:'--',
            roadName:'--',
            roadPointName:'--',
            roadPointId:'--',
            camTotal:0,
            onlineNum:0,
            monitNum:0,
            roadSideInfo:null,
            provinceSelected:'',
            municiSelected:'',
            isSlideIn:false,
            isSlideOut:false,
            isMaskShow:true,
            isChange:false,
            isRoadInfoShow:false,
            initDataList:[],
            id:'0021',
            lon:'--',
            lat:'--',
            operPlatUrl:'',
            data:[] ,
            newData:[],
            props: {
                label: 'name',
                children: 'zones',
                isLeaf: 'leaf'
            },
            regionObj:{
                children:[{
                    children:[]
                }]
            },
            defaultProps: {
                children: 'children',
                label: 'label',
                isLeaf: 'leaf'
            },
            requestData: {
                roadCode: ""
            }
        }

    },
    methods:{
        init(){
            this.queryRoadRegionTree();
            this.provinceSelected = this.provinceData[0];
            this.municiSelected = this.municipalData[0];
            this.operPlatUrl = window.config.operPlatUrl;
            let _this =this;
            //1分钟刷一次实时状态
            setInterval(()=>{
                    if(_this.municiSelected != null && _this.municiSelected != ''){
                        _this.computCamNum(_this.municiSelected.code);
                    }
            },5000);
        },
        queryRoadRegionTree(){
            queryRoadRegionTree().then(res => {
                if(res.status == '200') {
                    this.initDataList = res.data;
                    let len = this.initDataList.length;
                    for(let i=0;i<len;i++){//遍历省市数据
                        let provinceObj = {};
                        provinceObj.name = this.initDataList[i].name;
                        provinceObj.code = this.initDataList[i].code;
                        this.provinceData.push(provinceObj);
                    }
                }
            })
        },
        findMunicipal(item){
            let len = this.initDataList.length;
            let provinceCode = this.provinceSelected.code;
            this.isMaskShow = true;
            this.newData = [];//切换市区时初始化数据
            this.camId = '--';//切换市区时初始化摄像头序列号数据
            this.camCode = '--';//切换市区时初始化摄像头编号数据
            this.roadNewName = '--';//切换市区时初始化道路名称数据
            this.roadPointName = '--';//切换市区时初始化路侧点数据
            this.data = [];//切换下拉选择时,区路数据初始化
            this.municipalData = [];
            for(let j=0;j<len;j++){//查找辖区数据
                if(provinceCode == this.initDataList[j].code){
                    let municipalObj = {};
                    municipalObj.name = this.initDataList[j].dataList[0].name;
                    municipalObj.code = this.initDataList[j].dataList[0].code;
                    this.municipalData.push(municipalObj);
                    this.municipalData.unshift({name:'请选择',code:'0'})
                    this.municiSelected = this.municipalData[0];
                }
            }
        },
        findArea(item){//查找市区
            let len = this.initDataList.length;
            let municipalCode = this.municiSelected.code;
            let _this =this;
            this.regionData = [];
            
            for(let j=0;j<len;j++){//查找辖区数据
                if(municipalCode == this.initDataList[j].dataList[0].code){
                    let regionObj = {};
                    let subDataList = this.initDataList[j].dataList[0].dataList[0].dataList;
                    let subLen = subDataList.length;
                    this.regionObj.label = this.initDataList[j].dataList[0].dataList[0].name;
                    this.regionObj.children = [];
                    
                    for(let i=0;i<subLen;i++){
                        let subObj = {};
                        subObj.label = subDataList[i].name;
                        subObj.code = subDataList[i].code;
                        this.regionObj.children.push(subObj);
                    }
                    this.regionData.push(this.regionObj);
                    this.data = this.regionData;
                    this.newData = this.data;
                }
            }
            
        },
        showMapBar(){
            this.isSlideIn = true;
        },
        hideMapBar(){
            let slideBarRight = document.querySelector('.map-lay');
            slideBarRight.style.display = 'none';
            this.isSlideIn = true;
        },
        hideMap(){
            this.isSlideOut = false;
        },
        handleNodeClick(data){
            if(data.label.includes('路') || data.label.includes('道')){
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
                        var protocal = JSON.stringify(res.data[0].protocol);
                        localStorage.setItem('protocal',protocal);
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
        startPlay(camerData){
            let camList = this.camInfo;
            let camLen = camList.length;
            let protocal = JSON.parse(localStorage.getItem('protocal'));
            startStreamRoad({
                camId:camerData.serialNum,protocal:protocal
            }).then(res =>{
                if(res.status == '200') {
                    this.camId = camerData.serialNum;
                    this.camCode = camerData.label;
                    this.roadNewName = this.roadName;
                    this.roadPointName = camerData.rsPtName;
                    this.roadPointId = camerData.rsPtId;
                    this.lon = (camerData.ptLon).toFixed(8);
                    this.lat = (camerData.ptLat).toFixed(8);
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
                "camId":this.camCode,"protocal":protocal
            }).then(res => {

            })
        },
        showMap(){
            this.isSlideOut = true;
            this.isSlideIn = false;
            this.$refs.perceMap.resize([300,500]);
            let slideTime = setInterval(() => {
                let layHtml = `<div class='mapPop'><ul><li>摄像头:${this.camId}</li><li>道路名称:${this.roadName}</li><li>经纬度:${this.lon},${this.lat}</li></ul></div>`;
                this.$refs.perceMap.addInfoWindow({
                    id:"0021",
                    content:layHtml,
                    lon:this.lon,
                    lat:this.lat
                });
                clearInterval(slideTime);
            },100);
        },
        goRoadSide(){
            let roadPointId = this.roadPointId;
            this.roadSideInfo = RoadSideInfo;
        },
        backClick(){
            this.roadSideInfo = null;
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
        computCamNum(areaCode){
            //查询总数。在线数，实时监控数
            if(areaCode == 0){
                this.camTotal=0;
                this.onlineNum=0;
                this.monitNum=0;
            }else {
                getRoadSideCameraStaticsAndListByDist({
                    citycode: areaCode
                }).then(res =>{
                    if(res.status == '200'){
                        this.camDetail = res.data.body.list;
                        this.camTotal = res.data.body.count;
                        this.monitNum = res.data.body.monitorCount;
                        this.onlineNum = res.data.body.onlineCount;
                    }
                });
         }
       }
    },
    watch:{
        municiSelected(val){
            this.computCamNum(val.code)
        }
    },
    mounted(){
        this.init();
    }
}
</script>
<style>
.video-perce{
    width:730px;
}
.video-box-perce{
    width:730px;
    height: 500px;
}
.ol-popup {
    position: absolute;
    background-color: white;
    -webkit-filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
    filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
    padding: 15px;
    border-radius: 10px;
    border: 1px solid #cccccc;
    bottom: 12px !important;
    left: 0 !important;
    min-width: 208px !important;
}
.show-map {
  display:block;
  animation: am-show-map 1s ease-in;
  -webkit-animation: am-show-map 0.2s ease-in;
}
.rspRoad:hover{
    color:#f49308;
}
@keyframes am-show-map {
  from {
    width: 0;
  }
  to {
    width: 340px;
  }
}
@keyframes am-hide-map {
  from {
    width: 340px;
  }
  to {
    width: 0px;
  }
}
.el-tree{
    height:410px;
    overflow-y: scroll;
}
.sl-custom-tree-node {
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
.is-current.is-expanded .sl-play-icon {
    background-image:url(../../../../static/icon/btn-play.png);
}
.is-current .sl-pause-icon {
    background-image:url(../../../../static/icon/btn-pause.png);
}
</style>

