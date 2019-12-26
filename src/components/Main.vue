<template>
    <div class="yk-main-box">
        <header-bar></header-bar>

        <div class="main-container">
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
    </div>
</template>
<script>
import HeaderBar from './Header.vue'
import LeftBar from '@/components/layout/LeftBar.vue'

export default {
    name: 'Main',
    components: {
        HeaderBar3,
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
    min-width: 860px;
    margin: 0 auto;
    position: relative;
    width: 100%;
    height: 100%;
    background: #F7F9FA;
}
.main-container {
    width: 100%;
    position: absolute;
    top: 50px;
    bottom: 0;
    overflow: hidden;
}
.yk-body{
    position: absolute;
    top: 0;
    left: 180px;
    right: 0px;
    bottom: 0px;
}

.yk-left{
  display: inline-block; 
  top:0px;
  left:0px;
  bottom:0px;
  position:absolute;
  width: 180px;
  background-color: #1a1d20;
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

