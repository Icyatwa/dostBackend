// const mongoose = require('mongoose');

// const BusBookingSchema = new mongoose.Schema({
//   rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride' },
//   passenger: { type: String},
//   selectedPassengers: { type: String },
//   stations: [{ type: String }],
//   seatsBooked: { type: Number }
// }, { timestamps: true });

// const Bookings = mongoose.model('Bookings', BusBookingSchema);

// module.exports = Bookings;


// bookingModel.js
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const bookingSchema = new Schema({
  ride: { type: Schema.Types.ObjectId, ref: 'Ride', required: true },
  user: { type: String, required: true }, // Assuming user ID or username
  seatsBooked: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
