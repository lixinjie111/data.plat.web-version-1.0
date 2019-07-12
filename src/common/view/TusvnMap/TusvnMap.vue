<template>
    <div style="height:100%">
        <div :id="targetId"  style="height:100%"></div>
        <div :id="overlayContainerId" style="display: none;">
            <!-- <div id="marker" title="Marker">
                <img src="../../static/assets/images/loading.gif"/>
            </div> -->
            <!-- <img id="marker" src="../../static/assets/images/loading.gif"/> -->
        </div>
        <template v-for="(popupData,key,index) in popupDatas">
            <div :id="popupData.id+'-popup'" :ref="popupData.id+'-popup'" class="ol-popup" :key="index">
                <a href="#" :overlayid="popupData.id" :id="popupData.id+'-popup-closer'" class="ol-popup-closer" @click="closePopup($event)"></a>
                <div :id="popupData.id+'-popup-content'">
                    <span v-html="popupData.content"></span>
                </div>
            </div>
        </template>
    </div>
</template>
<script>

// import startIcon from '@/assets/images/start.png';
// import endIcon from '@/assets/images/end.png';
// import startIcon2 from '@/assets/images/start2.png';
// import endIcon2 from '@/assets/images/end2.png';

import _ from 'lodash';
import "ol/ol.css";
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import Overlay from 'ol/Overlay.js';
import {Image as ImageLayer} from 'ol/layer.js';
import ImageWMS from 'ol/source/ImageWMS.js';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style.js';
import {defaults as defaultControls,ScaleLine,FullScreen} from 'ol/control.js';
import {defaults as defaultInteractions, DragRotateAndZoom} from 'ol/interaction.js';
import TileLayer from 'ol/layer/Tile.js';
import BingMaps from 'ol/source/BingMaps';
import OSM from 'ol/source/OSM.js';
import Polygon from 'ol/geom/Polygon';
import Point from 'ol/geom/Point';
import MousePosition from 'ol/control/MousePosition.js';
import * as mapInit from './MapUtils.js';


