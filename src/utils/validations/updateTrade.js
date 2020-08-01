const Joi = require('@hapi/joi');

const schema = Joi.object({

    price: Joi.number()
        .integer()
        .min(0),

    quantity: Joi.number()
        .integer()
        .min(1)

});

module.exports = schema;



