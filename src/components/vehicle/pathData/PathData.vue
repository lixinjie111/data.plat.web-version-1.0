<template>
  <!-- 基本信息 -->
  <div class="yk-container">
    <div v-show="!panel.show">

      <el-form :inline="true" :model="searchKey" ref="searchForm" size='small' class="demo-form-inline">
          <el-form-item label="车辆编号:" prop='vehicleId'>
              <el-input v-model.trim="searchKey.vehicleId"></el-input>
          </el-form-item>
          <el-form-item label="车牌号:">
              <el-input v-model.trim="searchKey.plateNo"></el-input>
          </el-form-item>
          <el-form-item label="创建时间: ">
              <el-date-picker
                  v-model.trim="searchKey.startTime"
                  type="datetime"
                  placeholder="开始时间"
                  :editable="false"
                  :clearable="false"
                  :picker-options="pickerOptionsStart"
                  format='yyyy-MM-dd HH:mm:ss'>
              </el-date-picker>
              -
              <el-date-picker
                  v-model.trim="searchKey.endTime"
                  type="datetime"
                  placeholder="结束时间"
                  :editable="false"
                  :clearable="false"
                  :picker-options="pickerOptionsEnd"
                  format='yyyy-MM-dd HH:mm:ss'>
              </el-date-picker>
          </el-form-item>
          <el-form-item>
              <el-button type="primary" :loading='searchLoading' @click="searchClick('searchKey')">查询</el-button>
              <el-button type="primary" @click="resetClick">重置</el-button>
          </el-form-item>
      </el-form>

      <el-table :data="dataList" v-loading='loading' stripe class='c-mt-10'>
          <el-table-column align="center" min-width="5%" type="index" label="序号" :index='indexMethod'></el-table-column>
          <el-table-column align="center" min-width="16%" prop="routeId" label="行程ID"></el-table-column>
          <el-table-column align="center" min-width="12%" label="行程开始时间">
              <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.startTime)}}</template>
          </el-table-column>
          <el-table-column align="center" min-width="12%" label="行程结束时间">
              <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.endTime)}}</template>
          </el-table-column>
          <el-table-column align="center" min-width="11%" prop="vehicleId" label="车辆编号"></el-table-column>
          <el-table-column align="center" min-width="10%" prop="plateNo" label="车牌号"></el-table-column>
          <el-table-column align="center" min-width="7%" prop="mileage" label="行驶距离(km)"></el-table-column>
          <el-table-column align="center" min-width="9%" prop="durationTime" label="行驶时长(h)"></el-table-column>
          <el-table-column align="center" min-width="9%" label="平均速度(km/h)">
            <template slot-scope="scope">{{scope.row.avgSpeed}}</template>
          </el-table-column>
          <el-table-column align="center" min-width="9%" label="操作">
              <template slot-scope="scope">
                  <el-button size="mini" type="primary" :loading="scope.row.loading" @click="viewTrackData(scope.row)">查看轨迹</el-button>
              </template>
          </el-table-column>
      </el-table>

      <div class="pages">
          <el-pagination
                background
                @current-change="handleCurrentChange" 
                :current-page="paging.index"
                :total="paging.total" 
                @size-change="handleSizeChange"
                :page-sizes="[10,20,50,100,200,500]" 
                :page-size="paging.size"
                layout="total, sizes, prev, pager, next">
            </el-pagination>
      </div>
    </div>

    <!-- <alert-panel ref="refBaseMsgAlert" :title="panel.title" :msg="panel.msg"
                 @AlertEvent="exportPathData"></alert-panel> -->
    <path-data-info ref="refPathDataPanel" v-if="panel.show" :data="panel.data"
                    @PathDataInfoBack="pathDataInfoFn"></path-data-info>
  </div>
