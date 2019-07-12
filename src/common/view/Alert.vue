<template>
    <div id="alertPanel" class="yk-alert-box" :class="box.css">        
        <div class="yk-alert" :style="'top:' + position.top + 'px'">                
            <div class="yk-alert-header">
                <span class="yk-alert-title">
                    <!-- 标题： -->
                    {{ title }}
                </span>
                <span class="yk-btn-close" @click="closeClick();"> × </span>
            </div>
            <div class="yk-alert-body">
                <!-- 提示内容！   -->
                {{ msg }}
            </div>
            <div class="yk-alert-footer">
                <span class="yk-btn yk-btn-css" @click="okClick();">确定</span>
                <span class="yk-btn yk-btn-css" @click="closeClick();">取消</span>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'AlertPanel',
    props: ['title','type','msg','data'],
    data(){
        return {
            size: {
                width: 420,
                height: 136,
            },
            position: {
                top: -260,
            },
            box: {
                css: '',
            },
        }
    },
    methods: {
        init(){
            this.hide();
        },
        show(){
            this.box.css = 'yk-show';
            this.position.top = 100;    
        },
        hide(){
            this.position.top = -200;
            this.box.css = 'yk-hide';
        },
        closeClick(){
            this.init();
        },
        okClick(){
            this.$emit('AlertEvent',{
                type: this.type,
                data: this.data
            });
            this.init();
        }
    },
    mounted(){
        this.init();
    }
}
</script>
<style scoped>

.yk-show{
    visibility: visible;
}
.yk-hide{
    visibility: hidden;
}
.yk-alert-box{
    position: fixed;
    left: 0;
    top: 0px;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    text-align: center;

    transition: visibility 0.2s;
    -webkit-transition: visibility 0.2s;
    -moz-transition: visibility 0.2s;
    -o-transition: visibility 0.2s;
}
.yk-alert{
    display: inline-block;
    top: 0px;
    left: 0px;
    right: 0px;
    position: absolute;
    margin: 0 auto;
    width: 480px;
    height: 180px;
    padding-bottom: 10px;
    vertical-align: middle;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #ebeef5;
    font-size: 18px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    text-align: left;
    overflow: hidden;
    backface-visibility: hidden;
    opacity: 1;

    transition: top  0.6s;
    -moz-transition: top  0.6s;
    -webkit-transition: top  0.6s;
    -o-transition: top 0.6s;
}
.yk-alert-header{
    position: relative;
    padding: 15px;
    border-bottom: 1px solid #f6f0f0
}
.yk-alert-body{
    position: relative;
    padding: 10px 15px;
    height: 60px;
    font-family: 'MicrosoftYaHei';
    font-size: 15px;
    color: #606266;
}
.yk-alert-footer{
    padding: 15px;
    text-align: right;
    border-top: 1px solid #f6f0f0
}
.yk-btn-ok{
    font-size: 16px;
    background:#3d86ff!important;
    color:#ffffff!important;
}
.yk-btn-ok:hover{
    font-size: 16px;
    background:#3c75d1!important;
    color:#ffffff!important;
}
.yk-btn-cancel{
    font-size: 16px;
    background: #a3a3a3!important;
    color:#ffffff!important;
}
.yk-btn-cancel:hover{
    font-size: 16px;
    background: #8b8a8a!important;
    color:#ffffff!important;
}
.yk-btn-css{
    font-size: 15px;
}
.yk-btn-close{
    font-size: 20px;
    font-family: 'MicrosoftYaHei';
    font-weight: 900;
    color: #000;
    margin-right: 3px;
    float: right;
    cursor: pointer;
}
.yk-btn-close:hover{
    color: #33CDE5;
    /* color: rgb(14, 70, 236); */
}
.yk-alert-title{
    font-family: 'MicrosoftYaHei';
    font-size: 18px;
    font-weight: 500;
    user-select: none;
}
</style>


