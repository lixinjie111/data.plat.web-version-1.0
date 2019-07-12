<template>
    <!-- 分页组件min -->
    <div>
        
            
            <!-- <div  style="margin:0px;padding:0px;">
                <nav  aria-label="Page navigation example"  style="margin:0px;padding:0px;">
                    <ul class="pagination pagination-sm ts-page"  style="margin:0px;padding:0px;">
                        <li class="page-item"><a class="ts-page-a">共{{totalCount}}条记录 每页显示{{pageSize}}条</a></li>
                    </ul>
                </nav>
            </div> -->
            
            <div style="margin:0px;padding:0px;text-align:right;">
                <nav aria-label="Page navigation example"  style="margin:0px;padding:0px;">
            
                    <ul  class="pagination pagination-sm ts-page" style="float:right;">
                
                        <li class="page-item small ts-page-item" :class="[homeBtnEnable]" title="首页"><a class="page-link ts-page-link" @click="flagChange('home')">首页</a></li>
                        <li class="page-item small ts-page-item" :class="[preBtnEnable]" title="上一页" ><a class="page-link ts-page-link" @click="flagChange('pre');">上一页</a></li>
                        
                        <li v-if="showPreGroupBtn" class="page-item small ts-page-item" title="上一组"><a class="page-link ts-page-link" @click="groupChange('pre');">...</a></li>
                        <li v-for="(item,index) in dataList" :key="index" :title="item.name" class="page-item small ts-page-item" ><a class="page-link ts-page-link" :class="[item.active]" @click="pageChange(item);">{{item.value}}</a></li>
                        <li v-if="showNextGroupBtn" class="page-item small ts-page-item" title="下一组"><a class="page-link ts-page-link" @click="groupChange('next');">...</a></li>
                        
                        <li class="page-item small ts-page-item" :class="[nextBtnEnabel]" title="下一页"><a class="page-link ts-page-link" @click="flagChange('next');">下一页</a></li>
                        <li class="page-item small ts-page-item" :class="[endBtnEnable]" title="尾页"><a class="page-link ts-page-link" @click="flagChange('end');">尾页</a></li>
                    </ul>
                </nav>
            </div>
       
                    
    </div>
