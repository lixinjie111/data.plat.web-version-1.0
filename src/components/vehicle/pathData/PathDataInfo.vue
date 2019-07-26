<template>
<div class="c-view-dialog" v-cloak>
        <div class="c-scroll-wrap">
            <div class="c-scroll-inner">
                <h3 class="c-title">
                    轨迹数据 > 查看轨迹
                    <el-page-header @back="backClick" class="c-return-btn"></el-page-header>
                </h3>
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
                <div class="c-wrapper-20 c-detail-box c-padding-20">
                    <div class="c-map-big-wrapper">
                      <tusvn-map ref="refMap" targetId="pathDataMap" overlayContainerId="mec4" :isMasker='false'
                              :isCircle='false' @MapInitComplete="mapComplete"></tusvn-map>
                    </div>
                </div>
                <div class="c-wrapper-20 c-detail-box c-padding-20">
                  <!-- <table class="yk-table1">
                    <thead>
                    <tr>
                      <th style='width:5%;'>序号</th>
                      <th style='width:15%;'>时间</th>
                      <th style='width:12%;'>经度</th>
                      <th style='width:12%;'>纬度</th>
                      <th style='width:12%;'>速度(km/h)</th>
                      <th style='width:12%;'>航向角</th>
                      <th>高程(m)</th>
                    </tr>
                    </thead>
                    <tbody class="tbody">
                    <tr class="yk-table-body mouse-cursor" :class="index==selectItem?'table-row-color1':'table-row-color2'"
                        v-for='(item,index) in dataList' :key="index"
                        @click.stop="selectRow(item,index);">
                      <td style='width:5%;'>{{ index+1 }}</td>
                      <td style='width:15.2%;'>{{$dateUtil.formatTime(item.timestamp,'yy-mm-dd hh:mm:ss:ms')}}</td>
                      <td style='width:12%;'>{{item.gnss_LONG}}</td>
                      <td style='width:12.2%;'>{{item.gnss_LAT}}</td>
                      <td style='width:12.2%;'>{{item.gnss_SPD}}</td>
                      <td style='width:12%;'>{{item.gnss_HEAD}}</td>
                      <td>{{item.gnss_HIGHT}}</td>
                    </tr>
                    </tbody>
                  </table> -->

                  <el-table 
                      ref="tableBox"
                      :data="dataList"
                      border
                      min-height="300"
                      max-height="300"
                      highlight-current-row
                      @current-change="currentRow"
                      stripe>
                      <el-table-column label="序号" type="index"></el-table-column>
                      <el-table-column min-width="20%" label="时间">
                          <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.timestamp,'yy-mm-dd hh:mm:ss:ms')}}</template>
                      </el-table-column>
                      <el-table-column min-width="20%" label="经度" prop="gnss_LONG"></el-table-column>
                      <el-table-column min-width="20%" label="纬度" prop="gnss_LAT"></el-table-column>
                      <el-table-column min-width="20%" label="速度(km/h)" prop="gnss_SPD"></el-table-column>
                      <el-table-column min-width="15%" label="航向角" prop="gnss_HEAD"></el-table-column>
                      <el-table-column min-width="15%" label="高程(m)" prop="gnss_HIGHT"></el-table-column>
                  </el-table>
                  <div class="c-mt-20 c-text-center">{{requestDataParams.loadMoreData}}</div>
                </div>

              </div>
        </div>
</div>
</template>
<script>
  import TusvnMap from "@/common/view/TusvnMap/TusvnMap.vue";
  import { setTimeout } from 'timers';
  import {pathDetailList,exportPathExcel} from '@/api/vehicle';
