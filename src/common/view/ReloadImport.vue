<template>
    <modal-panel ref="reloadImportModel" :title="title" :panel-size="panelSize" @ModalEvent="okFn">
        <div class="yk-form-block">
            <div class='yk-input-label'>
                <label style="text-align:center;">是否重新下载?</label>
            </div>                
        </div>
    </modal-panel>
</template>
<script>
import ModalPanel from '@/common/view/Modal.vue'

export default {
    name: 'ReloadImport',
    components: {
        ModalPanel,
    },
    props: ['type'],
    data(){
        return {
            title: '重新下载',
            panelSize: 450,
            fileId: '',
        }
    },
    methods: {
        init(val){
            this.fileId = val.fileName;
        },
        show(){
            this.$refs.reloadImportModel.show();
        },
        okFn(){
           this.$refs.reloadImportModel.hide();
           this.$emit('reLoad',this.fileId)
        },
    },
    
}
</script>
<style scoped>

</style>
