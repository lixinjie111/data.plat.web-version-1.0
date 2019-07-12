<template>
    <div class="c-scroll-wrap menu-wrapper">
        <div class="c-scroll-inner">
            <tree-com ></tree-com>
        </div>
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
<style lang="scss" scoped>
@import "@/assets/scss/theme.scss";
.menu-wrapper {
    position: absolute;
    left: 0;
    top: 20px;
    bottom: 0;
    width: 100%;
    height: auto;
    .c-scroll-wrap::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, .5);
    }
}
</style>

