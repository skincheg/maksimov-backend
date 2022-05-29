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
    }, speaker: {
        type: String
    }, agree: {
        type: String
    }, versus: {
        type: String
    }, abstain: {
        type: String
    }
})

module.exports = model('Meeting', schema)
