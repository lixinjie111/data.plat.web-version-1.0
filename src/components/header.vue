<template>
<div id="header">
    <div class="logo">
        <img src="@/assets/images/logo.png" class="logo-img c-vertical-middle"/>
        <em class="name c-vertical-middle"></em>
    </div>
    <div class="userinfo">
        <el-dropdown trigger="hover">
            <span class="el-dropdown-link userinfo-inner">
                <i class="icon iconfont el-icon-mc-yonghuzhongxin_f c-vertical-middle"></i>
                <em class="name c-vertical-middle">{{sysAdminName}}</em>
            </span>
            <el-dropdown-menu slot="dropdown">
                <el-dropdown-item divided @click.native="logout">登出</el-dropdown-item>
            </el-dropdown-menu>
        </el-dropdown>
    </div>
</div>
</template>
<script>
import { mapActions } from 'vuex';
export default {
    name: "HeaderBar",
    data() {
        return {
            sysAdminName: this.$store.state.admin.adminName
        }
    },
    methods: {
        ...mapActions(['goLogOut']),
        //退出登录
        logout: function() {
            this.$confirm('确认退出吗?', '提示', {
            }).then(() => {
                this.goLogOut(this).then(res => {
                    this.$router.push({ path: '/' });
                });
            }).catch(err => {
                console.log("取消退出！");
            });
        }
    }
}
</script>
<style lang="scss" scoped>
@import "@/assets/scss/theme.scss";
#header {
    background: #1a1d20;
    position: relative;
    padding: 11px 20px;
    height: 28px;
    @include layoutMode(between);
    .userinfo {
        .userinfo-inner {
            cursor: pointer;
            color: #999;
            .icon {
                font-size: 28px;
                line-height: 28px;
                margin-right: 10px;
            }
        }
    }
    .logo {
        overflow: hidden;
        .logo-img {
            height: 25px;
            margin-right: 10px;
        }
        .name {
            font-size: 20px;
            color: #fff;
        }
    }
}
</style>
