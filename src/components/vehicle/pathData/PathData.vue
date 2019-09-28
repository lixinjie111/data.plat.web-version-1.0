<template>
  <!-- 基本信息 -->
  <div class="c-wrapper-20" v-cloak>
      <div v-if="!panel.show">
          <el-form :inline="true" :model="searchKey" ref="searchForm" size='small'>
              <el-form-item label="车辆编号" prop='vehicleId'>
                  <el-select
                    v-model.trim="searchKey.vehicleId"
                    clearable
                    filterable
                    remote
                    reserve-keyword
                    placeholder="请输入关键词"
                    :remote-method="rsVehicleRemoteMethod"
                    @clear="$searchFilter.clearFunc(rsVehicleOption)"
                    @focus="$searchFilter.remoteMethodClick(rsVehicleOption, searchKey, 'vehicleId', searchUrl)"
                    @blur="$searchFilter.remoteMethodBlur(searchKey, 'vehicleId')"
                    :loading="rsVehicleOption.loading">
                    <el-option
                        v-for="item in rsVehicleOption.filterOption"
                        :key="item"
                        :label="item"
                        :value="item">
                    </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="车牌号" prop='plateNo'>
                  <el-select
                    v-model.trim="searchKey.plateNo"
                    clearable
                    filterable
                    remote
                    reserve-keyword
                    placeholder="请输入关键词"
                    :remote-method="rsPlateNoRemoteMethod"
                    @clear="$searchFilter.clearFunc(rsPlateNoOption)"
                    @focus="$searchFilter.remoteMethodClick(rsPlateNoOption, searchKey, 'plateNo', searchUrl)"
                    @blur="$searchFilter.remoteMethodBlur(searchKey, 'plateNo')"
                    :loading="rsPlateNoOption.loading">
                    <el-option
                        v-for="item in rsPlateNoOption.filterOption"
                        :key="item"
                        :label="item"
                        :value="item">
                    </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="创建时间" prop='time'>
                  <el-date-picker
                      v-model.trim="searchKey.time"
                      type="datetimerange"
                      :picker-options="timeOption"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期">
                  </el-date-picker>
              </el-form-item>
              <el-form-item>
                  <el-button type="warning" icon="el-icon-search" :loading='searchLoading' @click="searchClick">查询</el-button>
                  <el-button type="warning" plain icon="el-icon-setting" @click="resetClick">重置</el-button>
              </el-form-item>
          </el-form>

          <el-table 
              :data="dataList" 
              v-loading='loading'
              stripe
              border
              class="c-mb-70"
              max-height="724">
              <el-table-column min-width="5%" type="index" label="序号" :index='indexMethod'></el-table-column>
              <el-table-column min-width="16%" prop="routeId" label="行程编号"></el-table-column>
              <el-table-column min-width="14%" label="行程开始时间">
                  <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.startTime)}}</template>
              </el-table-column>
              <el-table-column min-width="14%" label="行程结束时间">
                  <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.endTime)}}</template>
              </el-table-column>
              <el-table-column min-width="9%" prop="vehicleId" label="车辆编号"></el-table-column>
              <el-table-column min-width="8%" prop="plateNo" label="车牌号"></el-table-column>
              <el-table-column min-width="9%" prop="mileage" label="行驶距离(km)"></el-table-column>
              <el-table-column min-width="11%" prop="durationTime" label="行驶时长(min)"></el-table-column>
              <el-table-column min-width="9%" label="平均速度(km/h)">
                <template slot-scope="scope">{{scope.row.avgSpeed}}</template>
              </el-table-column>
              <el-table-column min-width="5%" label="操作">
                  <template slot-scope="scope">
                    <el-button size="small" icon="el-icon-view" circle type="warning" plain :loading="scope.row.viewLoading" @click="viewTrackData(scope.row)"></el-button>
                  </template>
              </el-table-column>
          </el-table>
          <div class="c-page clearfix">
              <el-pagination
                  background
                  @current-change="changePageCurrent" 
                  :current-page="pageOption.page" 
                  :total="pageOption.total"
                  @size-change="changePageSize"
                  :page-sizes="[10,20,50,100,200]" 
                  :page-size="pageOption.size"
                  layout="total, sizes, prev, pager, next">
              </el-pagination>
          </div>
      </div>
      
      <path-data-info ref="refPathDataPanel" v-if="panel.show" :data="panel.data"
                    @PathDataInfoBack="pathDataInfoFn"></path-data-info>
  </div>
