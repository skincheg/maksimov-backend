const {Schema, model} = require('mongoose')

const schema = new Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    }, date: {
        type: String,
    }, address : {
        type: String
    }, members : {
        type: String
    }, accept : {
        type: String
    }, name: {
        type: String
    }
})

module.exports = model('Meeting', schema)
