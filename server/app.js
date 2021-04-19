// 服务器入口文件
const koa = require('koa2')
const app = new koa()

// 第一层中间件
const durationMiddleware = require('./middleware/response.duration')
app.use(durationMiddleware)

// 第二次中间件
const headerMiddleware = require('./middleware/response.header')
app.use(headerMiddleware)

// 第三层中间价
const dataMiddleware = require('./middleware/response_data')
app.use(dataMiddleware)


app.listen(3000)


const WebSocket = require('ws')
const wss = new WebSocket.Server({
	port:3001
})

// 监听客户端连接事件
wss.on('connection',client=>{
	console.log('有客户端连接了');
	client.on('message',msg=>{
		console.log('客户端发送给服务端的消息：'+msg);
		client.send("hello vision")
	})
})