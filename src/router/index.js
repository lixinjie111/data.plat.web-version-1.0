import Vue from 'vue'
import Router from 'vue-router'

// 登录
const Login = resolve => require(['@/components/Login.vue'], resolve)
const Home = resolve => require(['@/components/Home.vue'], resolve)
const Main = resolve => require(['@/components/Main.vue'], resolve)
//重新加载当前路由
const Refresh = resolve => require(['@/components/Refresh.vue'], resolve)

// 车载视频
const VehicleVideo = resolve => require(['@/components/video/Video.vue'], resolve)
const RealMonitor = resolve => require(['@/components/video/realMonitor/RealMonitor.vue'], resolve)
const VideoManage = resolve => require(['@/components/video/videoManage/VideoManage.vue'], resolve)
const VideoDownload = resolve => require(['@/components/video/videoDownload/VideoDownload.vue'], resolve)
const PlayBack = resolve => require(['@/components/video/playVideo/playback.vue'], resolve)

// 路侧数据 
const RoadSide = resolve => require(['@/components/roadSide/RoadSide.vue'], resolve)
const RoadSideInfo = resolve => require(['@/components/roadSide/roadSideInfo/roadSideInfo.vue'], resolve)
const PerceptualData = resolve => require(['@/components/roadSide/perceptualData/PerceptualData.vue'], resolve)
const RoadVideoManage = resolve => require(['@/components/roadSide/roadVideoManage/roadVideoManage.vue'], resolve)
const RoadVideoReplay = resolve => require(['@/components/roadSide/roadVideoManage/roadVideoReplay.vue'], resolve)
const RoadVideoLoad = resolve => require(['@/components/roadSide/roadVideoLoad/roadVideoLoad.vue'], resolve)
const RoadAddLoad = resolve => require(['@/components/roadSide/roadVideoLoad/roadAddLoad.vue'], resolve)
const RadarData = resolve => require(['@/components/roadSide/radarData/RadarData.vue'], resolve)
const PercepData = resolve => require(['@/components/roadSide/perceptual/PercepData.vue'], resolve)
const PercepDetail = resolve => require(['@/components/roadSide/perceptual/PercepDetail.vue'], resolve)

// 平台数据 
const Platform = resolve => require(['@/components/platform/Platform.vue'], resolve)
const TrafficNotice = resolve => require(['@/components/platform/trafficNotice/TrafficNotice.vue'], resolve)
const Highway = resolve => require(['@/components/platform/highway/Highway.vue'], resolve)
const WeatherData = resolve => require(['@/components/platform/weatherData/WeatherData.vue'], resolve)

// 系统管理
const SysManage = resolve => require(['@/components/system/SysManage.vue'], resolve)

// 车辆管理
const VehilcleManage = resolve => require(['@/components/vehicle/vehicle.vue'], resolve)
const PathData = resolve => require(['@/components/vehicle/pathData/PathData.vue'], resolve)
const CanData = resolve => require(['@/components/vehicle/canData/CanData.vue'], resolve)
const DynamicParam = resolve => require(['@/components/vehicle/dynamicParam/DynamicParam.vue'], resolve)


//v2x
const v2xManage = resolve => require(['@/components/v2x/v2x.vue'], resolve)
const v2x = resolve => require(['@/components/v2x/realMonitor/main.vue'], resolve)
const bsm = resolve => require(['@/components/v2x/bsm/BsmCom.vue'], resolve)
const bsmDetail = resolve => require(['@/components/v2x/bsm/BsmDetail.vue'], resolve)
const event = resolve => require(['@/components/v2x/event/EventCom.vue'], resolve)
const rsm = resolve => require(['@/components/v2x/rsm/RsmCom.vue'], resolve)
const rsmDetail = resolve => require(['@/components/v2x/rsm/RsmDetail.vue'], resolve)
const rsi = resolve => require(['@/components/v2x/rsi/RsiCom.vue'], resolve)


Vue.use(Router)

