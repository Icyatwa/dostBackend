// taxiBookingModel.js
const mongoose = require('mongoose');

const taxiBookingSchema = new mongoose.Schema({
  taxi: { type: mongoose.Schema.Types.ObjectId, ref: 'Taxi', required: true },
  seatsBooked: { type: Number, required: true },
  bookingDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TaxiBooking', taxiBookingSchema);
