<template>
    <div>
        <real-data></real-data>
    </div>
</template>
<script>
    import RealData from '@/components/v2x/realMonitor/RealData.vue'
    export default {
        components: {
            RealData
        },
        data(){
            return {
                map: {
                    id: 'v2x',
                    layerId: 'v2xLayer',
                    width: 100,
                    height: 600,
                }
            }
        }
    }
</script>
<style>

</style>
