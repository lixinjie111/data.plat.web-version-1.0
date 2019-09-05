import axios from 'axios';
import {OPERATEURL} from '../requestUrl';

/**
 * 登录
 */
export const requestLogin = params => { return axios.post(`${OPERATEURL}openApi/user/login`, params).then(res => res.data); };
/**
 * 退出登录
 */
export const requestLogout = params => { return axios.post(`${OPERATEURL}openApi/user/logout`, params).then(res => res.data); };
/**
 * 修改密码
 */
export const requestPasswd = params => { return axios.post(`${OPERATEURL}openApi/user/passwd`, params).then(res => res.data); };


