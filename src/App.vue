<template>
  <div id="app" class="yk-box">
    
    <router-view></router-view>

    <loading v-if="$store.state.action.isLoading"></loading>
    <prompt v-if="$store.state.action.isPrompt" class="yk-prompt"></prompt>

  </div>
</template>

<script>
import ResponseCss from '@/assets/css/response.css'

import Loading from '@/common/view/Loading.vue'
import Prompt from '@/common/view/Prompt.vue'

import SessionUtils from '@/store/session.js'

export default {
  name: 'App',
  components: {
    Loading, Prompt,
  },
  data() {
    let _defaultCenterPoint =  [121.262939,31.245149];
    return {
      defaultCenterPoint: _defaultCenterPoint,
      defaultMapOption: {
        center: _defaultCenterPoint,
        zoom: 17,
        // resizeEnable: true, //是否监控地图容器尺寸变化
        mapStyle: "amap://styles/3312a5b0f7d3e828edc4b2f523ba76d8"
      }
    }
  },
  // watch: {
  //   deep: true,
  //   "$route"(newVal, oldVal) {
  //     console.log(newVal);
    
  //   }
  // },
  beforeRouteEnter (to, from, next) {
    console.log("进入");
      // if(to.name == 'PercepDetail'){
      //     console.log('缓存')
      //     to.meta.keepAlive = true; // 让 PercepData 缓存，即不刷新
      // }else{
      //     console.log('无缓存')
      //     to.meta.keepAlive = false;
      // };
      
      next();
  },
  beforeRouteLeave (to, from, next) {
    console.log("离开");
      // if(to.name == 'PercepDetail'){
      //     console.log('缓存')
      //     to.meta.keepAlive = true; // 让 PercepData 缓存，即不刷新
      // }else{
      //     console.log('无缓存')
      //     to.meta.keepAlive = false;
      // };
      
      next();
  },
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