</template>
<script>
  import {queryPathList,exportExcel} from '@/api/vehicle';
  import {requestqueryVehicleList} from '@/api/search';
  import PathDataInfo from '@/components/vehicle/pathData/PathDataInfo.vue'

  export default {
    name: 'VideoManage',
    components: {
      PathDataInfo
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
          startTime:'',
          endTime:'',
          time:[]
        },
        historySearchKey: {},
        selector: {
          isAll: false,
          item: null,     // 选择项
          list: [],   // 选择的列表
        },
        pageOption: {
            size: 10,
            total: 0,
            page: 1     //从1开始
        },
        rsVehicleOption: {
            loading: false,
            timer: null,
            filterOption: [],
            defaultOption: [],
            defaultFlag: false
        },
        rsPlateNoOption: {
            loading: false,
            timer: null,
            filterOption: [],
            defaultOption: [],
            defaultFlag: false
        },
        panel: {
          title: '提示',
          type: '',
          msg: '',
          data: this.initPathDataPage(),
          show: false,
        },
        timeOption: {
            disabledDate: time => {
                let _time = time.getTime(),
                    _newTime = new Date().getTime();
                return _time > _newTime;
            }
        },  
        searchUrl: requestqueryVehicleList 
      }
    },
    methods: {
      initPageOption() {
          this.dataList = [];
          this.pageOption.total = 0;
          this.pageOption.page = 1;
      },
      pathDataInfoFn() {
        this.panel.show = false;
      },
      viewTrackData(item) {
        this.panel.data = item;
        this.panel.show = true;
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
            name: "行程编号",
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
            name: "车辆编号",
            sort:4
          },
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
        exportExcel({
          'fileName': fileName,
          'titles': tittle,
          'datas': datas
        }).then(res => {
            if(res.status == '200'){
              this.$message({
                  type: 'success',
                  duration: '1500',
                  message: res.message,
                  showClose: true
              });
            }
        })
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
        this.historySearchKey.startTime = this.searchKey.time ? this.$dateUtil.dateToMs(this.searchKey.time[0]) : '';
        this.historySearchKey.endTime = this.searchKey.time ? this.$dateUtil.dateToMs(this.searchKey.time[1]) : '';
        this.initPaging();
        this.queryPathList();
      },
      initPaging() {
        this.pageOption.page = 1;
        this.pageOption.size = 10;
        this.pageOption.total = 0;
      },
      queryPathList() {
        this.loading = true;
        let _params = Object.assign({},this.historySearchKey,{
            page: {
                "pageSize": this.pageOption.size,
                "pageIndex": this.pageOption.page-1
            }
        })
        queryPathList(_params).then(res => {
          if(res.status == '200'){
              //转换开始时间、结束时间、行驶时长
              let data_convert=res.data.list;
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
              this.pageOption.total = res.data.totalCount;
          }
          this.loading = false;
          this.searchLoading = false;
        })
      },
      searchClick() {
        this.$refs.searchForm.validate((valid) => {
            if (valid) {
                this.searchLoading = true;
                this.historySearchKey = this.searchKey;
                this.historySearchKey.startTime = this.searchKey.time ? this.$dateUtil.dateToMs(this.searchKey.time[0]) : '';
                this.historySearchKey.endTime = this.searchKey.time ? this.$dateUtil.dateToMs(this.searchKey.time[1]) : '';
                this.initPaging();
                this.queryPathList();
            } else {
                return false;
            }
        });
      },
      resetClick() {
        this.$refs.searchForm.resetFields();
        this.rsVehicleOption.filterOption = this.rsVehicleOption.defaultOption;
        this.rsPlateNoOption.filterOption = this.rsPlateNoOption.defaultOption;
      },
      rsVehicleRemoteMethod(query) {
          this.$searchFilter.publicRemoteMethod({
              query: query,
              searchOption: this.rsVehicleOption,
              searchObj: this.searchKey,
              key: 'vehicleId',
              request: this.searchUrl
          });
      },
      rsPlateNoRemoteMethod(query) {
          this.$searchFilter.publicRemoteMethod({
              query: query,
              searchOption: this.rsPlateNoOption,
              searchObj: this.searchKey,
              key: 'plateNo',
              request: this.searchUrl
          });
      },
      changePageSize(value) {//每页显示条数变更
          this.initPageOption();
          this.pageOption.size = value;
          this.queryPathList();
      },
      changePageCurrent(value) {//页码变更
          this.pageOption.page = value;
          this.queryPathList();
      },
      indexMethod(index){
          return index + this.pageOption.size * (this.pageOption.page-1) + 1;
      }
    },
    mounted() {
      this.searchKey.time = [this.$dateUtil.GetDateStr(7), this.$dateUtil.getNowFormatDate()];
      this.init();
    },
  }
</script>
