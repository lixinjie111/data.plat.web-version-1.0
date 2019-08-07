<template>
    <!-- 系统管理 -->
    <div>
        <h3 class="c-title">{{ current.menu }}</h3>
        <router-view></router-view> 
    </div>
</template>
<script>
import LeftBar from '@/components/layout/LeftBar.vue'

import { Utils } from '@/common/utils/utils.js'

export default {
    name: 'SystemManage',
    components: {
        LeftBar,
    },
    data(){
        return {
            current: {
                menu: null,
            }
        }
    },
    methods: {

    },
    mounted(){

    },
    beforeDestroy(){

    },
    beforeRouteEnter (to, from, next) {
      
        let url = to.path;
        
        next( vm => {            
            vm.$router.push(url);
            vm.current.menu = Utils.setBreadCrumbs(url);            
        })
        
    },
    beforeRouteUpdate(to, from, next){
        
        next( vm => {
            vm.$router.push(to.path);
        })

        this.current.menu = Utils.setBreadCrumbs(to.path);
        
    }
}
</script>
<style>
    
</style>

