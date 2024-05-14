const mongoose = require('mongoose')
const Schema = mongoose.Schema
const cabSchema = new Schema({
    driver: { type: String, required: true},
    licensePlates: { type: String, required: true },
    model: { type: String, required: true },
    capacity: { type: String, required: true },
    taxiDriver_id: {
        type: String,
        required: true
    },
}, { timestamps: true })

module.exports = mongoose.model('Cab', cabSchema)