<template>
<el-dialog 
        title="新建任务" 
        :visible.sync="visible"
        :before-close="cancleFunc"
        width="30%">
        <el-form ref="dialogForm" :model="formParams" :rules="rules" size="small" label-position="right" label-width="120px">
            <el-form-item label="车牌号: " prop='plateNo'>
                <el-select
                    v-model="formParams.plateNo"
                    filterable
                    remote
                    value-key="plateNo"
                    placeholder="请输入关键词"
                    :remote-method="remoteMethod1"
                    @focus="getPlateNoList"
                    @change="plateNoSelect"
                    :loading="fuzzySearchOption1.loading">
                    <el-option
                        v-for="item in fuzzySearchOption1.filterOption"
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
                    value-key="vehicleId"
                    placeholder="请输入关键词"
                    :remote-method="searchVehicleId"
                    @change="vehicleIdSelect"
                    :loading="fuzzySearchOption2.loading">
                    <el-option
                        v-for="item in fuzzySearchOption2.filterOption"
                        :key="item.vehicleId"
                        :label="item.vehicleId"
                        :value="item">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="摄像头编号" prop='camDeviceId'>
                <el-select
                    v-model="formParams.camSerialNum"
                    value-key="camSerialNum"
                    @change="handleSelectCamCode">
                    <el-option
                        v-for="(item,index) in camCodeList"
                        :key="index"
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
            <el-button type="warning" size="small" plain @click="cancleFunc">取消</el-button>
        </div>
</el-dialog>
</template>

<script>
import {queryPage,findByDeviceList,historyDownloadTask} from '@/api/video';
import {requestqueryVehicleList} from '@/api/search'; 
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
            visible: true,
            loading: false,
            allList:[],
            typeList:[
                {name:'车牌号',val:'0'},
                {name:'车辆编号',val:'1'},
            ],
            formParams: {
                plateNo: '',
                vehicleId: '',
                camSerialNum:'',//摄像头序列号
                camDeviceId:'',//摄像头编号
                camDirection: '--',
                startTime: '',
                endTime: '',
                protocal: ''
            },

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
                    { required: true, message: '车辆编号不能为空', trigger: 'change' }
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
            fuzzySearchOption1: {
                loading: false,
                timer: null,
                filterOption: [],
                defaultOption:[]
            },
            fuzzySearchOption2: {
                loading: false,
                timer: null,
                filterOption: []
            },
        }
    },
    methods: {
        remoteMethod1(query) {
            if (query !== '') {
                clearTimeout(this.fuzzySearchOption1.timer);
                this.fuzzySearchOption1.timer = setTimeout(() => {
                    requestqueryVehicleList({
                        "plateNo": query,
                        "vehicleId": ''
                    }).then(res => {
                        if(res.status == '200'){
                            //接口请求后执行的操作 
                            this.fuzzySearchOption1.loading = false;
                            this.fuzzySearchOption1.filterOption = res.data.filter(item => {
                            return item.plateNo.toLowerCase()
                                .indexOf(query.toLowerCase()) > -1;
                            });
                        }
                    }).catch(err => {
                        this.fuzzySearchOption1.loading = false;
                    });
                }, 500);
            } else {
                this.fuzzySearchOption1.filterOption = [];
            }
        },
        remoteMethod2(query) {
            if (query !== '') {
                this.fuzzySearchOption2.loading = true;
                clearTimeout(this.fuzzySearchOption2.timer);
                this.fuzzySearchOption2.timer = setTimeout(() => {
                    requestqueryVehicleList({
                        "plateNo": '',
                        "vehicleId": query
                    }).then(res => {
                        if(res.status == '200'){
                            //接口请求后执行的操作 
                            this.fuzzySearchOption2.loading = false;
                            this.fuzzySearchOption2.filterOption = res.data.filter(item => {
                                return item.vehicleId.toLowerCase()
                                .indexOf(query.toLowerCase()) > -1;
                            });
                        }
                    }).catch(err => {
                        this.fuzzySearchOption2.loading = false;
                    });
                }, 500);
            } else {
                this.fuzzySearchOption2.filterOption = [];
            }
        },
        plateNoSelect(val) {
            this.fuzzySearchOption2.filterOption = [];
            this.fuzzySearchOption2.filterOption.push(val);
            this.formParams.plateNo = val;
            this.getVehicleBindCamInfo();
        },
        //@change="deviceIdSelect"
        vehicleIdSelect(val) {
            this.fuzzySearchOption1.filterOption = [];
            this.fuzzySearchOption1.filterOption.push(val);
            this.formParams.vehicleId = val;
        },
        getPlateNoList(){
            this.fuzzySearchOption1.loading = true;
            requestqueryVehicleList({
                "plateNo": '',
                "vehicleId": ''
            }).then(res => {
                if(res.status == '200'){
                    this.fuzzySearchOption1.filterOption = res.data;
                }
                this.fuzzySearchOption1.loading = false;
            }).catch(err => {
                this.fuzzySearchOption1.loading = false;
            });
        },
        searchPlateNo(query) {
            if (query !== '') {
                    this.plateNoList = this.allList.filter(item => {
                        return item.plateNo.toLowerCase()
                        .indexOf(query.toLowerCase()) > -1;
                    });
            } else {
                this.plateNoList = this.allList;
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
                    requestqueryVehicleList({
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
                    }).catch(err => {
                        this.vehicleIdLoading = false;
                    });
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
            this.formParams.camSerialNum = item.deviceId;
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
                        console.log(item);
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
                                value: item.deviceId,
                                label: item.deviceId,
                                serialNum: item.serialNum,
                                deviceId: item.deviceId,
                                toward: _towards,
                                protocal:item.protocol
                            }
                            console.log(_item);
                            this.camCodeList.push(_item);
                        }
                    });
                }
            })
        },
        submitFunc() {
            this.$refs.dialogForm.validate((valid) => {
                if (valid) {
                    this.submitloading = true;
                    let formParamsInfo = Object.assign(this.formParams,{
                        'plateNo':this.formParams.plateNo.plateNo,
                        'vehicleId':this.formParams.vehicleId.vehicleId,
                        'protocal':this.formParams.protocal,
                        'startTime': this.formParams.startTime ? this.$dateUtil.dateToMs(this.formParams.startTime) : '',
                        'endTime': this.formParams.endTime ? this.$dateUtil.dateToMs(this.formParams.endTime) : ''
                    });
                    historyDownloadTask(formParamsInfo).then(res => {
                        if(res.status == '200'){
                            this.cancleFunc('add');
                        }
                        this.submitloading = false;
                    }).catch(err => {
                        this.submitloading = false;
                    })
                } else {
                    return false;
                }
            });
        },
        cancleFunc(type) {
            this.$emit('backDownPage',type);
        }
    }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/theme.scss';
</style>