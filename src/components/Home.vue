<template>
    <div class="yk-home">
        
        <!-- <div class="yk-home-head">
           
        </div> -->
        <div class="yk-home-body">            
            
            <img class="yk-home-ico" src="static/images/home.png">
        
            <!-- <div class="yk-friendly-link">
                <div class="yk-block" @click="clickFn('www');">
                    <img class="ico" src="static/icon/www.png">
                    <div class="title">启迪云控官网</div>
                </div>
               
                <div class="yk-block" @click="clickFn('dmc');">
                    <img class="ico" src="static/icon/statics4.png">
                    <div class="title">云控基础平台</div>
                </div>
                
                <div class="yk-block" @click="clickFn('data-manage');">
                    <img class="ico" src="static/icon/data-manage2.png">
                    <div class="title">数据管理平台</div>
                </div>
                <div class="yk-block" @click="clickFn('ota');">
                    <img class="ico" src="static/icon/ota.png">
                    <div class="title">ota管理系统</div>
                </div>                                
                
            </div> -->
        </div>
        <div class="yk-home-footer">
            <ul class="yk-friendly">
                <li>
                    <img class="ico" src="static/icon/www.png">
                    <span class="title" @click="clickFn('www');">启迪云控官网</span>
                </li>
                <li>
                    <img class="ico" src="static/icon/statics4.png">
                    <span class="title" @click="clickFn('dmc');">云控基础平台</span>
                </li>
                <li>
                    <img class="ico" src="static/icon/operate-manage2.png">
                    <span class="title" @click="clickFn('operate-manage2');">运营管理平台</span>
                </li>
                <li>
                    <img class="ico" src="static/icon/ota.png">
                    <span class="title"  @click="clickFn('ota');">ota管理系统</span>
                </li>
            </ul>
           <!-- 启迪云控（北京）科技有限公司 -->
        </div>

    </div>
</template>
<script>
export default {
    data(){
        return{

        }
    },
    methods: {
        clickFn(type){
            switch(type){
                case 'www':
                    window.open('http://www.tusvn.com/');
                    break;
                case 'www-mobile':
                    window.open('http://m.tusvn.com/');
                    break;
                case 'dmc':
                    window.open('http://10.0.1.36:8003/dmc/');
                    break;
                case 'operate-manage1':
                    window.open('http://10.0.1.36:8003/tusvn/');
                    break;
                case 'operate-manage2':
                    window.open('http://10.0.1.36:8003/operationPlatform/');
                    break;
                case 'shanghai':
                    window.open('http://10.0.1.36:8003/simulation/');
                    break;
                case 'suzhou':
                    window.open('http://10.0.1.36:8003/simulation.sz');
                    break;
                case 'ota':
                    window.open('http://10.0.1.36:8003/ota/');
                    break;
                case 'car':
                    window.open('http://10.0.1.36:8003/car/');
                    break;
                case 'data-manage':
                    window.open('http://10.0.1.36:8003/video/');
                    break;
                case 'car-manage':
                    window.open('http://10.0.1.36:8003/carManage/');
                    break;
                case 'telematics':
                    window.open('http://10.0.1.36:8003/telematics');
                    break;
                case 'roadSystem':
                    window.open('http://10.0.1.36:8003/roadSystem');
                    break;
            }
            
        }
    }
}
</script>
<style scoped>
.yk-home{
    text-align: left;
    overflow-y: auto;
}
.yk-home-head{
    font-size: 30px;
}
.yk-home-body{
    /* padding: 30px; */
    /* height: 100%; */
    /* height: 100%;*/
    /* position: relative;  */
}
.yk-home-body .yk-block{
    background: #fff;
    padding: 5px 10px;
    border-radius: 5px;
    margin: 5px;
    cursor: pointer;
    height: 20px;
}
.yk-home-body .ico{
    margin: 0px;
    height: 20px;
}
.yk-home-body .title{
    display: inline-block;
    vertical-align: top;
    color: #00C1DE;
}
.yk-home-body .yk-friendly-link{
    left: 0px;
    right: 0px;
    bottom: 60px;
    position: absolute;
    padding: 20px;
}
.yk-home-footer{
    left: 0px;
    bottom:0px;
    right: 0px;
    position:absolute;
    height: 60px;
    line-height: 60px;
    background: #fff;
    text-align: center;
    padding-right: 30px;
    color: #35404F;
    font-size: 16px;
}

.yk-friendly{
    list-style: none;
    /* display: inline-block; */
    /* display: block;
    float:left; */
    height: 20px;
    line-height: 20px;
    
    margin-left: 30px;
    margin-top: 20px;
    clear: both;
}
.yk-friendly li{
    display: inline-block;
    height: 20px;
    line-height: 20px;
    border-right: 1px solid #00C1DE;
    padding: 0px 10px;
    font-size: 14px;
}
.yk-friendly li:last-child{
    border-right: 0px;
}

.yk-friendly .ico{
    width: 18px;
    display: inline-block;
    vertical-align: top;
}
.yk-friendly .title{
    display: inline-block;
    vertical-align: top;
    cursor: pointer;
    color: #00C1DE;
}

.yk-home-ico{
    width: 1004px;
}
</style>
