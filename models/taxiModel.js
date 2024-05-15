// taxiModel.js
const mongoose = require('mongoose');

const taxiSchema = new mongoose.Schema({
  cab: { type: mongoose.Schema.Types.ObjectId, ref: 'Cab', required: true},
  stations: { type: [String], required: true },
  time: { type: String },
  price: { type: Number },
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  publishSchedule: { type: [Object] },
  taxiGroupId: { type: mongoose.Schema.Types.ObjectId, required: true },
  bookedSeats: { type: Map, of: Number, default: {} }
}, { timestamps: true });

const Taxi = mongoose.model('Taxi', taxiSchema);

module.exports = Taxi;

