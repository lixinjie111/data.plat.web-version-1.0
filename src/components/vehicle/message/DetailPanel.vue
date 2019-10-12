<template>
    <div>
        <div class="yk-btn-box yk-right yk-b-10">
            <!-- <span class="yk-btn" @click="backClick();">返回</span> -->
            <img class="yk-img-btn" src="static/icon/back.png" title="返回" alt="返回" @click="backClick();">
            <!-- <span class="yk-btn" @click="backClick();">返回</span> -->
        </div>
        <div class="yk-cfg-box yk-scroll-y" id="idPanelBox" :style="'height:' + current.height + 'px'">
            <div class="yk-panel-box yk-gap10">

                <div class="yk-btn-box yk-left yk-b-border">
                        <span class="title">数据查看</span>
                        <!-- <span class="yk-btn">添加</span> -->
                </div>

                <div>
                   <div class="yk-search-box">                
                
                        <div class="yk-search-block">
                            <label class="yk-w-68">中文名称: </label>
                            <input class="yk-input" v-model="searchKey.name">
                        </div>                
                    
                        <div class="yk-search-block">
                            <span class="yk-btn yk-btn-gap" @click="searchClick">查询</span>
                            <span class="yk-btn" @click="resetClick">重置</span>
                        </div>  
                        <div class="yk-table-box" id="idTable" :style="'height:' + current.height + 'px;'">
                            <table class="yk-table">
                                <thead>
                                <tr>                        
                                    <th scope="col">时间戳</th>                       
                                    <th scope="col">数据编号</th>
                                    <th scope="col">英文名称</th>
                                    <th scope="col">中文名称</th>
                                    <th scope="col">数据值</th>
                                    <th scope="col">时间</th> 
                                </tr>
                                </thead>
                                <tbody>
                                <tr class="yk-table-body" v-for="(item,index) in dataList" :key="index" :class="item.css" @click="showDetailClick(item);">
                                    <td>{{item.vehicleId}}</td>                        
                                    <td>{{item.plateNo}}</td>
                                    <td>{{item.vin}}</td>
                                    <td>{{item.brand}}</td>
                                    <td>{{item.model}}</td>
                                    <td>{{item.color}}</td>                      
                                </tr>
                                </tbody>
                            </table>                
                        </div>
                        <paging class="yk-paging" :current-page="pageOption.page" :total-count="pageOption.total" @pagingEvent="pagingFn" @PageSizeEvent="pagingSizeFn"></paging>              
                                </div>
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
            pageOption: {
                page: 0,
                size: 10,
                total: 0,
                hideSize: true,
            },
            current: {
                top: 0,
                height: 100,
            },
            searchKey:{
                name:''
            }
        }
    },
    methods: {
        backClick(){
            this.$emit('CfgPanelBack')
        },
        pagingFn(e){

        },
        initPanelHeight(){
            // console.log('document.getElementById.offsetTop =   ' + document.getElementById('idTable').offsetTop )
            // console.log('document.getElementById.offsetHeight = ' + document.getElementById('idTable').offsetHeight )

            let boxHeight = document.body.clientHeight;
            this.current.top = document.getElementById('idTable').offsetTop;
            this.current.height = boxHeight - this.current.top;

            // console.log('page height ; ' + this.current.height)
        }
    },
    mounted(){
        this.initPanelHeight();
        window.onresize = () => {
            this.initPanelHeight();
        }
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

</style>
