const {Schema, model} = require('mongoose')

const schema = new Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    }, email: {
        type: String,
        unique: true,
        required: true
    }, password : {
        type: String
    }, token : {
        type: String
    }, lastLogin: {
        type: Number
    },
})

module.exports = model('User', schema)
