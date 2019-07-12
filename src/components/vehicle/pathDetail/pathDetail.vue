<template>
<!-- 基本信息 -->
    <div class="yk-container">
        <div v-show="!panel.show && !panel.cfgShow" class="yk-container"> 
            <div class="yk-btn-box yk-right yk-b-10">
                <span class="yk-btn" @click="addTask();">导出轨迹数据</span>
            </div>
            <div class="yk-search-box" style="padding-left:6px;">                
                    
                    <div class="yk-search-block">
                        <label>车牌号：</label>
                        <span></span>
                    </div>   
                    <div class="yk-search-block">
                        <label class="yk-w-60">行程开始时间:</label>
                        <span></span>
                    </div>
                    <div class="yk-search-block">
                        <label class="yk-w-50">行程结束时间: </label>
                        <span></span>
                    </div>                
                    <div class="yk-search-block">
                        <label class="yk-w-50 colGrap">行驶里程: </label>
                        <span></span>
                    </div>   
                    <div class="yk-search-block">
                        <label class="yk-w-50 colGrap">行驶时长: </label>
                        <span></span>
                    </div>     
                    
                </div>
            </div>
    </div> 
</template>
