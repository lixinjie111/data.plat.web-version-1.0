import axios from 'axios';
import {HTTPURL,operPlatUrl} from '../requestUrl';


/**
 * 实时监控
 */

/**
 * 获取摄像头相关数据
 */
// export const queryCamList = params => { return axios.post(`${HTTPURL}vehicle/queryVehicleCamList`, params).then(res => res.data); };
export const queryCamList = params => { return axios.post(`${HTTPURL}cam/queryCamList`, params).then(res => res.data); };

/**
 * 报活
 */
export const startStream = params => { return axios.post(`${HTTPURL}cam/startStream`, params).then(res => res.data); };

/**
 * 调用报活
 */
export const sendStreamHeart = params => { return axios.post(`${HTTPURL}cam/sendStreamHeart`, params).then(res => res.data); };

/**
 * 获取设备id
 */
export const queryDeviceType = params => { return axios.post(`${HTTPURL}vehicle/queryDeviceType`, params).then(res => res.data); };

/**
 * 获取直播gps
 */
export const gpsInfo = params => { return axios.post(`${HTTPURL}vehicle/gpsInfo`, params).then(res => res.data); };
/**
 * 获取回放gps
 */
export const historyGpsInfo = params => { return axios.post(`${HTTPURL}vehicle/historyGpsInfo`, params).then(res => res.data); };


/**
 * 视频管理
 */

/**
 * 视频列表
 */
export const queryVideoList = params => { return axios.post(`http://172.17.1.13:9099/dataPlatApp/cam/queryVideoList`, params).then(res => res.data); };
// export const queryVideoList = params => { return axios.post(`${HTTPURL}cam/queryVideoList`, params).then(res => res.data); };
/**
 * 删除文件
 */
export const removeVideo = params => { return axios.post(`${HTTPURL}cam/removeVideo`, params).then(res => res.data); };


/**
 * 视频下载
 */

/**
 * 视频任务列表
 */
export const queryTaskList = params => { return axios.post(`${HTTPURL}cam/queryTaskList`, params).then(res => res.data); };
/**
 * 下载视频
 */
export const redoVideoTask = params => { return axios.post(`${HTTPURL}cam/redoVideoTask`, params).then(res => res.data); };
/**
 * 获取车辆信息
 */
export const queryPage = params => { return axios.post(`${operPlatUrl}vehicle/query/page`, params).then(res => res.data); };
/**
 * 获取设备信息
 */
export const findByDeviceList = params => { return axios.post(`${operPlatUrl}vehicle/findByDeviceList`, params).then(res => res.data); };
/**
 * 新建下载任务
 */
export const historyDownloadTask = params => { return axios.post(`${HTTPURL}cam/historyDownloadTask`, params).then(res => res.data); };