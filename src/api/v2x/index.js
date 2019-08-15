// import axios from 'axios';
import {HTTPURL,operPlatUrl} from '../requestUrl';

/**
 * bsm数据
 */

 /**
 * 数据列表
 */
export const findBSMList = params => { return axios.post(`${HTTPURL}v2x/findBSMList`, params).then(res => res.data); };


/**
 * event数据
 */

/**
 * 数据列表
 */
export const findEventList = params => { return axios.post(`${HTTPURL}v2x/findEventList`, params).then(res => res.data); };


/**
 * rsm数据
 */

/**
 * 数据列表
 */
export const findRsmPage = params => { return axios.post(`${HTTPURL}v2x/findRsmPage`, params).then(res => res.data); };


/**
 * rsi数据
 */

/**
 * 数据列表
 */
export const findRsiPage = params => { return axios.post(`${HTTPURL}v2x/findRsiPage`, params).then(res => res.data); };