// import axios from 'axios';
import {HTTPURL,operPlatUrl} from '../requestUrl';

/**
 *车辆数据
 */


/**
 * 轨迹数据
 */

/**
 * 轨迹列表
 */
export const queryPathList = params => { return axios.post(`${HTTPURL}vehicle/path/list`, params).then(res => res.data); };

/**
 * 轨迹详情
 */
export const pathDetailList = params => { return axios.post(`${HTTPURL}vehicle/path/detail/list`, params).then(res => res.data); };

/**
 * 导出轨迹数据
 */
export const exportExcel = params => { return axios.post(`${HTTPURL}common/exportExcel`, params).then(res => res.data); };

/**
 * 导出全部轨迹数据
 */
export const exportPathExcel = params => { return axios.post(`${HTTPURL}vehicle/path/detail/export`, params,{
    responseType: 'blob'
  }).then(res => res); };


/**
 * can数据
 */

/**
 * 数据列表
 */
export const queryList = params => { return axios.post(`${HTTPURL}dynamic/realTime/list`, params).then(res => res.data); };


/**
 * 动态参数
 */

/**
 * 数据列表
 */
export const dynamicParamList = params => { return axios.post(`${HTTPURL}dynamic/event/list`, params).then(res => res.data); };

/**
 * 组数据列表
 */
export const findPropByGroupId = params => { return axios.post(`${operPlatUrl}vehicleTerminal/remote/findPropByGroupId`, params).then(res => res.data); };

/**
 * 详情
 */
export const getDetatilList = params => { return axios.post(`${HTTPURL}dynamic/event/data/list`, params).then(res => res.data); };

/**
 * 全集数据
 */
export const findVehicleProperty = params => { return axios.post(`${operPlatUrl}vehicleTerminal/v2/remote/findVehicleProperty`, params).then(res => res.data); };

/**
 * 本地组数据
 */
export const findVehicleGroup = params => { return axios.post(`${operPlatUrl}vehicleTerminal/v2/remote/findVehicleGroup`, params).then(res => res.data); };

/**
 * 提交本地数据
 */
export const submitForm = params => { return axios.post(`${HTTPURL}dynamic/vehicle/condition/submit`, params).then(res => res.data); };
