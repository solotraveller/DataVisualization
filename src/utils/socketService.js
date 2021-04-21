export default class SocketService {
    static instance = null;
    static get Instance() {
        if (!this.instance) {
            this.instance = new SocketService();
        }
        return this.instance;
    }

    // 是否连接成功
    connectFlag = false;
    // 重连的次数
    sendRetryCount = 0;

    // 连接服务器 websocket的端口，不是koa的端口
    ws = null;
    connent() {
        if (!window.WebSocket) {
            return console.log("您的浏览器不支持WebSocket");
        }
        this.ws = new WebSocket("ws://localhost:3001");

        this.ws.onopen = () => {
            this.connectFlag = true;
            this.sendRetryCount = 0;
            console.log("服务端连接成功");
        };

        this.ws.onclose = () => {
            console.log("服务端连接失败");
            this.connectFlag = false;
            this.sendRetryCount++;
            setTimeout(() => {
                this.connent();
            }, 500 * this.sendRetryCount);
        };

        this.ws.onmessage = msg => {
            const reveiceData = JSON.parse(msg.data);
            const socketType = reveiceData.socketType;
            if (this.callBackMapping[socketType]) {
                const action = reveiceData.action;
                if (action === "getData") {
                    const result = JSON.parse(reveiceData.data);
                    this.callBackMapping[socketType].call(this, result);
                } else if (action === "fullScreen") {
                    this.callBackMapping[socketType].call(this, reveiceData);
                } else if (action === "themeChange") {
                    this.callBackMapping[socketType].call(this, reveiceData);
                }
            }
        };
    }

    // 存储回调函数
    callBackMapping = {};

    // 注册回调函数
    registerCallBack(socketType, callBack) {
        this.callBackMapping[socketType] = callBack;
    }

    // 注销回调函数
    unRegisterCallBack(socketType) {
        this.callBackMapping[socketType] = null;
    }

    // 发送数据
    send(data) {
        if (this.connectFlag) {
            this.ws.send(JSON.stringify(data));
        } else {
            this.sendRetryCount++;
            setTimeout(() => {
                this.send(data);
            }, 500 * this.sendRetryCount);
        }
    }
}