</template>
<script>
  import Paging from '@/common/view/Paging.vue'
  import DatePicker from 'vue2-datepicker'
  import AlertPanel from '@/common/view/Alert.vue'
  import TList from '@/common/utils/list.js'
  import PathDataInfo from '@/components/vehicle/pathData/PathDataInfo.vue'

  export default {
    name: 'VideoManage',
    components: {
      Paging, DatePicker, AlertPanel, PathDataInfo
    },
    data() {
      let _this = this;
      return {
        searchLoading:false,
        loading:false,
        dataList: [],
        searchKey: {
          vehicleId: '',
          plateNo: '',
          startTime: '',
          endTime: ''
        },
        selector: {
          isAll: false,
          item: null,     // 选择项
          list: [],   // 选择的列表
        },
        paging: {
          index: 1,
          size: 10,
          total: 0,
        },
        currentPage:1,
        panel: {
          title: '提示',
          type: '',
          msg: '',
          data: this.initPathDataPage(),
          show: false,
        },
        rules:{
            vehicleId:[
                { required: true, message: 'VehicleID不能为空!', trigger: 'blur' },
            ],
            plateNo:[
                { required: true, message: '车牌号不能为空!', trigger: 'blur' },
            ]
        },
        pickerOptionsStart: {
            editable: false,
            clearable: false,
            disabledDate(time) {
                let endTimeTimestamp = new Date(_this.searchKey.endTime).getTime() || new Date().getTime();
                return time.getTime() > endTimeTimestamp || time.getTime() > new Date().getTime();
            }
        },
        pickerOptionsEnd: {
            editable: false,
            clearable: false,
            disabledDate(time) {
                let startTimeTimestamp = new Date(_this.searchKey.startTime).getTime() || new Date().getTime();
                return time.getTime() < new Date(_this.searchKey.startTime).getTime() || time.getTime() > new Date().getTime();
            }
        },
      }
    },
    methods: {
      pathDataInfoFn() {
        this.panel.show = false;
      },
      viewTrackData(item) {
        this.panel.data = item;
        this.panel.show = true;
        setTimeout(() => {
          //初始化table和地图
          this.$refs.refPathDataPanel.init(item);
        }, 100);

      },
      exportPathDataAlert() {
        this.panel.title = '提示';
        this.panel.type = 'exportPathData';
        this.panel.msg = '确定导出所有行程数据 ?';
        this.$refs.refBaseMsgAlert.show();
      },
      exportPathData() {
        if (this.dataList.length == 0) {
          this.$store.dispatch('showPrompt', '请查询需要导出的行程数据！');
          return;
        }
        let tittle = [
          {
            key: "routeId",
            name: "行程ID",
            sort:1
          },
          {
            key: "startTime",
            name: "开始时间",
            sort:2
          },
          {
            key: "endTime",
            name: "结束时间",
            sort:3
          },
          {
            key: "vehicleId",
            name: "车辆ID",
            sort:4
          },
          // {
          //   key: "vin",
          //   name: "车辆VIN",
          //   sort:5
          // },
          {
            key: "plateNo",
            name: "车牌号",
            sort:6
          },
          {
            key: "mileage",
            name: "行驶距离",
            sort:7
          },
          {
            key: "durationTime",
            name: "行驶时长",
            sort:8
          },
          {
            key: "avgSpeed",
            name: "平均速度",
            sort:9
          },
        ];
        const datas=[];

        const formDataList=this.dataList;
        for (let i = 0; i < formDataList.length; i++) {
          datas.push({
            routeId:formDataList[i].routeId,
            startTime:formDataList[i].startTime,
            endTime:formDataList[i].endTime,
            vehicleId:formDataList[i].vehicleId,
            // vin:formDataList[i].vin,
            plateNo:formDataList[i].plateNo,
            mileage:formDataList[i].mileage,
            durationTime:formDataList[i].durationTime,
            avgSpeed:formDataList[i].avgSpeed,
            sort:i
          });
        }

        //设置导出文件名
        let fileName="routeData";
        if(formDataList.length>0){
          fileName=formDataList[0].plateNo;
        }
        let params = {
          fileName: fileName,
          titles: tittle,
          datas: datas
        };

        let url = 'dataPlatApp/common/exportExcel';

        this.$api.download( url, params,
          response => {
            if (response.status >= 200 && response.status < 300) {

              this.$store.dispatch("showPrompt", "下载成功 ！");
            } else {
              this.$store.dispatch("showPrompt", "下载失败 ！");
            }
          }
        );
      },
      initPathDataPage() {
        return {
          routeId: "",
          vehicleId: "",
          vin: '',
          plateNo: '',
          startTime: "",
          endTime: "",
          mileage: '',
          durationTime: '',
          avgSpeed: '',
        };
      },
      init() {
        this.initSearchKey();
        this.initPaging();
        this.initData();
      },
      initSearchKey() {
        // this.searchKey.vin = '';
        this.searchKey.vehicleId = '';
        this.searchKey.plateNo = "";
        this.searchKey.startTime = '';
        this.searchKey.endTime = '';
      },
      initPaging() {
        this.paging.index =1;
        this.paging.size = 10;
        this.paging.total = 0;
      },
      initData() {
        this.loading = true;
        // const vin = this.searchKey.vin ? this.searchKey.vin : '';
        const vehicleId = this.searchKey.vehicleId ? this.searchKey.vehicleId : '';
        const plateNo = this.searchKey.plateNo ? this.searchKey.plateNo : '';
        let startTime = this.searchKey.startTime ? (new Date(this.searchKey.startTime)).getTime() : '';
        let endTime = this.searchKey.endTime ? (new Date(this.searchKey.endTime)).getTime() : '';
        let params = {
          pageSize: this.paging.size,
          pageIndex: this.paging.index-1,
          param: {
            // vin: vin,
            vehicleId: vehicleId,
            plateNo: plateNo,
            startTime: startTime,
            endTime: endTime,
          }
        };
        this.$api.post(
          'dataPlatApp/vehicle/path/list', params,
          response => {
            if (response.status == 200) {
              if(response.data.list && response.data.list.length > 0){
                  //转换开始时间、结束时间、行驶时长
                  let data_convert=response.data.list;
                  for (let i=0;i<data_convert.length;i++){
                    //保存原始时间
                    data_convert[i].originStartTime=data_convert[i].startTime;
                    data_convert[i].originEndTime=data_convert[i].endTime;
                    data_convert[i].originDurationTime=data_convert[i].durationTime;
                    data_convert[i].originMileage=data_convert[i].mileage;
                    data_convert[i].originAvgSpeed=data_convert[i].avgSpeed;

                    if (data_convert[i].startTime !="") {
                      let timestamp1= new Date(data_convert[i].startTime);
                      data_convert[i].startTime=timestamp1.toLocaleDateString().replace(/\//g, "-") + " " + timestamp1.toTimeString().substr(0, 8);
                    }
                    if (data_convert[i].endTime !="") {
                      let timestamp2= new Date(data_convert[i].endTime);
                      data_convert[i].endTime=timestamp2.toLocaleDateString().replace(/\//g, "-") + " " + timestamp2.toTimeString().substr(0, 8);
                    }
                    if (data_convert[i].durationTime !="") {
                      let st_durationTime=(parseFloat(data_convert[i].durationTime)/1000/60).toString();

                      if (st_durationTime.indexOf('.') !=-1){
                        let substring=st_durationTime.substring(0,st_durationTime.indexOf('.'));
                        if (substring=="0"){
                          data_convert[i].durationTime="1";
                        } else{
                          data_convert[i].durationTime=substring;
                        }
                      }else{
                        data_convert[i].durationTime=st_durationTime;
                      }
                    }
                    if (data_convert[i].mileage !="") {
                      let st_mileage=(parseFloat(data_convert[i].mileage)).toString();
                      if (st_mileage.indexOf('.') !=-1){
                        if (st_mileage.charAt(st_mileage.indexOf('.')+1)=='0'){
                          data_convert[i].mileage=st_mileage.substring(0,st_mileage.indexOf('.')+1)+"1";
                        }else{
                          data_convert[i].mileage=st_mileage.substring(0,st_mileage.indexOf('.')+2);
                        }
                      }else{
                        data_convert[i].mileage=st_mileage;
                      }
                    }

                    if (data_convert[i].avgSpeed !="") {
                      let st_avgSpeed=(parseFloat(data_convert[i].avgSpeed)).toString();
                      if (st_avgSpeed.indexOf('.') !=-1){
                        if (st_avgSpeed.charAt(st_avgSpeed.indexOf('.')+1)=='0'){
                          data_convert[i].avgSpeed=st_avgSpeed.substring(0,st_avgSpeed.indexOf('.')+1)+"1";
                        }else{
                          data_convert[i].avgSpeed=st_avgSpeed.substring(0,st_avgSpeed.indexOf('.')+2);
                        }
                      }else{
                        data_convert[i].avgSpeed=st_avgSpeed;
                      }
                    }
                  }
                  this.dataList = data_convert;
                  this.paging.total = response.data.totalCount;
              }
            } else {
              this.$message.error("获取列表失败！");
            }
            this.loading = false;
            this.searchLoading = false;
          },error => {
             this.$message.error("获取列表error！");
             this.loading = false;
             this.searchLoading = false;
          }
        );
      },
      searchClick() {
        this.$refs.searchForm.validate((valid) => {
            if (valid) {
                this.initPaging();
                this.initData();
            } else {
                return false;
            }
        });
      },
      resetClick() {
        this.init();
      },
      pagingFn(value) {
        this.paging.index = value;
        this.paging.total = 0;
        this.initData();
      },
      pagingSizeFn(value) {
        this.paging.size = value;
        this.paging.total = 0;
        this.initData();
      },
      handleSizeChange(value) {//每页显示条数变更
        this.paging.size = value;
        this.initData();
      },
      handleCurrentChange(value) {//页码变更
        this.paging.index = value;
        this.initData();
      },
      indexMethod(index){
          return index + this.paging.size * (this.paging.index-1) + 1;
      }
    },
    mounted() {
      this.init();
    },
  }
</script>
<style scoped>
  .data-time-style {
    display: inline-block;
  }

  .viewTrack:hover {
    cursor: pointer;
    color: red;
  }
  .viewTrack{
    color: #00c1de;
  }
  .yk-form-tip{
    color:#ff0000;
    font-size:16px;
    vertical-align: middle;
    margin-bottom: 0;
  }
</style>
