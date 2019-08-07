import axios from 'axios';
import {HTTPURL} from '../requestUrl';

/**
 * 车辆轨迹数据模糊查询
 */
export const requestqueryVehicleList = params => { return axios.post(`${HTTPURL}vehicle/queryVehicleList`, params).then(res => res.data); };
/**
 * 车辆轨迹数据模糊查询
 */
export const requestqueryRSUList = params => { return axios.post(`${HTTPURL}v2x/queryRSUList`, params).then(res => res.data); };
/**
 * 路侧摄像头模糊查询
 */
export const requestRSCamList = params => { return axios.post(`${HTTPURL}road/queryRSCamList`, params).then(res => res.data); };
/**
 * 路侧道路名称模糊查询
 */
export const requestqueryRoadList = params => { return axios.post(`${HTTPURL}road/queryRoadList`, params).then(res => res.data); };
/**
 * 路侧点名称模糊查询
 */
export const requestqueryRoadPointList = params => { return axios.post(`${HTTPURL}road/queryRoadPointList`, params).then(res => res.data); };
/**
 * 车载视频模糊查询
 */
export const requestqueryVehicleCamList = params => { return axios.post(`${HTTPURL}vehicle/queryVehicleCamList`, params).then(res => res.data); };

