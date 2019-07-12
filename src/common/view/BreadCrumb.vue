<template>
    <div class="yk-bread-crumb">
            <ul>
                <li v-for="(item,index) in breads" :key="index">
                    <span @click="clickFn(item);">{{ item.name }}</span>  
                    <span v-if="index != breads.length - 1"> &gt; </span>  
                </li>
            </ul>
            <!-- <span v-if="$store.state.btn.back" class="yk-btn yk-right yk-btn-back" @click="backClick();">返回</span> -->
    </div>
</template>
<script>
export default {
    name: 'bread-crumb',
    props: ['data'],
    data(){
        return {
            breads: [
                {
                    id: 1,
                    name: '摄像头管理'
                },
                {
                    id: 2,
                    name: '实时监控',
                    path: '/role'
                },
                // {
                //     id: 3,
                //     name: '新增车辆',
                //     path: ''
                // }
            ]
        }
    },
    methods: {
        clickFn(item){
            // console.log('item.name ' + item.name + ' item.id ' + item.id)
            let index = this.breads.findIndex(item);
            if(index < this.breads.length - 1){
                this.$emit('BreadCrumbEvent',item)
            }
            
        },
        backClick(){
            let temp = {
                type: 'back',
                status: false,
            }
            this.$store.dispatch('btnStatus',temp)
        }
    }
}
</script>
<style scoped>
.yk-bread-crumb ul {
    list-style: none;
    margin: 0px;
    padding: 0px;
}
.yk-bread-crumb ul li{
    display: inline-block;
    cursor: pointer;
}
.yk-bread-crumb ul li:hover{
    color: #30A5FF;
}
.yk-bread-crumb ul li:first-child:hover{
    color: #000;
}
.yk-bread-crumb ul li:first-child{
    cursor: default;
}
.yk-bread-crumb ul li:last-child{
    cursor: default;
}
.yk-bread-crumb ul li:last-child:hover{
    color: #000;
}
</style>

