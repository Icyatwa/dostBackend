const mongoose = require('mongoose');
const BookingSchema = new mongoose.Schema({
  rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  passenger: { type: String, required: true },
  selectedPassengers: { type: String, required: true }
}, { timestamps: true });
const Booking = mongoose.model('Booking', BookingSchema);
module.exports = Booking;
