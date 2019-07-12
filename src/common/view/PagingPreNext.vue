<template>
    <!-- 分页组件 -->
    <div>            
        <ul class="yk-paging-ul">
            <li :class="[preBtnEnable]" title="上一页" ><a @click="flagChange('pre');">上一页</a></li>
            <li :class="[nextBtnEnabel]" title="下一页"><a @click="flagChange('next');">下一页</a></li> 
        </ul>                     
    </div>
</template>
<script>
    export default {
        name: 'PagingPreNext',
        props: ['pageIndex','nextCount'], //nextCount下一页的记录条数
        data(){
            return {
                preBtnEnable:'',
                nextBtnEnabel:'',
                current:1
            }
        },
        methods: {
            init(pageIndex,pageTotal){

                this.current = this.pageIndex;                 
            
                this.initFlag(); 
            },

            pageChange(value){   
                             
                const tPage = value.value;  //页码在数据库 从1开始
                
                if( this.pageIndex == tPage) return;

                this.current = parseInt(value.value);
                this.initFlag();

                this.$emit('pagingEvent',tPage);      //页码在数据库 从0开始

            },
            flagChange(value){
                let curr = value;
                if(value == 'pre'){
                    this.current = this.current - 1;
                }else if(value == 'next'){
                    this.current = this.current + 1;
                }
                this.pageChange({value: this.current});
            },
            initFlag(){
                this.preBtnEnable = 'yk-paging-disabled';
                this.nextBtnEnabel = '';
                
                if(this.current > 1){
                    this.preBtnEnable = '';
                }
                
                if(this.nextCount > 0){
                    this.nextBtnEnabel = '';
                }else{
                    this.nextBtnEnabel = 'yk-paging-disabled';
                }
            }
        },

        watch:{
            nextCount:function(newVal,oldVal){
              this.initFlag();
            },
            pageIndex:function(newVal,oldVal){
              this.init();
            },
        },
        mounted(){
        
           this.init();
            
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