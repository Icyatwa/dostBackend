// // busDetailsModel.js
// const mongoose = require('mongoose');

// const busDetailsModel = new mongoose.Schema({
//   rideGroupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
//   busCapacity: { type: Number, required: true },
//   busPlates: { type: Number }
// });

// module.exports = mongoose.model('BusDetails', busDetailsModel);


// busDetailsModel.js
const mongoose = require('mongoose');

const busDetailsModel = new mongoose.Schema({
  rideGroupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  busCapacity: { type: Number, required: true },
  segmentCapacities: { type: Map, of: Number, default: {} }, // Field to track capacities per segment
  busPlates: { type: Number }
});

module.exports = mongoose.model('BusDetails', busDetailsModel);

