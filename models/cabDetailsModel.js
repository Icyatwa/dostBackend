// cabDetailsModel.js
const mongoose = require('mongoose');

const cabDetailsModel = new mongoose.Schema({
  taxiGroupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Taxi', required: true },
  cabCapacity: { type: Number, required: true },
  cabPlates: { type: Number }
});

module.exports = mongoose.model('CabDetails', cabDetailsModel);
