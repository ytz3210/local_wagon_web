<template>
  <div class="user-wrapper" :class="theme">

    <!--    <span class="action">-->
    <!--      <a class="logout_title" target="_blank" href="http://jeecg-boot.mydoc.io">-->
    <!--        <a-icon type="question-circle-o"></a-icon>-->
    <!--      </a>-->
    <!--    </span>-->
    <!--    <header-notice class="action"/>-->
    <a-dropdown>
      <span class="action action-full ant-dropdown-link user-dropdown-menu">
        <a-avatar class="avatar" size="small" :src="getAvatar()"/>
          <span v-if="isDesktop()">欢迎您，{{ nickname() }}</span>
      </span>
      <a-menu slot="overlay" class="user-dropdown-menu-wrapper">
        <a-menu-item key="0">
          <router-link :to="{ name: 'account-center' }">
            <a-icon type="user"/>
            <span>个人中心</span>
          </router-link>
        </a-menu-item>
        <a-menu-item key="1">
          <router-link :to="{ name: 'account-settings-base' }">
            <a-icon type="setting"/>
            <span>账户设置</span>
          </router-link>
        </a-menu-item>
        <a-menu-item key="2" @click="updatePassword">
          <a-icon type="setting"/>
          <span>密码修改</span>
        </a-menu-item>
        <!-- <a-menu-item key="2" disabled>
           <a-icon type="setting"/>
           <span>测试</span>
         </a-menu-item>
         <a-menu-divider/>
         <a-menu-item key="3">
           <a href="javascript:;" @click="handleLogout">
             <a-icon type="logout"/>
             <span>退出登录</span>
           </a>
         </a-menu-item>-->
      </a-menu>
    </a-dropdown>
    <span class="action">
      <a class="logout_title" href="javascript:;" @click="handleLogout">
        <a-icon type="logout"/>
        <span v-if="isDesktop()">&nbsp;退出登录</span>
      </a>
    </span>
    <user-password ref="userPassword"></user-password>
  </div>
</template>

<script>
  import HeaderNotice from './HeaderNotice'
  import UserPassword from './UserPassword'
  import { mapActions, mapGetters } from 'vuex'
  import { mixinDevice } from '@/utils/mixin.js'
  import {Axios} from 'axios'
  export default {
    name: 'UserMenu',
    mixins: [mixinDevice],
    data() {
      return {
        departLater: 0,
        arrive: 0,
        overspeed: 0,
        signin: 0,
        parkTimeout: 0
      }
    },
    components: {
      HeaderNotice,
      UserPassword
    },
    props: {
      theme: {
        type: String,
        required: false,
        default: 'dark'
      }
    },
    methods: {
      ...mapActions(['Logout']),
      ...mapGetters(['nickname', 'avatar', 'userInfo']),
      getAvatar() {
        console.log('url = ' + window._CONFIG['imgDomainURL'] + '/' + this.avatar())
        return window._CONFIG['imgDomainURL'] + '/' + this.avatar()
      },
      handleLogout() {
        const that = this

        this.$confirm({
          title: '提示',
          content: '真的要注销登录吗 ?',
          onOk() {
            return that.Logout({}).then(() => {
              window.location.href = '/'
              //window.location.reload()
            }).catch(err => {
              that.$message.error({
                title: '错误',
                description: err.message
              })
            })
          },
          onCancel() {
          }
        })
      },
      updatePassword() {
        let username = this.userInfo().username
        this.$refs.userPassword.show(username)
      },
      getCount(){
        Axios.get("url").then(response=>{

        })
      }
    },
    mounted() {
      //定时向后端发送请求
      // this.timer = setInterval(this.getCount,1000)
    },
  }
</script>

<style scoped>
  .ui {
    margin-top: 4.5%;
  }

  .logout_title {
    color: inherit;
    text-decoration: none;
  }
</style>