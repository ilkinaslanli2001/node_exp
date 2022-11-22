
const {Schema, model, Types} = require('mongoose')
const mongoose = require('mongoose')


const CommonSchema = new Schema({
    key:{
        type:String,required:true
    },
    data: {type: Object, required: true}
})
module.exports = model('Common', CommonSchema)
