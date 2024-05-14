// taxiBookingController.js
const TaxiBooking = require('../models/taxiBookingModel');
const CabDetails = require('../models/cabDetailsModel');
const Taxi = require('../models/taxiModel')

const bookTaxi = async (req, res) => {
  const { taxi_id, seatsBooked } = req.body;
  try {
    const taxi = await Taxi.findById(taxi_id);
    if (!taxi) {
      return res.status(404).json({ error: 'Taxi not found' });
    }

    const booking = await TaxiBooking.create({
      taxi: taxi_id,
      seatsBooked
    });

    const updatedCabDetails = await CabDetails.findOneAndUpdate(
      { taxiGroupId: taxi.taxiGroupId },
      { $inc: { capCapacity: -seatsBooked } },
      { new: true }
    );

    res.status(201).json({ booking, updatedCabDetails });
  } catch (error) {
    console.error('Error booking taxi:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { bookTaxi };
