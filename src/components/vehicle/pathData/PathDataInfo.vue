<template>
<div class="c-view-dialog" v-cloak>
        <div class="c-scroll-wrap">
            <div class="c-scroll-inner">
              <div class="c-title-fixed">
                  <h3 class="c-title">
                      轨迹数据<i class="el-icon-arrow-right"></i>查看轨迹
                      <el-page-header @back="backClick" class="c-return-btn"></el-page-header>
                  </h3>
              </div>
                <!-- 信息模块 -->
                <div class="c-detail-lable-list clearfix c-detail-box c-wrapper-20 c-padding-20">
                    
                    <p class="c-detail-lable">
                        <span class="name">车牌号：</span>
                        <span class="value">{{data.plateNo}}</span>
                    </p>
                    <p class="c-detail-lable">
                        <span class="name">车辆编号：</span>
                        <span class="value">{{data.vehicleId}}</span>
                    </p>
                    <p class="c-detail-lable">
                        <span class="name">行程开始时间：</span>
                        <span class="value">{{data.startTime}}</span>
                    </p>
                    <p class="c-detail-lable">
                        <span class="name">行程结束时间:</span>
                        <span class="value">{{data.endTime}}</span>
                    </p>
                    <p class="c-detail-lable">
                        <span class="name">行驶里程：</span>
                        <span class="value">{{data.mileage}} km</span>
                    </p>
                    <p class="c-detail-lable">
                        <span class="name">行驶时长：</span>
                        <span class="value">{{data.durationTime}} min</span>
                    </p>
                    <el-button class="c-pos-btn" type="warning" size="small" plain @click="exportTrailDataAlert">导出轨迹</el-button>
                </div>
                <div class="c-detail-box c-wrapper-20 c-padding-20">
                    <div class="c-map-big-wrapper" id='map-container' :class="isScaleMap ? 'c-map-on' : 'c-map-off'">
                        <span class="c-map-scale-btn" :class="isScaleMap ? 'c-map-scale-off' : 'c-map-scale-on'" @click="isScaleMap = !isScaleMap"></span>
                    </div>
                </div>
                <div class="c-wrapper-20 c-detail-box c-padding-20">
                    <el-table
                        ref="pathDataTable" 
                        :data="dataList" 
                        stripe 
                        border
                        v-loading="loading" 
                        highlight-current-row
                        @current-change="showDetail"
                        :row-class-name="rowClassName"
                        max-height="300"
                        :cell-style="{
                            cursor: 'pointer'
                        }">
                        <el-table-column label="序号" type="index"></el-table-column>
                        <el-table-column min-width="25%" label="时间">
                            <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.timestamp, 'yy-mm-dd hh:mm:ss:ms')}}</template>
                        </el-table-column>
                        <el-table-column min-width="20%" label="经度" prop="gnss_LONG"></el-table-column>
                        <el-table-column min-width="20%" label="纬度" prop="gnss_LAT"></el-table-column>
                        <el-table-column min-width="15%" label="速度(km/h)">
                            <template slot-scope="scope">{{scope.row.gnss_SPD}}</template>
                        </el-table-column>
                        <el-table-column min-width="15%" label="航向角" prop="gnss_HEAD"></el-table-column>
                        <el-table-column min-width="10%" label="高程(m)" prop="gnss_HIGHT"></el-table-column>
                    </el-table>
                </div>
            </div>
        </div>
