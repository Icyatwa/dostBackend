
const mongoose = require('mongoose');

const expressSchema = new mongoose.Schema({
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
  },
  licensePlates: { type: String, required: true },
  driverName: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  destination: { type: String, required: true },
  pickup: { type: String, required: true },
  dropoff: { type: String, required: true },
  seats: { type: String, required: true },
  price: { type: String, required: true },
}, { timestamps: true });
 
const Express = mongoose.model('Express', expressSchema);

module.exports = Express;