import { error } from 'util';
  export default {
    props: ['data'],
    components: {
      TusvnMap
    },
    data() {
      return {
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
        requestDataParams:{
          requestRowKey:null,
          loadMoreData:"下滑加载更多",
          isBottom:false,
          pageIndex:1,
          pageTotal:0
        },
        exportTime:{
          startTime:'',
          endTime:''
        }
      }
    },
    mounted() {
      let self = this;
      // setTimeout(() => {
      //   this.$refs.refMap.resize([1398, 315]);
      // }, 30);
      // let table = document.getElementsByClassName("tbody")[0];
      let table = this.$refs.tableBox;

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
      this.$refs.tableBox.bodyWrapper.addEventListener('scroll', (res) => {
 
          let height = res.target;
       
          let clientHeight = height.clientHeight;
          let scrollTop = height.scrollTop;
          let scrollHeight = height.scrollHeight;
       
          if(clientHeight + scrollTop + 50 > scrollHeight){
            console.log("-----------");
              if(!this.isBottom) {
                self.addPageData();
              }
          }
       
      },true);
      // table.onscroll=function () {
      //   if (table.scrollTop + table.clientHeight+1 >= table.scrollHeight) {
      //     if (self.requestDataParams.isBottom==false)
      //      self.addPageData();
      //   }
      // }
    },
    methods: {
      mapComplete(){
        this.$refs.refMap.addVectorLayer('PathDataLayer');
        this.$refs.refMap.zoomTo(14);
      },
      addPageData() {
        pathDetailList({
          page: {
              'pageSize': 10,
              'pageIndex': this.requestDataParams.pageIndex
          }, 
          'vehicleId': this.data.vehicleId,
          'startTime': this.data.originStartTime,
          'endTime': this.data.originEndTime,
          'nextStartRow':this.requestDataParams.requestRowKey
        }).then(res => {
          if(res.status == '200'){
            //重新赋值目前查询的总行数
            this.requestDataParams.pageTotal = res.data.totalCount;

            
            // if (res.data.list.length==10){
            //   this.requestDataParams.requestRowKey = res.data.list[res.data.list.length-1].rowkey;
            //   this.requestDataParams.pageIndex+=1;
            // }
            // if (res.data.list.length<10){
            //   this.requestDataParams.isBottom=true;
            //   this.requestDataParams.loadMoreData="所有数据加载完毕！"
            // }

            if (res.data &&res.data.list && res.data.list.length > 0) {
              //循环处理数据
              let data_convert = res.data.list;
              for (let i = 0; i < data_convert.length; i++) {
                if (data_convert[i].gnss_LONG != "") {
                  let st_gnss_LONG = (parseFloat(data_convert[i].gnss_LONG)).toString();
                  if (st_gnss_LONG.indexOf('.') != -1) {
                    data_convert[i].gnss_LONG = st_gnss_LONG.substring(0, st_gnss_LONG.indexOf('.') + 8);
                  } else {
                    data_convert[i].gnss_LONG = st_gnss_LONG;
                  }
                }

                if (data_convert[i].gnss_LAT != "") {
                  let st_gnss_LAT = (parseFloat(data_convert[i].gnss_LAT)).toString();
                  if (st_gnss_LAT.indexOf('.') != -1) {
                    data_convert[i].gnss_LAT = st_gnss_LAT.substring(0, st_gnss_LAT.indexOf('.') + 8);
                  } else {
                    data_convert[i].gnss_LAT = st_gnss_LAT;
                  }
                }

                if (data_convert[i].gnss_HIGHT != "") {
                  let st_gnss_HIGHT = (parseFloat(data_convert[i].gnss_HIGHT)).toString();
                  if (st_gnss_HIGHT.indexOf('.') != -1) {
                    if (st_gnss_HIGHT.charAt(st_gnss_HIGHT.indexOf('.') + 1) == '0') {
                      data_convert[i].gnss_HIGHT = st_gnss_HIGHT.substring(0, st_gnss_HIGHT.indexOf('.') + 1) + "1";
                    } else {
                      data_convert[i].gnss_HIGHT = st_gnss_HIGHT.substring(0, st_gnss_HIGHT.indexOf('.') + 2);
                    }
                  } else {
                    data_convert[i].gnss_HIGHT = st_gnss_HIGHT;
                  }
                }

                if (data_convert[i].gnss_SPD != "") {
                  let st_gnss_SPD = (parseFloat(data_convert[i].gnss_SPD)).toString();
                  if (st_gnss_SPD.indexOf('.') != -1) {
                    if (st_gnss_SPD.charAt(st_gnss_SPD.indexOf('.') + 1) == '0') {
                      data_convert[i].gnss_SPD = st_gnss_SPD.substring(0, st_gnss_SPD.indexOf('.') + 1) + "1";
                    } else {
                      data_convert[i].gnss_SPD = st_gnss_SPD.substring(0, st_gnss_SPD.indexOf('.') + 2);
                    }
                  } else {
                    data_convert[i].gnss_SPD = st_gnss_SPD;
                  }
                }
                if (data_convert[i].gnss_HEAD != "") {
                  let st_gnss_HEAD = (parseFloat(data_convert[i].gnss_HEAD)).toString();
                  if (st_gnss_HEAD.indexOf('.') != -1) {
                    if (st_gnss_HEAD.charAt(st_gnss_HEAD.indexOf('.') + 1) == '0') {
                      data_convert[i].gnss_HEAD = st_gnss_HEAD.substring(0, st_gnss_HEAD.indexOf('.') + 1) + "1";
                    } else {
                      data_convert[i].gnss_HEAD = st_gnss_HEAD.substring(0, st_gnss_HEAD.indexOf('.') + 2);
                    }
                  } else {
                    data_convert[i].gnss_HEAD = st_gnss_HEAD;
                  }
                }
              }
              this.dataList = this.dataList.concat(data_convert);


              if(this.requestDataParams.pageTotal > this.dataList.length) {
                this.requestDataParams.requestRowKey = res.data.list[res.data.list.length-1].rowkey;
                this.requestDataParams.pageIndex+=1;
              }else {
                this.requestDataParams.isBottom=true;
                this.requestDataParams.loadMoreData="所有数据加载完毕！"
              }
            }else {
              this.isBottom = true;
            }
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
        // let params = {
        //   vehicleId:this.data.vehicleId,
        //   plateNo: this.data.plateNo,
        //   startTime: this.$dateUtil.dateToMs(this.data.startTime),
        //   endTime:this.$dateUtil.dateToMs(this.data.endTime)
        // }

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
      init(item) {
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
        this.exportTime.startTime = item.originStartTime;
        this.exportTime.endTime = item.originEndTime;
        //初始化选择项
        this.selectItem=0;

        pathDetailList({
          page: {
              'pageSize': 10,
              'pageIndex': 0
          }, 
          'vehicleId': item.vehicleId,
          'startTime': item.originStartTime,
          'endTime': item.originEndTime,
        }).then(res => {
          if(res.status == '200'){
            this.drawPath(res.data.list);
          }
        })

        //添加分页数据
        this.addPageData();
      },
      drawPath(dataArray) {
        let start_lon = parseFloat(dataArray[0].gnss_LONG);
        let start_lat = parseFloat(dataArray[0].gnss_LAT);
        this.$refs.refMap.centerAt(start_lon, start_lat);
        // this.$refs.refMap.resize([485,315]);

        let lineArray = [];
        for (let i = 0; i < dataArray.length; i++) {
          lineArray.push([parseFloat(dataArray[i].gnss_LONG), parseFloat(dataArray[i].gnss_LAT)]);
        }
        // coordinates, id, color, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, width, layerId
        this.$refs.refMap.addLineString(lineArray, 'pathData_01', '#093bbb', 'round', 'round', [5, 0], 0, 10, 5, "PathDataLayer");
        const end_lon = parseFloat(dataArray[dataArray.length - 1].gnss_LONG);
        const end_lat = parseFloat(dataArray[dataArray.length - 1].gnss_LAT);
        //  添加起点
        this.$refs.refMap.addImg(start_lon, start_lat, "start_01", "PathDataLayer", 'static/images/start.png', [63, 83], 0, null, null, [0, 0], 0.3);
        //  添加终点
        this.$refs.refMap.addImg(end_lon, end_lat, "end_01", "PathDataLayer", 'static/images/end.png', [63, 83], 0, null, null, [0, 0], 0.3);
        //添加选中点
        this.$refs.refMap.addNormalPoint(start_lon, start_lat, 'heighLightPoint_01', "PathDataLayer", 5, "#FF0000", "#FFFF00", 2);
      },
      // currentRow(val) {
      //   console.log("--------------------------------");
      //   console.log(val);
      //   this.selectItem = val;
      //   // this.$refs.tableBox.setCurrentRow(this.dataList[this.selectItem]);
      // },
      selectRow(item, index) {
        let self = this;
        if (index ||index==0) {
          self.selectItem = index;
        }
        let lng = parseFloat(item.gnss_LONG);
        let lat = parseFloat(item.gnss_LAT);
        self.$refs.refMap.addNormalPoint(lng, lat, 'heighLightPoint_01', "PathDataLayer", 5, "#FF0000", "#FFFF00", 2);
      }
    },
  }
</script>
<style scoped>
  .yk-table1 {
    /* table-layout: fixed; */
    word-break: break-all;
    font-size: 14px;
    color: #777C7C;
    border-collapse: collapse;
    border-radius: 5px;
    width: fill-available;
    width: -webkit-fill-available;
    width: -moz-fill-available;
    width: -o-fill-available;
    border: 2px solid #f59307;
    border-radius: 5px;
    position: relative;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    -ms-border-radius: 5px;
    -o-border-radius: 5px;
  }

  .yk-table1:hover {
    border: 2px solid #f59307;
    border-radius: 5px;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    -ms-border-radius: 5px;
    -o-border-radius: 5px;
  }

  .yk-table1 thead, .yk-table1 tr {
    display: table;
    width: 100%;
    table-layout: fixed;
  }

  .yk-table1 thead {
    width: 100%;
  }

  .yk-table1 thead tr {
    background: #F5F8FC;
    height: 40px;
    text-align: left;
  }

  .yk-table1 tbody {
    display: block;
    height: 250px;
    overflow-y: scroll;
    overflow-x: hidden;
  }

  .yk-table1 tbody tr {
    height: 40px;
    border-bottom: 1px solid #E0E6ED;
    text-align: left;
  }

  .yk-table1 th, .yk-table1 td {
    padding-left: 5px;
    padding-right: 5px;
  }

  .table-row-color1 {
    background-color: #f59307;
  }

  .table-row-color2 {
    background-color: white;
  }

  .map-div {
    width: 98%;
    height: 315px;
    border: 2px solid #f59307;
    box-sizing: border-box;
    display: inline-block;
    margin-left:20px;
  }

  .mouse-cursor:hover {
    cursor: pointer;
  }

  .table-div {
    width:98%;
    overflow: hidden;
    height: 300px;
    display: inline-block;
    margin-left:20px;
  }

  .yk-title {
    text-align: left;
    height: 30px;
    line-height: 30px;
    font-size: 16px;
    margin-bottom: 5px;
    font-weight: 500;
  }

  .yk-tab ul {
    height: 36px;
    line-height: 36px;
  }

  .yk-tab ul li {
    list-style: none;
    display: inline-block;
    width: 120px;
    border-right: 1px solid #ccc;
  }

  .yk-tab ul li:last-child {
    border-right: 0px;
  }

  .yk-tab ul li span {
    height: 36px;
    line-height: 36px;
    cursor: pointer;
  }

  .yk-gap20 {
    margin-right: 20px;
    font-size: 14px;
  }

  .yk-gap20 label {
    font-weight: 500;
    width: 120px;
    display: inline-block;
    text-align: right;
  }

  .yk-gap20 span {
    width: 200px;
    display: inline-block;
  }

  .yk-first {
    margin: 10px 0px;
    padding: 20px 10px;
    background: #fff;
    border-top: 3px solid #2DCA93;
    font-size: 14px;
  }

  .yk-first table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    text-align: center;
  }

  .yk-first table th {
    background: #F7F9FA;
  }

  .yk-first table tr, th, td {
    border: 1px solid rgb(225, 231, 231);
    border-spacing: 0px;
  }

  .yk-second {
    margin: 10px 10px;
    background: #fff;
    font-size: 14px;
  }

  .yk-s-block .title {
    font-size: 16px;
    margin: 15px 10px 10px 10px;
  }

  .yk-s-block .body {
    font-size: 14px;
    margin: 0px 10px;
  }

  .yk-c-block .yk-img {
    height: 100px;
    display: inline-block;
    vertical-align: top;
    margin: 10px;
  }

  .yk-c-block .yk-sub-ul {
    display: inline-block;
    vertical-align: top;
    margin-top: 8px;
    margin-right: 10px;
  }

  .yk-c-block .yk-sub-ul li {
    margin: 5px;
  }
</style>
