<template>
<div class="c-wrapper-20 m-perceptual-data" v-cloak>
    
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
                        <span class="c-flex-1">联网总数:{{camStatusNums.count}}</span>
                        <span class="c-flex-1" style='text-align:center;'>在线:<i class="el-icon-loading" v-show='isRefshShow'></i><font v-show='isOnlineShow'>{{realTotal.onlineCount}}</font></span>
                        <span class="c-flex-1">实时监控:{{camStatusNums.monitorCount}}</span>
                    </div>
                    <div class="m-tree-box c-mt-10">
                        <el-tree
                            class="c-padding-10"
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
                                <span class="sl-play-text" :class='data.isHaveVideo ? "sl-custom-yellow" : ""'>{{ node.label }}</span>              
                            </span>
                        </el-tree>
                        <i class="el-icon-refresh" title="刷新摄像头状态" @click="getRegion(cityCode)"></i>
                    </div>
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
                <div class="c-mt-10">
                    <live-player 
                        :requestVideoUrl="videoUrl"
                        :autoplay="true"
                        @videoLoadCompleted="videoLoadCompleted"
                        >
                        <span></span>
                    </live-player>
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
// 视频插件
import LivePlayer from '@/common/livePlayer/template.vue';

import ConvertCoord from'@/common/utils/coordConvert.js';
import RoadSideInfo from "../roadSideInfo/roadSideInfo.vue";
import { setInterval, clearInterval, setTimeout } from 'timers';
import { queryRoadCamListSearch } from '@/api/search';
import {queryRoadRegionTree,queryCountyRoadTree,queryRoadCamList,startStreamRoad,getCityCameraStatics,stopStream,getCameraStatus} from '@/api/roadSide'

