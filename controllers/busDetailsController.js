// busDetailsController.js

const BusDetails = require('../models/busDetailsModel');

const getBusDetails = async (req, res) => {
  try {
    const busDetails = await BusDetails.find();
    res.json(busDetails);
  } catch (error) {
    console.error('Error fetching bus details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getBusDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    const busDetails = await BusDetails.findOne({ rideGroupId: id }); // Find by rideGroupId
    if (!busDetails) {
      return res.status(404).json({ error: 'Bus details not found' });
    }
    res.json(busDetails);
  } catch (error) {
    console.error('Error fetching bus details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports = {
  getBusDetails,
  getBusDetailsById
};

