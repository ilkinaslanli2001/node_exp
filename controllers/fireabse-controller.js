const firebaseService = require('../services/firebase-services')
const jwt = require('jsonwebtoken')
const ApiError = require("../exceptions");
const {validationResult} = require("express-validator");
require("dotenv").config({path:'../.env'})
class FirebaseController {

    async add_fcm_token(req, res, next) {
        try {
            const data = await firebaseService.add_fcm_token(req.body.id, req.body.token)
            return res.json({message: 'Success', data})
        } catch (e) {
            next(e)
        }
    }



}
module.exports = new FirebaseController()
