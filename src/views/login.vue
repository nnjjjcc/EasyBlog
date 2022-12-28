<template>
  <div class="login-body">
    <div class="bcakground">
      <div class="login-panel">
      <div class="login-title">用户登录</div>
      <el-form :model="formData"
               :rules="rules"
               ref="formDataRef">
        <el-form-item prop="account">
          <el-input placeholder="请输入账号"
                    v-model="formData.account"
                    size="large">
            <template #prefix>
              <span class="iconfont icon-account"></span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input type="password"
                    placeholder="请输入密码"
                    v-model="formData.password"
                    size="large">
            <template #prefix>
              <span class="iconfont icon-password"></span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="checkCode">
          <div class="check-code-panel">
            <el-input placeholder="请输入验证码"
                      v-model="formData.checkCode"
                      class="input-panel"
                      size="large"
                        />
            <img :src="checkCodeUrl"
                 class="check-code"
                 @click="changeCheckCode">
          </div>

        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="formData.rememberMe"
                       :true-label="1">记住我</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button type="primary"
                     :style="{width:'100%'}"
                     @click="login">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
   
  </div>
</template>
  <script setup>
import VueCookies from 'vue-cookies'
import md5 from 'js-md5'
import { getCurrentInstance, reactive, ref } from "vue"
import { useRouter } from 'vue-router'

const { proxy } = getCurrentInstance();//getCurrentInstance()可以用来获取当前组件实例 
const router = useRouter();
//API
const api = {
  checkCode: "api/checkCode",
  login: "/login"
}
//验证码刷新
 //获取到图形验证码的引用对象，为其指明 src 路径，利用时间差，时间一直是在变化的
const checkCodeUrl = ref(api.checkCode);
const changeCheckCode = () => {
  checkCodeUrl.value = api.checkCode + "?" + new Date().getTime();
}

//表单相关
const formDataRef = ref(null);
const formData = reactive({});
//验证 不能为空
const rules = {
  account: [{
    required: true,
    message: "请输入用户名",
  }],
  password: [{
    required: true,
    message: "请输入密码",
  }],
  checkCode: [{
    required: true,
    message: "请输入验证码",
  }]

}
//拿取信息
const init = () => {
  const loginInfo = VueCookies.get("loginInfo");
  if (!loginInfo) {
    return;
  }
  Object.assign(formData, loginInfo);//放入formData对象里

}
init();

const login = () => {
    //validate：对整个表单进行校验的方法，参数为一个回调函数。
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let cookieLoginInfo = VueCookies.get("loginInfo");
    let cookiePassword = cookieLoginInfo == null ? null : cookieLoginInfo.password;

    if (formData.password !== cookiePassword) {
      formData.password = md5(formData.password)
    }
//账号 密码 验证码
    let params = {
      account: formData.account,
      password: formData.password,
      checkCode: formData.checkCode
    }

    let result = await proxy.Request({
      url: api.login,
      params: params,
      errorCallback: () => {
        changeCheckCode();
      }
    })
    if (!result) {
      return;
    }
    proxy.message.success("登录成功");
//登录完了后跳转
    setTimeout(() => {
      router.push("/home")
    }, 1500);
   //用户的信息
    const loginInfo = {
      account: params.account,
      password: params.password,
      rememberMe: formData.rememberMe
    }
    VueCookies.set("userInfo", result.data, 0);
    if (formData.rememberMe == 1) {
      VueCookies.set("loginInfo", loginInfo, "7d")//创建一个从现在起7天后过期的cookie，在整个站点上有效：
    
    }
  });
}
  </script>
  <style lang="scss" >
 .login-body {
width: 1488px;
height: 100%;
margin: 0 0;
padding: 0 0;
 .bcakground{
  width: 100%;
  height: calc(100vh);
  background-size: cover;
  background-position: center;
  background-image: url(../assets/login.jpg);
 }
  .login-panel {
    margin-top: 150px;
    width: 350px;
    float: right;
    margin-right: 100px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 5px;
    box-shadow: 2px 2px 10px #ddd;

    .login-title {
      font-size: 25px;
      text-align: center;
      margin-bottom: 10px;
    }

    .check-code-panel {
      width: 100%;
      display: flex;
      align-items: center;
      .input-panel {
        flex: 1;
        margin-right: 5px;
      }
      .check-code {
        cursor: pointer;
      }
    }
  }
}
  </style>