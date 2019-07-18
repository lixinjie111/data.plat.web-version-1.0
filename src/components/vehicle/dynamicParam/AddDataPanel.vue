<template>
<div class="c-wrapper-20" v-show="isShow">
    <!-- <el-tabs v-model="activeName">
        <el-tab-pane label="全集数据" name="first">
            <full-list ref='fullList'  :title="panel.title" :type="panel.type" :data="panel.data"></full-list>
        </el-tab-pane>
        <el-tab-pane label="组数据" name="second">
            <group-list ref='groupList' :title="panel.title" :type="panel.type" :data="panel.data"></group-list>
        </el-tab-pane>
    </el-tabs>
    <div class="c-text-center c-mt-30">
        <el-button size="small" type="warning" @click="confirmClick">确定</el-button>
        <el-button size="small" type="warning" @click="cancelClick">取消</el-button>
    </div> -->
    <el-tabs v-model="activeName">
        <el-tab-pane label="全集数据" name="first">
            <full-list ref='fullList'  :title="panel.title" :type="panel.type" :data="panel.data"></full-list>
        </el-tab-pane>
        <el-tab-pane label="组数据" name="second">
            <group-list ref='groupList' :title="panel.title" :type="panel.type" :data="panel.data"></group-list>
        </el-tab-pane>
    </el-tabs>
    <div class="c-text-center c-mt-30">
        <el-button size="small" type="warning" @click="confirmClick">确定</el-button>
        <el-button size="small" type="warning" @click="cancelClick">取消</el-button>
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
            isShow:true,
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
    methods: {
        init(){
            this.isShow=true;
            this.operPlatUrl = window.config.operPlatUrl;
            this.$refs.fullList.initData();
            this.$refs.groupList.initData();
        },
        confirmClick(){
            this.getPropertybyGroupIds(this.$refs.groupList.selector.list,this.getLocalData);//获取组对应的property
        },
        cancelClick(){
            this.$refs.fullList.selector.list=[];
            this.$refs.groupList.selector.list=[];
            this.isShow=false;
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
                if(res.status == '200'){
                    callback(res.data);
                }
            })
        },
        getLocalData(listGroupProperty){
            let list = [];
            TList.pushNoRepeat(list,this.$refs.fullList.selector.list);
            TList.pushNoRepeat(list,listGroupProperty);

            this.isShow=false;
            this.$emit("loadData",list);
        }
    },
    mounted(){
    }
}
</script>
<style scoped>
.yk-b-30{
    margin-top: 10px;
    margin-bottom: 30px;
}
.yk-r-30{
    margin-right: 30px;
}
.yk-bgcolor-white{
    background: #fff;
}
.yk-min-300{
    min-height: 300px;
}
.yk-b-border{
    border-bottom: 1px dashed #d5e1e2;
}
.yk-t-10{
    margin-top: 10px;
}
.yk-270{
    width: 246px;
    float: left;
}
.yk-input-200{
    width: 168px;
    display: inline-block;
    vertical-align: top;
    text-align: left;
    float:left;
    margin-left:5px;
}
.yk-label-65{
    display: inline-block;
    width: 65px;
    text-align: right;
    float:left;
}
.mt15{
    margin-top:15px;
}
.changBtn{
    cursor: pointer;
}
.on{
    color:#00c1de;
}
</style>

