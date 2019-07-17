import axios from 'axios';
import {HTTPURL,operPlatUrl} from '../requestUrl';

/**
 * 实时监控
 */

 /**
 * 左侧树形菜单 省市区
 */
export const queryRoadRegionTree = params => { return axios.post(`${HTTPURL}road/queryRoadRegionTree`, params).then(res => res.data); };
 /**
 * 左侧树形菜单
 */
export const queryRoadCamList = params => { return axios.post(`${HTTPURL}road/queryRoadCamList`, params).then(res => res.data); };
 /**
 * 开启直播报活
 */
export const startStreamRoad = params => { return axios.post(`${HTTPURL}road/startStreamRoad`, params).then(res => res.data); };
 /**
 * 停止直播报活
 */
export const stopStream = params => { return axios.post(`${HTTPURL}road/stopStream`, params).then(res => res.data); };
 /**
 * 查询在线车辆数
 */
export const getRoadSideCameraStaticsAndListByDist = params => { return axios.get(`${operPlatUrl}v2x/remote/device/getRoadSideCameraStaticsAndListByDist`, {params: params}).then(res => res.data); };

/**
 * 视频管理
 */

/**
 * 视频列表
 */
export const queryRoadVideoList = params => { return axios.post(`${HTTPURL}road/queryRoadVideoList`, params).then(res => res.data); };

/**
 * 批量下载
 */
export const downLoadZipFile = params => { return axios.get(`${HTTPURL}cam/downLoadZipFile`, {params: params}).then(res => res.data); };

 /**
 * 删除视频
 */
export const removeVideo = params => { return axios.post(`${HTTPURL}cam/removeVideo`, params).then(res => res.data); };

 /**
 * 视频任务列表
 */
export const queryRoadTaskList = params => { return axios.post(`${HTTPURL}road/queryRoadTaskList`, params).then(res => res.data); };
 /**
 * 视频下载
 */
export const redoVideoTask = params => { return axios.post(`${HTTPURL}cam/redoVideoTask`, params).then(res => res.data); };
 /**
 * 新建下载任务
 */
export const roadDownloadTask = params => { return axios.post(`${HTTPURL}road/roadDownloadTask`, params).then(res => res.data); };

/**
 * 感知数据
 */

/**
 * 数据列表
 */
export const findVideoRecords = params => { return axios.post(`${HTTPURL}perception/findVideoRecords`, params).then(res => res.data); };
