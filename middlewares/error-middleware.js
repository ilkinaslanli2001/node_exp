const ApiError = require('../exceptions')
module.exports = function (err,req,res,next)
{

    if(err instanceof ApiError)
    {
        console.log(err)
       return  res.status(err.status).json({message:err.message,errors:err.errors})
    }
    console.log(err)
    return res.status(500).json({message:'Server error',errors:{}})
}

