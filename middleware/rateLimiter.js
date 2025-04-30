const rateLimit = require('express-rate-limit');

const getLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 50, // maximum number of requests allowed in the windowMs
    message: 'Too many get requests, please try again later.',
});
const postLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // maximum number of requests allowed in the windowMs
    message: 'Too many post requests, please try again later.',
});

module.exports = { getLimiter, postLimiter };