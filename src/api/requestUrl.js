// 引入全局配置文件
import '../../static/config/cfg.js';

let HTTPURL = '',
    operPlatUrl = '',
    websocketUrl = '';

if(process.env.NODE_ENV == 'development') { // 开发环境
    HTTPURL = window.config.url;
    operPlatUrl = window.config.operPlatUrl;
    websocketUrl = window.config.websocketUrl;
}else {
    HTTPURL = window.config.url;
    operPlatUrl = window.config.operPlatUrl;
    websocketUrl = window.config.websocketUrl;
}

export {
    HTTPURL,
    operPlatUrl,
    websocketUrl
}
