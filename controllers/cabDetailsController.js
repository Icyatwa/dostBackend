// cabDetailsController.js

const CabDetails = require('../models/cabDetailsModel');

const getCabDetails = async (req, res) => {
  try {
    const cabDetails = await CabDetails.find();
    res.json(cabDetails);
  } catch (error) {
    console.error('Error fetching cab details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getCabDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    const cabDetails = await CabDetails.findOne({ taxiGroupId: id }); // Find by taxiGroupId
    if (!cabDetails) {
      return res.status(404).json({ error: 'Cab details not found' });
    }
    res.json(cabDetails);
  } catch (error) {
    console.error('Error fetching cab details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports = {
    getCabDetails,
    getCabDetailsById
};

