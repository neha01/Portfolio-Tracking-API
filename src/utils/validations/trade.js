const Joi = require('@hapi/joi');

const schema = Joi.object({
    ticker: Joi.string()
        .trim()
        .uppercase()
        .pattern(/^[a-zA-Z]+$/)
        .required(),

    operation: Joi.string()
        .trim()
        .uppercase()
        .valid('BUY', 'SELL')
        .required(),

    price: Joi.number()
        .integer()
        .min(1)
        .required(),

    quantity: Joi.number()
        .integer()
        .min(1)
        .required()

});

module.exports = schema;



