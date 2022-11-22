const jwt = require('jsonwebtoken')
require("dotenv").config({path: '../.env'})
const TokenModel = require('../models/Token')
const ApiError = require('../exceptions')
const User = require('../models/User')

class JWTService {
    generateTokens(payload) {
        const access_token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '20m'})
        const refresh_token = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '60d'})
        return {
            access_token,
            refresh_token
        }
    }

    async saveToken(userId, refreshToken) {
        const tokenData = await TokenModel.findOne({user: userId})
        if (tokenData) {
            tokenData.refreshToken = refreshToken
            return tokenData.save()
        }
        return await TokenModel.create({user: userId, refreshToken})
    }

    validateAccessToken(token) {
        try {
            return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        } catch (e) {
            return null
        }
    }

    validateRefreshToken(token) {
        try {
            return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
        } catch (e) {
            return null
        }
    }

    async refresh(refreshToken) {

        if (!refreshToken) {
            throw ApiError.UnauthorizedError('Refresh token is required')
        }
        const userData = this.validateRefreshToken(refreshToken)
        const tokenFromDb = await this.findToken(refreshToken)
        if (!userData || !tokenFromDb) {
            await this.removeToken(refreshToken)
            throw ApiError.UnauthorizedError('Invalid Token')
        }
        const user = await User.findById(userData.id)
        const tokens = this.generateTokens({id: user.id, phone_number: user.phone_number})
        await this.saveToken(user.id, tokens.refresh_token)
        return {
            ...tokens,
            id: userData.id
        }
    }

    async removeToken(refreshToken) {
        await TokenModel.deleteMany({refreshToken})
    }

    async findToken(refreshToken) {
        return TokenModel.findOne({refreshToken});
    }
}

module.exports = new JWTService()