export default {
    props:["targetId","overlayContainerId"],
    data(){
        return {
             orderStatus: -1
            ,map: null
            ,project:"EPSG:4326"//地图投影
            ,center: [116.38921511745102,39.912577179827466]//地图初始中心
            ,zoom: 16//地图初始缩放级别
            ,planLineTracks: []
            ,realLineTracks: []
            ,pageHeight: 400
            ,carLayerId:"carLayer"
            ,currentDivPolygon:null//记录旋转过后的，div窗口对应的矩形
            // ,startIcon: '@/assets/images/start.png'
            // ,endIcon: '@/assets/images/end.png'
            ,popupDatas:{}
            ,overlays:{}

        }
    },
    watch:{
    },
    methods: {
        //初始化地图
        initMap:function(){

            this.$data.map = new Map({
                controls: defaultControls({attribution: false}).extend([
                    // overviewMapControl
                    new ScaleLine()
                    // ,new FullScreen()
                    // ,new MousePosition()
                ]),
                interactions: defaultInteractions().extend([
                    new DragRotateAndZoom()
                ]),
                layers: [
                    new TileLayer({
                        source: new OSM({
                            wrapX: false,
                            // url:"https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            // url:"http://113.208.118.62:8086/mapserver/getMapTile?protocol=https&cache=true&server={a-c}&xyz={z}/{x}/{y}&type=vector&format=png&baseUrl=tile.openstreetmap.org"
                            url:"http://120.133.21.14:8086/mapserver/getMapTile?protocol=https&cache=true&server={a-c}&xyz={z}/{x}/{y}&type=vector&format=png&baseUrl=tile.openstreetmap.org"
                            // url:"http://10.0.1.22:8086/mapserver/getMapTile?protocol=https&cache=true&server={a-c}&xyz={z}/{x}/{y}&type=vector&format=png&baseUrl=tile.openstreetmap.org"
                            // url:"https://api.chinavehiclenet.cn:8769/mapproxy/mapserver/getMapTile?protocol=https&cache=true&server={a-c}&xyz={z}/{x}/{y}&type=vector&format=png&baseUrl=tile.openstreetmap.org"
                        })
                        // source: new BingMaps({
                        //     key: 'AlgNEg0cVVHbTuJ8jXqJzA6uah5MIklbLmMySfTMb-GQZzEndCrxR1PxBEaWC3Bt',
                        //     imagerySet: "Aerial"  //'Road','RoadOnDemand','Aerial','AerialWithLabels','collinsBart','ordnanceSurvey'
                        //     // use maxZoom 19 to see stretched tiles instead of the BingMaps
                        //     // "no photos at this zoom level" tiles
                        //     // maxZoom: 19
                        // })
                    })
                ],
                target: this.targetId,
                view: new View({
                    projection:this.$data.project,
                    center: this.$data.center,
                    zoom: this.$data.zoom
                })
            });
            this.$data.map.on("click",this.mapClick);
            this.$data.map.getView().on("change:resolution",this.viewLevelChange);
            this.$data.map.on("moveend",this.moveEnd);
            

            //测试用
            // this.addVectorLayer("vectorLayer_01");
            // this.removeOverlayById("vectorLayer_01");

            //添加文字
            // lon,lat,id,layerId,text, font, placement, textOffsetX, textOffsetY, fillColor, stroke, backgroundFillColor, backgroundStroke, padding,imgUrl,imgSize,imgOffset
            // this.addText(116.38921511745102,39.912577179827466,"text_001","vectorLayer_01","图标上的文字", //lon,lat,id,layerId,text
            //             null, "point", 0, -25, //font, placement, textOffsetX, textOffsetY
            //             "black", null, "red", //fillColor, stroke, backgroundFillColor
            //             null, [3,5,2,5],true,null,null,null);//backgroundStroke, padding,withImg,imgUrl,imgSize,imgOffset

            // this.addNormalPoint(116.38780560519022,39.91485809347664,"car_01","vectorLayer_01",30,"red","green",2);//lon,lat,id,layerId,radius,fillColor,strokeColor,StrokeWidth

            

            // this.addRegularShapePoint(116.38780560519022,39.91485809347664,"text_002","vectorLayer_01",
            //     null,5,//fill, points, 
            //     30,30,//radius, radius1, 
            //     10,0,//radius2, angle, 
            //     mapInit.generateStroke(
            //         "green", "round", "round", [5,5], 0, 10, 5
            //     ),//stroke, // stroke  由generateStroke
            //     0,true//rotation, rotateWithView
            // );

            //添加图片
            // this.addImg(116.39097012548343,39.91324037123015,"car_01","vectorLayer_01",null,null,Math.PI/2);
            //添加线
            // this.addLineString([[116.38921511745102,39.912577179827466]
            //                     ,[116.39051330661422,39.91280248538472]
            //                     ,[116.3911033925975,39.91340330020405]
            //                     ,[116.39159691905624,39.91415431872822]
            //                     ,[116.39247668361313,39.914336708941235]],
            //                     "line_01",
            //                     "red",
            //                     "round",
            //                     "round",
            //                     [5,0],
            //                     0,
            //                     10,
            //                     5,
            //                     "vectorLayer_01"
            //                 );
            // this.addLineString("MULTILINESTRING((125.389335725555 43.8583870585032,125.384612993563 43.871334125479,125.386970579559 43.8738060564743,125.388557423556 43.8754463874713))",
            //                     "line_01",
            //                     "red",
            //                     "round",
            //                     "round",
            //                     [5,0],
            //                     0,
            //                     10,
            //                     5,
            //                     "vectorLayer_01"
            //                 );
                            

            // 添加面
            // this.addMultiPolygon([[[[-180,-90]
            //                     ,[180,-90]
            //                     ,[180,90]
            //                     ,[-180,90]
            //                     ,[-180,-90]]]],
            //                     "multiPolygon_01",
            //                     [127,127,127,0.3],
            //                     "red",
            //                     "round",
            //                     "round",
            //                     [5,0],
            //                     0,
            //                     10,
            //                     5,
            //                     "vectorLayer_01"
            //                 );
            //lon, lat, radius, id,  layerId

            // this.addCircle(116.38780560519022,39.91485809347664,0.001,"circle_01",
            //         [0, 0, 125, 0.5],
            //         'green',
            //         "round",
            //         "round",
            //         [5,0],
            //         0,
            //         0,
            //         3,
            //         "vectorLayer_01");

            //添加箭头
            // this.addArrow([[116.38780560519022,39.91485809347664]
            //                 ,[116.3905200007133,39.91474007627998]
            //                 ,[116.39190402056498,39.91560911200081]
            //                 ,[116.39309492136759,39.91575931570564]
            //                 ,[116.39422144915385,39.916188469148025]],
            //                 "arrow_01",
            //                 "black",
            //                 "round",
            //                 "round",
            //                 [5,0],
            //                 0,
            //                 10,
            //                 5,
            //                 "static/assets/images/geolocation_marker.png",
            //                 "static/assets/images/geolocation_marker_heading.png",
            //                 "vectorLayer_01");

            //添加html元素到地图中
            // let overLay_container = document.getElementById(this.overlayContainerId);
            // let overLay_img = document.createElement("img");
            // overLay_img.setAttribute("src","static/assets/images/loading.gif");
            // overLay_img.setAttribute("id","marker01");
            // overLay_container.appendChild(overLay_img);

            // this.addOverlay("marker01",document.getElementById('marker01'),
            //                 116.39080511723024,39.91646217707094,null,[50,50],);


            // setTimeout(() => {
            //     this.removeOverlayById("marker01");
            //     console.log(document.getElementById('marker01'));
            // }, 10000);


            //添加图片覆盖物
            // this.addImgOverlay("marker02","static/assets/images/loading.gif",90,
            //                     116.39959600997206,39.90647601131848,
            //                     JSON.stringify({a:1,b:2,c:{d:5}}),[50,50],
            //                     this.testImgOverlayClick);

            // let trackPoint=[[116.37659338546034,39.90578936581067]
            //                 ,[116.37938288283583,39.90581082348279]
            //                 ,[116.381936345818,39.90578936581067]
            //                 ,[116.38448980880018,39.9060468578761]
            //                 ,[116.38700035643812,39.90600394253186]
            //                 ,[116.38963965010878,39.90608977322034]
            //                 ,[116.39245060515638,39.90623997692517]
            //                 ,[116.39457491469618,39.90630434994153]
            //                 ,[116.39609840941664,39.90634726528577]
            //                 ,[116.39794376921888,39.906368722957886]
            //                 ,[116.39959600997206,39.90647601131848]];
            // let i = trackPoint.length;
            // let intervalHandle = setInterval(()=>{
            //     i--;
            //     if(i>=0)
            //     {
            //         // console.log(i+":"+trackPoint[i]);
            //         this.setOverlayPosition("marker02",trackPoint[i][0],trackPoint[i][1]);
            //         // this.centerAt(trackPoint[i][0],trackPoint[i][1])
            //     }else{
            //         // clearInterval(intervalHandle);
            //         i = trackPoint.length;
            //     }
            // },1000);
            
            
            // setTimeout(() => {
            //     this.removeOverlayById("marker02");
            //     console.log(document.getElementById('marker02'));
            // }, 10000);

            //固定地图缩放比例，以及限制平移
            // this.forbidZoom(15);
            // this.centerAt(120.663373847,31.1255560491);
            // this.forbidDrag();

            //添加wms图层
            // this.addWms("aa","http://10.0.1.22:8080/geoserver/shanghai_qcc/wms","shanghai_qcc:shanghai_qcc_HD","",1,true,null);
            // this.addWms("aa","http://113.208.118.62:8080/geoserver/shanghai_qcc/wms","shanghai_qcc:shanghai_qcc_HD","",1,true,null);
            
            // let n = 10.0;
            // let i = 0;
            // let rotation=Math.PI/4;
            // let intervalHandle = setInterval(()=>{
            //     if(i<1)
            //     {
            //         this.rotateMap(rotation);
            //         // rotation = rotation + Math.PI*2/n;
                    
            //     }else{
            //         clearInterval(intervalHandle);
            //     }
            //     i++;
            // },30000);
            // this.rotateMap(Math.PI/4);


            //add popup
            // let popup1IntervalHandle = setInterval(()=>{
            //     this.addInfoWindow({
            //         id:"0021",
            //         content:"<span style='color:red'>0021</span>",
            //         lon:116.38921521746112,
            //         lat:39.912577179827466
            //     });
            //     clearInterval(popup1IntervalHandle);
            // },2000);

            // let popup2IntervalHandle = setInterval(()=>{
            //     this.addInfoWindow({
            //         id:"0011",
            //         content:"<span style='color:red'>001</span>",
            //         lon:116.39931511745102,
            //         lat:39.912577179827466
            //     });
            //     clearInterval(popup2IntervalHandle);
            // },1000);
            
        },
        /**
         * 添加信息窗口到地图中
         * obj格式如下：
         * {
         *     id:"0011",  //唯一编码
         *     content:"<span style='color:red'>001</span>",//信息框中显示的内容
         *     lon:117,//经度
         *     lat:39  //纬度
         * }
         */
        addInfoWindow:function(obj){
            this.$set(this.$data.popupDatas, obj.id, obj);
            this.$nextTick(function(){
                console.log(obj);
                let container = document.getElementById(obj.id+'-popup');
                let overlay = new Overlay({
                    element: container,
                    autoPan: true,
                    autoPanAnimation: {
                        duration: 250
                    }
                });
                this.$data.overlays[obj.id]=overlay;
                this.$data.map.addOverlay(overlay);
                overlay.setPosition([obj.lon,obj.lat]);
            });            
        },
        closePopup:function(e){
            let overlayid = e.target.attributes.overlayid.value;
            let overlay = this.$data.overlays[overlayid];
            this.$data.map.removeOverlay(overlay);
            e.target.blur();
            return false;
        },
        testImgOverlayClick:function(e){
            console.log(e.target.getAttribute("bdata"));
        },
        mapClick:function(mevent){
            this.$emit("MapClick",this,mevent);
        },
        viewLevelChange:function(mevent){
            let z = parseInt(this.$data.map.getView().getZoom());
            if(this.$data.zoom!=z)
            {
                this.$emit("ViewLevelChange",this,z);
                this.$data.zoom=z;
            }
        },
        moveEnd:function(mevent){
            this.$emit("ExtentChange",this,this.getCurrentExtent());
        },
        /**
         * 固定地图到某一缩放级别，使鼠标滚轮失效
         * 
         * @param {Number} level  缩放级别
         */
        forbidZoom:function(level){
            let view = this.$data.map.getView();
            view.setZoom(level);
            view.setMaxZoom(level);
            view.setMinZoom(level);
        },
        /**
         * 旋转地图
         * 
         * @param {Number} rotation  弧度，180度=Math.PI弧度
         */
        rotateMap:function(rotation){
            let view = this.$data.map.getView();
            // view.animate({
            //     rotation: rotation
            // });
            //获取旋转后的当前窗口矩形Polygon
            let currentExtent = this.getCurrentExtent();
            this.$data.currentDivPolygon=new Polygon([[
                [currentExtent[2],currentExtent[3]],
                [currentExtent[2],currentExtent[1]],
                [currentExtent[0],currentExtent[1]],
                [currentExtent[0],currentExtent[3]],
                [currentExtent[2],currentExtent[3]]
            ]]);
            view.setRotation(rotation);
            this.$data.currentDivPolygon.rotate(rotation,[(currentExtent[0]+currentExtent[2])/2,(currentExtent[1]+currentExtent[3])/2]);
            
        },
        /**
         * 判断是否在点在当前地图div对应Polygon的范围内
         */
        isInDivPolygon:function(x,y)
        {
            if(this.$data.currentDivPolygon==null)
            {
                let currentExtent = this.getCurrentExtent();
                this.$data.currentDivPolygon=new Polygon([[
                    [currentExtent[2],currentExtent[3]],
                    [currentExtent[2],currentExtent[1]],
                    [currentExtent[0],currentExtent[1]],
                    [currentExtent[0],currentExtent[3]],
                    [currentExtent[2],currentExtent[3]]
                ]]);
            }
            return this.$data.currentDivPolygon.intersectsCoordinate([x,y]);
        },

        /**
         * 禁止缩放
         */
        forbidDrag:function(){
            let controls = this.$data.map.getControls();
            let interactions = this.$data.map.getInteractions();
            for(var i=0;i<interactions.getArray().length;i++)
            {
                this.$data.map.removeInteraction(interactions.getArray()[i]);
            }
        },
        /**
         * 向地图中添加覆盖物
         * 
         * @param {any} id 
         * @param {Document} dom 
         * @param {Number} lon 
         * @param {Number} lat 
         * @param {String} className  样式
         * @param {Array.<Number>} offset  位置偏移
         */
        addOverlay:function(id, dom, lon, lat, className,offset) {
            mapInit.addOverlay(id, dom, lon, lat, className,offset,this.$data.map);
        },
        /**
         * 向地图中添加图片覆盖物
         * 
         * @param {any} id 
         * @param {String} imgUrl  图片地址
         * @param {Number} courseAngle 旋转角度
         * @param {Number} lon 
         * @param {Number} lat 
         * @param {String} bdata 业务数据
         * @param {Array.<Number>} offset  位置偏移
         * @param {Function} callback 点击的回调
         */
        addImgOverlay:function(id, imgUrl,courseAngle, lon, lat,bdata,offset,callback){
            let overLay_container = document.getElementById(this.overlayContainerId);
            let overLay_img = document.createElement("img");
            overLay_img.setAttribute("src",imgUrl);
            overLay_img.setAttribute("id",id);
            overLay_img.setAttribute("bdata",bdata);
            if(courseAngle!=null){
                overLay_img.style.transform = 'rotate(' + courseAngle + 'deg)';
            }
            if(callback!=null)
            {
                overLay_img.onclick=callback;
            }
            
            overLay_container.appendChild(overLay_img);
            mapInit.addOverlay(id, overLay_img, lon, lat, null,offset,this.$data.map);
        },
        /**
         * 重新设置覆盖物的位置
         * @param {String} id 
         * @param {Number} lon 
         * @param {Number} lat 
         */
        setOverlayPosition:function(id, lon, lat) {
            mapInit.setOverlayPosition(id, lon, lat,this.$data.map);
        },
        /**
         * 清除地图中的覆盖物
         * 
         */
        clearOverlays:function() {
            mapInit.clearOverlays(this.$data.map);
        },
        /**
         * 根据id移除覆盖物
         * 
         * @param {String} id 覆盖物的id
         */
        removeOverlayById:function(id) {
            mapInit.removeOverlayById(id,this.$data.map);
        },
        /**
         * 添加矢量图层
         * @param {string} id 矢量图层id
         */
        addVectorLayer:function(id){
            let carLayer = mapInit.generateVectorLayer(id);
            mapInit.addLayer(this.$data.map,carLayer);
        },
        /**
         * 通过Id获取图层
         * @param {string} id 图层id
         */
        getLayerById:function(id){
            return mapInit.getLayerByAttr(this.$data.map, "id", id);
        },
        /**
         * 向地图中添加图片
         * 
         * @param {number} lon 浮点型的值
         * @param {number} lat 浮点型的值
         * @param {string} id 图片id
         * @param {string} layerId 图层id
         * @param {string} carImgUrl 图片地址
         * @param {Array.<number>} size 图片大小，例如：[22,37]
         * @param {number} rotation 旋转角度（弧度），顺时针方向为正。例如：顺时针方向偏转90度，对应的值是Math.PI/2
         * @param {boolean} rotateWithView 是否跟view一起旋转
         * @param {number} opacity 透明度，0到1之间的值
         * @param {Array.<number>} offset x、y方向的偏移，默认值是[0,0]。例如：[0,0]
         * @param {number} scale 图片缩放，默认为1
         */
        addImg:function(lon,lat,id,layerId,carImgUrl,size,rotation,rotateWithView,opacity,offset,scale){
             let carStyle = new Style({
                image:mapInit.generateIcon(carImgUrl||"../../static/assets/images/geolocation_marker_heading.png",size||[22,37],rotation||0,rotateWithView||true,opacity||1,offset||[0,0],scale)
            });
            mapInit.addPoint(lon,lat,id,carStyle,this.getLayerById(layerId));
        },

        

        /**
         * 向地图中添加规则图形形点
         * 
         * @param {number} lon 浮点型的值
         * @param {number} lat 浮点型的值
         * @param {string} id id
         * @param {string} layerId 图层id
         * 图形的样式
         * @param {module:ol/style/Fill~Fill} fill 填充样式。调用generateFill生成
         * @param {number} points 点数
         * @param {number} radius 半径
         * @param {number} radius1  外半径（星形）
         * @param {number} radius2  内半径（星形）
         * @param {number} angle 偏转角度，弧度
         * @param {module:ol/style/Stroke~Stroke} stroke 边线的样式。调用generateStroke函数生成
         * @param {number} rotation 旋转角度，弧度
         * @param {boolean} rotateWithView 是否和view一起偏转
        */
        addRegularShapePoint:function(lon,lat,id,layerId,fill, points, radius, radius1, radius2, angle, stroke, rotation, rotateWithView){
             let carStyle = new Style({
                image:mapInit.generateRegularShape(fill, points, radius, radius1, radius2, angle, stroke, rotation, rotateWithView)
            });
            mapInit.addPoint(lon,lat,id,carStyle,this.getLayerById(layerId));
        },
        /**
         * 向地图中添加普通点
         * @param {number} lon 浮点型的值
         * @param {number} lat 浮点型的值
         * @param {string} id 图片id
         * @param {string} layerId 图层id
         * 
         * @param {number} radius 圆的半径 默认值是5
         * @param {module:ol/color~Color | module:ol/colorlike~ColorLike} fillColor 颜色值，默认值是red，'black'、'red'、'green'、'white'、'#4271AE' 
         * @param {module:ol/color~Color | module:ol/colorlike~ColorLike} strokeColor 颜色值，默认值是green，'black'、'red'、'green'、'white'、'#4271AE'
         * @param {number} StrokeWidth 线宽度 默认值是3
         */
        addNormalPoint:function(lon,lat,id,layerId,radius,fillColor,strokeColor,StrokeWidth){
            let image = new CircleStyle({
                radius: radius||5,
                fill: new Fill({
                    color: fillColor||"red"
                }),
                stroke: new Stroke({
                    color: strokeColor||"green",
                    width: StrokeWidth||3
                })
            });
            let carStyle = new Style({
                image:image
            });
            mapInit.addPoint(lon,lat,id,carStyle,this.getLayerById(layerId));
        },

        /**
         * 向地图中添加文字
         * 
         * @param {number} lon 浮点型的值
         * @param {number} lat 浮点型的值
         * @param {string} id 图片id
         * @param {string} layerId 图层id
         * @param {string} text 显示的文字
         * @param {string} font 字体，默认值：'bold 14px "Open Sans", "Arial Unicode MS", "sans-serif"'
         * @param {string} placement 位置，可取值，line、point,默认值：line
         * @param {number} textOffsetX  x方向上的偏移，单位像素，默认值：0
         * @param {number} textOffsetY  y方向上的偏移，单位像素，默认值：0
         * @param {string} fillColor 文字颜色，默认值：white
         * @param {module:ol/style/Stroke~Stroke} stroke 绘制的线条的样式
         * @param {string} backgroundFillColor 文字颜色，默认值：black
         * @param {module:ol/style/Stroke~Stroke} backgroundStroke 背景边框绘制的线条的样式
         * @param {Array.<number>} padding 内边距，默认值是[0, 0, 0, 0]
         * 
         * @param {boolean} withImg 是否带图标
         * @param {string} imgUrl 图片地址
         * @param {Array.<number>} imgSize 图片大小，例如：[22,37]
         * @param {Array.<number>} imgOffset x、y方向的偏移，默认值是[0,0]。例如：[0,0]
         * @param {number} scale 图片缩放，默认为1
         */
        addText:function(lon,lat,id,layerId,text, font, placement, textOffsetX, textOffsetY, fillColor, stroke, backgroundFillColor, backgroundStroke, padding,withImg,imgUrl,imgSize,imgOffset,scale){
             let textStyle = null;
             if(withImg){
                textStyle = new Style({
                    image:mapInit.generateIcon(imgUrl||"../../static/assets/images/geolocation_marker_heading.png",imgSize||[22,37],0,true,1,imgOffset||[0,0],scale),
                    text:mapInit.generateText(text, font, placement, textOffsetX, textOffsetY, fillColor, stroke, backgroundFillColor, backgroundStroke, padding||[0, 0, 0, 0]),
                });
             }else{
                textStyle = new Style({
                    text:mapInit.generateText(text, font, placement, textOffsetX, textOffsetY, fillColor, stroke, backgroundFillColor, backgroundStroke, padding||[0, 0, 0, 0]),
                });
             }
             
            mapInit.addPoint(lon,lat,id,textStyle,this.getLayerById(layerId));
        },

        /**
         * 添加线条
         * @param {Array.<Array.<number>>} coordinates 坐标序列[[112,39],[113,40]]
         * @param {string} id 线条的ID
         * @param {module:ol/color~Color | module:ol/colorlike~ColorLike} color 颜色值，'black'、'red'、'green'、'white'、'#4271AE' [red, green, blue, alpha]
         * @param {string} lineCap 线端点的样式。butt, round, or square.
         * @param {string} lineJoin 线连接处的样式。bevel, round, or miter.
         * @param {Array.<number>} lineDash 虚线设置。[5,5]
         * @param {number} lineDashOffset 默认值是0。
         * @param {number} miterLimit 默认值10
         * @param {number} width 线宽度
         * @param {string} layerId 图层id
         */
        addLineString:function(coordinates, id, color, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, width, layerId) {
            let lineStyle = new Style({
                stroke:mapInit.generateStroke(color, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, width)
            });
            mapInit.addLineString(coordinates, id, lineStyle, this.getLayerById(layerId));            
        },
        /**
         * 向地图中添加圆
         *  @param {number} lon 经度，浮点型的值
         *  @param {number} lat 纬度，浮点型的值
         *  @param {number} radius 半径
         *  @param {any} id 唯一标识
         *  @param {module:ol/color~Color | module:ol/colorlike~ColorLike} fillColor 颜色值，'black'、'red'、'green'、'white'、'#4271AE' [red, green, blue, alpha]
         *  @param {module:ol/color~Color | module:ol/colorlike~ColorLike} strokeColor 颜色值，'black'、'red'、'green'、'white'、'#4271AE' [red, green, blue, alpha]
         *  @param {string} lineCap 线端点的样式。butt, round, or square.
         *  @param {string} lineJoin 线连接处的样式。bevel, round, or miter.
         *  @param {Array.<number>} lineDash 虚线设置。[5,5]
         *  @param {number} lineDashOffset 默认值是0。
         *  @param {number} miterLimit 默认值10
         *  @param {number} width 线宽度
         *  @param {module:ol/Layer} layer Openlayers的Layer对象
         */
        addCircle:function(lon, lat, radius, id,fillColor,strokeColor, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, width, layerId) {
            let circleStyle = new Style({
                stroke:mapInit.generateStroke(strokeColor, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, width),
                fill:mapInit.generateFill(fillColor)
            });
            mapInit.addCircle(lon, lat,radius, id, circleStyle, this.getLayerById(layerId));
        },
        /**
         * 添加面
         * @param {Array.<Array.<Array.<module:ol/coordinate~Coordinate>>>} coords 数组型的值
         * @param {string} id 线条的ID
         * @param {module:ol/color~Color | module:ol/colorlike~ColorLike} fillColor 颜色值，'black'、'red'、'green'、'white'、'#4271AE' [red, green, blue, alpha]
         * @param {module:ol/color~Color | module:ol/colorlike~ColorLike} strokeColor 颜色值，'black'、'red'、'green'、'white'、'#4271AE' [red, green, blue, alpha]
         * @param {string} lineCap 线端点的样式。butt, round, or square.
         * @param {string} lineJoin 线连接处的样式。bevel, round, or miter.
         * @param {Array.<number>} lineDash 虚线设置。[5,5]
         * @param {number} lineDashOffset 默认值是0。
         * @param {number} miterLimit 默认值10
         * @param {number} width 线宽度
         * @param {string} layerId 图层id
         */
        addMultiPolygon:function(coords, id, fillColor,strokeColor, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, width, layerId) {
            let polygonStyle = new Style({
                stroke:mapInit.generateStroke(strokeColor, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, width),
                fill:mapInit.generateFill(fillColor)
            });
            mapInit.addMultiPolygon(coords, id, polygonStyle, this.getLayerById(layerId));
        },
        /**
         * 添加箭头
         * @param {Array.<Array.<number>>} coordinates 坐标二维数组[[x1,y1],[x2,y2],[x3,y3]]
         * @param {*} id 箭头id
         * 
         * @param {module:ol/color~Color | module:ol/colorlike~ColorLike} color 颜色值，'black'、'red'、'green'、'white'、'#4271AE'
         * @param {string} lineCap 线端点的样式。butt, round, or square.
         * @param {string} lineJoin 线连接处的样式。bevel, round, or miter.
         * @param {Array.<number>} lineDash 虚线设置。[5,5]
         * @param {number} lineDashOffset 默认值是0。
         * @param {number} miterLimit 默认值10
         * @param {number} width 线宽度
         * 
         * @param {string} tailImgUrl 箭头尾的图片
         * @param {string} headImgUrl 箭头头的图片
         * @param {string} layerId 图层id
         */
        addArrow:function(coordinates, id, color, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, width, tailImgUrl, headImgUrl, layerId) {
            let lineStyle = new Style({
                stroke:mapInit.generateStroke(color, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, width)
            });
            mapInit.addArrow(coordinates, id, lineStyle, tailImgUrl||"../../static/assets/images/geolocation_marker.png", headImgUrl||"../../static/assets/images/geolocation_marker_heading.png", this.getLayerById(layerId));
        },
        /**
         * 将地图的中心移动到指定的点
         * @param {number} lon 浮点型的值
         * @param {number} lat 浮点型的值 
         */
        centerAt:function(lon,lat){
            this.$data.map.getView().setCenter([lon,lat]);
        },
        /**
         * 将地图缩放到某一级别
         * 
         * @param {number} level 整数值，取0到19的整数值
         */
        zoomTo:function(level){
            this.$data.map.getView().setZoom(level);
        },
        /**
         * 获取地图当前的矩形范围
         */
        getCurrentExtent:function(){
            return this.$data.map.getView().calculateExtent(this.$data.map.getSize());
        },
        /**
         * 获取地图当前的缩放级别
         */
        getCurrentLevel:function(){
            let z = parseInt(this.$data.map.getView().getZoom());
            return z;
        },
        /**
         * 移除地图上的要素
         * @param {*} id 要素id
         * @param {*} layerId 要素所在的图层ID
         */
        removeFeature:function(id, layerId) {
            let source = this.getLayerById(layerId).getSource();
            let f = source.getFeatureById(id);
            if (f != null) {
                source.removeFeature(f);
            }
        },
        /**
         * 移除所有要素
         * @param {*} layerId 要素所在的图层ID
         */
        removeAllFeature:function(layerId) {
            let source = this.getLayerById(layerId).getSource();
            if (source != null) {
                source.clear();
            }
        },
        // 绘制规划路线
        storkeLine(tracks) {
            
        },
        /**
         * 添加wms图层
         * 
         * @param {String} id 图层id
         * @param {String} url wms图层的地址
         * @param {String} layers wms图层的名称
         * @param {String} styles wms图层的样式，默认为空
         * @param {number} opacity wms图层的透明度，取值0~1,1不透明，0透明
         * @param {boolean} visble  wms是否可见，默认true
         * @param {String} version  wms是版本号
         */
        addWms:function(id,url,layers,styles,opacity,visble,version){
            mapInit.addWms(id,url,layers,styles,opacity,visble,version,this.$data.map)
        },
        // 规划路线
        translateCallback(data,color){

        },
        pageResize(){
            const borwserHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            this.pageHeight = borwserHeight - 64;
            console.log('pageHeight : ' + this.pageHeight)
        },
        resize:function(size)
        {
            this.$data.map.setSize(size);
        }
    },
    created(){

    },
    mounted(){
        this.pageResize();
        window.onresize = () => {
            this.pageResize();
        }
        //初始化地图
        setTimeout(() => {
            this.initMap();
            this.$emit("MapInitComplete",this);

            
        }, 100);
    },
    destroyed(){

    }
}
</script>
<style>
    #map {
        width: 100%;
        height: 800px;
        overflow: hidden;
        margin:0;
        font-family:"微软雅黑";

        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
    }
    .map:-moz-full-screen {
        height: 100%;
    }
    .map:-webkit-full-screen {
        height: 100%;
    }
    .map:-ms-fullscreen {
        height: 100%;
    }
    .map:fullscreen {
        height: 100%;
    }
    .ol-rotate {
        top: 3em;
    }

    .ol-popup {
        position: absolute;
        background-color: white;
        -webkit-filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
        filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
        padding: 15px;
        border-radius: 10px;
        border: 1px solid #cccccc;
        bottom: 12px;
        left: -50px;
        min-width: 280px;
    }
    .ol-popup:after, .ol-popup:before {
        top: 100%;
        border: solid transparent;
        content: " ";
        height: 0;
        width: 0;
        position: absolute;
        pointer-events: none;
    }
    .ol-popup:after {
        border-top-color: white;
        border-width: 10px;
        left: 48px;
        margin-left: -10px;
    }
    .ol-popup:before {
        border-top-color: #cccccc;
        border-width: 11px;
        left: 48px;
        margin-left: -11px;
    }
    .ol-popup-closer {
        text-decoration: none;
        position: absolute;
        top: 2px;
        right: 8px;
    }
    .ol-popup-closer:after {
        content: "✖";
    }
</style>
