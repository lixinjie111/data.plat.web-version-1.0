<template>
    <div class="yk-dropDownList" @click="boxClick();">
        <div>
            <input v-model="searchKey.name" :style="'width:' + size.width + 'px'" @input="searchKeyFn">
        </div>
        <div v-if="showPanel && searchKey.showPanel" class="yk-list" :style="'width:' + size.width + 'px'">
            <ul>
                <li v-for="(item,index) in dataList" :key="index" @click="itemClick(item);">{{item[type]}}</li>                
            </ul>
        </div>
    </div>
</template>
<script>
export default {
    name: 'DropDownList',
    props: ['type','data','size','showPanel'],
    data(){
        return {
            searchKey: {
                name: '',
                showPanel: true,
            },
            dataList: [],
        }
    },
    watch:{
        data(newVal,oldVal){
            this.dataList = Object.assign({},newVal);
            this.searchKey.showPanel = newVal.length ? true : false;

        },
    },
    methods:{
        init(key){
           this.searchKey = {
                name: key ? key : '',
                showPanel: false,
            }; 
            
        },
        show(bool){
            this.searchKey.showPanel = bool;
        },
        boxClick(){
            this.searchKey.showPanel = false;
        },
        itemClick(item){
            this.searchKey.name = item[this.type];
            
            this.searchKey.showPanel = false;
            let temp = {
                type: this.type,
                data: item
            };
            this.$emit('SelectEvt',temp);
        },
        searchKeyFn(){
            let data = {
                type: this.type,
                key: this.searchKey.name,
            };
            this.$emit('SearchChangeEvt', data);
            
        }
    },
    mounted(){

        this.searchKey = {
            name: '',
            showPanel: false,
        };

        document.body.onclick = ()=>{
            this.searchKey.showPanel = false;
        }
    }
}
</script>
<style scoped>
.yk-dropDownList{
    position: relative;
    /* width: 173px; */
    display: inline-block;
}

.yk-dropDownList input{
    width: 170px;
    height: 22px;
    line-height: 22px;
    border: 1px solid #d3dce6;
}

.yk-list{
    position:fixed;
    z-index: 9999;
    width: 172px;
    background: #EBF7FF;
}

.yk-list ul{
    display: inline-block;
    vertical-align: top;
    list-style: none;
    /* margin: 10px; */
    /* width: 360px; */
    width: 100%;
}
.yk-list li{
    margin: 0px;
    padding: 0px;
    border-bottom: 1px dashed #d5e1e2;
    height: 24px;
    line-height: 24px;
    font-size: 16px;
    /* padding: 0px 5px; */
}
.yk-list li:last-child{
    border-bottom: 0px;
}
.yk-list li:hover{
    background: rgb(225, 231, 231);
}
.yk-list li .left{
    display: inline-block;
    /* width: 180px; */
    text-align: right;
    padding-right: 10px;
}
.yk-list li .right{
    display: inline-block;
}
</style>
