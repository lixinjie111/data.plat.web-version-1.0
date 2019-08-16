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
                <div class="c-wrapper-20 c-padding-20 c-detail-box">
                  <table class="path-table">
                    <thead>
                    <tr>
                      <th style='width:5%;'>序号</th>
                      <th style='width:20%;'>时间</th>
                      <th style='width:20%;'>经度</th>
                      <th style='width:20%;'>纬度</th>
                      <th style='width:15%;'>速度(km/h)</th>
                      <th style='width:10%;'>航向角</th>
                      <th style='width:10%;'>高程(m)</th>
                    </tr>
                    </thead>
                    <tbody class="tbody">
                    <tr class="mouse-cursor" :class="index==selectItem?'table-row-color1':''"
                        v-for='(item,index) in dataList' :key="index"
                        @click.stop="selectRow(item,index);">
                      <td style='width:5%;'>{{ index+1 }}</td>
                      <td style='width:20%;'>{{$dateUtil.formatTime(item.timestamp,'yy-mm-dd hh:mm:ss:ms')}}</td>
                      <td style='width:20%;'>{{item.gnss_LONG}}</td>
                      <td style='width:20%;'>{{item.gnss_LAT}}</td>
                      <td style='width:15%;'>{{item.gnss_SPD}}</td>
                      <td style='width:10%;'>{{item.gnss_HEAD}}</td>
                      <td style='width:10%;'>{{item.gnss_HIGHT}}</td>
                    </tr>
                    </tbody>
                  </table>
                </div>
                <!-- <div class="remaining-pages">{{requestDataParams.loadMoreData}}</div> -->

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
          requestRowKey:null,
          loadMoreData:"下滑加载更多",
          isBottom:false,
          pageIndex:1
        },
        exportTime:{
          startTime:'',
          endTime:''
        }
      }
    },
    mounted() {
      let self = this;
      this.initMap();
      let table = document.getElementsByClassName("tbody")[0];

      //注册键盘事件
      document.onkeydown = function () {
        let e = event || window.event || arguments.callee.caller.arguments[0];
        if (self.dataList && self.dataList.length > 0 && e) {
          if (e.keyCode == 38) {
            if (self.selectItem > 0) {
              self.selectItem -= 1;
              //设置滚动条高度
              if (self.selectItem==0){
                table.scrollTop=0;
              } else{
                table.scrollTop=41.33*(self.selectItem);
              }
              //画点
              self.selectRow(self.dataList[self.selectItem]);
            }
          }
          if (e.keyCode == 40) {
            if (self.selectItem < self.dataList.length - 1) {
              self.selectItem += 1;
              //设置滚动条高度
              if (self.selectItem==0){
                table.scrollTop=0;
              } else{
                table.scrollTop=41.33*(self.selectItem-1);
              }
              //画点
              self.selectRow(self.dataList[self.selectItem]);
            }
            if (self.selectItem+1==self.dataList.length  && self.requestDataParams.isBottom==false) {
              self.addPageData();
            }
          }
        }
      }

      table.onscroll=function () {
        if (table.scrollTop + table.clientHeight+1 >= table.scrollHeight) {
          if (self.requestDataParams.isBottom==false)
            self.addPageData();
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
        this.distanceMap = new AMap.Map('map-container', this.$parent.$parent.$parent.$parent.defaultMapOption);

        this.distanceMap.addControl(_scale);
        this.distanceMap.addControl(_toolbar);

        this.init();
      },
      addPageData() {
        pathDetailList({
          'vehicleId': this.data.vehicleId,
          'startTime': this.data.originStartTime,
          'endTime': this.data.originEndTime,
          'epsilon':10
        }).then(res => {
          if(res.status == '200'){
            this.dataList = res.data;
          }
        }).catch(err => {

        })
      },
      exportTrailDataAlert() {
        this.exportTrailData();
      },
      exportTrailData() {
        if (this.dataList.length == 0) {
          this.$message.error('轨迹数据不存在！');
          return;
        }
        let tittle = [
          {
            key: "lng",
            name: "经度",
            sort: 1
          },
          {
            key: "lat",
            name: "纬度",
            sort: 2
          },
          {
            key: "altitude",
            name: "高程",
            sort: 3
          },
          {
            key: "speed",
            name: "速度",
            sort: 4
          },
          {
            key: "pathAngle",
            name: "航向角",
            sort: 5
          },
          {
            key: "time",
            name: "时间",
            sort: 6
          },
        ];
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

                  // let a = document.getElementById('exportLog')
                  let url = window.URL.createObjectURL(blob)

                  let filename = decodeURI(res.headers['content-disposition'].split('filename=')[1])
                  // let filename = 'car_' + (new Date()).getTime() + '.txt';
                  // let filename = 'filename.txt';

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
        // this.$refs.refMap.resize([485, 315]);
        //清空图层
        // this.$refs.refMap.removeAllFeature("PathDataLayer");
        //清空数组
        this.dataList = [];

        //初始化分页加载数据参数
        this.requestDataParams.isBottom=false;
        this.requestDataParams.requestRowKey=null;
        this.requestDataParams.loadMoreData="下滑加载更多";
        this.requestDataParams.pageIndex=1;
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
              this.addLine(res.data);
              let _position = ConvertCoord.wgs84togcj02(res.data[0].gnss_LONG, res.data[1].gnss_LAT);
              this.addRemoveMaker(_position);
            }
          }
        })
        //添加分页数据
        this.addPageData();
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
      selectRow(item, index) {
        let self = this;
        if (index ||index==0) {
          self.selectItem = index;
        }
        let _position = ConvertCoord.wgs84togcj02(item.gnss_LONG, item.gnss_LAT);
        this.addRemoveMaker(_position);
      }
    },
  }
</script>
<style scoped>
  .remaining-pages{
    text-align:center;
    font-size: 15px;
    color: #D0D0D0;
  }
  .path-table {
    position: relative;
    word-break: break-all;
    font-size: 14px;
    color: #777C7C;
    border-collapse: collapse;
    border-radius: 5px;    
    border: 1px solid #ebeef5;
    border-top: none;
  }

  .path-table thead, .path-table tr {
    text-align: center;
    display: table;
    width: 100%;
    table-layout: fixed;
  }

  .path-table thead {
    width: 100%;
  }

  .path-table thead tr {
    background: #e6e6e6;
    height: 48px;
    color: #000;
    font-weight: 400;
  }

  .path-table tbody {
    display: block;
    height: 246px;
    overflow-y: scroll;
    overflow-x: hidden;
  }

  .path-table tbody tr {
    height: 40px;
    border: none;
  }

  .path-table th, .path-table td {
    padding: 0 5px;
  }
  .path-table td {
    border-top: 1px solid #ebeef5;
    border-right: 1px solid #ebeef5;
  }

  .table-row-color1 {
    background-color: #fff0db;
  }

  .mouse-cursor:hover {
    cursor: pointer;
  }
</style>
