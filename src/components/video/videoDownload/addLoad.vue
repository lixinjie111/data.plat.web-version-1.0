<template>
    <div class="yk-container">

        <el-page-header @back="backClick" content="新建下载任务" class="c-mt-30"></el-page-header>

        <el-form ref="addForm" :model="formParams" :rules="rules" size="small" label-position="right" label-width="100px" class="c-mt-30" style="width: 360px;">
            <el-form-item label="车牌号: " prop='plateNo'>
                <el-select
                    style="width: 260px;"
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
            <el-form-item label="车辆编号: " prop='vehicleId'>
                <el-select
                    style="width: 260px;"
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
            <el-form-item label="摄像头编号: " prop='camDeviceId'>
                <el-select
                    style="width: 260px;"
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
            <el-form-item label="摄像头朝向: ">
                {{formParams.camDirection}}
            </el-form-item>
            <el-form-item label="开始时间:" prop='startTime'>
                <el-date-picker
                    style="width: 260px;"
                    v-model.trim="formParams.startTime"
                    type="datetime"
                    placeholder="开始时间"
                    :picker-options="startTimeOption">
                </el-date-picker>
            </el-form-item>
            <el-form-item label="结束时间:" prop='endTime'>
                <el-date-picker
                    style="width: 260px;"
                    v-model.trim="formParams.endTime"
                    type="datetime"
                    placeholder="结束时间"
                    :picker-options="endTimeOption">
                </el-date-picker>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitFunc" :loading="loading">确定</el-button>
                <el-button type="primary" @click="backClick">取消</el-button>
            </el-form-item>
        </el-form>
    </div>

</template>
<script>
import DatePicker from 'vue2-datepicker'
import Paging from '@/common/view/Paging.vue'
export default {
    props: ['title','type','data'],
    components: {
        Paging,
        DatePicker
    },
    data(){
        let _this = this;
        return {
            operPlatUrl: window.cfg.operPlatUrl,

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
                    { required: true, message: '开始时间不能为空', trigger: 'change' }
                ],
                endTime:[
                    { required: true, message: '结束时间不能为空', trigger: 'change' }
                ]
            },

            startTimeOption: {
                disabledDate: time => {
                    let endDateVal = _this.formParams.endTime;
                    if (endDateVal) {
                        return time.getTime() > new Date(endDateVal).getTime() || time.getTime() > new Date().getTime();
                    }else {
                        return time.getTime() > new Date().getTime();
                    }
                }
            },
            endTimeOption: {
                disabledDate: time => {
                    let startDateVal = _this.formParams.startTime;
                    if (startDateVal) {
                        return  time.getTime() < new Date(startDateVal).getTime() || time.getTime() > new Date().getTime();
                    }else {
                        return time.getTime() > new Date().getTime();
                    }
                }
            }
            
        }
    },
    methods: {
        searchPlateNo(query) {
            if (query !== '') {
                this.plateNoLoading = true;
                clearTimeout(this.plateNoTimer);
                this.plateNoTimer = setTimeout(() => {
                    let _params = {
                        "page":{
                            "pageIndex": 0,
                            "pageSize": 100000
                        },
                        "plateNo": query,
                        "vehicleId": ''
                    };
                    this.plateNoList = [];
                    this.$api.post(this.operPlatUrl + 'vehicle/query/page',_params,response => {
                        if(response.data.list && response.data.list.length > 0){
                            let _result = response.data.list.map((item, index) => {
                                let _item = {
                                    plateNo: item.plateNo,
                                    vehicleId: item.vehicleId
                                };
                                return _item;
                            });
                            this.plateNoList = _result;
                            // console.log(this.plateNoList);
                        }else {
                            this.$message.error("获取车牌号失败！");
                        }
                        this.plateNoLoading = false;
                    }, error => {
                        this.$message.error("获取车牌号error！");
                        this.plateNoLoading = false;
                    });
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
                    let _params = {
                        "page":{
                            "pageIndex": 0,
                            "pageSize": 100000
                        },
                        "plateNo": '',
                        "vehicleId": query
                    };
                    this.vehicleIdList = [];
                    this.$api.post(this.operPlatUrl + 'vehicle/query/page',_params,response => {
                        if(response.data.list && response.data.list.length > 0){
                            let _result = response.data.list.map((item, index) => {
                                let _item = {
                                    plateNo: item.plateNo,
                                    vehicleId: item.vehicleId
                                };
                                return _item;
                            });
                            this.vehicleIdList = _result;
                        }else {
                            this.$message.error("获取车辆ID 失败！");
                        }
                        this.vehicleIdLoading = false;
                    }, error => {
                        this.$message.error("获取车辆ID error！");
                        this.vehicleIdLoading = false;
                    });
                }, 1000);
            } else {
                this.vehicleIdList = [];
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
            // console.log(item);
            this.formParams.camSerialNum = item.serialNum;
            this.formParams.camDeviceId = item.deviceId;
            this.formParams.camDirection = item.toward;
            this.formParams.protocal = item.protocal;
        },
        getVehicleBindCamInfo(){
            this.camCodeList = [];
            this.$api.post(this.operPlatUrl + 'vehicle/findByDeviceList',{
              "vehicleId":this.formParams.vehicleId
            },response => {
                if(response.data && response.data.length > 0){
                    response.data.forEach((item, index) => {
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
                }else {
                    this.$message.error("获取摄像头列表失败！");
                }
            },error => {
                this.$message.error('获取摄像头列表error！');
            });
        },
        submitFunc() {
            let _formParams = Object.assign(this.formParams, {
                startTime: this.$dateUtil.dateToMs(this.formParams.startTime) || '',
                endTime: this.$dateUtil.dateToMs(this.formParams.endTime) || ''
            });
            this.$refs.addForm.validate((valid) => {
                if (valid) {
                    this.loading = true;
                    this.$api.post('dataPlatApp/cam/historyDownloadTask',_formParams,response => {
                        if(response.data.code == '200'){
                            this.backClick();
                        }else{
                            this.$message.error(response.data.message);
                        }
                        this.loading = false;
                    }, error => {
                        this.loading = false;
                        this.$message.error("新建下载任务error！");
                    });
                } else {
                    return false;
                }
            });
        },
        backClick(){
            this.$router.replace({
                path: '/refresh',
                params: {
                    t: Date.now()
                }
            })
        },
    },
    mounted(){
        
    }
}
</script>
<style scoped>
.yk-b-10{
    margin-bottom: 10px;
}
.yk-b-30{
    margin-bottom: 30px;
}
.yk-t-30{
    margin-top: 30px;
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
    width: 206px;
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
.yk-add-box .yk-block{
    margin-top:10px;
}
</style>

