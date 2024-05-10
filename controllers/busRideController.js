// controllers/busRideController.js

const BusRide = require('../models/busRideSchema');

exports.getBusByRideGroupId = async (req, res) => {
  try {
    const { rideGroupId } = req.params;
    const busRide = await BusRide.findOne({ rideGroupId });

    if (!busRide) {
      return res.status(404).json({ error: 'Bus details not found for the provided rideGroupId' });
    }

    // Assuming you have other bus details stored in the same document
    const { model, licensePlates, busCapacity } = busRide;

    res.status(200).json({
      model,
      licensePlates,
      busCapacity
    });
  } catch (error) {
    console.error('Error fetching bus details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
