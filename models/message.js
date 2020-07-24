const { Schema, model } = require('mongoose')
const chatSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    role:{
        type:String,
        required:true
    },
    room:{
        type:String,
        required:true
    },
    time:{
        type:String,
        required:true
    }




}, { timestamps: true })




module.exports = model('messages', chatSchema);