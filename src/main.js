// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
// import '@/assets/css/video-js.css';
import store from './store/index'
import echarts from 'echarts'
import Api from './api/index.js';
import TDate from './common/utils/date.js'

import TFormValidate from './common/utils/formValidate'
Vue.config.productionTip = false
Vue.prototype.$echarts = echarts
Vue.prototype.$api = Api;
Vue.prototype.$dateUtil = TDate;

//全局静态文件引入
import '@/assets/scss/reset.scss';
import '@/assets/scss/public.scss';
import '@/assets/scss/element-ui-reset.scss';
import '@/assets/icon-font/iconfont.css';
import '@/assets/icon-font/iconfont.js';

//导入video.js
import VideoPlayer  from 'vue-video-player'
import 'video.js/dist/video-js.css'
import 'vue-video-player/src/custom-theme.css'
import 'videojs-flash'
Vue.use(VideoPlayer);


//element-ui
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

/* eslint-disable no-new */
// Vue.filter('toFixed',function (value,num) {
//   value = Number(value);
//   return value.toFixed(num);
// });

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
