
const ApiError = require('../exceptions')
const jwtService = require('../services/jwt-service')
module.exports = (req, res, next) => {

    if (req.method === 'OPTIONS') {
        return next()
    }
    try {

        if (req.headers.authorization) {

            const access_token = req.headers.authorization.split(' ')[1]// Get the access_token
            if (!access_token) return next(ApiError.UnauthorizedError('Access token is required'))
            const userData = jwtService.validateAccessToken(access_token)
            if (!userData) return next(ApiError.UnauthorizedError('Access token is not valid'))
            req.user = userData
            next()
        } else
            return next(ApiError.UnauthorizedError('Access Token is Required'))

    } catch (e) {
        return next(ApiError.UnauthorizedError())
    }
}
