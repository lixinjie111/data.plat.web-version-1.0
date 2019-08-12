<template>
<el-dialog 
        title="新建任务" 
        :close-on-click-modal='false'
        :visible.sync="visible"
        :before-close="cancleFunc"
        width="30%">
        <el-form ref="dialogForm" :model="formParams" :rules="rules" size="small" label-position="right" label-width="120px">
            <el-form-item label="行政区域">
                <el-select
                    v-model.trim="provinceSelected"
                    value-key="code"
                    placeholder="请选择省"
                    @change="findMunicipal">
                    <el-option
                        v-for="item in provinceData"
                        :key="item.code"
                        :label="item.label"
                        :value="item">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="市辖区">
                <el-select
                    v-model.trim="municiSelected"
                    value-key="code"
                    placeholder="请选择市"
                    @change='findArea'>
                    <el-option
                        v-for="item in municipalData"
                        :key="item.code"
                        :label="item.label"
                        :value="item">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="区">
                <el-select
                    v-model.trim="areaSelected"
                    value-key="code"
                    placeholder="请选择区"
                    @change='changeRoad'>
                    <el-option
                        v-for="item in areaList"
                        :key="item.code"
                        :label="item.label"
                        :value="item">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="道路名称">
                <el-select
                    v-model.trim="roadSelected"
                    value-key="code"
                    placeholder="请选择路"
                    @change='getRoadPoint'>
                    <el-option
                        v-for="item in roadList"
                        :key="item.code"
                        :label="item.label"
                        :value="item">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="摄像头编号">
                <el-select
                    v-model.trim="camSelected"
                    value-key="serialNum"
                    placeholder="请选择摄像头编号"
                    @change='getRoadPoint'>
                    <el-option
                        v-for="item in roadCamList"
                        value-key="serialNum"
                        :key="item.serialNum"
                        :label="item.serialNum"
                        :value="item">
                    </el-option>
                </el-select>
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
            <el-button type="warning" size="small" plain @click="cancleFunc">取消</el-button>
        </div>
</el-dialog>
</template>

<script>
import {queryProvinceCityTree,queryCountyRoadTree,queryRoadCamList,roadDownloadTask} from '@/api/roadSide';
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
            visible:true,
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
            roadCamList:[],
            roadList:[],
            provinceData:[],//省市
            municipalData:[],//辖区
            areaList:[],
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
            this.municiSelected = this.municipalData[0];
            this.areaSelected = this.areaList[0];
        },
        queryRoadRegionTree(){
            queryProvinceCityTree({
                'type':'N'
                }).then( res => {
                if(res.status == '200'){
                    this.initDataList = res.data;
                    let len = this.initDataList.length;
                    this.provinceData = res.data;
                }
            })
        },
        findMunicipal(item){
            this.municiSelected = '';
            this.areaSelected = '';
            this.roadSelected = '';
            this.roadSelected = '';
            this.camSelected = '';
            this.municipalData = item.children;
        },
        findArea(item){//遍历区数据
            queryCountyRoadTree({
                'cityCode':item.code,
                'type':'N'
            }).then(res => {
                if(res.status == '200') {
                    this.areaList = res.data;
                }
            })
            let len = this.initDataList.length;
            let areaCode = this.municiSelected.code;
            this.areaList = item.children;
        },
        changeRoad(item){
            this.roadList = item.children;
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
            let roadName = this.roadSelected.label;
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
                    this.$emit('backDownPage','add');
                }
            })
        },
    	cancleFunc() {
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