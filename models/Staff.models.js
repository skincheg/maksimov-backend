const {Schema, model} = require('mongoose')

const schema = new Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    }, name: {
        type: String,
    }, position: {
        type: String
    }, phone : {
        type: String
    }, address : {
        type: String
    }, birthday: {
        type: String
    }
})

module.exports = model('Staff', schema)
