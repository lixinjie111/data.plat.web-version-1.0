<template>
<div class="c-wrapper-20" v-cloak>
    
        <!-- 信息&&地图视频模块 -->
        <div class="c-flex">
            <!-- 地图视频模块 -->
            <div class="c-gray-box road-cam-box c-mr-10">
                <div class='cam-title'>摄像头组织结构</div>
                <div class='carm-oragn-info c-mt-10'>
                    <el-form :model="searchKey" size="small" class="c-text-between">
                        <el-form-item>
                            <el-select
                                v-model.trim="searchKey.device"
                                clearable
                                filterable
                                remote
                                reserve-keyword
                                value-key="deviceId"
                                placeholder="请输入关键词"
                                :remote-method="rsCamCodeRemoteMethod"
                                @clear='clearFn'
                                @focus="$searchFilter.remoteMethodClick(rsCamCodeOption, searchKey,'deviceId', cameraUrl)"
                                @blur="$searchFilter.remoteMethodBlur(searchKey, 'deviceId')"
                                :loading="rsCamCodeOption.loading">
                                <el-option
                                    v-for="item in rsCamCodeOption.filterOption"
                                    :key="item.deviceId"
                                    :label="item.deviceId"
                                    :value="item">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-button type="warning" icon="el-icon-search" @click="searchClick" size='small'>查询</el-button>
                    </el-form>
                    <el-form :model="searchKey" size="small" class="c-text-between c-mt-10">
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
                        <span class="c-flex-1">总数:{{camStatusNums.count}}</span>
                        <span class="c-flex-1">在线:{{camStatusNums.monitorCount}}</span>
                        <span class="c-flex-1">实时监控:{{camStatusNums.onlineCount}}</span>
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
                        :default-expanded-keys="currentArr"
                        @node-click="handleNodeClick" 
                        >
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
import { queryRoadCamListSearch } from '@/api/search';
import {queryRoadRegionTree,queryCountyRoadTree,queryRoadCamList,startStreamRoad,getCityCameraStatics,stopStream} from '@/api/roadSide'
export default {
    name:'PerceptualData',
    components:{
        RoadSideInfo,
    },
    data(){
        return{
            defaultData: {
                code: 'N-NJ-0004',
                serialNum: '3402000000132000003001'
            },
            currentVideoNode:{
                code: 'N-NJ-0004',
                serialNum:'3402000000132000003001'
            },
            currentArr: ['N-NJ-0004'],

            roads:[],
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
            camInfo:'',
            roadPointName:'--',
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
                device:'',
            },
            defaultProps: {
                code:'code',
                children: 'children',
                label: 'label',
                isLeaf: 'leaf'
            },
            camStatusNums:{
                count:0,
                monitorCount:0,
                onlineCount:0,
            },
            rsCamCodeOption: {
                loading: false,
                timer: null,
                filterOption: [],
                defaultOption: [],
                defaultFlag: false
            },
            markerOption: {
                markers: null,
                point: null
            },
            infoWindow: new AMap.InfoWindow({
                offset: new AMap.Pixel(0, -33),
                anchor: 'bottom-center'
            }),
            isSearch:false,
            // selectDeviceId:'',
            // selectSerialNum:'',
            timer: null,
            protocal:'',
            cameraUrl: queryRoadCamListSearch,
        }
    },
    watch: {
        "searchKey.cityValue"(newVal, oldVal) {
            if(newVal.code) {
                clearInterval(this.timer);
                this.computCamNum();
                this.timer = setInterval(()=>{
                    this.computCamNum();
                },5000);
            }else {
                clearInterval(this.timer);
                this.camStatusNums.count = 0;
                this.camStatusNums.monitorCount = 0;
                this.camStatusNums.onlineCount = 0;
            }
        }
    },
    mounted(){
        this.getSideTree();//获取树结构数据
        this.initMap();
        // this.computCamNum();
    },
    methods:{
        computCamNum(){
            //查询总数。在线数，实时监控数
            getCityCameraStatics({
                cityCode: this.searchKey.cityValue.code
            }).then(res =>{
                if(res.status == '200'){
                    this.camStatusNums = res.data;
                }
            });
        },
        rsCamCodeRemoteMethod(query) {
            this.$searchFilter.publicRemoteMethod({
                query: query,
                searchOption: this.rsCamCodeOption,
                searchObj: this.searchKey,
                key: 'deviceId',
                request: this.cameraUrl
            });
        },
        initMap(){
            this.distanceMap = new AMap.Map('map-container', window.defaultMapOption);
        },
        drawStartMarker() {
            let _this = this;
            if(this.markerOption.markers) {
                this.distanceMap.remove(this.markerOption.markers);
                this.markerOption.markers = null;
            }
            let _position = ConvertCoord.wgs84togcj02(this.markerOption.point.ptLon, this.markerOption.point.ptLat);
            this.markerOption.markers = new AMap.Marker({
                map: this.distanceMap,
                position: new AMap.LngLat(_position[0],_position[1]),
            });
            this.markerOption.markers.content = `<div class="c-map-info-window">
                                <p class="c-info-window-text">摄像头编号：${this.markerOption.point.label}<p>
                                <p class="c-info-window-text">道路名称：${this.markerOption.point.roadName}<p>
                                <p class="c-info-window-text">经纬度：${this.markerOption.point.ptLon},${this.markerOption.point.ptLat}<p>
                            </div>`;
            this.markerOption.markers.on('click', this.markerClick);
            this.markerOption.markers.emit('click', {target: this.markerOption.markers});

            this.distanceMap.setFitView();
        },
        markerClick(e) {
            this.infoWindow.setContent(e.target.content);
            this.infoWindow.open(this.distanceMap, e.target.getPosition());
        },
        queryCountyRoadTrees(item){
            this.endPlay();
            this.roads = [];
            this.currentArr = [];
            queryCountyRoadTree({
                'cityCode':item.code,
                'type':'N'
            }).then(res => {
                if(res.status == '200') {
                    this.regionList = [];
                    res.data.forEach(child => {
                        var obj = {};
                        obj.label = child.label;
                        obj.code = child.code;
                        obj.dataList = [];
                        child.children.forEach(roadInfo => {
                            var o ={};
                            o.name = roadInfo.label;
                            o.code = roadInfo.code;
                            obj.dataList.push(o);
                        })
                        this.regionList.push(obj);
                        this.treeData = this.regionList;
                    })
                }
            })
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
                        this.provinceOptions.push(obj);
                    })
                }
                //首次加载
                if(this.isFirst){
                    var provinceCode = this.provinceOptions[0].code;
                    this.searchKey.provinceValue = this.provinceOptions[0];
                    this.getCitys(provinceCode);
                    var cityCode = this.cityOptions[0].code;
                    this.searchKey.cityValue = this.cityOptions[0];
                    this.getRegion(cityCode);
                    this.isFirst = false;
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
            //懒加载路
            if(node.level == 1){
                var children = [];
                this.regionList.forEach(item => {
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
                resolve(children);
                return;
            }
            if (node.level > 2) return resolve([]);
            if(node.level == 2){
                this.roads.push(node.data.code);
                queryRoadCamList({
                    roadCode:node.data.code
                }).then(res => {
                    if(res.status == '200') {
                        var camDetail = res.data;
                        var children = [];
                        if(camDetail.length > 0){
                            //默认选中样式
                            camDetail.forEach(item => {
                                var obj = {};
                                obj.roadCode = node.data.code;
                                obj.label = item.deviceId;
                                obj.code = item.deviceId;
                                obj.serialNum = item.serialNum;
                                obj.roadName = item.rspRoadName;
                                obj.rsPtName = item.rsPtName;
                                obj.rsPtId = item.rsPtId;
                                obj.ptLon = item.ptLon;
                                obj.ptLat = item.ptLat;
                                obj.isOn = false;
                                obj.protocal = item.protocol;
                                obj.cameraRunStatus = item.cameraRunStatus;
                                obj.icon = "sl-play-icon";
                                obj.type = 3;
                                obj.leaf = true;
                                children.push(obj);
                            })
                        }
                        if(node.data.code == this.roads[0]){
                            // this.selectDeviceId = children[0].code;
                            // this.selectSerialNum = children[0].serialNum;
                            this.protocal = children[0].protocal;
                        }
                        resolve(children);
                        if(this.searchKey.device) {
                            this.currentVideoNode.code = this.searchKey.device.deviceId;
                            this.currentVideoNode.serialNum = this.searchKey.device.serialNum;
                        }else {
                            this.currentVideoNode.code = this.defaultData.code;
                            this.currentVideoNode.serialNum = this.defaultData.serialNum;
                        }
                        this.currentArr = [];
                        this.currentArr.push(this.currentVideoNode.code);

                        this.$refs.tree.setCurrentKey(this.currentArr[0]);
                        if(this.currentArr[0]){
                            startStreamRoad({
                                camId:this.currentVideoNode.serialNum,protocal:this.protocal
                        }).then(res =>{
                            if(res.status == '200') {
                                    children.forEach((item,i) => {
                                        if(item.serialNum == this.currentVideoNode.serialNum){
                                            var camerData = res.data;
                                            children[i].icon = 'sl-pause-icon';
                                            this.camDetail.camId = children[i].serialNum;
                                            this.camDetail.camCode = children[i].label;
                                            this.camDetail.roadName = children[i].roadName;
                                            this.camDetail.roadPointName = children[i].rsPtName;
                                            this.camDetail.roadPointId = children[i].rsPtId;
                                            this.camDetail.rsPtId = children[i].rsPtId;
                                            this.camDetail.lon = Number(children[i].ptLon).toFixed(8);
                                            this.camDetail.lat = Number(children[i].ptLat).toFixed(8);
                                            this.isMaskShow = false;
                                            let videoUrl = res.data.rtmp;
                                            this.embedFlash(videoUrl);
                                            this.markerOption.point = {
                                                ptLon: children[i].ptLon,
                                                ptLat: children[i].ptLat,
                                                roadName: children[i].roadName,
                                                label: children[i].label
                                            };
                                            this.drawStartMarker();
                                        }
                                    })
                                    
                                }
                            });
                        };
                        
                        return;
                    }
                })
            }
        },
        handleNodeClick(data){
            this.protocal = data.protocal;
            this.markerOption.point = null;
            this.currentVideoNode.code = data.code;//重置当前设备号
            let camStatus = data.cameraRunStatus;
            this.changeSize = false;
            if(this.currentVideoNode.code == data.code){
                if(data.isOn) {
                    data.isOn = false;
                    this.endPlay();
                    data.icon = "sl-play-icon";
                }else {
                    data.isOn = true;
                    this.startPlay(data);
                    data.icon = "sl-pause-icon";
                }
            }else{
                console.log('切换')
                this.currentVideoNode.isOn = false;
                this.currentVideoNode.icon = "sl-play-icon";
                if(camStatus == 1){//在线
                console.log(data.isOn);
                    if(data.isOn) {
                        data.isOn = false;
                        this.endPlay();
                        data.icon = "sl-play-icon";
                    }else {
                        data.isOn = true;
                        this.startPlay();
                        data.icon = "sl-pause-icon";
                    }
                    let roadCamInfo = Object.assign({},{roadName:this.roadName},data);
                    this.camDetail.rsPtId = roadCamInfo.rsPtId;
                    this.camDetail.roadName = data.roadName;
                    this.markerOption.point = roadCamInfo;
                    this.drawStartMarker();
                }else {
                    this.camDetail.roadName = '';
                    this.camDetail.camCode = '';
                    this.camDetail.camId = '';
                    this.camDetail.roadPointName = '';
                    if(camStatus == '0'){//未知
                        this.$message.error('未知摄像头!');
                    }else if(camStatus == '2'){//离线
                        this.$message.error('摄像头为离线状态!');
                    }else if(camStatus == '3'){//未注册
                        this.$message.error('摄像头未注册!');
                    }
                    data.isOn = false;
                    this.endPlay();
                    data.icon = "sl-play-icon";
                }
                this.currentVideoNode.data = data;
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
            startStreamRoad({
                camId:camerData.serialNum,protocal:this.protocal
            }).then(res =>{
                if(res.status == '200') {
                    this.camDetail.camId = camerData.serialNum;
                    this.camDetail.camCode = camerData.label;
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
        endPlay(data){
            this.isMaskShow = true;
            let nodeSel = document.querySelectorAll('.el-tree-node .el-tree-node__content .el-tree-node__expand-icon');
            let nodeSelArray = Array.from(nodeSel);
            for(let i=0;i<nodeSelArray.length;i++){
                nodeSelArray[i].classList.remove('pause');
            }
            if(this.currentVideoNode.code) {
                stopStream({
                    "camId":this.currentVideoNode.code,"protocal":this.protocal
                }).then(res => {
                    this.camId = '--';
                    this.camCode = '--';
                    this.roadPointName = '--';
                    this.roadPointId = '--';
                    this.camDetail.roadName = '';
                    this.camDetail.camCode = '';
                    this.camDetail.camId = '';
                    this.camDetail.roadPointName = '';
                })
            }
        },
        goRoadSide(){
            clearInterval(this.timer);
            this.isMaskShow = false;
            this.roadSideShow = true;
            this.changeSize = false;
        },
        getCityTrees(item){//获区市辖数据
            this.searchKey.device = '';
            this.searchKey.cityValue = '';
            this.camDetail.camCode = '';
            this.camDetail.camId = '';
            this.camDetail.roadName = '';
            this.camDetail.roadPointName = '';
            this.treeData = [];
            this.endPlay();
            this.provinceOptions.forEach((a,index,arr) => {
                if(a.code == item.code){
                    //重新获取市辖区信息
                    this.cityOptions = [];
                    this.treeList[index].dataList.forEach(cityVal => {
                        var obj = {};
                        obj.label = cityVal.name;
                        obj.code = cityVal.code;
                        this.cityOptions.push(obj);
                    })
                }
            })
        },
        backClick(){
            this.wsRequest();
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
        searchClick(){
            var rsCamOptions = this.rsCamCodeOption.filterOption;
            this.treeData = [];

            this.currentVideoNode.code = this.searchKey.device.deviceId;
            this.currentVideoNode.serialNum = this.searchKey.device.serialNum;
            this.currentArr = [this.searchKey.device.deviceId];

            this.isSearch = true;
            this.markerOption.point = null;
            if(rsCamOptions.length > 0){
                //过滤匹配默认选中数据
                rsCamOptions.forEach(item => {
                    if(item.deviceId == this.searchKey.device.deviceId){
                        this.provinceOptions.forEach(e => {
                            if(e.code == item.rspDistcodeProvince){
                                let obj = {};
                                obj.label = e.label;
                                obj.code = item.rspDistcodeProvince;
                                this.provinceOptions = [];
                                this.provinceOptions.push(obj);
                            }
                            
                            this.treeList.forEach((provinceInfo,index) => {
                                if(provinceInfo.code == this.provinceOptions[0].code){
                                    this.searchKey.provinceValue = this.provinceOptions[0];
                                    this.cityOptions = [];
                                    this.treeList[index].dataList.forEach(cityInfo => {
                                        var obj = {};
                                        obj.label = cityInfo.name;
                                        obj.code = cityInfo.code;
                                        this.cityOptions.push(obj);
                                    })
                                    this.searchKey.cityValue = this.cityOptions[0];
                                    this.getSideTree();
                                }
                            })
                        })
                        this.cityOptions.forEach(a => {
                            if(a.code == item.rspDistcodeCity){
                                let obj = {};
                                obj.label = a.label;
                                obj.code = item.rspDistcodeCity;
                                this.cityOptions = [];
                                this.cityOptions.push(obj);
                                this.getRegion(item.rspDistcodeCity);
                                this.currentArr = [];
                                this.currentArr.push(this.searchKey.device.deviceId);
                            }
                        })
                        this.currentVideoNode.serialNum = item.serialNum;
                    }
                })
            }else{
                this.provinceOptions = [];
                this.cityOptions = [];
                this.treeData = [];
                this.currentArr = [];
            }
        },
        clearFn(){
            this.rsCamCodeOption.defaultOption = this.rsCamCodeOption.filterOption;
        }
    },
    beforeRouteLeave(to, from, next) {
        // 设置下一个路由的 meta
        to.meta.keepAlive = false;
        next();
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
        top: 156px;
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

