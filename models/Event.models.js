const {Schema, model} = require('mongoose')

const schema = new Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    }, name: {
        type: String,
    }, date: {
        type: String
    }, address : {
        type: String
    }, price : {
        type: String
    }
})

module.exports = model('Event', schema)
