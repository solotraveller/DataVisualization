//  计算服务器计算时长

module.exports = async (ctx,next)=>{
    const startTime = Date.now()
    await next()
    const endTime = Date.now()
    const duration = endTime - startTime

    // 设置响应头
    ctx.set('X-Response-Time',duration+'ms')
}