import axios from 'axios';
import {HTTPURL,operPlatUrl} from '../requestUrl';

/**
 * 登录
 */
export const requestLogin = params => { return axios.post(`${HTTPURL}admin/sys/user/login`, params).then(res => res.data); };
/**
 * 退出登录
 */
export const requestLogout = params => { return axios.post(`${operPlatUrl}sys/user/logout`, params).then(res => res.data); };
/**
 * 修改密码
 */
export const requestPasswd = params => { return axios.post(`${operPlatUrl}sys/user/passwd`, params).then(res => res.data); };


