<template>
    <div class="wrapper" v-cloak>
        <div class="c-wrapper-20 c-detail-box">
            <p class="c-title c-border-bottom">新建任务<el-page-header @back="backClick" class="c-return-btn"></el-page-header></p>
            <div class="c-add-box">
                <el-form ref="addForm" :inline="true" :model="formParams" :rules="rules" size="small" label-position="right" label-width="120px">
                    <el-form-item label="行政区域">
                        <el-select
                            v-model.trim="provinceSelected"
                            @change="findMunicipal">
                            <el-option
                                v-for="item in provinceData"
                                :key="item.name"
                                :label="item.name"
                                :value="item.name">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="市辖区">
                        <el-select
                            v-model.trim="municiSelected"
                            @change='findArea'>
                            <el-option
                                v-for="item in municipalData"
                                :key="item.name"
                                :label="item.name"
                                :value="item.name">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="区">
                        <el-select
                            v-model.trim="areaSelected"
                            @change='changeRoad'>
                            <el-option
                                v-for="item in areaList"
                                :key="item.name"
                                :label="item.name"
                                :value="item.name">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="道路名称">
                        <select class="yk-select" v-model="roadSelected" @change="getRoadPoint">
                            <option v-for="(item,index) in roadList" :key="index" :value="item">{{item.name}}</option>
                        </select>
                    </el-form-item>
                    <el-form-item label="摄像头编号">
                        <select class="yk-select" v-model="camSelected" @change="getRoadPoint">
                            <option v-for="(item,index) in roadCamList" :key="index" :value="item">{{item.serialNum}}</option>
                        </select>
                    </el-form-item>
                    <el-form-item label="开始时间" prop='startTime'>
                        <el-date-picker
                            v-model.trim="formParams.startTime"
                            type="datetime"
                            placeholder="开始时间"
                            :picker-options="startTimeOption">
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item label="结束时间" prop='endTime'>
                        <el-date-picker
                            v-model.trim="formParams.endTime"
                            type="datetime"
                            placeholder="结束时间"
                            :picker-options="endTimeOption">
                        </el-date-picker>
                    </el-form-item>
                </el-form>
                <div class="c-text-center">
                    <el-button type="warning" size="small" @click="submitFunc" :loading="submitloading">确定</el-button>
                    <el-button type="warning" size="small" plain @click="backClick">取消</el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {queryRoadRegionTree,queryRoadCamList,roadDownloadTask} from '@/api/roadSide';
