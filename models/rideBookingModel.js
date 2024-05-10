// rideBookingModel.js
const mongoose = require('mongoose');

const rideBookingSchema = new mongoose.Schema({
  ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  seatsBooked: { type: Number, required: true },
  bookingDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RideBooking', rideBookingSchema);
