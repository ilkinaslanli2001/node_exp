const DeclineCase = require('../models/DeclineCases')
class DeclineCaseService {
    async create_decline_case(from, to,declineCase) {
        await DeclineCase.create({from,to,case:declineCase})
    }
}

module.exports = new DeclineCaseService()
