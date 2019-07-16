<template>
    <modal-panel ref="refBatchImportModel" :title="title" :panel-size="panelSize" @ModalEvent="okFn">
        <div class="yk-form-block">
            <div class='yk-input-label'>
                <label>模板下载：</label>
            </div>                
            <!-- <span class="yk-btn" @click="downTemplate();">下载</span> -->
            <img class="yk-img-btn yk-template" src="static/icon/download2.png" title="模板" alt="模板" @click="downTemplate();">
            <!-- <span class="yk-btn" @click="downTemplate();">下载</span> -->
        </div>
        <div class="yk-form-block">
            <div class='yk-input-label'>
                <label>上传路径：</label>
            </div>                
            <input class="yk-input-file" autocomplete="off" readonly v-model="fileName" :title="fileName">
                   
            <label class="yk-btn" title="选择文件" for="xFile">选择文件</label> 
            <form>
                <input class="yk-file" type="file" id="xFile" @change="selectFile">
            </form>  
        </div>
    </modal-panel>
</template>
<script>
import ModalPanel from '@/common/view/Modal.vue'

export default {
    name: 'BatchImport',
    components: {
        ModalPanel,
    },
    props: ['type'],
    data(){
        return {
            title: '批量导入',
            panelSize: 450,
            fileName: '',
        }
    },
    methods: {
        show(){
            this.$refs.refBatchImportModel.show();
        },
        selectFile(e){
                let file = e.target.files[0];  
                this.fileName = file.name;
                this.param = new FormData(); //创建form对象  
                this.param.append('upfile',file);//通过append向form对象添加数据              
                // console.log('upload --------------- ' + this.param.get('upfile')); //FormData私有类对象，访问不到，可以通过get判断值是否传进去                  
            },
            okFn(){
                if(!this.param) return;

                let config = {  
                    headers:{'Content-Type':'multipart/form-data'}  
                }; //添加请求头

                let url = window.config.url;
                if(this.type == 'term-data-import'){    // 车载终端
                    url = url + 'admin/sys/vehicleTerminal/importVehicleProperty';
                }else if(this.type == 'car-manage'){        // 车辆管理
                    url = url + 'admin/car/import/carinfo';
                }else if(this.type == 'device-manage-import'){      // 设备管理
                    url = url + 'v2x/device/import/deviceInfo';
                }else if(this.type == 'sim-manage'){
                    url = url + '/admin/sim/batchImport';//sim卡管理
                }
                
                axios.post(url,this.param,config)  
                    .then(response=>{  
                        // console.log('文件上传结果 ： -------------- ' + JSON.stringify(response.data) );  
                        this.$emit('BatchImportEvent');

                        let tip1 = {
                            isShow: true,
                            type: 'success',
                            msg: '导入成功 ！'
                        };

                        if(response.data.status != '200'){
                            tip1.msg = '导入失败！'
                        }

                        if(response.data.status == '700'){
                            const fileName = response.data.message;
                            const fUrl = window.config.url + '/temp/' + fileName;
                            window.open(fUrl);
                        }

                        this.$store.dispatch('showPrompt',tip1.msg);
                    }
                ).catch(function (error) {
                    // console.log(error);
                    const tip2 = {
                            isShow: true,
                            type: 'warning',
                            msg: '导入失败  ！' + error
                    };
                    store.dispatch('showPrompt',tip2.msg);
                    // this.$store.dispatch('popPrompt',tip2);
                }) ;
               
            },
            downTemplate(){
                let url = window.config.url;
                if(this.type == 'term-data-import'){
                    url = url + window.config.carTerminalTemplate;
                }else if(this.type == 'car-manage'){
                    url =  url + window.config.carManageTemplate;
                }else if(this.type == 'device-manage-import'){
                    url = url + window.config.deviceManageTemplate;
                }else if(this.type == 'sim-manage'){
                    url = url + window.config.simManageTemplate;
                }
                window.open(url);
            }
    },

}
</script>
<style scoped>
.yk-input-file{
    height: 18px;
    margin-right: 10px;
    cursor: default;
}
.yk-file{
    position: absolute;
    clip: rect(0 0 0 0);
}
.yk-template{
    width: 24px!important;
    margin-left: 20px;
    margin-top: 5px;
}
</style>
