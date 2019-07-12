<template>
    <div class="yk-main-box">
        <header-bar></header-bar>
        <div class="yk-left" :class="dyCss.tree">
            <left-bar @YkEvtTreeShow="treeShow"></left-bar>
        </div>

        <div class="yk-body">            
            <div class="c-scroll-wrap">
                <div class="c-scroll-inner">
                    <transition name="fade" mode="out-in">
                        <router-view></router-view>
                    </transition>
                </div>
            </div>           
        </div>
    </div>
</template>
<script>
import HeaderBar from '@/components/layout/Header3.vue'
import LeftBar from '@/components/layout/LeftBar.vue'

import ResponseCss from '@/assets/css/response.css'


export default {
    name: 'Main',
    components: {
        HeaderBar,
        LeftBar
    },
    data(){
        return {
            menu: {
                isTree: true,
                
            },
            dyCss: {
                tree: 'yk-tree-normal',
            }
        }
    },
    methods: {
        treeShow(value){      
            this.dyCss.tree = value.show ? 'dy-tree-normal' : 'dy-tree-min';
        }
    },   
    mounted(){
        
    },
    destroyed(){

    },
}
</script>
<style scoped>
.yk-main-box{
    /* max-width: 1280px; */
    margin: 0 auto;
    position: relative;
    width: 100%;
    height: 100%;
}
.yk-body{
    top: 55px;
    left: 240px;
    right: 0px;
    bottom: 0px;
    position: absolute;
}

.yk-left{
  display: inline-block; 
  top:60px;
  left:0px;
  bottom:0px;
  position:absolute;
  width: 240px;
  background: #101113;
  overflow-y: hidden;
  overflow-x: hidden;
}

.yk-animate-width{
  transition: width 2s;
  -moz-transition: width 2s;
  -o-transition: width 2s;
  -webkit-transition: width 2s;
}

.dy-tree-normal{        
    width: 260px;    
    font-size: 14px;   
    transition: width 0.2s;
    -moz-transition: width 0.2s;
    -o-transition: width 0.2s;
    -webkit-transition: width 0.2s;
}
.dy-tree-min{
    width: 50px;
    font-size: 18px;   
    transition: width 0.2s;
    -moz-transition: width 0.2s;
    -o-transition: width 0.2s;
    -webkit-transition: width 0.2s;
}
</style>

