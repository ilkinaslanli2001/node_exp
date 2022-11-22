const jwtService = require('../services/jwt-service')
const ApiError = require("../exceptions");
const {decryptCookie} = require("../helpers/cookie-helper");
const {condition} = require("../helpers/cookie-helper");
const {encryptCookie} = require("../helpers/cookie-helper");

class JwtController {
    async refresh(req, res, next) {
        try {
            const {refresh_token} = req.body
            const data = await jwtService.refresh(refresh_token)
            return res.json({
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                userId: data.id
            })
        } catch (e) {
            next(e)
        }
    }

    async admin_refresh(req, res, next) {
        try {
            const refresh_token = req.cookies.refresh_token
            if (!refresh_token)
                return next(ApiError.UnauthorizedError("Token Error", {refresh_token: 'Refresh token is required'}))
            const data = await jwtService.refresh(decryptCookie(refresh_token))
            return res.cookie("access_token", encryptCookie(data.access_token), condition).cookie("refresh_token", encryptCookie(data.refresh_token), condition).json({message: 'Success'})
        } catch (e) {
            next(e)
        }
    }

}

module.exports = new JwtController()
