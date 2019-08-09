<template>
    <div class="c-wrapper-20">
        <el-table 
            class="c-mb-70"
            :data="showDataList"
            v-loading="tableLoading" 
            border
            max-height="724">
            <el-table-column label="序号" type="index" :index='indexMethod'></el-table-column>
            <el-table-column min-width="25%" label="版本号" prop="versionNum"></el-table-column>
            <el-table-column min-width="75%" label="功能变更">
                <template slot-scope="scope">
                    <div class="logs-list c-text-left" v-for="(item, index) in scope.row.powerChange" :key="index">
                        <p class="logs-title">{{index+1}}. {{item.title}}</p>
                        <ul class="logs-list-inner">
                            <li class="logs-text" v-for="(subItem, subIndex) in item.list" :key="subIndex">{{subIndex+1}}) {{subItem}}</li>
                        </ul>
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <div class="c-page clearfix">
            <el-pagination
                background
                @current-change="changePageCurrent" 
                :current-page="pageOption.page" 
                :total="pageOption.total"
                @size-change="changePageSize"
                :page-sizes="[10,20,50,100,200]" 
                :page-size="pageOption.size"
                layout="total, sizes, prev, pager, next">
            </el-pagination>
        </div>
    </div>
</template>

<script>
import Logs from "../../../../static/logs/logs"
export default {
    name: 'Logs',
    data () {
        return {
            tableLoading: false,
            pageOption: {
                size: 10,
                total: Logs.length,
                page: 1     //从1开始
            },
            listData: Logs,
            showDataList: []   
        }
    },
    mounted() {
        this.initShowData();
    },
    methods: {
        changePageSize(value) {//每页显示条数变更
            this.pageOption.page = 1;
            this.pageOption.total = Logs.length;
            this.pageOption.size = value;
            this.initShowData();
        },
        changePageCurrent(value) {//页码变更
            this.pageOption.page = value;
            this.initShowData();
        },
        indexMethod(index){
            return index + this.pageOption.size * (this.pageOption.page-1) + 1;
        },
        initShowData() {
            let _index = this.pageOption.page-1;
            let _handleList = Object.assign([], this.listData);
            this.showDataList = _handleList.splice(_index*this.pageOption.size, this.pageOption.size);
        }
    }
}
</script>
<style scoped lang="scss">
.logs-list {
    padding: 10px 50px;
    line-height: 30px;
    .logs-list-inner {
        padding-left: 15px;
    }
}
</style>