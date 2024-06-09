const multer = require("multer");
const {v4} = require("uuid");

const storage = multer.diskStorage({
    destination(req,file,callback){
        callback(null,"uploads");
    },
    filename(req,file,callback){
        const id = v4();
        const ext = file.originalname.split(".").pop();
        callback(null,`${id}.${ext}`);
    }
})

const singleUpload = multer({storage}).single("photo");
module.exports = singleUpload;