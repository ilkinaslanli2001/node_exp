const {Schema, model} = require('mongoose')


const FeaturesOfRideSchema = new Schema({
    features: {type: Object, required: true}
})
module.exports = model('FeaturesOfRide', FeaturesOfRideSchema)