export default new Router({
  // mode: 'history',
  // base: '/dataManage',    // 发布的项目目录，如果发布的目录为根目录不需要设置这个属性
  // mode: 'hash',
  routes: [    
    {
      path: '/',
      component: Login
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/main',
      component: Main,      
      children: [
        {
          path: '',
          component: Home,
        },
        {
          path: '/home',    // 首页
          name: 'home',
          component: Home
        },      
        {
          path: '/refresh',    // 重新加载当前路由
          name: 'refresh',
          component: Refresh
        },        
        {
          path: '/system',    // 系统设置
          name: 'SysManage',         
          component: SysManage,   
          children:[]  
        },        
        {
          path: '/vehicleVideo',     // 车载视频
          name: 'VehicleVideo',
          component: VehicleVideo,
          children: [                       
            {
              path: '/realMonitor',    // 实时监控
              name: 'RealMonitor',
              component: RealMonitor
            },
            {
              path: '/playback',    // 历史监控
              name: 'PlayBack',
              component: PlayBack
            },
            {
              path: '/videoManage',    // 视频管理
              name: 'VideoManage',
              component: VideoManage,
            },
            {
              path: '/videoDownload',    // 视频下载
              name: 'VideoDownload',
              component: VideoDownload
            },
          ]
        },
        {
          path: '/vehilcle',     // 车辆数据
          name: 'vehilcleManage',
          component: VehilcleManage,
          children: [        
            {
              path: '/pathData',    // 轨迹数据
              name: 'PathData',
              component: PathData,
            },            
            {
              path: '/canData',    // CAN数据
              name: 'CanData',
              component: CanData,
            },            
            {
              path: '/dynamicParam',    // 动态参数
              name: 'DynamicParam',
              component: DynamicParam,
            },            
          ]
        },
        {
          path: '/roadSide',     // 路侧数据路侧数据
          name: 'roadSide',
          component: RoadSide,
          children: [
            {
              path: '/perceptualData',    // 实时监控
              name: 'perceptualData',
              component: PerceptualData,
            },    
            {
              path: '/roadSideInfo',    // 路侧数据
              name: 'RoadSideInfo',
              component: RoadSideInfo,
            },        
            {
              path: '/roadVideoManage',    // 路侧视频管理
              name: 'RoadVideoManage',
              component: RoadVideoManage,
            },            
            {
              path: '/roadVideoReplay',    // 路侧视频回放
              name: 'RoadVideoReplay',
              component: RoadVideoReplay,
            },            
            {
              path: '/roadVideoLoad',    // 路侧视频下载
              name: 'RoadVideoLoad',
              component: RoadVideoLoad,
            },            
            {
              path: '/roadAddLoad',    // 新建路侧视频下载
              name: 'RoadAddLoad',
              component: RoadVideoLoad,
            },            
            // {
            //   path: '/radarData',    // 雷达数据
            //   name: 'radarData',
            //   component: RadarData,
            // },
            {
              path: '/percepData',    // 感知数据
              name: 'PercepData',
              component: PercepData,
            },
            {
              path: '/percepDetail/:serialNum/:startTime/:endTime',    // 感知数据详情
              name: 'PercepDetail',
              component: PercepDetail,
            },
          ]
        },
        {
         path:'/v2xmanage',  //v2x管理
         name:'V2xmanage',
         component:v2xManage,
         children:[
          // {
          //   path:'/v2x',  //实时预警
          //   name:'v2x',
          //   component:v2x
          // },
          {
            path:'/bsm',  //bsm数据
            name:'bsm',
            component:bsm
          },
          {
            path:'/bsmdetail', //bsm数据明细
            name:'BsmDetail',
            component:bsmDetail
          },
          {
            path:'/event',  //event数据
            name:'event',
            component:event
          },
          {
            path:'/rsm',  //rsm数据
            name:'rsm',
            component:rsm
          },
          {
            path:'/rsi',  //rsi数据
            name:'rsi',
            component:rsi
          },
          {
            path:'/rsmDetail',  //rsm数据明细
            name:'rsmDetail',
            component:rsmDetail
          }
         ]
        },
        {
          path: '/platform',     // 平台数据
          name: 'Platform',
          component: Platform,
          children: [
            {
              path: '/weatherData',    // 天气数据
              name: 'weatherData',
              component: WeatherData,
            },            
            {
              path: '/trafficNotice',    // 交通公告
              name: 'trafficNotice',
              component: TrafficNotice,
            },            
            {
              path: '/highway',    // 高速公路
              name: 'highway',
              component: Highway,
            },
          ]
        },
      ]
    }
  ]
})
