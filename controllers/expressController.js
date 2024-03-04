// controllers/rideController.js
const Express = require('../models/express');
const { io } = require('../server');
exports.createRide = async (req, res) => {
  try {
    const {
      bus,
      // driver,
      licensePlates,
      driverName,
      location,
      destination,
      time,
      pickup,
      dropoff,
      seats,
      price
    } = req.body;
    const newRide = new Express({
        bus,
        // driver,
        licensePlates,
        driverName,
        location,
        destination,
        time,
        pickup,
        dropoff,
        seats,
        price
    });
    const savedRide = await newRide.save();


    res.status(201).json(savedRide);
  } catch (error) {
    console.error('MongoDB Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getAllRides = async (req, res) => {
  try {
    const busRides = await Express.find();
    res.status(200).json(busRides);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getRidesByDriverId = async (req, res) => {// Corrected from driver to driverId
  try {
    const rides = await Express.find();
    res.status(200).json(rides);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


exports.getRideById = async (req, res) => {
  const rideId = req.params.rideId;
  try {
    const ride = await Express.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    res.status(200).json(ride);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};