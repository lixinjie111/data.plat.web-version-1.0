<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
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
  width: 100%;
  height: 100%;
}
</style>
