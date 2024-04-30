
const mongoose = require('mongoose');

const carpoolSchema = new mongoose.Schema({
  driverId: { type: String, required: true },
  username: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  carModel: { type: String, required: true },
  licensePlates: { type: String, required: true },
  carColor: { type: String, required: true },
  location: { type: String, required: true },
  destination: { type: String, required: true },
  day: { type: Date, required: true },
  time: { type: String, required: true },
  pickup: { type: String, required: true },
  dropoff: { type: String, required: true },
  seats: { type: String, required: true },
  price: { type: String, required: true },
}, { timestamps: true });

const Carpool = mongoose.model('Carpool', carpoolSchema);

module.exports = Carpool;
