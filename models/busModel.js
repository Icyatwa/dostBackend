const mongoose = require('mongoose')

const Schema = mongoose.Schema

const busSchema = new Schema({

    driver: { type: String, required: true},
    licensePlates: { type: String, required: true },
    model: { type: String, required: true },
    capacity: { type: String, required: true },

    user_id: {
        type: String,
        required: true
    },
  
  // status: { type: String, default: 'pending' },
}, { timestamps: true })

module.exports = mongoose.model('Bus', busSchema)