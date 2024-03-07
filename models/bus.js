
const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  driver: { type: String, required: true},
  licensePlates: { type: String, required: true },
  model: { type: String, required: true },
  capacity: { type: String, required: true },
}, { timestamps: true });

const Bus = mongoose.model('Bus', busSchema);

module.exports = Bus;
