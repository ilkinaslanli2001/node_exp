const faqService  = require('../services/faq-service')
class FaqController
{
    async get_faqs(req, res, next) {
        try {

            let data = await faqService.get_faqs(req.params.type)
            return res.json({'message': 'success', data})
        } catch (e) {
            next(e)
        }
    }
    async add_faq(req,res,next)
    {
        try {
            let faqData = req.body.faq_data
            await faqService.add_faq(faqData)
            return res.json({'message':'success'})
        }
        catch (e)
        {
            next(e)
        }
    }
}

module.exports = new FaqController()
