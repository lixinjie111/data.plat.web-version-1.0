<template>
    <div class="yk-tree-box">
        <tree-com></tree-com>
    </div>
</template>
<script>

import TreeCom from '@/common/view/TreeList.vue'
export default {
    name: 'LeftBar',
    components: {
        TreeCom,
    },
    data(){
        return {
            name: 'LeftBar',
            // ops: {
            //     bar: {
            //         background: 'rgb(24, 144, 255)'
            //     },
            //     rail: {
            //         border: '1px solid #cecece',
            //         size: '20px'
            //     },
            //     scrollButton: {
            //         enable: true,
            //         background: '#cecece'
            //     }
            // }
        }
    },
    methods: {
        menuShow(value){            
            this.$emit('YkEvtTreeShow',value);
        }
    },
    mounted(){

    },
    beforeDestroy(){

    },
}
</script>
<style scoped>
    .yk-tree-box{
        top: 20px;
        left: 0px;
        right: 0px;
        bottom: 0px;
        position: absolute;
        width: 240px;
        overflow-y: auto;
        background:#21272f;
    }

       /* 自定义 滚动条样式 */
/* ::-webkit-scrollbar{
    width: 3px;
    height: 16px;
    background-color: rgb(15, 15, 15);    
} */
</style>

