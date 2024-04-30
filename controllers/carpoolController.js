
const Carpool = require('../models/carpoolModel');

exports.createCarpool = async (req, res) => {
  try {
    const {
      driverId,
      username,
      phoneNumber,
      carModel,
      licensePlates,
      carColor,
      location,
      destination,
      day,
      time,
      pickup,
      dropoff,
      seats,
      price
    } = req.body;
    
    const newCarpool = new Carpool({
        driverId,
        username,
        phoneNumber,
        carModel,
        licensePlates,
        carColor,
        location,
        destination,
        day,
        time,
        pickup,
        dropoff,
        seats,
        price
    });
    
    const savedCarpool = await newCarpool.save();

    res.status(201).json(savedCarpool);
  } catch (error) {
    console.error('MongoDB Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getAllCarpools = async (req, res) => {
  try {
    const carpools = await Carpool.find();
    res.status(200).json(carpools);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getCarpoolsByDriverId = async (req, res) => {
  const driverId = req.params.driverId;
  try {
    const carpools = await Carpool.find({ driverId });
    res.status(200).json(carpools);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getCarpoolById = async (req, res) => {
  const carpoolId = req.params.carpoolId;
  try {
    const carpool = await Carpool.findById(carpoolId);
    if (!carpool) {
      return res.status(404).json({ message: 'Carpool not found' });
    }
    res.status(200).json(carpool);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.updateCarpool = async (req, res) => {
  const carpoolId = req.params.carpoolId;
  const updateData = req.body;
  try {
    const updatedCarpool = await Carpool.findByIdAndUpdate(carpoolId, updateData, { new: true });
    if (!updatedCarpool) {
      return res.status(404).json({ message: 'Carpool not found' });
    }
    res.status(200).json(updatedCarpool);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.deleteCarpool = async (req, res) => {
  const carpoolId = req.params.carpoolId;
  try {
    const deletedCarpool = await Carpool.findByIdAndDelete(carpoolId);
    if (!deletedCarpool) {
      return res.status(404).json({ message: 'Carpool not found' });
    }
    res.status(200).json({ message: 'Carpool deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
