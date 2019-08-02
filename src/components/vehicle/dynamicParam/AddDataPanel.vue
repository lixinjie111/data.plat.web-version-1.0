<template>
<div class="c-wrapper-20">
    <el-tabs v-model="activeName">
        <el-tab-pane label="全集数据" name="first">
            <full-list ref='fullList' :title="panel.title" :type="panel.type" :data="panel.data"></full-list>
        </el-tab-pane>
        <el-tab-pane label="组数据" name="second">
            <group-list ref='groupList' :title="panel.title" :type="panel.type" :data="panel.data"></group-list>
        </el-tab-pane>
    </el-tabs>
    <div class="c-text-center c-mt-20">
        <el-button size="small" type="warning" @click="confirmClick">确定</el-button>
        <el-button size="small" type="warning" plain @click="cancelClick">取消</el-button>
    </div>
</div>
</template>
<script>
import FullList from '@/components/vehicle/dynamicParam/fullList.vue';
import GroupList from '@/components/vehicle/dynamicParam/groupList.vue';
import TList from '@/common/utils/list.js'
import {findPropByGroupId} from '@/api/vehicle';
export default {
    props: {
        title: String
    },
    components:{
        FullList,
        GroupList,
        TList
    },
    data(){
        return {
            activeName: 'first',
            dataList: [],
            groupList:[],
            operPlatUrl:'',
            panel: {
                title: '提示',
                type: '',
                msg: '',
                data:'',
                show: false,
                cfgShow: true,
            }, 
        }
    },
    mounted(){
        this.init();
    },
    methods: {
        init(){
            this.operPlatUrl = window.config.operPlatUrl;
            this.$refs.fullList.initData();
            this.$refs.groupList.initData();
        },
        confirmClick(){
            this.getPropertybyGroupIds(this.$refs.groupList.selector,this.getLocalData);//获取组对应的property
        },
        cancelClick(){
            this.$refs.fullList.selector=[];
            this.$refs.groupList.selector=[];
            this.$emit("init");
        },
        getPropertybyGroupIds(list,callback){
            let ids =[];
            list.forEach(item => {
                ids.push(item.id);
            });
            if(ids.length == 0){
                callback([]);
                return;
            }
            findPropByGroupId({
                'ids':ids
            }).then(res => {
                // if(res.status == '200'){
                    callback(res);
                // }
            })
        },
        getLocalData(listGroupProperty){
            let list = [];
            TList.pushNoRepeat(list,this.$refs.fullList.selector);
            TList.pushNoRepeat(list,this.$refs.groupList.selector);
            console.log(list);
            this.isShow=false;
            this.$emit("loadData",list);
        }
    }
}
</script>
