// import axios from 'axios';
import {HTTPURL} from '../requestUrl';

/**
 * 车辆轨迹数据模糊查询
 */
export const requestqueryVehicleList = params => { return axios.post(`${HTTPURL}vehicle/queryVehicleListForSearchView`, params).then(res => res.data); };

/**
 * Can数据模糊查询
 */
export const queryVehicleList = params => { return axios.post(`${HTTPURL}vehicle/queryVehicleList`, params).then(res => res.data); };

/**
 * RSU编号模糊查询
 */
export const requestqueryRSUList = params => { return axios.post(`${HTTPURL}v2x/queryRSUListForSearchView`, params).then(res => res.data); };
/**
 * 路侧摄像头模糊查询
 */
export const requestRSCamList = params => { return axios.post(`${HTTPURL}road/queryRoadCamListForSearchView`, params).then(res => res.data); };
/**
 * 路侧道路名称、路侧点名称模糊查询
 */
export const requestqueryRoadList = params => { return axios.post(`${HTTPURL}road/queryRoadPointListForSearchView`, params).then(res => res.data); };
/**
 * 车载视频模糊查询
 */
export const requestqueryVehicleCamList = params => { return axios.post(`${HTTPURL}vehicle/queryVehicleCamList`, params).then(res => res.data); };
/**
 * 车载视频摄像头编号模糊查询
 */
export const requestFindCamList = params => { return axios.post(`${HTTPURL}vehicle/queryVehicleCamListForSearchView`, params).then(res => res.data); };

/**
 * 路侧视频模糊查询地址
 */
export const queryRoadCamListSearch = params => { return axios.post(`${HTTPURL}road/queryRSCamList`, params).then(res => res.data); };

/**
 * 感知数据路侧点名称模糊查询
 */
export const queryRoadPointList = params => { return axios.post(`${HTTPURL}road/queryRoadPointList`, params).then(res => res.data); };

/**
 * 感知数据根据路侧点名称模糊查询RCU编号、设备编号、摄像头序列号
 */
export const queryRoadSideDevList = params => { return axios.post(`${HTTPURL}road/queryRoadSideDevList`, params).then(res => res.data); };

/**
 * 感知数据模糊查询摄像头、雷达数据
 */
export const queryRSDeviceList = params => { return axios.post(`${HTTPURL}road/queryRSDeviceList`, params).then(res => res.data); };