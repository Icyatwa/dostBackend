// controllers/rideController.js
const Bus = require('../models/bus');
const { io } = require('../server');

// Create a new ride
exports.createBus = async (req, res) => {
  try {
    const {
      driver,
      licensePlates,
      model,
      capacity,
    } = req.body;
    const newBus = new Bus({
        driver,
        licensePlates,
        model,
        capacity,
    });
    const savedBus = await newBus.save();

    // io.emit("ride_created", savedRide);

    res.status(201).json(savedBus);
  } catch (error) {
    console.error('MongoDB Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get all rides
exports.getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.find();
    res.status(200).json(buses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getBusById = async (req, res) => {
  const busId = req.params.busId;
  try {
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    res.status(200).json(bus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};