export default {
    name:'PerceptualData',
    components:{
        RoadSideInfo,
        LivePlayer
    },
    data(){
        return{
            defaultData: {
                code: '',
                serialNum: ''
            },
            currentVideoNode:{
                code: '',
                serialNum:''
            },
            videoUrl:"",
            // defaultData: {
            //     code: 'N-NJ-0004',
            //     serialNum: '3402000000132000003001'
            // },
            // currentVideoNode:{
            //     code: 'N-NJ-0004',
            //     serialNum:'3402000000132000003001'
            // },
            currentArr: ['N-NJ-0004'],

            playerData: null,

            roads:[],
            roadSideShow:false,
            provinceLoading:false,
            changeSize:false,
            isMaskShow:false,
            isRefshShow:true,
            isOnlineShow:false,
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
            realTotal:{
                onlineCount:0,
            },
            camStatusNums:{
                count:0,
                monitorCount:0,
                // onlineCount:0,
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
            playerOptions: {
                overNative: true,
                autoplay: true,
                controls: true,
                techOrder: ['flash', 'html5'],
                sourceOrder: true,
                flash: {
                  // swf: '../../../../static/media/video-js.swf'
                    // swf: '/static/media/video-js.swf'       
                    swf: '/static/media/video-js.swf'
                    // swf: isProduction ? '/dataManage/static/media/video-js.swf' : './static/media/video-js.swf'
                },
                muted: true, // 默认情况下将会消除任何音频。
                loop: false, // 导致视频一结束就重新开始。
                preload: 'auto', // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
                language: 'zh-CN',
                aspectRatio: '16:9', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
                fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
                sources: [
                    {
                        // type: 'rtmp/mp4',
                        // type: 'rtmp/flv',
                        type: 'rtmp',
                        src: ''
                    }
                ],
                // width: document.documentElement.clientWidth,
                notSupportedMessage: '此视频暂无法播放，请稍后再试', //允许覆盖Video.js无法播放媒体源时显示的默认信息。
                // controlBar: {
                //     timeDivider: false,
                //     durationDisplay: false,
                //     remainingTimeDisplay: false,
                //     fullscreenToggle: true  //全屏按钮
                // }
            },
            isSearch:false,
            // selectDeviceId:'',
            // selectSerialNum:'',
            timer: null,
            protocal:'',
            cameraUrl: queryRoadCamListSearch,
        }
    },
    // watch: {
    //     "searchKey.cityValue"(newVal, oldVal) {
    //         if(newVal.code) {
    //             clearInterval(this.timer);
    //             this.computCamNum();
    //             this.timer = setInterval(()=>{
    //                 this.computCamNum();
    //             },5000);
    //         }else {
    //             clearInterval(this.timer);
    //             // this.camStatusNums.count = 0;
    //             this.camStatusNums.monitorCount = 0;
    //             this.camStatusNums.onlineCount = 0;
    //         }
    //     }
    // },

    mounted(){
        this.getSideTree();//获取树结构数据
        this.initMap();
    },
    methods:{
        videoLoadCompleted() {
            console.log("视频加载完成");
        },
        computCamNum(cityCode){
            //查询总数。在线数，实时监控数
            getCityCameraStatics({
                cityCode: cityCode
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
            setTimeout(()=>{
                this.distanceMap.setMapStyle(window.defaultMapOption.mapStyle);
            },0);
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
            this.isRefshShow = true;
            this.isOnlineShow = false;
            this.realTotal.onlineCount = 0;//重置摄像头在线数
            this.cityCode = item.code;
            this.computCamNum(this.cityCode);
            this.endPlay();
            this.roads = [];
            this.currentArr = [];
            queryCountyRoadTree({
                'cityCode':item.code,
                'type':'N'
            }).then(res => {
                if(res.status == '200') {
                    this.regionList = [];
                    if(res.data){
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
                    }else{
                        this.isRefshShow = false;
                        this.isOnlineShow = true;
                    }
                }else{
                    this.isRefshShow = false;
                    this.isOnlineShow = true;
                }
            }).catch(err => {
                this.isRefshShow = false;
                this.isOnlineShow = true;
            });
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
                    this.cityCode = this.cityOptions[0].code;
                    this.searchKey.cityValue = this.cityOptions[0];
                    this.getRegion(this.cityCode);
                    this.computCamNum(this.cityCode);
                    this.isFirst = false;
                }
            }).catch(err => {
                this.isRefshShow = false;
                this.isOnlineShow = true;
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
            this.treeData = [];
            this.isRefshShow = true;
            this.isOnlineShow = false;
            this.realTotal.onlineCount = 0;//重置摄像头在线数
            this.computCamNum(this.cityCode);
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
                                obj.isHaveVideo = false;
                                obj.icon = "el-icon-loading";
                                obj.protocal = item.protocol;
                                obj.type = 3;
                                obj.leaf = true;
                                setTimeout( () => {
                                    new Promise((resolve,reject) => {
                                        this.getCameraStatus(item.serialNum,item.protocol,obj,resolve,reject);
                                    }).then((res) => {
                                        if(this.currentVideoNode.code == obj.code){
                                            this.currentArr = [];
                                            this.currentArr.push(this.currentVideoNode.code);
                                            setTimeout(() => {
                                                this.$refs.tree.setCurrentKey(this.currentArr[0]);
                                                this.handleNodeClick(obj);
                                            }, 0);
                                        }
                                    }).catch(() => {
                                        console.log('失败');
                                    });
                                },2000);
                                children.push(obj);                                
                            })
                        }
                        if(node.data.code == this.roads[0]){
                            this.protocal = children[0].protocal;
                        }
                        resolve(children);
                    }
                })
            }
        },
        handleNodeClick(data){
            if(data.icon == 'el-icon-loading') {
                this.$message({
                    type: 'error',
                    duration: '1500',
                    message: '正在加载摄像头状态，请稍等...',
                    showClose: true
                });
            }else {
                this.protocal = data.protocal;
                this.markerOption.point = null;
                let camStatus = data.status;
                this.changeSize = false;
                if(this.currentVideoNode.code == data.code){
                    if(data.isOn) {
                        data.isOn = false;
                        data.icon = "sl-play-icon";
                        this.endPlay();
                        this.currentVideoNode.code = this.defaultData.code;
                        this.currentVideoNode.serialNum = this.defaultData.serialNum;
                    }else {
                        // data.isOn = true;
                        // data.icon = "sl-pause-icon";
                        this.startPlay(data);
                    }
                }else{
                    // this.currentVideoNode.isOn = false;
                    // this.currentVideoNode.icon = "sl-play-icon";
                    if(camStatus == 1){//在线
                        if(data.isOn) {
                            data.isOn = false;
                            data.icon = "sl-play-icon";
                            this.endPlay();
                            this.currentVideoNode.code = this.defaultData.code;
                            this.currentVideoNode.serialNum = this.defaultData.serialNum;
                        }else {
                            // data.isOn = true;
                            // data.icon = "sl-pause-icon";
                            this.startPlay(data);
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
                        let _message = '';
                        if(camStatus == '0'){//未注册
                            _message = '摄像头未注册!';
                        }else if(camStatus == '2'){//离线
                            _message = '摄像头为离线状态!';
                        }else if(camStatus == '3'){//未知
                            _message = '未知摄像头!';
                        }
                        if(_message) {
                            this.$message({
                                type: 'error',
                                duration: '1500',
                                message: _message,
                                showClose: true
                            });
                        }
                        if(this.playerData) {      
                            data.isOn = false;
                            data.icon = "sl-play-icon";
                            this.endPlay();
                        }           
                    }
                }
            }
        },
        startPlay(camerData){
            if(this.playerData) {
                this.endPlay();
            }
            startStreamRoad({
                camId:camerData.serialNum,protocal:this.protocal
            }).then(res =>{
                if(res.status == '200') {
                    let videoUrl = res.data.flv;
                    this.isMaskShow = false;
                    camerData.isOn = true;
                    camerData.icon = "sl-pause-icon";
                    this.playerData = camerData;
                    if(videoUrl) {
                        this.camDetail.camId = camerData.serialNum;
                        this.camDetail.camCode = camerData.label;
                        this.camDetail.roadName = camerData.roadName;
                        this.camDetail.roadPointName = camerData.rsPtName;
                        this.camDetail.roadPointId = camerData.rsPtId;
                        this.camDetail.lon = camerData.ptLon;
                        this.camDetail.lat = camerData.ptLat;
                        this.isMaskShow = false;
                        this.videoUrl = videoUrl;
                        camerData.isOn = true;
                        camerData.icon = "sl-pause-icon";
                        this.playerData = camerData;
                    }else {
                        let _message = res.message;
                        camerData.isOn = false;
                        camerData.icon = "sl-play-icon";
                        this.$message({
                            type: 'error',
                            duration: '1500',
                            message: _message,
                            showClose: true
                        });
                    }
                }else {
                    camerData.isOn = false;
                    camerData.icon = "sl-play-icon";
                }
            }).catch(err => {
                camerData.isOn = false;
                camerData.icon = "sl-play-icon";
            });
        },
        endPlay(){
            if(this.playerData) {
                this.isMaskShow = true;
                let nodeSel = document.querySelectorAll('.el-tree-node .el-tree-node__content .el-tree-node__expand-icon');
                let nodeSelArray = Array.from(nodeSel);
                for(let i=0;i<nodeSelArray.length;i++){
                    nodeSelArray[i].classList.remove('pause');
                }
                stopStream({
                    "camId":this.playerData.code,"protocal":this.protocal
                }).then(res => {
                    this.camId = '--';
                    this.camCode = '--';
                    this.roadPointName = '--';
                    this.roadPointId = '--';
                    this.camDetail.roadName = '';
                    this.camDetail.camCode = '';
                    this.camDetail.camId = '';
                    this.camDetail.roadPointName = '';
                });
                this.playerData.isOn = false;
                this.playerData.icon = "sl-play-icon";
                this.playerData = null;
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
            if(this.searchKey.device) {
                this.treeData = [];

                this.currentVideoNode.code = this.searchKey.device.deviceId;
                this.currentVideoNode.serialNum = this.searchKey.device.serialNum;

                this.isSearch = true;
                this.markerOption.point = null;
                this.isRefshShow = true;
                this.isOnlineShow = false;
                this.computCamNum(this.cityCode);
                this.provinceOptions.forEach(e => {
                    if(e.code == this.searchKey.device.rspDistcodeProvince){
                        let obj = {};
                        obj.label = e.label;
                        obj.code = this.searchKey.device.rspDistcodeProvince;
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
                });
                this.cityOptions.forEach(a => {
                    if(a.code == this.searchKey.device.rspDistcodeCity){
                        let obj = {};
                        obj.label = a.label;
                        obj.code = this.searchKey.device.rspDistcodeCity;
                        this.cityOptions = [];
                        this.cityOptions.push(obj);
                        this.getRegion(this.searchKey.device.rspDistcodeCity);
                        this.currentArr = [];
                        this.currentArr.push(this.searchKey.device.deviceId);
                    }
                });
            }
        },
        getCameraStatus(serialNum,protocol,obj,resolve,reject){
            getCameraStatus({
                serialNum:serialNum,
                protocol:protocol
            }).then(res => {
                if(res.status == 200){
                    obj.status = res.data.status;
                    obj.icon = "sl-play-icon";
                    if(obj.status == 1){
                        obj.isHaveVideo = true;
                        this.realTotal.onlineCount++;
                        this.isRefshShow = false;
                        this.isOnlineShow = true;
                    }else{
                        this.isRefshShow = false;
                        this.isOnlineShow = true;
                    }
                    resolve(obj);
                }else{
                    reject();
                }
            }).catch(err => {
                reject();
            })
            
        },
        clearFn(){
            this.rsCamCodeOption.defaultOption = this.rsCamCodeOption.filterOption;
            this.currentVideoNode.code = this.defaultData.code;
            this.currentVideoNode.serialNum = this.defaultData.serialNum;
        }
    },
    destroyed() {
        clearInterval(this.timer);
    }
}
</script>
<style lang="scss">
@import '@/assets/scss/theme.scss';
.m-perceptual-data {
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
            width: 12px;
            height: 12px;
            background:url(../../../../static/icon/btn-play.png) center center no-repeat;
            background-size: 10px 10px;
            vertical-align: middle;
            &.el-icon-loading {
                font-size: 10px;
                background-image: none !important;
            }
        }
        .sl-play-text {
            vertical-align: middle;
        }
    }
    .m-tree-box {
        position: absolute;
        top: 156px;
        left: 10px;
        right: 10px;
        bottom: 10px;
        background-color: #fff;
        .el-icon-refresh {
            position: absolute;
            right: 23px;
            top: 5px;
            font-size: 14px;
            cursor: pointer;
        }
        .el-tree{
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
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
    // .video-js.vjs-ended .vjs-big-play-button, .video-js.vjs-paused .vjs-big-play-button, .vjs-paused.vjs-has-started.vjs-custom-skin>.video-js .vjs-big-play-button{
    //     display:none;
    // }
    .sl-custom-yellow{
        color:#f49308;
    }
}
</style>

