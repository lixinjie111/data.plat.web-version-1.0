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
      name: 'index',
      redirect: 'login'
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
          meta: {
              requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
          },
          component: Home
        },      
        {
          path: '/refresh',    // 重新加载当前路由
          name: 'refresh',
          meta: {
              requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
          },
          component: Refresh
        },        
        {
          path: '/system',    // 系统设置
          name: 'SysManage',  
          meta: {
              requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
          },       
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
              meta: {
                  requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
              },
              component: RealMonitor
            },
            {
              path: '/playback',    // 历史监控
              name: 'PlayBack',
              meta: {
                  requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
              },
              component: PlayBack
            },
            {
              path: '/videoManage',    // 视频管理
              name: 'VideoManage',
              meta: {
                  requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
              },
              component: VideoManage,
            },
            {
              path: '/videoDownload',    // 视频下载
              name: 'VideoDownload',
              meta: {
                  requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
              },
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
              meta: {
                  requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
              },
              component: PathData,
            },            
            {
              path: '/canData',    // CAN数据
              name: 'CanData',
              meta: {
                  requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
              },
              component: CanData,
            },            
            {
              path: '/dynamicParam',    // 动态参数
              name: 'DynamicParam',
              meta: {
                  requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
              },
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
              meta: {
                  requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
              },
              component: PerceptualData,
            },    
            {
              path: '/roadSideInfo',    // 路侧数据
              name: 'RoadSideInfo',
              meta: {
                  requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
              },
              component: RoadSideInfo,
            },        
            {
              path: '/roadVideoManage',    // 路侧视频管理
              name: 'RoadVideoManage',
              meta: {
                  requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
              },
              component: RoadVideoManage,
            },            
            {
              path: '/roadVideoReplay',    // 路侧视频回放
              name: 'RoadVideoReplay',
              meta: {
                  requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
              },
              component: RoadVideoReplay,
            },            
            {
              path: '/roadVideoLoad',    // 路侧视频下载
              name: 'RoadVideoLoad',
              meta: {
                  requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
              },
              component: RoadVideoLoad,
            },            
            {
              path: '/roadAddLoad',    // 新建路侧视频下载
              name: 'RoadAddLoad',
              meta: {
                  requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
              },
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
              meta: {
                  requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
              },
              component: PercepData,
            },
            {
              path: '/percepDetail/:serialNum/:startTime/:endTime',    // 感知数据详情
              name: 'PercepDetail',
              meta: {
                  requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
              },
              component: PercepDetail,
            },
          ]
        },
        {
         path:'/v2xmanage',  //v2x管理
         name:'V2xmanage',
         component:v2xManage,
         children:[
          {
            path:'/bsm',  //bsm数据
            name:'bsm',
            meta: {
                requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
            },
            component:bsm
          },
          {
            path:'/bsmdetail', //bsm数据明细
            name:'BsmDetail',
            meta: {
                requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
            },
            component:bsmDetail
          },
          {
            path:'/event',  //event数据
            name:'event',
            meta: {
                requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
            },
            component:event
          },
          {
            path:'/rsm',  //rsm数据
            name:'rsm',
            meta: {
                requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
            },
            component:rsm
          },
          {
            path:'/rsi',  //rsi数据
            name:'rsi',
            meta: {
                requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
            },
            component:rsi
          },
          {
            path:'/rsmDetail',  //rsm数据明细
            name:'rsmDetail',
            meta: {
                requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
            },
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
              meta: {
                  requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
              },
              component: WeatherData,
            },            
            {
              path: '/trafficNotice',    // 交通公告
              name: 'trafficNotice',
              meta: {
                  requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
              },
              component: TrafficNotice,
            },            
            {
              path: '/highway',    // 高速公路
              name: 'highway',
              meta: {
                  requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
              },
              component: Highway,
            },
          ]
        },
      ]
    }
  ]
})
