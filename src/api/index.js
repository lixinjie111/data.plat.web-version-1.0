import axios from 'axios'
// import queryString from 'querystring';

// import cfg from '@/common/cfg.js'
import store from '@/store/index.js'

let http = axios.create({
  baseURL: cfg.url,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
    // 'Content-Type': 'application/x-www-form-urlencoded'
    // ,
    // 'Content-Type': 'application/x-www-urlencoded;charset=UTF-8',
    // 'Access-Control-Allow-Origin': '*'
  },
  responseType: 'json',
  // ,"Access-Control-Allow-Methods":"PUT,POST,GET,DELETE,OPTIONS"
  transformResponse: [function(data) { //后端发送过来的数据
    // console.log('transformResponse' + data);
    return data;
  }],
  transformRequest: [function(data) {
    // console.log('transformRequest  data : ' + data);

    return data;
    // let newData = '';
    // for (let k in data) {
    //     if (data.hasOwnProperty(k) === true) {
    //         newData += encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) + '&';
    //     }
    // }
    // newData = newData.slice(0, newData.length - 1);
    // console.log('transformRequest  newData : ' + newData);
    // return newData;
  }]
});

function apiAxios(method, url, params, response,isLoading=true) {

  params = JSON.stringify(params);

  // params = queryString.stringify(params);
  // console.log('queryString.stringify(params) : ' + params);

  // const random = new Date().getTime();
  // url = url + '?random=' + random;

  if(isLoading){
    // store.dispatch('popLoading',true);
    // store.dispatch('showLoading');
    // requestOverTime();
  }

  // const random = "?random=" + Math.round(Math.random() * 1000000);



  // 判断url是否包含?
  // const index = url.indexOf('?');
  // if(index > -1){
  //     url.splice(index,1,random)
  // }else{
  //     url = url + random;
  // }

  // console.log('apiAxios ----2222222------ ' + url + ' --- random ' + random);


  http({
    method: method,
    url: url,
    data: method === 'POST' || method === 'PUT' ? params : null,
    params: method === 'GET' || method === 'DELETE' ? params : null
  }).then(function(res) {
    // console.log('success !!! ------------- ' + res.status);
    response(res);

    if(isLoading){
      // store.dispatch('popLoading',false);
      store.dispatch('hideLoading');
    }

  }).catch(function(err) {
    console.log('fail !!! --------------- ' + err);
    response(err);

    // if(isLoading){
    //   // store.dispatch('popLoading',false);
    //   store.dispatch('hideLoading');
    // }
  });
}

/**
 * 请求超时，停止loading
 */
function requestOverTime(){

  let timer = setTimeout(() => {
    if(store.state.action.isLoading){
      store.dispatch('showPrompt','请求超时！');
      store.dispatch('hideLoading');
    }
    clearTimeout(timer);
    timer = null;
  }, 5000);
}

function downloadFile(url,params){
  axios.post(cfg.url + url, params, {
    responseType: 'blob'
  }).then(res => {
    // console.log('res ----downloadFile-------- ' + res + ' ----------- : ' + JSON.stringify(res))

    if (res.data) {
      if ('msSaveBlob' in navigator) { // 对IE和Edge的兼容
        window.navigator.msSaveBlob(res.data, decodeURI(res.headers['content-disposition'].split('filename=')[1]))
      } else {
        let blob = res.data

        // console.log('res.data ----------- ' + JSON.stringify(res))

        let a = document.createElement('a');
        a.setAttribute('id','exportLog');
        a.style.display = 'none'

        // let a = document.getElementById('exportLog')
        let url = window.URL.createObjectURL(blob)

        let filename = decodeURI(res.headers['content-disposition'].split('filename=')[1])
        // let filename = 'car_' + (new Date()).getTime() + '.txt';
        // let filename = 'filename.txt';

        var evt = document.createEvent('HTMLEvents') // 对firefox的兼容
        evt.initEvent('click', false, false) // 对firefox的兼容
        a.href = url
        a.download = filename
        a.dispatchEvent(evt) // 对firefox的兼容
        a.click()
        window.URL.revokeObjectURL(url)
      }
    }
  })

}

export default {
  get: function(url, params, response) {
    return apiAxios('GET', url, params, response);
  },
  post: function(url, params, response,isLoading=true) {
    return apiAxios('POST', url, params, response,isLoading);
  },
  // post: function(url, params, response) {
  //     return apiAxios('POST', url, params, response);
  // },
  put: function(url, params, response) {
    return apiAxios('PUT', url, params, response);
  },
  delete: function(url, params, response) {
    return apiAxios('DELETE', url, params, response);
  } ,
  download: function(url,params){
    console.log(url);
    console.log('download ----------------');
    // return downLoadApiAxios222(url,params);
    // return downLoadApiAxios(url,params);
    return downloadFile(url,params);
  }
}
