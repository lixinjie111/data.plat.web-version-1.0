let HTTPURL = '',
    OPERATEURL = '';

if(process.env.NODE_ENV == 'development') { // 开发环境
    HTTPURL = window.config.url;
    OPERATEURL = window.config.operateUrl;
}else {
    HTTPURL = window.config.url;
    OPERATEURL = window.config.operateUrl;
}

export {
    HTTPURL,
    OPERATEURL
}
