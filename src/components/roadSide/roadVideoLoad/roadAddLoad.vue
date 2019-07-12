<template>
    <div>
        <div class="yk-btn-box yk-right yk-b-10">
            <span class="yk-btn-back" @click="backClick();">返回</span>
        </div>
        <div class="yk-btn-box yk-left" style="border-bottom:1px dashed #d5e1e2;">
            <span class="title">新建下载任务</span>
        </div>
        <div class="yk-panel-box">
            <div class="yk-crud-box">
                <div class="yk-form-block yk-center">
                    <div class="yk-add-box">
                        <div class="yk-block yk-270">
                            <div class='yk-label-100' style="margin-left:-16px;">
                                <label class="yk-w-100">行政区域:</label>
                            </div>
                            <div class="yk-input-300">
                                <select class="yk-select" v-model="provinceSelected" @change="findMunicipal">
                                    <option v-for='(item,index) in provinceData' :key='index' :value='item'>{{item.name}}</option>
                                </select>
                                <select class="yk-select mt10" v-model='municiSelected' @change='findArea'>
                                    <option v-for='(item,index) in municipalData' :key='index' :value="item">{{item.name}}</option>
                                </select>
                                <select class="yk-select mt10" v-model="areaSelected" @change='changeRoad'>
                                    <option v-for="(item,index) in areaList" :key="index" :value="item">{{item.name}}</option>
                                </select>
                            </div>
                        </div>
                        <div class="yk-block yk-270" v-show='isPlate' style="width: 304px;line-height:26px;">
                            <div class='yk-label-100'>
                                <label class="yk-w-100">道路名称:</label>
                            </div>
                            <div class="yk-input-300">
                                <select class="yk-select" v-model="roadSelected" @change="getRoadPoint">
                                    <option v-for="(item,index) in roadList" :key="index" :value="item">{{item.name}}</option>
                                </select>
                            </div>
                        </div>
                        <div class="yk-block yk-270" style="width: 304px;line-height:26px;">
                            <div class=' yk-label-100'>
                                <label class="yk-w-100">摄像头编号:</label>
                            </div>
                            <div class="yk-input-300">
                              <select class="yk-select" v-model="camSelected">
                                <option v-for="(item,index) in roadCamList" :key="index" :value="item">{{item.deviceId}}</option>
                              </select>
                            </div>
                        </div>
                        <div class="yk-block yk-270" style="width: 310px;">
                            <label class="yk-w-100 timeBox">开始时间:</label>
                            <date-picker class=" data-control-css yk-input" lang="zh" type="datetime" format="YYYY-MM-DD HH:mm:ss"
                         placeholder="选择开始时间" :editable="false" :not-after="endTime"
                         v-model="startTime" style="width:165px;"></date-picker>
                            <label title="开始时间不能为空" class="yk-form-tip">*</label>
                            <span class="yk-tip" id="startTimeTip" v-show='isStartTipsShow'>开始时间不能为空 ！</span>
                         <div style="height:10px;"></div>
                         <label class="yk-w-100 timeBox">结束时间:</label>
                            <date-picker class="data-control-css yk-input" lang="zh" type="datetime" format="YYYY-MM-DD HH:mm:ss"
                         placeholder="选择结束时间" :editable="false" :not-before="startTime"
                         v-model="endTime" style="width:165px;"></date-picker>
                            <label title="结束时间不能为空" class="yk-form-tip">*</label>
                            <span class="yk-tip" id="endTimeTip" v-show='isEndTipsShow'>结束时间不能为空 ！</span>
                        </div>

                    </div>
                </div>
                <div class="yk-btn-box yk-center yk-t-30">
                    <span class="yk-btn" style="margin-right:10px;" @click='ok'>确定</span>
                    <span class="yk-btn" @click="backClick();">取消</span>
                </div>
            </div>

        </div>

    </div>

