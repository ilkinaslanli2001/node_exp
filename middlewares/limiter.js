const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
    windowsMs: 60 * 1000, //1 minute
    max: 10,
    keyGenerator: (req, res) => {
        return req.headers['x-forwarded-for']
    },
    //windowMs: 60 * 60 * 1000,
    message: {message: 'Too many requests, try later', errors: {}}
});
const limiter = rateLimit({
    windowsMs: 60 * 1000, //1 minute
    max: 90,
    keyGenerator: (req, res) => {
        return req.headers['x-forwarded-for']
    },
    //windowMs: 60 * 60 * 1000,
    message: {message: 'Too many requests, try later', errors: {}}
});
const chatLimiter = rateLimit({
    windowsMs: 60 * 1000, //1 minute
    max: 120,
    keyGenerator: (req, res) => {

        return req.headers['x-forwarded-for']
    },
    //windowMs: 60 * 60 * 1000,
    message: {message: 'Too many requests, try later', errors: {}}
});
module.exports = {chatLimiter, limiter,otpLimiter};
