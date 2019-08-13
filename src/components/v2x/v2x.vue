<template>
    <!-- 车载视频管理 -->
    <div>        
        <h3 class="c-title">{{ current.menu }}</h3>
        <router-view></router-view> 
    </div>

</template>
<script>
import { Utils } from '@/common/utils/utils.js'

export default {
    name: 'v2x',
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
        next( vm => {            
            vm.current.menu = Utils.setBreadCrumbs(to.path);
        })
    },
    beforeRouteUpdate(to, from, next){
        next();
        this.current.menu = Utils.setBreadCrumbs(to.path);

    }
}
</script>
