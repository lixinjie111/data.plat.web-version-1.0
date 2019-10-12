// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
// import Vue from 'vue'
import App from './App'
import router from './router'
// import '@/assets/css/video-js.css';
import store from './store/index'
//element-ui
// import ElementUI from 'element-ui';
// import 'element-ui/lib/theme-chalk/index.css';
// Vue.use(ElementUI);

Vue.config.productionTip = false

// 日期转换
import TDate from './common/utils/date.js'
Vue.prototype.$dateUtil = TDate;

// 模糊查询封装
import SearchFilter from '@/assets/js/module/searchFilter.js'
Vue.prototype.$searchFilter = SearchFilter;

//全局静态文件引入
import '@/assets/scss/reset.scss';
import '@/assets/scss/public.scss';
import '@/assets/scss/map.scss';
import '@/assets/scss/video.scss';
import '@/assets/scss/element-ui-reset.scss';    
import '@/assets/icon-font/iconfont.css';

//导入video.js
// import VideoPlayer  from 'vue-video-player'
// import 'video.js/dist/video-js.css'
// import 'vue-video-player/src/custom-theme.css'
// import 'videojs-flash'
// Vue.use(VideoPlayer);

// 路由拦截器
router.beforeEach((to, from, next) => {
    if (to.meta.requireAuth) {  // 判断该路由是否需要登录权限
        if (sessionStorage.getItem('login')) {  // 通过vuex state获取当前的token是否存在
            next();
        }
        else {
            next({
                path: '/login',
                query: {redirect: to.fullPath}  // 将跳转的路由path作为参数，登录成功后跳转到该路由
            })
        }
    }
    else {
        next();
    }
})


/* eslint-disable no-new */
const vm = new Vue({
    el: '#app',
    router,
    store,
    components: { App },
    template: '<App/>'
})


// axios 过滤器
import axiosFilter from './api/axiosConfig.js';
axiosFilter(vm);
