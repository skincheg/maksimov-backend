const {Schema, model} = require('mongoose')

const schema = new Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    }, landmarkId: {
        type: Number,
    }, price: {
        type: Number
    }, date : {
        type: String
    }, userId: {
        type: Number
    }, count: {
        type: Number
    }
})

module.exports = model('Order', schema)
