
const fs = require('fs')

module.exports.getFileJsonData = (filePath) =>{
    return new Promise((reslove,reject)=>{
        fs.readFile(filePath, 'utf-8', (error,data)=>{
            if(error){
                reject(error)
            }else{
                reslove(data)
            }
        })
    })
}