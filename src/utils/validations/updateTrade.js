const Joi = require('@hapi/joi');

const schema = Joi.object({

    price: Joi.number()
        .integer()
        .min(0)
        .required(),

    quantity: Joi.number()
        .integer()
        .min(1)
        .required()

});

module.exports = schema;



