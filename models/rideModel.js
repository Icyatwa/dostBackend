

const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true},
  stations: { type: [String], required: true },
  time: { type: String },
  price: { type: Number },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  publishSchedule: { type: [Object] },
  rideGroupId: { type: mongoose.Schema.Types.ObjectId, required: true },
  bookedSeats: { type: Map, of: Number, default: {} }
}, { timestamps: true });

const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride;