</template>
<script>
    export default {
        name: 'PagingMin',
        props: ['pageIndex','pageSize','totalCount'],
        data(){
            return {
                pageTotal: 1,
                dataList:[],
                currGroup:1,
                groupTotal:1,
                showPreGroupBtn:false,
                showNextGroupBtn:false,
                preBtnEnable:'',
                nextBtnEnabel:'',
                homeBtnEnable:'',
                endBtnEnable:'',
                current:1
            }
        },
        methods: {
            init(pageIndex,pageTotal){

                if(pageIndex){
                    this.pageIndex = pageIndex;
                }
                if(pageTotal){
                    this.pageTotal = pageTotal;
                }

                this.pageTotal = Math.ceil(this.totalCount/this.pageSize);
                this.current = this.pageIndex + 1;                 

                this.currGroup = Math.ceil(this.pageIndex / this.pageSize);
                if((this.pageIndex % this.pageSize == 0) && (this.pageIndex < this.totalCount)){
                    this.currGroup = this.currGroup + 1;
                }

                if(this.currGroup == 0){
                    this.currGroup = 1;
                }
            
                this.initFlag();
                this.initGroup();
                this.initPaging();    
            },
            initGroup(){
                this.groupTotal = Math.ceil(this.pageTotal/this.pageSize);

                this.showPreGroupBtn = this.currGroup > 1;
                this.showNextGroupBtn = this.currGroup >= 1 && (this.currGroup != this.groupTotal);
                
            },
            groupChange(value){
                
                let index = 1;
                if(value == 'pre'){
                    if(this.currGroup > 1){
                        this.currGroup--;                        
                        this.initPaging();
                    }                    
                    this.showPreGroupBtn = this.currGroup > 1 ? true : false;
                    this.showNextGroupBtn = true;

                    index = this.currGroup * this.pageSize;

                }else if(value == 'next'){
                    this.dataList = [];
                    if(this.currGroup < this.groupTotal){
                        this.currGroup++;                        
                        this.initPaging();
                    }
                    this.showPreGroupBtn = true;
                    this.showNextGroupBtn = this.currGroup < this.groupTotal ? true : false;

                    index = (this.currGroup-1)*this.pageSize + 1;    
                }
                
                let temp = {value: index};
                this.pageChange(temp);
            },
            initPaging(){  
                let start = (this.currGroup -1) * this.pageSize;
                let end =  this.currGroup * this.pageSize;
                if(end > this.pageTotal){
                    end = this.pageTotal;
                }
                this.dataList = [];
                for( start; start < end; start++){
                    let pageNum = start + 1;
                    let temp = {};
                    temp.name = '第' + pageNum + '页';
                    temp.value = pageNum;
                    temp.active = this.current == start+1 ? 'ts-page-active' : '';
                    this.dataList.push(temp);
                }
                
            },
            pageChange(value){   
                             
                const tPage = value.value - 1;  //页码在数据库 从0开始
                
                if( this.pageIndex == tPage) return;

                this.current = parseInt(value.value);
                for(let i=0;i<this.dataList.length;i++){
                    let temp = this.dataList[i];
                    temp.active = value.value == temp.value ? 'ts-page-active' : '';
                }
                this.initFlag();

                this.$emit('pagingEvent',tPage);      //页码在数据库 从0开始

            },
            flagChange(value){
                let curr = value;
                if(value == 'pre'){

                    this.current = this.current - 1;
                    curr = this.current > 1 ? this.current : 1; 
                    const currMin = (this.currGroup - 1) * this.pageSize + 1;
                    if(curr < currMin){                        
                        this.groupChange('pre');
                        this.initPaging();
                    }      

                }else if(value == 'next'){

                    this.current = this.current + 1;
                    curr = this.current < this.pageTotal ? this.current : this.pageTotal;
                   
                    const currMax = this.currGroup * this.pageSize;
                   
                    if(curr > currMax){
                        this.groupChange('next');
                        this.initPaging();
                    }
                   
                }else if(value == 'home'){
                    
                    this.current = 1;
                    this.currGroup = 1;
                    this.showPreGroupBtn = false;
                    this.showNextGroupBtn = this.groupTotal > 1;                    
                    this.initPaging();
                }else if(value == 'end'){
                   
                    this.current = this.pageTotal;
                    this.currGroup = this.groupTotal;
                    this.showPreGroupBtn = this.groupTotal > 1;
                    this.showNextGroupBtn = false;
                    
                    this.initPaging();
                }
                this.pageChange({value: this.current});
            },
            initFlag(){
                this.preBtnEnable = 'disabled';
                this.homeBtnEnable = 'disabled';
                this.nextBtnEnabel = '';
                this.endBtnEnable = '';
                
                if(this.current > 1){
                    this.preBtnEnable = '';
                    this.homeBtnEnable = '';
                }
                
                if(this.current < this.pageTotal){
                    this.nextBtnEnabel = '';
                    this.endBtnEnable = '';
                }else{
                    this.nextBtnEnabel = 'disabled';
                    this.endBtnEnable = 'disabled';
                }
            }
        },

        watch:{
            totalCount:function(newVal,oldVal){
                this.pageTotal = Math.ceil(this.totalCount/this.pageSize);
                this.current = this.pageIndex + 1;
                this.initGroup();
                this.initFlag();
                this.initPaging();
            }
        },
        mounted(){
        
           this.init();
            
        }
    }

</script>
<style scoped>
    .ts-page{
        color:#4BACDF!important;
        margin:0px;
        padding:0px;
        /* float: right; */
        
    }
    .ts-page-a{
        position: relative;
        display: block;
        /* padding: 0.5rem 0.75rem; */
        margin-top:0px;
        margin-bottom:0px;
        margin-left: -1px;
        line-height: 1.25;
        color: #2EA7D4;
        background-color: transparent;
        font-size:14px!important;
    }
    .ts-page-link{
        padding: 1px 3px!important;
        font-size:8px!important;
    }
    .ts-page-active{
        color:#ff0000!important;
        background: #F3F3F3!important;
        /* background: #dee2e6!important; */
    }

    .ts-page-item{
        /* margin:2px!important; */
        border-radius: 3px!important;
        
        color:#2EA7D4;
        margin:0px!important;
        padding:0px!important;
    }
</style>