</template>
<script>
import DatePicker from 'vue2-datepicker'
import Paging from '@/common/view/Paging.vue'
import { debug } from 'util';
export default {
    // props: ['title','type','data'],
    components: {
        Paging,
        DatePicker
    },
    data(){
        return {
            camId:'',
            startTime:'',
            endTime:'',
            provinceSelected:'',
            municiSelected:'',
            areaSelected:'',
            roadSelected:'',
            camSelected:'',
            searchPlateNo:'',
            vehicleSearch:'',
            codeSearchVal:'',
            isPlateSearch:false,
            isPlateNo:false,
            isPlate:true,
            isVehicle:false,
            isSearchVehicle:false,
            isSearchCode:false,
            isStartTipsShow:false,
            isEndTipsShow:false,
            plateNum:'',
            vehicleList:[],
            plateNoList:[],
            roadCamList:[{name:'请选择',code:'0'}],
            roadList:[{name:'请选择',code:'0'}],
            searchKey:{
                vehicleId:'',
                factoryName:'',
                model:'',
                plateNo:'',
                serialNum:''
            },
            typeList:[
                {name:'车牌号',val:'0'},
                {name:'VehicleID',val:'1'},
            ],
            provinceData:[{name:'请选择',code:'0'}],//省市
            municipalData:[{name:'请选择',code:'0'}],//辖区
            areaList:[{name:'请选择',code:'0'}]
        }
    },
    computed: {
        NewPlateNoList() {
            var _this = this;
            var NewItems = [];
            if (_this.plateNum == '') {
                return ;
            }
            _this.plateNoList.forEach(function(item) {
                if(item.indexOf(_this.plateNum) != -1){
                    NewItems.push(item);
                    _this.isPlateSearch = true;
                }
            });
            return NewItems;
        },
        NewVehicleIdList() {
            var _this = this;
            var NewItems = [];
            if (_this.vehicleSearch == '') {
                return ;
            }
            _this.vehicleList.forEach(function(item) {
                if (item.indexOf(_this.vehicleSearch) != -1) {
                    NewItems.push(item);
                    _this.isSearchVehicle = true;
                }
            });
            return NewItems;
        }
    },
    methods: {
        init(){
            this.roadRegion();
            this.isStartTipsShow = false;
            this.isEndTipsShow = false;
            this.provinceSelected = this.provinceData[0];
            this.municiSelected = this.municipalData[0];
            this.areaSelected = this.areaList[0];
        },
        roadRegion(){
            this.$api.post('dataPlatApp/road/queryRoadRegionTree',{
            },response => {
                if(response.status >= 200 && response.status < 300){
                    if(response.data.code == 200){
                        this.initDataList = response.data.data;
                        let len = this.initDataList.length;
                        this.provinceData = [];
                        for(let i=0;i<len;i++){//遍历省市数据
                            let provinceObj = {};
                            provinceObj.name = this.initDataList[i].name;
                            provinceObj.code = this.initDataList[i].code;
                            this.provinceData.push(provinceObj);
                        }
                        this.provinceData.unshift({name:'请选择',code:'0'})
                    }
                }
            });
        },
        findMunicipal(item){
            let len = this.initDataList.length;
            let provinceCode = this.provinceSelected.code;
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
        findArea(){//遍历区数据
            let len = this.initDataList.length;
            let areaCode = this.municiSelected.code;
            for(let i=0;i<len;i++){
                if(areaCode == this.initDataList[i].dataList[0].code){
                    this.areaList = this.initDataList[i].dataList[0].dataList;
                }
            }
        },
        changeRoad(){
            let len = this.initDataList.length;
            let roadCode = this.areaSelected.code;
            for(let i=0;i<len;i++){
                if(roadCode == this.initDataList[i].dataList[0].dataList[0].code){
                    this.roadList = this.initDataList[i].dataList[0].dataList[0].dataList;
                }
            }
        },
        getRoadPoint(){
            this.$api.post('dataPlatApp/road/queryRoadCamList',{
                "roadCode":this.roadSelected.code
            },response => {
                if(response.status >= 200 && response.status < 300){
                    if(response.data.code == 200){
                        if(response.data.data != [] || response.data.data != null){
                          this.roadCamList = response.data.data;
                        }
                    }
                }
            });
        },
        backClick(){
            this.codeSearchVal = '';
            this.$emit('addTask');
        },
        searchPlateShow(){
            this.isPlateSearch = true;
        },
        searchVehclieShow(){
            this.isSearchVehicle = true;
        },
        searchCodeShow(){
            this.isSearchCode = true;
        },
        searchListHide(){
            setTimeout(() => {
                this.isPlateSearch = false;
                this.isSearchVehicle = false;
                this.isSearchCode = false;
            },1000)
        },
        selPlateItem(val){
            this.plateNum = val;
            setTimeout(() => {
                this.isPlateSearch = false;
            },1000)
        },
        selVehicleItem(val){
            this.vehicleSearch = val;
            setTimeout(() => {
                this.isSearchVehicle = false;
            },1000)
        },
        selCodeItem(val){
            this.codeSearchVal = val;
            setTimeout(() => {
                this.isSearchCode = false;
            },1000)
        },
        ok(){
            let roadName = this.roadSelected.name;
            let protocal = this.camSelected.protocol;
            let pointName = this.camSelected.rsPtName;
            let camCode = this.camSelected.deviceId;
            let camId = this.camSelected.serialNum;
            let startTime = this.$dateUtil.dateToMs(this.startTime);
            let endTime = this.$dateUtil.dateToMs(this.endTime);
            if(this.startTime == ''){
                this.isStartTipsShow = true;
                return;
            }else{
                this.isStartTipsShow = false;
            }
            if(this.endTime == ''){
                this.isEndTipsShow = true;
                return;
            }else{
                this.isEndTipsShow = false;
            }
            this.$api.post('dataPlatApp/road/roadDownloadTask',{
              'protocal':protocal,
              'camId':camId,
              'camCode':camCode,
              'roadName':roadName,
              'roadPointName':pointName,
              'startTime':startTime,
              'endTime':endTime
            },response => {
               if(response.data.code == '200'){
                 var fileId = response.data.data;
                 this.$message({
                    message: '添加成功',
                    type: 'sucess'
                  });
                 this.$emit('addTask');
               }
               else if(response.data.code == '510'){
                 this.$message({
                    message: response.data.message,
                    type: 'error'
                  });
                  return;
               }
            });
        }
    },
    mounted(){
        this.init();
        this.isSearch = false;
    }
}
</script>
<style scoped>
.yk-b-10{
    margin-bottom: 10px;
}
.yk-t-30{
    margin-top:30px;
}
.yk-b-30{
    margin-bottom: 30px;
}
.yk-r-30{
    margin-right: 30px;
}
.yk-20{
    height: 20px;
}
.yk-24{
    height: 24px;
    width: 171px;
}
.yk-list{
    margin-top:5px;
    padding: 5px 10px;
    height: 120px;
    overflow-y: auto;
}
.yk-270{
    width: 320px;
    float: left;
}
.yk-input-300{
    width: 200px;
    display: inline-block;
    vertical-align: top;
    text-align: left;
    position: relative;
}
.yk-input-300 ul{
    width:194px;
    background:#a9daff;
    position:absolute;
    top:26px;
    left:-1px;
    z-index:1000;
    padding:5px 4px 2px;
    box-sizing: border-box;
    border:1px solid #d3dce6;
    box-shadow: 2px 2px 4px rgba(109, 221, 255, 0.479);
}
.yk-input-300 ul li{
    cursor: pointer;
    font-size:12px;
    line-height: 24px;
    border-bottom: 1px solid #fff;
}
.yk-input-300 ul li:last-child{
    border-bottom: none;
}
.yk-label-100{
    display: inline-block;
    width: 100px;
    text-align: right;

}
.yk-gap{
    margin: 10px 0px 10px 0px;
    background: #ccd;
}

.yk-panel-box{
    position: relative;
    overflow-y: auto;
}
.yk-add-box{
    width:304px;
}
.yk-add-box label.yk-w-40{
    width:60px;
    text-align: right;
    line-height:27px;
}
.yk-add-box select,.yk-add-box input{
    border:1px solid #d3dce6;
    width:192px !important;
    height:22px;
    line-height: 22px;
}
.yk-add-box select{
    height:26px;
    line-height: 26px;
}
.yk-add-box .yk-block,.mt10{
    margin-top:10px;
}
.el-date-picker__time-header .el-date-picker__editor-wrap input.el-input__inner{
    width:142px !important;
}
.timeBox{
    display:inline-block;
    float:left;
    text-align:right;
}
</style>

