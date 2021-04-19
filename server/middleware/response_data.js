// 处理业务逻辑的中间件
const path = require("path");
const fileUtils = require("../utils/file_path");

module.exports = async (ctx, next) => {
    const url = ctx.request.url;                // /api/seller
    let filePath = url.replace("/api", "");     // seller
    filePath = "../data" + filePath + ".json";
    filePath = path.join(__dirname, filePath);
    try {
        const result = await fileUtils.getFileJsonData(filePath);
        ctx.response.body = result;
    } catch (error) {
        const errorMsg = {
            message: "读取文件内容失败, 文件资源不存在",
            status: 404,
        };
        ctx.response.body = JSON.stringify(errorMsg);
    }

    console.log(filePath);
    await next();
};
