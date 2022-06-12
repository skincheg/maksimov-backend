const {Schema, model} = require('mongoose')

const schema = new Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    }, name: {
        type: String,
    }, price : {
        type: String
    }, userId: {
        type: Number
    }, accept: {
        type: Boolean
    }
})

module.exports = model('MyPayment', schema)
