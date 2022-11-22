const ApiError = require('../exceptions')

const jwtService = require('../services/jwt-service')
const {decryptCookie} = require("../helpers/cookie-helper");
module.exports = (req, res, next) => {

    if (req.method === 'OPTIONS') {
        return next()
    }
    try {

        if (req.cookies['access_token'] && req.cookies['refresh_token']) {

            const access_token = req.cookies.access_token
            if (!access_token) return next(ApiError.UnauthorizedError('Access token is required'))
            const userData = jwtService.validateAccessToken(decryptCookie(access_token))
            if (!userData) return next(ApiError.UnauthorizedError('Access token is not valid'))
            req.user = userData
            next()
        } else
            return next(ApiError.UnauthorizedError('Access Token is Required'))
    } catch (e) {
        return next(ApiError.UnauthorizedError())
    }
}