</div>
</template>
<script>
import ConvertCoord from'@/common/utils/coordConvert.js';
import { setTimeout } from 'timers';
import {pathDetailList,exportPathExcel} from '@/api/vehicle';
import { error } from 'util';
export default {
    props: ['data'],
    components: {},
    data() {
        return {
        loading: true,
        isScaleMap: false,
        dataList: [],
        selectItem: 0,
        panel:{
            title:'',
            msg:''
        },
        dialogOption: {
            loading: false,
            show: false,
            data: {}
        },
        markers: {
            markerStart: null,
            markerPolyline: null,
            polylinePath: [],
            markerEnd: null
        },
        removeMarker:null,
        requestDataParams:{
            isBottom:false,
        },
        exportTime:{
            startTime:'',
            endTime:''
        },

        rowHeight: 0,
        currentIndex: -1,
        tableHeight: 0,
        }
    },
    mounted() {
        let _this = this;
        this.init();
        this.initMap();
        //注册键盘事件
        document.onkeydown = function (event) {
            let e = event || window.event || arguments.callee.caller.arguments[0];
            e.preventDefault();
            if (_this.dataList && _this.dataList.length > 0 && e) {
                let _scrollTop = _this.$refs.pathDataTable.bodyWrapper.scrollTop;
                if (e.keyCode == 38) {
                    if(_this.currentIndex > 0) {
                        _this.currentIndex --;
                        _this.$refs.pathDataTable.setCurrentRow(_this.dataList[_this.currentIndex]);
                        if(_this.currentIndex*_this.rowHeight <= _scrollTop) {
                            _this.$refs.pathDataTable.bodyWrapper.scrollTop = _this.currentIndex*_this.rowHeight;
                        }
                    }
                }
                if (e.keyCode == 40) {
                    if(_this.currentIndex <= _this.dataList.length) {
                        _this.currentIndex ++;
                        _this.$refs.pathDataTable.setCurrentRow(_this.dataList[_this.currentIndex]);
                        if(_this.currentIndex*_this.rowHeight >= (_scrollTop + _this.tableHeight)) {
                            _this.$refs.pathDataTable.bodyWrapper.scrollTop = (_this.currentIndex+1)*_this.rowHeight - _this.tableHeight;
                        }
                    }
                }
            }
        }
    },
    methods: {
        initMap(){
        let _scale = new AMap.Scale(),
            _toolbar = new AMap.ToolBar({
                liteStyle: true,
                position: 'LT'
            });
        this.distanceMap = new AMap.Map('map-container', window.defaultMapOption);
        setTimeout(()=>{
            this.distanceMap.setMapStyle(window.defaultMapOption.mapStyle);
        },0);

        this.distanceMap.addControl(_scale);
        this.distanceMap.addControl(_toolbar);
        this.distanceMap.setStatus({keyboardEnable:false});  //不允许键盘操作
      },
      showDetail(row) {
        if(row) {
            this.currentIndex = row.index;
            let _position = ConvertCoord.wgs84togcj02(row.gnss_LONG, row.gnss_LAT);
            this.addRemoveMaker(_position);
        }
      },
      rowClassName({row, rowIndex}) {
          //把每一行的索引放进row
          row.index = rowIndex;
      },
      exportTrailDataAlert() {
        this.exportTrailData();
      },
      exportTrailData() {
        if (this.dataList.length == 0) {
          this.$message({
              type: 'error',
              duration: '1500',
              message: '轨迹数据不存在！',
              showClose: true
          });
          return;
        }
        const datas = [];

        const formDataList = this.dataList;
        for (let i = 0; i < formDataList.length; i++) {
          datas.push({
            lng: formDataList[i].gnss_LONG,
            lat: formDataList[i].gnss_LAT,
            altitude: formDataList[i].gnss_HIGHT,
            speed: formDataList[i].gnss_SPD,
            pathAngle: formDataList[i].gnss_HEAD,
            time: this.$dateUtil.formatTime(formDataList[i].timestamp, 'yy-mm-dd hh:mm:ss:ms'),
            sort: i
          });
        }

        //日期转换
        let  d=new Date(this.data.originStartTime);
        let year=d.getFullYear();
        let month=d.getMonth()+1;
        if (month.toString().length==1){
          month="0"+month.toString();
        }
        let date=d.getDate();
        if (date.toString().length==1){
          date="0"+date.toString();
        }
        let hour=d.getHours();
        let minute=d.getMinutes();
        let second=d.getSeconds();
        this.$confirm('是否导出全部轨迹数据?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            let params = {
              'vehicleId':this.data.vehicleId,
              'plateNo': this.data.plateNo,
              'startTime': this.exportTime.startTime ? this.$dateUtil.dateToMs(this.exportTime.startTime) : '',
              'endTime':this.exportTime.endTime ? this.$dateUtil.dateToMs(this.exportTime.endTime) : ''
            }
            exportPathExcel(params).then(res => {
                this.downloadFile(res);
            });
        })
      },
      downloadFile(res){
          if (res.data) {
              if ('msSaveBlob' in navigator) { // 对IE和Edge的兼容
                  window.navigator.msSaveBlob(res.data, decodeURI(res.headers['content-disposition'].split('filename=')[1]))
              } else {
                  let blob = res.data

                  // console.log('res.data ----------- ' + JSON.stringify(res))

                  let a = document.createElement('a');
                  a.setAttribute('id','exportLog');
                  a.style.display = 'none'
                  let url = window.URL.createObjectURL(blob)

                  let filename = decodeURI(res.headers['content-disposition'].split('filename=')[1])

                  var evt = document.createEvent('HTMLEvents') // 对firefox的兼容
                  evt.initEvent('click', false, false) // 对firefox的兼容
                  a.href = url
                  a.download = filename
                  a.dispatchEvent(evt) // 对firefox的兼容
                  a.click()
                  window.URL.revokeObjectURL(url)
              }
          }
      },
      backClick() {
        this.$emit('PathDataInfoBack')
      },
      init() {
        //清空数组
        this.exportTime.startTime = this.data.originStartTime;
        this.exportTime.endTime = this.data.originEndTime;
        //初始化选择项
        this.selectItem=0;
        pathDetailList({
          'vehicleId': this.data.vehicleId,
          'startTime': this.data.originStartTime,
          'endTime': this.data.originEndTime,
          'epsilon':10,
        }).then(res => {
          if(res.status == '200'){
            if(res.data.length) {
              this.dataList = res.data;
              this.addLine(res.data);
              this.setCurrentRow(this.dataList[0]);
            }
          }
          this.loading = false;
        }).catch(err => {
          this.loading = false;
        });
      },
      addLine(pointList) {
        this.markers.polylinePath = [];
        pointList.forEach(item => {
          let _position = ConvertCoord.wgs84togcj02(item.gnss_LONG, item.gnss_LAT);
          this.markers.polylinePath.push(new AMap.LngLat(_position[0], _position[1]));
        });
        if(!this.markers.markerStart) {
            this.drawStartMarker();
        }else {
            this.markers.markerStart.setPosition = this.markers.polylinePath[0];
        }
        if(!this.markers.markerEnd) {
            this.drawEndMarker();
        }else {
            this.markers.markerEnd.setPosition = this.markers.polylinePath[this.markers.polylinePath.length-1];
        }
        if(!this.markers.markerPolyline) {
            this.drawLine();
        }
      },
      drawStartMarker() {
          this.markers.markerStart = new AMap.Marker({
              position: this.markers.polylinePath[0],
              icon:'static/images/map/start-point.png',
              offset: new AMap.Pixel(-10, -26)
          });
          this.distanceMap.add(this.markers.markerStart);
      },
      drawEndMarker() {
          this.markers.markerEnd = new AMap.Marker({
              position: this.markers.polylinePath[this.markers.polylinePath.length-1],
              icon:'static/images/map/end-point.png',
              offset: new AMap.Pixel(-10, -26)
          });
          this.distanceMap.add(this.markers.markerEnd);
      },
      drawLine() {
          this.markers.markerPolyline = new AMap.Polyline({
              path: this.markers.polylinePath,
              strokeColor: "#03812e",     //绿色
              // strokeColor: "#f59307",  //黄色
              // strokeColor: "red",      //红色
              strokeWeight: 2,
              strokeStyle: "solid",
              lineJoin: 'round',
              lineCap: 'round',
              zIndex: 50
          });
          this.distanceMap.add(this.markers.markerPolyline);
          this.distanceMap.setFitView();
      },
      addRemoveMaker(point){
        if(this.removeMarker) {
          this.removeMarker.setPosition(point);
        }else {
          this.removeMarker = new AMap.Marker({
              position: point,
              icon:'static/images/map/blue-point.png',
              offset: new AMap.Pixel(-11, -11)
          });
          this.distanceMap.add(this.removeMarker);
        }
      },
      setCurrentRow(row) {
        if(this.$refs.pathDataTable.bodyWrapper.children[0].children[1].children.length) {
            this.setScrollTop(row);
        }else {
            setTimeout(() => {
                this.setScrollTop(row);
            }, 1000);
        }
      },
      setScrollTop(row) {
          this.$refs.pathDataTable.setCurrentRow(row);
          this.rowHeight = this.$refs.pathDataTable.bodyWrapper.children[0].children[1].children[0].clientHeight;
          this.tableHeight = parseInt(this.$refs.pathDataTable.bodyHeight['max-height']);
          this.$refs.pathDataTable.bodyWrapper.scrollTop = this.rowHeight*this.currentIndex;
          let _position = ConvertCoord.wgs84togcj02(row.gnss_LONG, row.gnss_LAT);
          this.addRemoveMaker(_position);
      }
    },
    destroyed(){
       document.onkeydown = function (event) {
            if (e.keyCode == 38 || e.keyCode == 40) {
                e.preventDefault();
            }
            
       } 
    }
  }
</script>
