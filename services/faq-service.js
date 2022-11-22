const FAQ = require('../models/FAQ')
const ApiError = require("../exceptions");
const constants = require('../constants/constant')
class FaqService
{
    async get_faqs(type) {

        if (parseInt(type) !== constants.PASSENGER && parseInt(type) !== constants.DRIVER) {
            throw ApiError.UnprocessableEntity('Data is wrong', {'type': 'Invalid Type'})
        }
        return FAQ.find({type}).clone();
    }
    async add_faq(faqData) {
        await FAQ.create({type: faqData.type, question: faqData.question, answer: faqData.answer})
        return true
    }
}
module.exports = new FaqService()