export default {
    name: 'MenuOneAdd',
    data () {
        let _this = this,
            _checkStartTime = (rule, value ,callback) => {
                let _startTime = value ? this.$dateUtil.dateToMs(this.$dateUtil.formatTime(value)) : null,//标准时间转为时间戳
                    _endTime = this.formParams.endTime ? this.$dateUtil.dateToMs(this.$dateUtil.formatTime(this.formParams.endTime)) : null;//标准时间转为时间戳
                if(_startTime){
                    if(_endTime) {
                        if(_startTime > _endTime){
                            callback(new Error('开始时间必须小于结束时间'));
                        }else {
                            callback();
                        }
                    }else {
                        callback();
                    }
                }else {
                    callback();
                }
            },
            _checkEndTime = (rule, value ,callback) => {
                let _startTime = this.formParams.startTime ? this.$dateUtil.dateToMs(this.$dateUtil.formatTime(this.formParams.startTime)) : null,//标准时间转为时间戳
                    _endTime = value ? this.$dateUtil.dateToMs(this.$dateUtil.formatTime(value)) : null;//标准时间转为时间戳
                if(_endTime){
                    if(_startTime) {
                        if(_startTime > _endTime){
                            callback(new Error('开始时间必须小于结束时间'));
                        }else {
                            callback();
                        }
                    }else {
                        callback();
                    }
                }else {
                    callback();
                }
            };
        return {
            camId:'',
            provinceSelected:'',
            municiSelected:'',
            areaSelected:'',
            roadSelected:'',
            camSelected:'',
            vehicleSearch:'',
            codeSearchVal:'',
            isPlateSearch:false,
            isPlate:true,
            isSearchVehicle:false,
            isSearchCode:false,
            isStartTipsShow:false,
            isEndTipsShow:false,
            plateNum:'',
            vehicleList:[],
            plateNoList:[],
            roadCamList:[{name:'请选择',code:'0'}],
            roadList:[{name:'请选择',code:'0'}],
            provinceData:[{name:'请选择',code:'0'}],//省市
            municipalData:[{name:'请选择',code:'0'}],//辖区
            areaList:[{name:'请选择',code:'0'}],
            submitloading: false,
            formParams: {
                vehicleId:'',
                factoryName:'',
                model:'',
                plateNo:'',
                serialNum:'',
                startTime: '',
                endTime: ''
            },
            rules:{
                startTime:[
                    { validator: _checkStartTime, trigger: 'blur' }
                ],
                endTime:[
                    { validator: _checkEndTime, trigger: 'blur' }
                ]
            },
            startTimeOption: {
                disabledDate: time => {
                    let _time = time.getTime(),
                        _newTime = new Date().getTime(), 
                        _endDateVal = _this.formParams.endTime ? _this.$dateUtil.dateToMs(_this.$dateUtil.formatTime(_this.formParams.endTime, "yy-mm-dd")+' 00:00:00') : null;
                    if (_endDateVal) {
                        return _time > _endDateVal || _time > _newTime;
                    }else {
                        return _time > _newTime;
                    }
                }
            },
            endTimeOption: {
                disabledDate: time => {
                    let _time = time.getTime(),
                        _newTime = new Date().getTime(), 
                        _startDateVal = _this.formParams.startTime ? _this.$dateUtil.dateToMs(_this.$dateUtil.formatTime(_this.formParams.startTime, "yy-mm-dd")+' 00:00:00') : null;
                    if (_startDateVal) {
                        return  _time < _startDateVal || _time > _newTime;
                    }else {
                        return _time > _newTime;
                    }
                }
            }, 
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
            this.queryRoadRegionTree();
            this.isStartTipsShow = false;
            this.isEndTipsShow = false;
            this.provinceSelected = this.provinceData[0];
            this.municiSelected = this.municipalData[0];
            this.areaSelected = this.areaList[0];
        },
        queryRoadRegionTree(){
            queryRoadRegionTree().then( res => {
                if(res.status == '200'){
                    this.initDataList = res.data;
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
            })
        },
        findMunicipal(item){
            let len = this.initDataList.length;
            this.data = [];//切换下拉选择时,区路数据初始化
            this.municipalData = [];
            for(let j=0;j<len;j++){//查找辖区数据
                if(item == this.initDataList[j].name){
                    let municipalObj = {};
                    municipalObj.name = this.initDataList[j].dataList[0].name;
                    municipalObj.code = this.initDataList[j].dataList[0].code;
                    this.municipalData.push(municipalObj);

                    this.municipalData.unshift({name:'请选择',code:'0'})
                    this.municiSelected = this.municipalData[0];
                }
            }
        },
        findArea(item){//遍历区数据
            let len = this.initDataList.length;
            let areaCode = this.municiSelected.code;
            for(let i=0;i<len;i++){
                if(item == this.initDataList[i].dataList[0].name){
                    this.areaList = this.initDataList[i].dataList[0].dataList;
                }
            }
        },
        changeRoad(item){
            let len = this.initDataList.length;
            let roadCode = this.areaSelected.code;
            for(let i=0;i<len;i++){
                if(item == this.initDataList[i].dataList[0].dataList[0].name){
                    this.roadList = this.initDataList[i].dataList[0].dataList[0].dataList;
                }
            }
        },
        getRoadPoint(){
            queryRoadCamList({
                "roadCode":this.roadSelected.code
            }).then( res => {
                if(res.status == '200'){
                    this.roadCamList = res.data;
                }
            })
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
        submitFunc() {
            let roadName = this.roadSelected.name;
            let protocal = this.camSelected.protocol;
            let pointName = this.camSelected.rsPtName;
            let camCode = this.camSelected.deviceId;
            let camId = this.camSelected.serialNum;
            let startTime = this.formParams.startTime ? this.$dateUtil.dateToMs(this.formParams.startTime) : '';
            let endTime = this.formParams.endTime ? this.$dateUtil.dateToMs(this.formParams.endTime) : '';
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
            roadDownloadTask({
                'protocal':protocal,
                'camId':camId,
                'camCode':camCode,
                'roadName':roadName,
                'roadPointName':pointName,
                'startTime':startTime,
                'endTime':endTime
            }).then(res => {
                if(res.status == '200'){
                    this.$emit('backDownPage');
                }
            })
        },
    	backClick() {
    		this.$emit('backDownPage');
    	}
    },
    mounted(){
        this.init();
    }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/theme.scss';
</style>