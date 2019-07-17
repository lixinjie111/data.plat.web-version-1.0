<template>
  <div class="yk-left">
    <el-page-header @back="backClick" class="c-mt-30"></el-page-header>
    <div class="yk-first">
      <div class="yk-title" style="display: inline-block;">
        轨迹详情
      </div>
      <div class="c-button-wrapper c-text-right">
          <el-button size="mini" plain icon="el-icon-top-right" @click="exportTrailDataAlert">导出轨迹数据</el-button>
      </div>
      <div>
        <div class="yk-block yk-gap20">
          <label>车牌号:</label>
          <span>{{data.plateNo}}</span>
        </div>
        <div class="yk-block yk-gap20">
          <label>车牌编号:</label>
          <span>{{data.vehicleId}}</span>
        </div>
      </div>
      <div class="yk-second">
        <div class="yk-block yk-gap20">
          <label>行程开始时间:</label>
          <span>{{data.startTime}}</span>
        </div>
        <div class="yk-block yk-gap20">
          <label>行程结束时间:</label>
          <span>{{data.endTime}}</span>
        </div>
        <div class="yk-block yk-gap20">
          <label>行驶里程:</label>
          <span>{{data.mileage}} km</span>
        </div>
        <div class="yk-block yk-gap20">
          <label>行驶时长:</label>
          <span>{{data.durationTime}} min</span>
        </div>
      </div>
      <div class="map-div">
          <tusvn-map ref="refMap" targetId="pathDataMap" overlayContainerId="mec4" :isMasker='false'
                    :isCircle='false' @MapInitComplete="mapComplete"></tusvn-map>
      </div>
      <div>
        <div class="table-div">
          <table class="yk-table1">
            <thead>
            <tr>
              <th style='width:5%;'>序号</th>
              <th style='width:15%;'>时间</th>
              <th style='width:12%;'>经度</th>
              <th style='width:12%;'>纬度</th>
              <th style='width:12%;'>速度</th>
              <th style='width:12%;'>航向角</th>
              <th>高程</th>
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
          </table>
        </div>
        <div class="remaining-pages">{{requestDataParams.loadMoreData}}</div>
      </div>

    </div>
    <!-- <alert-panel ref="refBaseMsgAlert" :title="panel.title" :msg="panel.msg"
                 @AlertEvent="exportTrailData"></alert-panel> -->
  </div>
</template>
<script>
  import TusvnMap from "@/common/view/TusvnMap/TusvnMap.vue";
  // import AlertPanel from '@/common/view/Alert.vue'
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
          pageIndex:1
        },
      }
    },
    mounted() {
      let self = this;
      // setTimeout(() => {
      //   this.$refs.refMap.resize([1398, 315]);
      // }, 30);
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
      mapComplete(){
        this.$refs.refMap.addVectorLayer('PathDataLayer');
        this.$refs.refMap.zoomTo(14);
      },
      addPageData() {
        pathDetailList({
          page: {
              'pageSize': 100,
              'pageIndex': this.requestDataParams.pageIndex
          }, 
          'vehicleId': this.data.vehicleId,
          'startTime': this.data.originStartTime,
          'endTime': this.data.originEndTime,
          'nextStartRow':this.requestDataParams.requestRowKey
        }).then(res => {
          if(res.status == '200'){
            //重新赋值目前查询的总行数
            if (res.data.list.length==100){
              this.requestDataParams.requestRowKey = res.data.list[res.data.list.length-1].rowkey;
              this.requestDataParams.pageIndex+=1;
            }
            if (res.data.list.length<100){
              this.requestDataParams.isBottom=true;
              this.requestDataParams.loadMoreData="所有数据加载完毕！"
            }

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
            }
          }else{
            this.$message.error(res.message);
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
            exportPathExcel({
              'vehicleId':this.data.vehicleId,
              'plateNo': this.data.plateNo,
              'startTime': this.data.startTime ? this.$dateUtil.dateToMs(this.data.startTime) : '',
              'endTime':this.data.endTime ? this.$dateUtil.dateToMs(this.data.endTime) : ''
            }).then(res => {
              console.log(res);
                this.$message.success(res.message);
            });
        })
        // let url = 'vehicle/path/detail/export';

        // this.$api.download(url, params,
        //   response => {
        //     if (response.status >= 200 && response.status < 300) {

        //       this.$message.error("下载成功 ！");
        //     } else {
        //       this.$message.error("下载失败 ！");
        //     }
        //   }
        // );
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

        //初始化选择项
        this.selectItem=0;

        pathDetailList({
          page: {
              'pageSize': 100,
              'pageIndex': 0
          }, 
          'vehicleId': item.vehicleId,
          'startTime': item.originStartTime,
          'endTime': item.originEndTime,
        }).then(res => {
          if(res.status == '200'){
            this.drawPath(res.data.list);
          }else{
            this.$message.error(res.message);
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
  .remaining-pages{
    text-align:center;
    font-size: 15px;
    color: #D0D0D0;
  }
  .yk-table1 {
    table-layout: fixed;
    word-break: break-all;
    font-size: 14px;
    color: #777C7C;
    border-collapse: collapse;
    border-radius: 5px;
    width: fill-available;
    width: -webkit-fill-available;
    width: -moz-fill-available;
    width: -o-fill-available;
    border: 2px solid #00c1de;
    border-radius: 5px;
    position: relative;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    -ms-border-radius: 5px;
    -o-border-radius: 5px;
  }

  .yk-table1:hover {
    border: 2px solid #00c1de;
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
    background-color: #2DCA93;
  }

  .table-row-color2 {
    background-color: white;
  }

  .map-div {
    width: 100%;
    height: 315px;
    border: 2px solid #00c1de;
    box-sizing: border-box;
    display: inline-block;
    /* position: absolute; */
  }

  .mouse-cursor:hover {
    cursor: pointer;
  }

  .table-div {
    overflow: hidden;
    height: 300px;
    display: inline-block;
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
