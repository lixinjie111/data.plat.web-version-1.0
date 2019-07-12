<template>
    <div>
        <el-page-header @back="backClick" class="c-mt-30"></el-page-header>
        <!-- <div class="yk-btn-box yk-right yk-b-10">
            <span class="yk-btn-back" @click="backClick();">返回</span>
        </div> -->
        <div class="yk-cfg-box yk-scroll-y" id="idPanelBox" :style="'height:' + current.height + 'px'">
            <div class="yk-panel-box yk-gap10">
                <div class="yk-btn-box yk-left yk-b-border">
                        <span class="title">数据查看</span>
                </div>
                <div>
                <el-form :inline="true" :model="searchKey" size='small' class="demo-form-inline">
                    <el-form-item label="数据ID:" prop='dataId'>
                        <el-input v-model.trim="searchKey.dataId"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" :loading='loading' @click="searchClick('searchKey')">查询</el-button>
                        <el-button type="primary" @click="resetClick()">重置</el-button>
                    </el-form-item>
                </el-form>
                <!-- 
                   <div class="yk-search-box">                
                        <div class="yk-search-block">
                            <label class="yk-w-68">数据ID: </label>
                            <input class="yk-input" v-model.trim="searchKey.dataId">
                        </div>                
                    
                        <div class="yk-search-block">
                            <span class="yk-btn yk-btn-gap" @click="searchClick();">查询</span>
                            <span class="yk-btn" @click="resetClick();">重置</span>
                        </div>   
                        <div>-->
                    <el-table :data="dataList" class='c-mt-10' stripe>
                        <el-table-column align="center" prop="timestamp" label="时间戳"></el-table-column>
                        <el-table-column align="center" prop="dataId" label="数据ID"></el-table-column>
                        <el-table-column align="center" prop="enName" label="英文名称"></el-table-column>
                        <el-table-column align="center" prop="chName" label="中文名称"></el-table-column>
                        <el-table-column align="center" prop="enName" label="数据值"></el-table-column>
                        <el-table-column align="center" label="时间">
                            <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.timestamp)}}</template>
                        </el-table-column>
                        <el-table-column align="center" label="数据采集开始时间">
                            <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.beginTime)}}</template>
                        </el-table-column>
                        <el-table-column align="center" label="数据采集结束时间">
                            <template slot-scope="scope">{{$dateUtil.formatTime(scope.row.endTime)}}</template>
                        </el-table-column>
                        <el-table-column align="center" prop="status" label="采集状态"></el-table-column>
                        <el-table-column align="center" prop="vehicleId" label="操作"></el-table-column>                
                    </el-table>
                            <!-- <div class="yk-table-box" style="margin-top:10px;">        
                                <table class="yk-table">
                                    <thead>
                                    <tr>                        
                                        <th scope="col">时间戳</th>                       
                                        <th scope="col">数据ID</th>
                                        <th scope="col">英文名称</th>
                                        <th scope="col">中文名称</th>
                                        <th scope="col">数据值</th>
                                        <th scope="col">时间</th>
                                    </tr>
                                    </thead>
                                    <tbody :style='{"height":(paging.total<=10 ? "auto" : "405px")}'>
                                    <tr class="yk-table-body" v-for="(item,index) in dataList" :key="index" :class="item.css">
                                        <td>{{item.timestamp}}</td>                        
                                        <td>{{item.dataId}}</td>
                                        <td>{{item.enName}}</td>
                                        <td>{{item.chName}}</td>
                                        <td>{{item.dataValue}}</td>
                                        <td>{{$dateUtil.formatTime(item.timestamp,'yy-mm-dd hh:mm:ss:ms')}}</td>                      
                                    </tr>
                                    </tbody>
                                </table> 
                            </div>                -->
                        </div>
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
                    </div>
                    
                </div>
            </template>
<script>
import Paging from '@/common/view/Paging.vue'

export default {
    props: ['title','type','data'],
    components: {
        Paging,
    },
    data(){
        return {
            paging: {
                index: 1,
                size: 10,
                total: 0,
                hideSize: true,
            },
            current: {
                top: 0,
                height: 100,
            },
            searchKey:{
                queryId:'',
                dataId:''
            },
            dataList: [],
            currentPage:1,
            loading:false
        }
    },
    methods: {
        init(queryId,dataId){
            if(queryId != undefined) this.searchKey.queryId = queryId;
            if(dataId != undefined) this.searchKey.dataId = dataId;
            this.$refs.page.internalCurrentPage = this.currentPage;
            this.paging.index = 1;
            this.initData();
        },
        initData(){
            let _this = this;
            _this.dataList = [];
            _this.loading = true;
            _this.$api.post('dataPlatApp/dynamic/event/data/list',{     
                "pageSize": this.paging.size,
                "pageIndex": this.paging.index,           
                "param":{
                    queryId: this.searchKey.queryId,
                    sId: this.searchKey.dataId,
                }
            },response => {
                if(response.status == 200){
                    _this.dataList = response.data.list;
                    _this.paging.total = response.data.totalCount;
                }else{
                    _this.$store.dispatch('showPrompt','获取数据列表失败 ！');
                }
                _this.loading = false;
            },error => {
                this.$message.error("获取列表error！");
                this.loading = false;
            });
        },
        searchClick(){
            this.paging.index = 0;
            this.initData();
        },
        backClick(){
            this.$emit('detailPanelBack')
        },
        resetClick(){
            this.searchKey.dataId ="";
            this.init();
        },
        // initPanelHeight(){
        //     let boxHeight = document.body.clientHeight;
        //     this.current.top = document.getElementById('idTable').offsetTop;
        //     this.current.height = boxHeight - this.current.top;
        // },
        handleSizeChange(value) {//每页显示条数变更
            this.paging.size = value;
            this.initData();
        },
        handleCurrentChange(value) {//页码变更
            this.paging.index = value;
            this.initData();
        }
    },
    mounted(){
        // this.initPanelHeight();
        // window.onresize = () => {
        //     this.initPanelHeight();
        // }
    }
}
</script>
<style scoped>
.yk-gap10{
    background: #fff;
    margin: 10px 0px;
}

.yk-cfg-box{
    width: 100%;
    height: 100%;
    position: relative;
}

.yk-b-border{
    border-bottom: 1px dashed #d5e1e2;
    margin-bottom: 10px;
}

.yk-sub-box{
    margin: 10px 0px;
    position: relative;
    background: #F7F9FA;
}

.yk-s-block{
    display: inline-block;
    vertical-align: top;
    background: #fff;
    height: 160px;
    width: 22%;
}
.yk-s-block:hover{
    border: 2px solid #00c1de;
    border-radius: 3px;
    -webkit-border-radius: 3px;
    -moz-border-radius: 3px;
    -ms-border-radius: 3px;
    -o-border-radius: 3px;
}

.yk-t-color{
    background: #F7F9FA!important;
}

.yk-s-block .title{
    text-align: left;
    height: 36px;
    line-height: 36px;
    font-size: 16px;
    color: #5F6E82;
    padding-left: 10px;
}
.yk-s-block .body{
    font-size: 42px;
    color: #475669;
    padding: 10px;
}
.yk-top150{
    margin-top: 150px!important;
}
</style>
