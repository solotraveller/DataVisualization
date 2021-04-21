import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import * as echarts from "echarts";
import axios from "axios";

import "./assets/css/global.css";
import "./assets/font/iconfont.css";
import SocketService from "./utils/socketService";

axios.defaults.baseURL = "http://127.0.0.1:3000/api";

// 连接服务端WebSocket
SocketService.Instance.connent();
Vue.prototype.$socket = SocketService.Instance;

Vue.prototype.$http = axios;
Vue.prototype.$echarts = echarts;

Vue.config.productionTip = false;

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount("#app");
