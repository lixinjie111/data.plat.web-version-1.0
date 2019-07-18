<template>
    <div class="wrapper" v-cloak> 
        <div class="c-detail-box">
            <p class="c-title c-border-bottom">新建任务<el-page-header @back="backClick" class="c-return-btn"></el-page-header></p>
            <div class="c-add-box">
                <el-form ref="addForm" :inline="true" :model="formParams" :rules="rules" size="small" label-position="right" label-width="120px">
                    <el-form-item label="车牌号: " prop='plateNo'>
                        <el-select
                            v-model="formParams.plateNo"
                            filterable
                            remote
                            placeholder="请输入关键词"
                            :remote-method="searchPlateNo"
                            @change="handleSelectPlateNo"
                            :loading="plateNoLoading">
                            <el-option
                                v-for="item in plateNoList"
                                :key="item.plateNo"
                                :label="item.plateNo"
                                :value="item">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="车辆编号" prop='vehicleId'>
                        <el-select
                            v-model="formParams.vehicleId"
                            filterable
                            remote
                            placeholder="请输入关键词"
                            :remote-method="searchVehicleId"
                            @change="handleSelectVehicleId"
                            :loading="vehicleIdLoading">
                            <el-option
                                v-for="item in vehicleIdList"
                                :key="item.vehicleId"
                                :label="item.vehicleId"
                                :value="item">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="摄像头编号" prop='camDeviceId'>
                        <el-select
                            v-model="formParams.camSerialNum"
                            @change="handleSelectCamCode">
                            <el-option
                                v-for="item in camCodeList"
                                :key="item.value"
                                :label="item.label"
                                :value="item">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="摄像头朝向" prop='camDirection'>
                        <p class="c-width-200">{{formParams.camDirection}}</p>
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
import {queryPage,findByDeviceList} from '@/api/video';
export default {
    name: 'AddLoad',
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
            operPlatUrl: window.config.operPlatUrl,

            loading: false,

            typeList:[
                {name:'车牌号',val:'0'},
                {name:'车辆编号',val:'1'},
            ],

            formParams: {
                plateNo: '',
                vehicleId: '',
                camSerialNum:'',//摄像头序列号
                camDeviceId:'',//摄像头编号
                // camId: '',      //摄像头序列号
                // camCode: '',    //摄像头编号
                camDirection: '--',
                startTime: '',
                endTime: '',
                protocal: ''
            },

            plateNoTimer: null,
            vehicleIdTimer: null,
            plateNoLoading: false,
            vehicleIdLoading: false,
            submitloading:false,
            plateNoList: [],
            vehicleIdList: [],
            camCodeList: [],

            rules: {
                plateNo:[
                    { required: true, message: '车牌号不能为空', trigger: 'change' }
                ],
                vehicleId:[
                    { required: true, message: '车辆ID不能为空', trigger: 'change' }
                ],
                camDeviceId:[
                    { required: true, message: '摄像头编号不能为空', trigger: 'change' }
                ],
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
    methods: {
        searchPlateNo(query) {
            if (query !== '') {
                this.plateNoLoading = true;
                clearTimeout(this.plateNoTimer);
                this.plateNoTimer = setTimeout(() => {
                    this.plateNoList = [];
                    queryPage({
                        "page":{
                            "pageIndex": 0,
                            "pageSize": 500
                        },
                        "plateNo": query,
                        "vehicleId": ''
                    }).then(res => {
                        if(res.status == '200'){
                            let _result = res.data.list.map((item, index) => {
                                let _item = {
                                    plateNo: item.plateNo,
                                    vehicleId: item.vehicleId
                                };
                                return _item;
                            });
                            this.plateNoList.push(_result);
                        }
                    })
                }, 1000);
            } else {
                this.plateNoList = [];
            }
        },
        handleSelectPlateNo(item) {
            this.vehicleIdList = [{
                plateNo: item.plateNo,
                vehicleId: item.vehicleId
            }];
            this.formParams.plateNo = item.plateNo;
            this.formParams.vehicleId = item.vehicleId;
            this.formParams.camSerialNum = '';
            this.formParams.camDeviceId = '';
            this.formParams.camDirection = '';
            this.getVehicleBindCamInfo();
        },
        searchVehicleId(query) {
            if (query !== '') {
                this.vehicleIdLoading = true;
                clearTimeout(this.vehicleIdTimer);
                this.vehicleIdTimer = setTimeout(() => {
                    this.vehicleIdList = [];
                    queryPage({
                        "page":{
                            "pageIndex": 0,
                            "pageSize": 500
                        },
                        "plateNo": '',
                        "vehicleId": query
                    }).then(res => {
                        if(res.status == '200'){
                            let _result = res.data.list.map((item, index) => {
                                let _item = {
                                    plateNo: item.plateNo,
                                    vehicleId: item.vehicleId
                                };
                                return _item;
                            });
                            this.vehicleIdList = _result;
                        }
                        this.vehicleIdLoading = false;
                    })
                },1000);
            }
        },
        handleSelectVehicleId(item) {
            this.plateNoList = [{
                plateNo: item.plateNo,
                vehicleId: item.vehicleId
            }];
            this.formParams.plateNo = item.plateNo;
            this.formParams.vehicleId = item.vehicleId;
            this.formParams.camSerialNum = '';
            this.formParams.camDeviceId = '';
            this.formParams.camDirection = '';
            this.getVehicleBindCamInfo();
        },
        handleSelectCamCode(item) {
            this.formParams.camSerialNum = item.serialNum;
            this.formParams.camDeviceId = item.deviceId;
            this.formParams.camDirection = item.toward;
            this.formParams.protocal = item.protocal;
        },
        getVehicleBindCamInfo(){
            this.camCodeList = [];
            findByDeviceList({
                'vehicleId':this.formParams.vehicleId
            }).then(res => {
                if(res.status == '200'){
                    res.data.forEach((item, index) => {
                        if(item.type == "M"){
                            let _towards = "";
                            switch (item.toward){
                                case "0":{
                                    _towards = "前向";
                                    break;
                                }
                                case "1":{
                                    _towards = "后向";
                                    break;
                                }
                                case "2":{
                                    _towards = "侧向";
                                    break;
                                }
                                case "3":{
                                    _towards = "环视";
                                    break;
                                }
                                case "4":{
                                    _towards = "车内";
                                    break;
                                }
                            }
                            let _item = {
                                value: item.serialNum,
                                label: item.serialNum,
                                serialNum: item.serialNum,
                                deviceId: item.deviceId,
                                toward: _towards,
                                protocal:item.protocol
                            }
                            this.camCodeList.push(_item);
                        }
                    });
                }
            })
        },
        submitFunc() {
            this.$refs.addForm.validate((valid) => {
                if (valid) {
                    this.loading = true;
                    historyDownloadTask({
                        'plateNo':this.formParams.plateNo,
                        'vehicleId':this.formParams.vehicleId,
                        'camSerialNum':this.formParams.camSerialNum,
                        'camDeviceId':this.formParams.camDeviceId,
                        'camDirection':this.formParams.camDirection,
                        'startTime': this.formParams.startTime ? this.$dateUtil.dateToMs(this.formParams.startTime) : '',
                        'endTime': this.formParams.endTime ? this.$dateUtil.dateToMs(this.formParams.endTime) : ''
                    }).then(res => {
                        if(res.status == '200'){
                            this.backClick();
                        }
                        this.loading = false;
                    })
                } else {
                    return false;
                }
            });
        },
        backClick() {
            this.$emit('backDownPage');
        }
    }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/theme.scss';
</style>