const User = require('../models/User')
const Balance = require('../models/Balance')
const Transaction = require('../models/Transaction')
const {getUserByAccountNumber} = require("../helpers/user-helpers");

class PaymentService {
    async pay(account, txnId, sum, txnDate) {
        const transaction = await Transaction.findOne({txn_id: txnId})
        if (transaction) {
            return '<?xml version="1.0" encoding="UTF-8"?>' +
                '<response>' +
                `<osmp_txn_id>${txnId}</osmp_txn_id>` +
                '<prv_txn></prv_txn>' +
                `<amount>${sum}</amount>` +
                '<result>1</result>' +
                '<comment>Error</comment>' +
                '</response>'
        } else {
            await Transaction.create({sum, account_number: account, txn_id: txnId, date: txnDate})

            const user = await getUserByAccountNumber(account)
            if (!user)
                return '<?xml version="1.0" encoding="UTF-8"?>' +
                    '<response>' +
                    `<osmp_txn_id>${txnId}</osmp_txn_id>` +
                    '<prv_txn></prv_txn>' +
                    `<amount>${sum}</amount>` +
                    '<result>1</result>' +
                    '<comment>Error</comment>' +
                    '</response>'
            await Balance.findOneAndUpdate({user_id: user.id}, {$inc: {balance: sum}})

        }
        return '<?xml version="1.0" encoding="UTF-8"?>' +
            '<response>' +
            `<osmp_txn_id>${txnId}</osmp_txn_id>` +
            '<prv_txn></prv_txn>' +
            `<amount>${sum}</amount>` +
            '<result>0</result>' +
            '<comment>OK</comment>' +
            '</response>'

    }

    async status(txnId) {
        const transaction = await Transaction.findOne({txn_id: txnId})
        if (transaction) {
            return '<?xml version="1.0" encoding="UTF-8"?>' +
                '<response>' +
                '<result>0</result>' +
                `<osmp_txn_id>${txnId}</osmp_txn_id>` +
                '<comment>OK</comment>' +
                '</response>'

        } else return '<?xml version="1.0" encoding="UTF-8"?>' +
            '<response>' +
            '<result>1</result>' +
            `<osmp_txn_id>${txnId}</osmp_txn_id>` +
            '<comment>Not found</comment>' +
            '</response>'

    }

    async check(account, txnId) {


        const user = await getUserByAccountNumber(account)

        if (user) {
            const userBalance = await Balance.findOne({user_id: user.id})
            return '<?xml version="1.0" encoding="UTF-8"?>' +
                '<response>' +
                `<osmp_txn_id>${txnId}</osmp_txn_id>` +
                '<result>0</result>' +
                '<comment>OK</comment>' +
                `<addinfo>${user.name}||${userBalance.balance.toFixed(2)}</addinfo>` +
                '</response>'
        } else return '<?xml version="1.0" encoding="UTF-8"?>' +
            '<response>' +
            `<osmp_txn_id>${txnId}</osmp_txn_id>` +
            '<result>1</result>' +
            '<comment>NOT OK</comment>' +
            '<addinfo></addinfo>' +
            '</response>'
    }
}

module.exports = new PaymentService()
