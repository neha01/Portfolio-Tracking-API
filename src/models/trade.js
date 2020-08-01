const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const tradeSchema = new mongoose.Schema({
    ticker: {
        type: String,
        uppercase: true,
        trim: true,
        required: true
    },
    operation: {
        type: String,
        enum: ['BUY', 'SELL'],
        required: true
    },
    price: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        min: 0,
        required: true
    }
}, {
    timestamps: true
});

tradeSchema.set('collection', 'trade');
tradeSchema.set(mongoosePaginate);

module.exports = mongoose.model('trade', tradeSchema);
