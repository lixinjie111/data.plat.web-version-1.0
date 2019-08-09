let HTTPURL = '',
    operPlatUrl = '';

if(process.env.NODE_ENV == 'development') { // 开发环境
    HTTPURL = window.config.url;
    operPlatUrl = window.config.operPlatUrl;
}else {
    HTTPURL = window.config.url;
    operPlatUrl = window.config.operPlatUrl;
}

export {
    HTTPURL,
    operPlatUrl
}
