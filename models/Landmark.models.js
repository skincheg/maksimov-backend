const {Schema, model} = require('mongoose')

const schema = new Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    }, name: {
        type: String,
    }, price: {
        type: Number
    }, description : {
        type: String
    }, address : {
        type: String
    }, developerId: {
        type: Number
    }, images: {
        type: Array
    }, latitude: {
        type: Number
    }, longitude: {
        type: Number
    }
})

module.exports = model('Landmark', schema)
