require("dotenv").config({path: '../.env'})
const libxmljs = require("libxmljs");
const paymentService = require('../services/payment-service')
const xml = require("xml");
const {PAY, CHECK, STATUS} = require("../constants/constant");

class PaymentController {
    async million_payment(req, res, next) {
        let data = null
        try {
            switch (req.query.command) {
                case PAY:
                    data = await paymentService.pay(req.query.account, req.query.txn_id, req.query.sum, req.query.txn_date)
                    break;
                case CHECK:
                    data = await paymentService.check(req.query.account, req.query.txn_id)
                    break;
                case STATUS:
                    data = await paymentService.status(req.query.txn_id)
                    break;
                default:
                    break;
            }
            res.header("Content-Type", "application/xml");
            return res.send(libxmljs.parseXml(data).toString())
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new PaymentController()
