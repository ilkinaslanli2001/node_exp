module.exports = class ApiError extends Error
{
    status;
    errors;
    constructor(status,message,errors ={}) {
        super(message);
        this.status = status
        this.errors = errors
    }
    static UnauthorizedError(message='Phone number or password is incorrect')
    {
        return new ApiError(401,message)
    }
    static BadRequest(message,errors = {})
    {
        return new ApiError(400,message,errors)
    }
    static  UnprocessableEntity(message,errors = {})
    {
        return new ApiError(422,message,errors)
    }
}
