const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const securitySchema = new mongoose.Schema({
    ticker: {
        type: String,
        unique: true,
        uppercase: true,
        trim: true,
        required: true
    },
    averagePrice: {
        type: String,
        required: true
    },
    currentPrice: {
        type: String,
        default: 100
    },
    quantity: {
        type: Number,
        min: 0,
        required: true
    }
});

securitySchema.set('collection', 'security');
securitySchema.set(mongoosePaginate);

module.exports = mongoose.model('portfolio', securitySchema);
