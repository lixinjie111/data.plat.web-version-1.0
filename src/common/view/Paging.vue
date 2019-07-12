<template>
    <!-- 分页组件 -->
    <div>            
        <ul class="yk-paging-ul">

            <li class="yk-paging-total">
                <span >共 {{ totalCount }} 条记录</span>
            </li>
            <li class="yk-paging-size" v-if="!hideSize">
                <span>每页显示：</span>
                <select v-model="paging.size" @change="pageSizeChange();">
                    <option v-for="(item,index) in sizeList" :key="index" :value="item">{{item.value}}</option>                                
                </select>
                <span>条</span>
            </li>
    
            <li :class="[homeBtnEnable]" title="首页"><a @click="flagChange('home')">首页</a></li>
            <li :class="[preBtnEnable]" title="上一页" ><a @click="flagChange('pre');">上一页</a></li>
            
            <li v-if="showPreGroupBtn" title="上一组"><a @click="groupChange('pre');">...</a></li>
            <li v-for="(item,index) in dataList" :key="index" :title="item.name" >
                <a :class="[item.active]" @click="pageChange(item);">{{item.value}}</a>
            </li>
            <li v-if="showNextGroupBtn" title="下一组"><a @click="groupChange('next');">...</a></li>
            
            <li :class="[nextBtnEnabel]" title="下一页"><a @click="flagChange('next');">下一页</a></li>
            <li :class="[endBtnEnable]" title="尾页"><a @click="flagChange('end');">尾页</a></li> 
        </ul>          
                    
    </div>
</template>
<script>
    export default {
        name: 'Paging',
        props: ['currentPage','totalCount','hideSize'],
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
                current:1,
                pageSize: 10,
                groupSize: 10,  // 每组显示10条
                paging: {
                    size: 10,
                },
                sizeList: [
                    {id: 1 ,name: 10, value: 10},
                    {id: 2 ,name: 20, value: 20},
                    {id: 3 ,name: 50, value: 50},
                    {id: 4 ,name: 100, value: 100},
                    {id: 5 ,name: 200, value: 200},
                    {id: 6 ,name: 500, value: 500},
                    // {id: 7 ,name: 1000, value: 1000},
                ]
            }
        },
        methods: {
            initGroup(){                
                this.currGroup = 1;
                this.showPreGroupBtn = false;
                this.showNextGroupBtn = false;

                this.groupTotal = Math.ceil(this.pageTotal/this.groupSize);
                
                if(this.groupTotal > 1){
                    this.showNextGroupBtn = true;
                }                
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

                    index = this.currGroup * this.groupSize;
                    
                }else if(value == 'next'){
                    this.dataList = [];
                    if(this.currGroup < this.groupTotal){
                        this.currGroup++;
                        this.initPaging();
                    }
                    this.showPreGroupBtn = true;
                    this.showNextGroupBtn = this.currGroup < this.groupTotal ? true : false;

                    index = (this.currGroup-1) * this.groupSize + 1;    
                    
                }
                
                let temp = {value: index};
                this.pageChange(temp);
            },
            initPaging(){
                let start = (this.currGroup -1) * this.groupSize;               
                let end =  start + this.groupSize;               
                if(end > this.pageTotal){
                    end = this.pageTotal;
                }

                this.dataList = [];
                for( start; start < end; start++){
                    let pageNum = start + 1;
                    let temp = {};
                    temp.name = '第' + pageNum + '页';
                    temp.value = pageNum;
                    temp.active = this.current == start+1 ? 'yk-paging-active' : '';
                    this.dataList.push(temp);
                }
                
            },
            pageChange(value){   

                const tPage = value.value - 1;  //页码在数据库 从0开始
                
                if( this.currentPage == tPage) return;

                this.current = parseInt(value.value);
                for(let i=0;i<this.dataList.length;i++){
                    let temp = this.dataList[i];
                    temp.active = value.value == temp.value ? 'yk-paging-active' : '';
                }
                this.initFlag(value.value);

                this.$emit('pagingEvent',tPage);      //页码在数据库 从0开始
            },
            pageSizeChange(){               
                this.$emit('PageSizeEvent',this.paging.size.value);                
            },

            flagChange(value){
                let curr = value;
                if(value == 'pre'){

                    this.current = this.current - 1;
                    curr = this.current > 1 ? this.current : 1; 
                    const currMin = (this.currGroup - 1) * this.paging.size.value + 1;
                    
                    if(curr < currMin){                        
                        this.groupChange('pre');
                        this.initPaging();
                    }      

                }else if(value == 'next'){

                    this.current = this.current + 1;
                    curr = this.current < this.pageTotal ? this.current : this.pageTotal;
                   
                    const currMax = this.currGroup * this.paging.size.value;
                                      
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
            initFlag(value){

                this.preBtnEnable = 'yk-paging-disabled';
                this.homeBtnEnable = 'yk-paging-disabled';
                this.nextBtnEnabel = 'yk-paging-disabled';
                this.endBtnEnable = 'yk-paging-disabled';
                
                if(value > 1){
                    this.preBtnEnable = '';
                    this.homeBtnEnable = '';
                }
                
                if(value < this.pageTotal){
                    this.nextBtnEnabel = '';
                    this.endBtnEnable = '';
                }else{
                    this.nextBtnEnabel = 'yk-paging-disabled';
                    this.endBtnEnable = 'yk-paging-disabled';
                }
            }
        },        

        watch:{
            totalCount:function(newVal,oldVal){
                this.pageTotal = Math.ceil(this.totalCount/this.paging.size.value);                
                this.current = this.currentPage + 1;
                this.initGroup();
                this.initFlag(this.current);
                this.initPaging();
            }
        },
        created(){                       
            this.paging.size = this.sizeList[0];
            this.pageTotal = Math.ceil(this.totalCount/this.paging.size.value);            
            this.current = parseInt(this.current);

            this.initFlag(1);
            this.initGroup();
            this.initPaging(); 
        }
    }

</script>
<style scoped>
    
    .yk-paging-ul{
        float: right;
        list-style: none;
        height: 36px;
        line-height: 36px;
        padding-right: 10px; 
    }
    .yk-paging-ul li{
        float: left;
        height: 36px;
        line-height: 36px;
        margin: 2px;
        cursor: pointer;
    }
    .yk-paging-ul li span{
        height: 25px;
        line-height: 25px;
    }
    .yk-paging-ul li select{
        height: 25px;
        line-height: 25px;  
        font-size: 15px;
    }
    .yk-paging-ul li a{
        width: 100%;
        height: 100%;
        border: 1px solid #ccc;
        padding: 2px 6px!important;
    }
    .yk-paging-total{
        padding-right: 20px;
        font-size: 15px;
    }
    .yk-paging-size{
        padding-right: 30px;
        font-size: 15px;
    }
    .yk-paging-active{
        
        color:#00c1de!important;
        background: #F5F8FC!important;
        /* color:#ff0000!important; */
        /* background: #e4e2e2!important; */
    }

    .yk-paging-disabled{
        opacity: 0.65;
        pointer-events: none;
    }

</style>