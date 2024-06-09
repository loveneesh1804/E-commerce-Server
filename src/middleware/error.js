const errorMiddleware=(err,req,res,next)=>{
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;
    if(err.code===11000){
        err.message = "Data Alredy Exists!";
    }

    if(err.kind==='ObjectId'){
        err.message = "Invalid ID";
        err.statusCode = 401;
    };

    return res.status(err.statusCode).send({message : err.message,success : false});
}
module.exports = errorMiddleware;