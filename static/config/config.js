window.config = {
    //望京 内网
    // staticUrl: "http://172.17.1.16:9090/", //静态文件路径
    // url: 'http://172.17.1.16:9091/dataPlatApp/',//数据平台
    // operateUrl: 'http://172.17.1.16:9090/operateApp/',//运营平台
    // downloadUrl: 'http://172.17.1.16:9091/dataPlatApp/cam/download/', //导出&&下载地址
    // websocketUrl:'ws://172.17.1.16:49982/mon',

    //望京 外网
    staticUrl: "http://120.133.21.14:9090/", //静态文件路径
    url: 'http://120.133.21.14:9091/dataPlatApp/',//数据平台
    operateUrl: 'http://120.133.21.14:9090/operateApp/',//运营平台
    downloadUrl: 'http://120.133.21.14:9091/dataPlatApp/cam/download/', //导出&&下载地址
    websocketUrl:'ws://120.133.21.14:49982/mon',

    //测试环境 内网
    // staticUrl: "http://10.0.1.181:9090/", //静态文件路径
    // url: 'http://10.0.1.181:9091/dataPlatApp/',//数据平台
    // operateUrl: 'http://10.0.1.181:9090/operateApp/',//运营平台
    // downloadUrl: 'http://10.0.1.181:9091/dataPlatApp/cam/download/', //导出&&下载地址
    // websocketUrl:'ws://10.0.1.183:49982/mon',

    //上海正式环境  外网
    // staticUrl: "http://116.236.72.204:49090/", //静态文件路径
    // url: 'http://116.236.72.204:49091/dataPlatApp/',//数据平台
    // operateUrl: 'http://116.236.72.204:49090/operateApp/',//运营平台
    // downloadUrl: 'http://116.236.72.204:49091/dataPlatApp/cam/download/', //导出&&下载地址
    // websocketUrl:'ws://116.236.72.206:49982/mon',   //监控

    version: 1.0,       // 版本号
}
//地图默认配置
window.defaultMapOption = {
	center: [121.551976, 31.276054],
	zoom: 17,		// 默认：比例尺显示100m
	resizeEnable: true, //是否监控地图容器尺寸变化
	rotateEnable: true,
	mapStyle: "amap://styles/3312a5b0f7d3e828edc4b2f523ba76d8"
}

window.circleParam = {
    redius:600.0,
    center:[325535.061,3462402.816,13.618],
    color:"#ffffff",
    outline:false,
    outlineColor:"#ff0000",
    opacity:0.5,
    rotate:[0,0,0]
};

