<template>
    <div id="promptPanel" class="yk-panel" :class="box.css">        
        <div class="yk-panel-msg">
             {{ $store.state.action.msg }}
        </div>
        <div class="yk-panel-btn">
            <span class="yk-btn-min" @click="closeClick();"> × </span>
        </div>
    </div>
</template>
<script>
export default {
    name: 'PromptPanel',
    props: ['title','type','msg'],
    data(){
        return {
            size: {
                width: 420,
                height: 136,
            },            
            box: {
                css: 'yk-primary',
            },
        }
    },
    methods: {
        init(){
            this.hide();
        },
        show(){
            this.box.css = 'yk-show';
            
        },
        hide(){
            // this.box.css = 'yk-hide';
            let timer = setTimeout(() => {
                this.closeClick();
                clearTimeout(timer);
                timer = null;
            }, 2000);
        },
        closeClick(){
            // this.init();            
            this.$store.dispatch('hidePrompt');
        },
        
    },
    mounted(){
        // this.init();
        // console.log('------------- prompt mounted !!!')
        this.hide();

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

.yk-panel{
    height: 64px;
    text-align: center;
}

.yk-panel-msg{
    text-align: center;
    width: 100%;
    height: 64px;
    line-height: 64px;
    font-family: 'MicrosoftYaHei';
    font-size: 18px;
    color: #fff;
}
.yk-panel-btn{
    right: 10px;
    bottom: 15px;
    position: absolute;
    text-align: right;
}
.yk-panel-btn span{
    font-family: 'MicrosoftYaHei';
    font-size: 24px;
    font-weight: 900;
    color: #fff;
}

.yk-panel-btn span:hover{
    color: rgb(186, 197, 197);
}

.yk-default{
    background: #fff;
}
.yk-primary{
    background: rgb(44, 68, 88);
}
.yk-success{
    background: #DFF0D8;
}
.yk-info{
    background: #D9EDF7;
}
.yk-warning{
    background: #FCF8E3;
}
.yk-danger{
    background: #F2DEDE;
}
</style>


